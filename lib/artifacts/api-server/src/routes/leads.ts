import { Router } from "express";
import { db, leads, messages, visitorSessions } from "@workspace/db";
import { asc, desc, eq } from "drizzle-orm";
import {
  SubmitLeadBody,
  TrackVisitorBody,
} from "@workspace/api-zod";

const router = Router();

const NOTIFY_EMAIL = "billafonbarbara@gmail.com";

type ConversationMessage = typeof messages.$inferSelect;

function escapeHtml(value: string | null | undefined) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderConversationHistory(history: ConversationMessage[]) {
  if (history.length === 0) {
    return `<p style="font-size: 13px; color: #6b7280; margin: 0 0 28px;">No chat messages were saved for this lead yet.</p>`;
  }

  return `
    <div style="margin-bottom: 28px;">
      ${history
        .map((message) => {
          const isUser = message.role === "user";
          const label = isUser ? "Visitor" : "Sarah";
          const bubbleColor = isUser ? "#eef2ff" : "#f3f4f6";
          const labelColor = isUser ? "#3730a3" : "#374151";

          return `
            <div style="margin-bottom: 12px;">
              <div style="font-size: 11px; font-weight: 700; color: ${labelColor}; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">${label}</div>
              <div style="background: ${bubbleColor}; border-radius: 10px; padding: 10px 12px; color: #111827; font-size: 13px; line-height: 1.5; white-space: pre-wrap;">${escapeHtml(message.content)}</div>
            </div>`;
        })
        .join("")}
    </div>`;
}

