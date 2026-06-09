import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

Deno.serve(async (req) => {
  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const ct = req.headers.get("content-type") || "";
    let paymentId = "", txStatus = "", raw = "";
    if (req.method === "GET" || req.url.includes("?")) {
      const url = new URL(req.url);
      paymentId = url.searchParams.get("ExternalReference") || url.searchParams.get("external_reference") || "";
      txStatus = url.searchParams.get("TransactionStatus") || url.searchParams.get("transaction_status") || "";
    } else {
      raw = await req.text();
      console.log("supplier-pay IPN raw:", raw);
      if (ct.includes("xml") || raw.trim().startsWith("<")) {
        paymentId = raw.match(/<ExternalReference>([^<]+)<\/ExternalReference>/i)?.[1] || "";
        txStatus = raw.match(/<TransactionStatus>([^<]+)<\/TransactionStatus>/i)?.[1] || "";
      } else {
        try {
          const p = new URLSearchParams(raw);
          paymentId = p.get("ExternalReference") || p.get("external_reference") || "";
          txStatus = p.get("TransactionStatus") || p.get("transaction_status") || "";
          if (!paymentId) {
            const j = JSON.parse(raw);
            paymentId = j.ExternalReference || j.external_reference || "";
            txStatus = j.TransactionStatus || j.transaction_status || "";
          }
        } catch {}
      }
    }

    if (!paymentId) return new Response("ok", { status: 200 });

    const normal = txStatus.toUpperCase();
    const success = ["SUCCEEDED","SUCCESSFUL","SUCCESS","COMPLETE","COMPLETED"].includes(normal);
    const failed = ["FAILED","CANCELLED","CANCELED","REVERSED"].includes(normal);
    if (!success && !failed) return new Response("ok", { status: 200 });

    const { data: pay } = await admin.from("supplier_payments").select("id, status").eq("id", paymentId).single();
    if (!pay) return new Response("ok", { status: 200 });
    if (pay.status === "funds_received" || pay.status === "settled") return new Response("ok", { status: 200 });

    if (failed) {
      await admin.from("supplier_payments").update({ status: "failed" }).eq("id", paymentId);
      return new Response("ok", { status: 200 });
    }

    await admin.from("supplier_payments").update({ status: "funds_received" }).eq("id", paymentId);
    return new Response("ok", { status: 200 });
  } catch (e: any) {
    console.error("supplier-pay-ipn error:", e);
    return new Response("error", { status: 500 });
  }
});