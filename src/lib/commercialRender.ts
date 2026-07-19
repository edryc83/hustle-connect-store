// Client-side stitcher for Studio Commercial. Uses ffmpeg.wasm to concat the
// AI-generated shots, mix in the template's background music, and overlay the
// caption sequence (rendered as transparent PNGs via a 2D canvas so we don't
// have to ship a font into ffmpeg-core).

import type { CommercialTemplate, CommercialCaption } from "@/components/dashboard/commercialTemplates";
import { fillCaption } from "@/components/dashboard/commercialTemplates";

const OUT_W = 720;
const OUT_H = 1280; // 9:16 portrait — best for Reels/Status/TikTok

type FFmpegModule = typeof import("@ffmpeg/ffmpeg");
type UtilModule = typeof import("@ffmpeg/util");

let ffmpegPromise: Promise<{ ffmpeg: any; util: UtilModule }> | null = null;

async function loadFFmpeg(onProgress?: (p: number) => void) {
  if (!ffmpegPromise) {
    ffmpegPromise = (async () => {
      const ff: FFmpegModule = await import("@ffmpeg/ffmpeg");
      const util: UtilModule = await import("@ffmpeg/util");
      const ffmpeg = new ff.FFmpeg();
      const base = "https://unpkg.com/@ffmpeg/[email protected]/dist/umd";
      await ffmpeg.load({
        coreURL: await util.toBlobURL(`${base}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await util.toBlobURL(`${base}/ffmpeg-core.wasm`, "application/wasm"),
      });
      return { ffmpeg, util };
    })();
  }
  const { ffmpeg, util } = await ffmpegPromise;
  if (onProgress) {
    ffmpeg.on("progress", ({ progress }: { progress: number }) => {
      onProgress(Math.max(0, Math.min(1, progress)));
    });
  }
  return { ffmpeg, util };
}

function renderCaptionPng(
  caption: CommercialCaption,
  text: string,
  style: CommercialTemplate["captionStyle"]
): Blob {
  const canvas = document.createElement("canvas");
  canvas.width = OUT_W;
  canvas.height = OUT_H;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, OUT_W, OUT_H);

  const displayText = style.uppercase ? text.toUpperCase() : text;
  // Downscale caption size proportionally (style.size is defined for 1080 tall)
  const scale = OUT_H / 1080;
  const fontSize = Math.round(style.size * scale);
  ctx.font = `${style.weight} ${fontSize}px ${style.fontFamily}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Word-wrap
  const maxWidth = OUT_W * 0.86;
  const words = displayText.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);

  const lineHeight = fontSize * 1.15;
  const blockHeight = lines.length * lineHeight;

  let cy: number;
  if (style.align === "top") cy = OUT_H * 0.15 + blockHeight / 2;
  else if (style.align === "bottom") cy = OUT_H * 0.82 - blockHeight / 2;
  else cy = OUT_H / 2;

  // Chip background
  if (style.bg) {
    ctx.fillStyle = style.bg;
    const padX = fontSize * 0.6;
    const padY = fontSize * 0.35;
    let widest = 0;
    for (const l of lines) widest = Math.max(widest, ctx.measureText(l).width);
    const bx = OUT_W / 2 - widest / 2 - padX;
    const by = cy - blockHeight / 2 - padY;
    const bw = widest + padX * 2;
    const bh = blockHeight + padY * 2;
    const r = Math.min(bh / 2, 24);
    // rounded rect
    ctx.beginPath();
    ctx.moveTo(bx + r, by);
    ctx.arcTo(bx + bw, by, bx + bw, by + bh, r);
    ctx.arcTo(bx + bw, by + bh, bx, by + bh, r);
    ctx.arcTo(bx, by + bh, bx, by, r);
    ctx.arcTo(bx, by, bx + bw, by, r);
    ctx.closePath();
    ctx.fill();
  } else {
    // Soft shadow so text stays readable over any shot
    ctx.shadowColor = "rgba(0,0,0,0.75)";
    ctx.shadowBlur = 14;
  }

  ctx.fillStyle = style.color;
  ctx.shadowColor = ctx.shadowColor || "rgba(0,0,0,0.75)";
  ctx.shadowBlur = style.bg ? 0 : 14;

  const startY = cy - blockHeight / 2 + lineHeight / 2;
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], OUT_W / 2, startY + i * lineHeight);
  }

  return new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), "image/png")) as unknown as Blob;
}

async function canvasToBlob(cb: () => Blob | Promise<Blob>): Promise<Blob> {
  return (await cb()) as Blob;
}

export interface RenderInput {
  template: CommercialTemplate;
  shotUrls: string[];
  productName: string;
  price: string;
  onProgress?: (stage: "loading" | "downloading" | "rendering", pct: number) => void;
}