async function sendLeadEmail(
  lead: typeof leads.$inferSelect,
  geo: Record<string, string | null>,
  history: ConversationMessage[],
) {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) return;

  const visitTime = new Date().toLocaleString("en-US", {
    timeZone: geo.timezone ?? "America/New_York",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  });

  const html = `
  <div style="font-family: Inter, sans-serif; max-width: 640px; margin: 0 auto; background: #f9fafb; padding: 24px;">
    <div style="background: #101828; border-radius: 12px 12px 0 0; padding: 24px 28px; display: flex; align-items: center; gap: 12px;">
      <div>
        <h1 style="color: #fff; margin: 0; font-size: 20px; font-weight: 700;">New Legal Intake Lead</h1>
        <p style="color: #9ca3af; margin: 4px 0 0; font-size: 13px;">MD Law Group — Sarah Legal Intake Widget</p>
      </div>
    </div>

    <div style="background: #fff; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; padding: 28px;">

      <!-- Lead Info -->
      <h2 style="margin: 0 0 16px; font-size: 15px; font-weight: 700; color: #101828; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #101828; padding-bottom: 8px;">Contact Information</h2>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 28px;">
        <tr><td style="padding: 8px 0; color: #6b7280; font-size: 13px; width: 140px;">Full Name</td><td style="padding: 8px 0; font-weight: 600; color: #101828;">${lead.name}</td></tr>
        <tr style="background: #f9fafb;"><td style="padding: 8px 6px; color: #6b7280; font-size: 13px;">Email</td><td style="padding: 8px 6px; font-weight: 600; color: #101828;"><a href="mailto:${lead.email}" style="color: #1d4ed8;">${lead.email}</a></td></tr>
        <tr><td style="padding: 8px 0; color: #6b7280; font-size: 13px;">Phone</td><td style="padding: 8px 0; font-weight: 600; color: #101828;"><a href="tel:${lead.phone}" style="color: #1d4ed8;">${lead.phone}</a></td></tr>
        <tr style="background: #f9fafb;"><td style="padding: 8px 6px; color: #6b7280; font-size: 13px;">Legal Issue</td><td style="padding: 8px 6px;"><span style="background: #dbeafe; color: #1e40af; font-size: 12px; font-weight: 600; padding: 3px 10px; border-radius: 999px;">${lead.legalIssue}</span></td></tr>
        <tr><td style="padding: 8px 0; color: #6b7280; font-size: 13px;">Submitted</td><td style="padding: 8px 0; color: #374151; font-size: 13px;">${visitTime}</td></tr>
      </table>

      <!-- Conversation History -->
      <h2 style="margin: 0 0 16px; font-size: 15px; font-weight: 700; color: #101828; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #101828; padding-bottom: 8px;">Conversation History</h2>
      ${renderConversationHistory(history)}

      <!-- Visitor Analytics -->
      <h2 style="margin: 0 0 16px; font-size: 15px; font-weight: 700; color: #101828; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #101828; padding-bottom: 8px;">Visitor Analytics</h2>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 28px;">
        <tr><td style="padding: 8px 0; color: #6b7280; font-size: 13px; width: 140px;">IP Address</td><td style="padding: 8px 0; color: #374151; font-family: monospace; font-size: 13px;">${geo.ip ?? "Unknown"}</td></tr>
        <tr style="background: #f9fafb;"><td style="padding: 8px 6px; color: #6b7280; font-size: 13px;">Country</td><td style="padding: 8px 6px; color: #374151;">${geo.country_name ?? geo.country ?? "Unknown"}</td></tr>
        <tr><td style="padding: 8px 0; color: #6b7280; font-size: 13px;">Region</td><td style="padding: 8px 0; color: #374151;">${geo.region ?? "Unknown"}</td></tr>
        <tr style="background: #f9fafb;"><td style="padding: 8px 6px; color: #6b7280; font-size: 13px;">City</td><td style="padding: 8px 6px; color: #374151;">${geo.city ?? "Unknown"}</td></tr>
        <tr><td style="padding: 8px 0; color: #6b7280; font-size: 13px;">Timezone</td><td style="padding: 8px 0; color: #374151;">${geo.timezone ?? "Unknown"}</td></tr>
        <tr style="background: #f9fafb;"><td style="padding: 8px 6px; color: #6b7280; font-size: 13px;">ISP / Org</td><td style="padding: 8px 6px; color: #374151;">${geo.org ?? geo.isp ?? "Unknown"}</td></tr>
        <tr><td style="padding: 8px 0; color: #6b7280; font-size: 13px;">Coordinates</td><td style="padding: 8px 0; color: #374151; font-size: 13px;">${geo.latitude ? `${geo.latitude}, ${geo.longitude}` : "Unknown"}</td></tr>
      </table>

      <a href="https://maps.google.com/?q=${geo.latitude},${geo.longitude}" style="display: inline-block; background: #101828; color: #fff; text-decoration: none; font-size: 13px; font-weight: 600; padding: 10px 20px; border-radius: 8px; margin-bottom: 28px;">
        View on Map
      </a>

      <!-- Device Info -->
      <h2 style="margin: 0 0 16px; font-size: 15px; font-weight: 700; color: #101828; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #101828; padding-bottom: 8px;">Device & Browser</h2>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 28px;">
        <tr><td style="padding: 8px 0; color: #6b7280; font-size: 13px; width: 140px;">Browser</td><td style="padding: 8px 0; color: #374151;">${geo.browser ?? "Unknown"} ${geo.browserVersion ?? ""}</td></tr>
        <tr style="background: #f9fafb;"><td style="padding: 8px 6px; color: #6b7280; font-size: 13px;">Operating System</td><td style="padding: 8px 6px; color: #374151;">${geo.os ?? "Unknown"} ${geo.osVersion ?? ""}</td></tr>
        <tr><td style="padding: 8px 0; color: #6b7280; font-size: 13px;">Device</td><td style="padding: 8px 0; color: #374151;">${geo.device ?? "Unknown"}</td></tr>
        <tr style="background: #f9fafb;"><td style="padding: 8px 6px; color: #6b7280; font-size: 13px;">Screen Resolution</td><td style="padding: 8px 6px; color: #374151;">${geo.screenWidth && geo.screenHeight ? `${geo.screenWidth} × ${geo.screenHeight}` : "Unknown"}</td></tr>
        <tr><td style="padding: 8px 0; color: #6b7280; font-size: 13px;">Language</td><td style="padding: 8px 0; color: #374151;">${geo.language ?? "Unknown"}</td></tr>
        <tr style="background: #f9fafb;"><td style="padding: 8px 6px; color: #6b7280; font-size: 13px;">Referrer</td><td style="padding: 8px 6px; color: #374151; font-size: 12px; word-break: break-all;">${geo.referrer || "Direct / None"}</td></tr>
        <tr><td style="padding: 8px 0; color: #6b7280; font-size: 13px;">Page URL</td><td style="padding: 8px 0; color: #374151; font-size: 12px; word-break: break-all;">${geo.pageUrl || "Unknown"}</td></tr>
      </table>

      <p style="font-size: 12px; color: #9ca3af; margin: 0; text-align: center; padding-top: 16px; border-top: 1px solid #f3f4f6;">
        MD Law Group — Legal Intake System &bull; Automated lead notification
      </p>
    </div>
  </div>`;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "onboarding@resend.dev",
      to: [NOTIFY_EMAIL],
      subject: `New Lead: ${lead.name} - ${lead.legalIssue}`,
      html,
    }),
  });
}

