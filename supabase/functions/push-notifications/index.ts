import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Web Push helpers using Web Crypto API
async function generateVapidKeys() {
  const keyPair = await crypto.subtle.generateKey(
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["sign", "verify"]
  );
  const publicJwk = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
  const privateJwk = await crypto.subtle.exportKey("jwk", keyPair.privateKey);

  // Convert JWK public key to uncompressed point (base64url)
  const publicKey = `${publicJwk.x}.${publicJwk.y}`;
  return {
    publicKey: jwkToApplicationServerKey(publicJwk),
    privateKey: JSON.stringify(privateJwk),
    publicJwk: JSON.stringify(publicJwk),
  };
}

function jwkToApplicationServerKey(jwk: JsonWebKey): string {
  const x = base64urlToBytes(jwk.x!);
  const y = base64urlToBytes(jwk.y!);
  const uncompressed = new Uint8Array(65);
  uncompressed[0] = 0x04;
  uncompressed.set(x, 1);
  uncompressed.set(y, 33);
  return bytesToBase64url(uncompressed);
}

function base64urlToBytes(s: string): Uint8Array {
  const b = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b.length % 4 === 0 ? "" : "=".repeat(4 - (b.length % 4));
  const binary = atob(b + pad);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function bytesToBase64url(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// HKDF implementation
async function hkdf(
  salt: Uint8Array,
  ikm: Uint8Array,
  info: Uint8Array,
  length: number
): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", ikm, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const prk = new Uint8Array(await crypto.subtle.sign("HMAC", key, salt.length ? salt : new Uint8Array(32)));
  const prkKey = await crypto.subtle.importKey("raw", prk, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const infoWithCounter = new Uint8Array(info.length + 1);
  infoWithCounter.set(info);
  infoWithCounter[info.length] = 1;
  const okm = new Uint8Array(await crypto.subtle.sign("HMAC", prkKey, infoWithCounter));
  return okm.slice(0, length);
}

function createInfo(type: string, clientPublicKey: Uint8Array, serverPublicKey: Uint8Array): Uint8Array {
  const typeBytes = new TextEncoder().encode(type);
  const info = new Uint8Array(18 + typeBytes.length + 1 + 5 + 2 + clientPublicKey.length + 2 + serverPublicKey.length);
  let offset = 0;

  const header = new TextEncoder().encode("Content-Encoding: ");
  info.set(header, offset); offset += header.length;
  info.set(typeBytes, offset); offset += typeBytes.length;
  info[offset++] = 0;

  const p256 = new TextEncoder().encode("P-256");
  info.set(p256, offset); offset += p256.length;

  info[offset++] = 0;
  info[offset++] = clientPublicKey.length;
  info.set(clientPublicKey, offset); offset += clientPublicKey.length;

  info[offset++] = 0;
  info[offset++] = serverPublicKey.length;
  info.set(serverPublicKey, offset);

  return info;
}

async function encryptPayload(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: string
) {
  const clientPublicKey = base64urlToBytes(subscription.keys.p256dh);
  const clientAuth = base64urlToBytes(subscription.keys.auth);

  // Generate ephemeral ECDH key pair
  const localKeyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveBits"]
  );

  const localPublicJwk = await crypto.subtle.exportKey("jwk", localKeyPair.publicKey);
  const localPublicBytes = jwkPublicToUncompressed(localPublicJwk);

  // Import client public key
  const clientKey = await crypto.subtle.importKey(
    "raw",
    clientPublicKey,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    []
  );

  // Derive shared secret
  const sharedSecret = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: "ECDH", public: clientKey },
      localKeyPair.privateKey,
      256
    )
  );

  // Derive encryption key and nonce using HKDF
  const authInfo = new TextEncoder().encode("Content-Encoding: auth\0");
  const prk = await hkdf(clientAuth, sharedSecret, authInfo, 32);

  const contentEncryptionKeyInfo = createInfo("aesgcm", clientPublicKey, localPublicBytes);
  const contentEncryptionKey = await hkdf(new Uint8Array(0), prk, contentEncryptionKeyInfo, 16);

  const nonceInfo = createInfo("nonce", clientPublicKey, localPublicBytes);
  const nonce = await hkdf(new Uint8Array(0), prk, nonceInfo, 12);

  // Encrypt with AES-GCM
  const payloadBytes = new TextEncoder().encode(payload);
  const paddedPayload = new Uint8Array(2 + payloadBytes.length);
  paddedPayload[0] = 0;
  paddedPayload[1] = 0;
  paddedPayload.set(payloadBytes, 2);

  const aesKey = await crypto.subtle.importKey("raw", contentEncryptionKey, "AES-GCM", false, ["encrypt"]);
  const encrypted = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, aesKey, paddedPayload)
  );

  return { encrypted, localPublicBytes };
}

function jwkPublicToUncompressed(jwk: JsonWebKey): Uint8Array {
  const x = base64urlToBytes(jwk.x!);
  const y = base64urlToBytes(jwk.y!);
  const result = new Uint8Array(65);
  result[0] = 0x04;
  result.set(x, 1);
  result.set(y, 33);
  return result;
}

