import imageCompression from "browser-image-compression";

const DEFAULT_OPTIONS = {
  maxSizeMB: 1,             // max 1MB output
  maxWidthOrHeight: 1920,   // max dimension
  useWebWorker: true,       // non-blocking
  preserveExif: false,      // strip metadata for smaller size
  fileType: "image/webp" as const,  // modern format, great compression
};

/**
 * Compress an image file before upload.
 * Returns a compressed File with excellent visual quality.
 */
export async function compressImage(
  file: File,
  options?: Partial<typeof DEFAULT_OPTIONS>
): Promise<File> {
  // Skip if already small enough
  if (file.size <= 200 * 1024) return file; // under 200KB, skip

  try {
    const compressed = await imageCompression(file, {
      ...DEFAULT_OPTIONS,
      ...options,
    });

    // Keep original if compression made it larger
    if (compressed.size >= file.size) return file;

    // Return as File with original name (but .webp extension)
    const name = file.name.replace(/\.[^.]+$/, ".webp");
    return new File([compressed], name, { type: compressed.type });
  } catch {
    // Fall back to original on any error
    return file;
  }
}

/**
 * Compress multiple image files in parallel.
 */
export async function compressImages(files: File[]): Promise<File[]> {
  return Promise.all(files.map((f) => compressImage(f)));
}
