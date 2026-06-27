import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const smtpHost = Deno.env.get("OVH_SMTP_HOST") || "ssl0.ovh.net";
const smtpPort = Number(Deno.env.get("OVH_SMTP_PORT") || "465");
const smtpUser = Deno.env.get("OVH_SMTP_USER") || "";
const smtpPassword = Deno.env.get("OVH_SMTP_PASSWORD") || "";
const supportFrom = Deno.env.get("SUPPORT_FROM_EMAIL") || smtpUser;
const supportTo = Deno.env.get("SUPPORT_TO_EMAIL") || "somthingreat@kamyameha.com";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const authHeader = request.headers.get("Authorization");
  if (!authHeader) {
    return json({ error: "Missing authorization" }, 401);
  }

  if (!smtpUser || !smtpPassword || !supportFrom) {
    return json({ error: "SMTP is not configured" }, 500);
  }

  const payload = await request.json().catch(() => null);
  const subject = String(payload?.subject || "").trim().slice(0, 120);
  const message = String(payload?.message || "").trim().slice(0, 1500);
  const email = String(payload?.email || "").trim().slice(0, 160);

  if (!subject || !message) {
    return json({ error: "Subject and message are required" }, 400);
  }

  const client = new SmtpClient();

  try {
    await client.connectTLS({
      hostname: smtpHost,
      port: smtpPort,
      username: smtpUser,
      password: smtpPassword,
    });

    await client.send({
      from: supportFrom,
      to: supportTo,
      subject: `[Somthingreat] ${subject}`,
      content: `From: ${email || "Unknown"}\n\n${message}`,
    });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Email failed" }, 500);
  } finally {
    await client.close().catch(() => {});
  }

  return json({ ok: true });
});