async function createVapidAuthHeader(
  endpoint: string,
  privateJwk: JsonWebKey,
  publicKeyBase64url: string
) {
  const url = new URL(endpoint);
  const audience = `${url.protocol}//${url.host}`;

  const header = { typ: "JWT", alg: "ES256" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: audience,
    exp: now + 12 * 3600,
    sub: "mailto:hello@afristall.com",
  };

  const headerB64 = bytesToBase64url(new TextEncoder().encode(JSON.stringify(header)));
  const payloadB64 = bytesToBase64url(new TextEncoder().encode(JSON.stringify(payload)));
  const unsignedToken = `${headerB64}.${payloadB64}`;

  const key = await crypto.subtle.importKey(
    "jwk",
    privateJwk,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );

  const signature = new Uint8Array(
    await crypto.subtle.sign(
      { name: "ECDSA", hash: "SHA-256" },
      key,
      new TextEncoder().encode(unsignedToken)
    )
  );

  // Convert DER signature to raw r||s format
  const rawSig = derToRaw(signature);
  const sigB64 = bytesToBase64url(rawSig);

  const jwt = `${unsignedToken}.${sigB64}`;
  return {
    authorization: `vapid t=${jwt}, k=${publicKeyBase64url}`,
  };
}

function derToRaw(der: Uint8Array): Uint8Array {
  // If it's already 64 bytes, it's raw format
  if (der.length === 64) return der;

  // DER format: 0x30 <len> 0x02 <rlen> <r> 0x02 <slen> <s>
  if (der[0] !== 0x30) return der;

  let offset = 2;
  if (der[offset] !== 0x02) return der;
  offset++;
  const rLen = der[offset++];
  const r = der.slice(offset, offset + rLen);
  offset += rLen;

  if (der[offset] !== 0x02) return der;
  offset++;
  const sLen = der[offset++];
  const s = der.slice(offset, offset + sLen);

  const raw = new Uint8Array(64);
  raw.set(r.length > 32 ? r.slice(r.length - 32) : r, 32 - Math.min(r.length, 32));
  raw.set(s.length > 32 ? s.slice(s.length - 32) : s, 64 - Math.min(s.length, 32));
  return raw;
}

async function sendPushNotification(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: string,
  vapidPrivateJwk: JsonWebKey,
  vapidPublicKey: string
) {
  const sub = {
    endpoint: subscription.endpoint,
    keys: { p256dh: subscription.p256dh, auth: subscription.auth },
  };

  const { encrypted, localPublicBytes } = await encryptPayload(sub, payload);
  const vapidHeaders = await createVapidAuthHeader(subscription.endpoint, vapidPrivateJwk, vapidPublicKey);

  const response = await fetch(subscription.endpoint, {
    method: "POST",
    headers: {
      ...vapidHeaders,
      "Content-Type": "application/octet-stream",
      "Content-Encoding": "aesgcm",
      "Crypto-Key": `dh=${bytesToBase64url(localPublicBytes)};p256ecdsa=${vapidPublicKey}`,
      TTL: "86400",
      Urgency: "high",
    },
    body: encrypted,
  });

  if (!response.ok) {
    const text = await response.text();
    throw { statusCode: response.status, body: text };
  }

  return response;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  async function getOrCreateVapidKeys() {
    const { data } = await supabase
      .from("app_config")
      .select("key, value")
      .in("key", ["vapid_public_key", "vapid_private_jwk"]);

    if (data && data.length === 2) {
      return {
        publicKey: data.find((d: any) => d.key === "vapid_public_key")!.value,
        privateJwk: JSON.parse(data.find((d: any) => d.key === "vapid_private_jwk")!.value),
      };
    }

    // Generate new keys
    const keys = await generateVapidKeys();
    await supabase.from("app_config").upsert([
      { key: "vapid_public_key", value: keys.publicKey },
      { key: "vapid_private_jwk", value: keys.privateKey },
    ]);

    return {
      publicKey: keys.publicKey,
      privateJwk: JSON.parse(keys.privateKey),
    };
  }

  try {
    const body = await req.json();
    const { action } = body;

    if (action === "get-key") {
      const keys = await getOrCreateVapidKeys();
      return new Response(JSON.stringify({ publicKey: keys.publicKey }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "subscribe") {
      const { subscription, user_id } = body;
      const { error } = await supabase.from("push_subscriptions").upsert(
        {
          user_id,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
        { onConflict: "user_id,endpoint" }
      );
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "notify") {
      const { seller_id, title, body: notifBody, url } = body;
      const keys = await getOrCreateVapidKeys();

      const { data: subs } = await supabase
        .from("push_subscriptions")
        .select("*")
        .eq("user_id", seller_id);

      if (!subs || subs.length === 0) {
        return new Response(JSON.stringify({ sent: 0 }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const payload = JSON.stringify({
        title: title || "New Order! 🎉",
        body: notifBody || "You have a new order",
        url: url || "/dashboard/orders",
      });

      let sent = 0;
      for (const sub of subs) {
        try {
          await sendPushNotification(sub, payload, keys.privateJwk, keys.publicKey);
          sent++;
        } catch (err: any) {
          if (err.statusCode === 410 || err.statusCode === 404) {
            await supabase.from("push_subscriptions").delete().eq("id", sub.id);
          }
          console.error("Push failed for", sub.endpoint, err);
        }
      }

      return new Response(JSON.stringify({ sent }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Push notification error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
