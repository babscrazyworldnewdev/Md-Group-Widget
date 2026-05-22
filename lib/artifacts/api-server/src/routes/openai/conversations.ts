import { Router } from "express";
import { db, conversations, leads, messages } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";
import {
  CreateOpenaiConversationBody,
  GetOpenaiConversationParams,
  DeleteOpenaiConversationParams,
  ListOpenaiMessagesParams,
  SendOpenaiMessageParams,
  SendOpenaiMessageBody,
} from "@workspace/api-zod";

const router = Router();
const NOTIFY_EMAIL = "billafonbarbara@gmail.com";

const SYSTEM_PROMPT = `You are Sarah, a warm and knowledgeable virtual legal intake assistant for MD Law Group — a personal injury and family law firm. Your role is to:

1. Welcome potential clients and help them understand their legal situation
2. Gather basic information about their case (type of incident, when it happened, injuries/damages)
3. Explain the firm's practice areas: Personal Injury, Car Accidents, Family Law, Divorce, Child Custody, Criminal Defense, Immigration, Employment Issues, Business Law, Real Estate
4. Provide general legal information (not legal advice) to help them understand their options
5. Let them know the firm offers free consultations and encourage them to schedule one

Be empathetic, professional, and concise. Never provide specific legal advice — always remind them that a consultation with an attorney is needed for advice specific to their situation. If they describe an emergency or urgent situation, acknowledge it and suggest they contact the firm immediately.

Keep responses brief and conversational — 2-4 sentences typically. Ask one clarifying question at a time to gather information about their situation.`;

function escapeHtml(value: string | null | undefined) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function sendTranscriptEmail(conversationId: number) {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) return;

  const [lead] = await db
    .select()
    .from(leads)
    .where(eq(leads.conversationId, String(conversationId)));

  if (!lead) return;

  const history = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(asc(messages.createdAt));

  const transcript = history
    .map((message) => {
      const label = message.role === "user" ? "Visitor" : "Sarah";
      return `<p style="margin: 0 0 12px;"><strong>${label}:</strong><br>${escapeHtml(message.content)}</p>`;
    })
    .join("");

  const html = `
    <div style="font-family: Inter, Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 24px; color: #111827;">
      <h1 style="font-size: 20px; margin: 0 0 16px;">Updated Lead Conversation</h1>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <tr><td style="padding: 6px 0; color: #6b7280;">Name</td><td style="padding: 6px 0;">${escapeHtml(lead.name)}</td></tr>
        <tr><td style="padding: 6px 0; color: #6b7280;">Email</td><td style="padding: 6px 0;">${escapeHtml(lead.email)}</td></tr>
        <tr><td style="padding: 6px 0; color: #6b7280;">Phone</td><td style="padding: 6px 0;">${escapeHtml(lead.phone)}</td></tr>
        <tr><td style="padding: 6px 0; color: #6b7280;">Legal Issue</td><td style="padding: 6px 0;">${escapeHtml(lead.legalIssue)}</td></tr>
      </table>
      <h2 style="font-size: 15px; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 0.05em;">Conversation History</h2>
      <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px;">
        ${transcript || "<p>No messages saved yet.</p>"}
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
      subject: `Updated Lead Conversation: ${lead.name}`,
      html,
    }),
  });
}

// GET /api/openai/conversations
router.get("/conversations", async (req, res) => {
  try {
    const all = await db.select().from(conversations).orderBy(asc(conversations.createdAt));
    res.json(all);
  } catch (err) {
    req.log.error({ err }, "Failed to list conversations");
    res.status(500).json({ error: "Failed to list conversations" });
  }
});

// POST /api/openai/conversations
router.post("/conversations", async (req, res) => {
  const parsed = CreateOpenaiConversationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  try {
    const [conversation] = await db
      .insert(conversations)
      .values({ title: parsed.data.title })
      .returning();
    res.status(201).json(conversation);
  } catch (err) {
    req.log.error({ err }, "Failed to create conversation");
    res.status(500).json({ error: "Failed to create conversation" });
  }
});

// GET /api/openai/conversations/:id
router.get("/conversations/:id", async (req, res) => {
  const parsed = GetOpenaiConversationParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  try {
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, parsed.data.id));
    if (!conversation) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }
    const msgs = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, parsed.data.id))
      .orderBy(asc(messages.createdAt));
    res.json({ ...conversation, messages: msgs });
  } catch (err) {
    req.log.error({ err }, "Failed to get conversation");
    res.status(500).json({ error: "Failed to get conversation" });
  }
});

// DELETE /api/openai/conversations/:id
router.delete("/conversations/:id", async (req, res) => {
  const parsed = DeleteOpenaiConversationParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  try {
    const [deleted] = await db
      .delete(conversations)
      .where(eq(conversations.id, parsed.data.id))
      .returning();
    if (!deleted) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete conversation");
    res.status(500).json({ error: "Failed to delete conversation" });
  }
});

// GET /api/openai/conversations/:id/messages
router.get("/conversations/:id/messages", async (req, res) => {
  const parsed = ListOpenaiMessagesParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  try {
    const msgs = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, parsed.data.id))
      .orderBy(asc(messages.createdAt));
    res.json(msgs);
  } catch (err) {
    req.log.error({ err }, "Failed to list messages");
    res.status(500).json({ error: "Failed to list messages" });
  }
});

// POST /api/openai/conversations/:id/messages (SSE streaming)
router.post("/conversations/:id/messages", async (req, res) => {
  const paramsParsed = SendOpenaiMessageParams.safeParse({ id: Number(req.params.id) });
  const bodyParsed = SendOpenaiMessageBody.safeParse(req.body);

  if (!paramsParsed.success || !bodyParsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const conversationId = paramsParsed.data.id;
  const userContent = bodyParsed.data.content;

  try {
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId));
    if (!conversation) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }

    // Save user message
    await db.insert(messages).values({
      conversationId,
      role: "user",
      content: userContent,
    });

    // Load full history for context
    const history = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(asc(messages.createdAt));

    const chatMessages: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    let fullResponse = "";

    const stream = await openai.chat.completions.create({
      model: "gpt-5.4",
      max_completion_tokens: 8192,
      messages: chatMessages,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullResponse += content;
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    // Save assistant message
    await db.insert(messages).values({
      conversationId,
      role: "assistant",
      content: fullResponse,
    });

    sendTranscriptEmail(conversationId).catch((emailError) => {
      req.log.error({ err: emailError }, "Failed to send transcript email");
    });

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    req.log.error({ err }, "Failed to send message");
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to send message" });
    } else {
      res.write(`data: ${JSON.stringify({ error: "Stream error" })}\n\n`);
      res.end();
    }
  }
});

export default router;