export async function renderCommercial(input: RenderInput): Promise<Blob> {
  const { template, shotUrls, productName, price, onProgress } = input;

  onProgress?.("loading", 0.05);
  const { ffmpeg, util } = await loadFFmpeg((p) => onProgress?.("rendering", p));

  // Download shots + music
  onProgress?.("downloading", 0.15);
  const shots = await Promise.all(
    shotUrls.map(async (u, i) => {
      const data = await util.fetchFile(u);
      await ffmpeg.writeFile(`shot${i}.mp4`, data);
      return `shot${i}.mp4`;
    })
  );

  const musicData = await util.fetchFile(template.music);
  await ffmpeg.writeFile("music.mp3", musicData);

  // Render caption PNGs
  const captions = template.captions;
  const capFiles: string[] = [];
  for (let i = 0; i < captions.length; i++) {
    const c = captions[i];
    const text = fillCaption(c, { productName, price });
    if (!text) continue;
    const blob = await canvasToBlob(() => renderCaptionPng(c, text, template.captionStyle));
    const ab = new Uint8Array(await blob.arrayBuffer());
    const name = `cap${i}.png`;
    await ffmpeg.writeFile(name, ab);
    capFiles.push(name);
  }

  onProgress?.("rendering", 0.3);

  // Step 1 — normalize each shot to portrait, trim to its slot duration, no audio
  for (let i = 0; i < shots.length; i++) {
    const dur = template.shotDurations[i] ?? 5;
    await ffmpeg.exec([
      "-y",
      "-i", shots[i],
      "-t", String(dur),
      "-vf",
      // Fit and pad to 720x1280 portrait, keep aspect
      `scale=${OUT_W}:${OUT_H}:force_original_aspect_ratio=increase,crop=${OUT_W}:${OUT_H},setsar=1,fps=30`,
      "-an",
      "-c:v", "libx264",
      "-pix_fmt", "yuv420p",
      "-preset", "ultrafast",
      `norm${i}.mp4`,
    ]);
  }

  onProgress?.("rendering", 0.55);

  // Step 2 — concat normalized shots
  const concatList = shots.map((_, i) => `file 'norm${i}.mp4'`).join("\n");
  await ffmpeg.writeFile("concat.txt", new TextEncoder().encode(concatList));
  await ffmpeg.exec([
    "-y", "-f", "concat", "-safe", "0", "-i", "concat.txt",
    "-c", "copy", "video.mp4",
  ]);

  onProgress?.("rendering", 0.7);

  const totalDur = template.shotDurations.reduce((a, b) => a + b, 0);

  // Step 3 — overlay captions + mix music
  // Build filter graph: [0:v][1:v]overlay=enable=between(t,a,b)[v1]; [v1][2:v]overlay=enable=between(t,c,d)[v2]; ...
  // Music: loop, trim to totalDur, ducked to 0.35.
  const inputArgs: string[] = ["-y", "-i", "video.mp4"];
  capFiles.forEach((f) => inputArgs.push("-i", f));
  inputArgs.push("-stream_loop", "-1", "-i", "music.mp3");

  let filter = "";
  let last = "[0:v]";
  capFiles.forEach((_, i) => {
    const c = captions[i];
    const outLabel = `[v${i + 1}]`;
    filter += `${last}[${i + 1}:v]overlay=0:0:enable='between(t,${c.from},${c.to})'${outLabel};`;
    last = outLabel;
  });
  // Fade music in/out
  filter += `[${capFiles.length + 1}:a]atrim=0:${totalDur},afade=t=in:st=0:d=0.6,afade=t=out:st=${(totalDur - 0.8).toFixed(2)}:d=0.8,volume=0.55[a]`;

  await ffmpeg.exec([
    ...inputArgs,
    "-filter_complex", filter,
    "-map", last,
    "-map", "[a]",
    "-t", String(totalDur),
    "-c:v", "libx264",
    "-pix_fmt", "yuv420p",
    "-preset", "ultrafast",
    "-c:a", "aac",
    "-b:a", "128k",
    "-movflags", "+faststart",
    "out.mp4",
  ]);

  onProgress?.("rendering", 0.98);
  const data = (await ffmpeg.readFile("out.mp4")) as Uint8Array;

  // Cleanup
  const cleanup = [
    "video.mp4", "out.mp4", "music.mp3", "concat.txt",
    ...shots, ...shots.map((_, i) => `norm${i}.mp4`), ...capFiles,
  ];
  for (const f of cleanup) {
    try { await ffmpeg.deleteFile(f); } catch {}
  }

  return new Blob([data], { type: "video/mp4" });
}