// POST /api/leads
router.post("/leads", async (req, res) => {
  const parsed = SubmitLeadBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  try {
    // Get IP from request headers
    const ip =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      null;

    // Geolocate the IP
    let geoData: Record<string, string | null> = { ip };
    if (ip && ip !== "::1" && !ip.startsWith("127.")) {
      try {
        const geoRes = await fetch(`https://ipapi.co/${ip}/json/`, {
          headers: { "User-Agent": "MDLawGroup-Widget/1.0" },
        });
        if (geoRes.ok) {
          const g = (await geoRes.json()) as Record<string, unknown>;
          geoData = {
            ip: String(g.ip ?? ip),
            country: String(g.country_code ?? ""),
            country_name: String(g.country_name ?? ""),
            region: String(g.region ?? ""),
            city: String(g.city ?? ""),
            timezone: String(g.timezone ?? ""),
            latitude: String(g.latitude ?? ""),
            longitude: String(g.longitude ?? ""),
            org: String(g.org ?? ""),
            isp: String(g.org ?? ""),
          };
        }
      } catch {
        // geo lookup failed — continue without it
      }
    }

    const [lead] = await db
      .insert(leads)
      .values({
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone,
        legalIssue: parsed.data.legalIssue,
        conversationId: parsed.data.conversationId ?? null,
      })
      .returning();

    // Fire-and-forget email — don't block the response
    let conversationHistory: ConversationMessage[] = [];
    const conversationId = Number(parsed.data.conversationId);
    if (Number.isInteger(conversationId) && conversationId > 0) {
      conversationHistory = await db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, conversationId))
        .orderBy(asc(messages.createdAt));
    }

    sendLeadEmail(lead, geoData, conversationHistory).catch((emailError) => {
      req.log.error({ err: emailError }, "Failed to send lead email");
    });

    res.status(201).json(lead);
  } catch (err) {
    req.log.error({ err }, "Failed to submit lead");
    res.status(500).json({ error: "Failed to submit lead" });
  }
});

// GET /api/leads
router.get("/leads", async (req, res) => {
  try {
    const all = await db.select().from(leads).orderBy(desc(leads.createdAt));
    res.json(all);
  } catch (err) {
    req.log.error({ err }, "Failed to list leads");
    res.status(500).json({ error: "Failed to list leads" });
  }
});

// POST /api/analytics/track
router.post("/analytics/track", async (req, res) => {
  const parsed = TrackVisitorBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  try {
    const ip =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      null;

    let country: string | null = null;
    let region: string | null = null;
    let city: string | null = null;
    let timezone: string | null = parsed.data.timezone ?? null;
    let latitude: string | null = null;
    let longitude: string | null = null;
    let isp: string | null = null;

    if (ip && ip !== "::1" && !ip.startsWith("127.")) {
      try {
        const geoRes = await fetch(`https://ipapi.co/${ip}/json/`, {
          headers: { "User-Agent": "MDLawGroup-Widget/1.0" },
        });
        if (geoRes.ok) {
          const g = (await geoRes.json()) as Record<string, unknown>;
          country = String(g.country_code ?? "");
          region = String(g.region ?? "");
          city = String(g.city ?? "");
          timezone = String(g.timezone ?? timezone ?? "");
          latitude = String(g.latitude ?? "");
          longitude = String(g.longitude ?? "");
          isp = String(g.org ?? "");
        }
      } catch {
        // geo lookup failed
      }
    }

    const [session] = await db
      .insert(visitorSessions)
      .values({
        sessionId: parsed.data.sessionId,
        ip,
        country,
        region,
        city,
        timezone,
        latitude,
        longitude,
        isp,
        browser: parsed.data.browser ?? null,
        browserVersion: parsed.data.browserVersion ?? null,
        os: parsed.data.os ?? null,
        osVersion: parsed.data.osVersion ?? null,
        device: parsed.data.device ?? null,
        screenWidth: parsed.data.screenWidth ?? null,
        screenHeight: parsed.data.screenHeight ?? null,
        language: parsed.data.language ?? null,
        referrer: parsed.data.referrer ?? null,
        pageUrl: parsed.data.pageUrl ?? null,
        userAgent: parsed.data.userAgent ?? null,
        extra: parsed.data.extra ?? null,
      })
      .returning();

    res.status(201).json(session);
  } catch (err) {
    req.log.error({ err }, "Failed to track visitor");
    res.status(500).json({ error: "Failed to track visitor" });
  }
});

// GET /api/analytics/sessions
router.get("/analytics/sessions", async (req, res) => {
  try {
    const all = await db.select().from(visitorSessions).orderBy(desc(visitorSessions.visitedAt));
    res.json(all);
  } catch (err) {
    req.log.error({ err }, "Failed to list sessions");
    res.status(500).json({ error: "Failed to list sessions" });
  }
});

export default router;
