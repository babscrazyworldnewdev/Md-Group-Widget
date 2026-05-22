import { useState, useEffect, useRef } from "react";
import { Send, User, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  useCreateOpenaiConversation,
  useListOpenaiMessages,
  getListOpenaiMessagesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { LeadForm } from "./lead-form";
import { trackVisit } from "@/lib/analytics";
import { resolveApiPath } from "@/lib/api-config";

const SUGGESTIONS = [
  "Personal Injury",
  "Car Accident",
  "Family Law",
  "Divorce",
  "Child Custody",
  "Criminal Defense",
  "Immigration",
  "Employment Issues",
  "Business Law",
  "Real Estate",
  "Other Legal Matter",
];

const WELCOME_MESSAGE = "Hi! Welcome to MD Law Group. I'm the virtual assistant for the firm. I can help answer questions, point you in the right direction, and connect you with the legal team if needed. What can we help you with today?";

const DEMO_CONVERSATION_ID = -1;
const SARAH_IMAGE_SRC = `${import.meta.env.BASE_URL.replace(/\/$/, "")}/sarah.png`;

function buildDemoResponse(message: string) {
  const lower = message.toLowerCase();
  const topic = message.trim() || "your legal matter";

  if (lower.includes("car") || lower.includes("accident") || lower.includes("injury")) {
    return "I'm sorry that happened. Please write down when and where it happened, whether anyone was injured, if a police report was made, and whether insurance has contacted you. I can share general information here, but an attorney should review the facts before giving advice specific to your case.";
  }

  if (lower.includes("divorce") || lower.includes("custody") || lower.includes("family")) {
    return "Family matters can feel heavy, so the useful starting point is understanding whether there are children involved, any existing court orders, and what outcome you are hoping for. I can help organize the basics, but an attorney should review your situation before giving legal advice.";
  }

  if (lower.includes("criminal")) {
    return "If this involves an arrest, court date, warrant, or police contact, please treat it as time-sensitive and speak with an attorney as soon as possible. The most helpful details are the charge, court date, location, and whether paperwork was given to you.";
  }

  return `Thanks for sharing that. For ${topic.toLowerCase()}, the best next step is to gather what happened, when it happened, who was involved, any documents or deadlines, and the best phone/email to reach you. I can provide general information, but an attorney should review the details before giving advice specific to your situation.`;
}

export function ChatWidget({ embedMode = false }: { embedMode?: boolean }) {
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [streamingContent, setStreamingContent] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasSentMessage, setHasSentMessage] = useState(false);
  const [demoMessages, setDemoMessages] = useState<Array<{
    id: number;
    conversationId: number;
    role: "user" | "assistant";
    content: string;
    createdAt: string;
  }>>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const createConversation = useCreateOpenaiConversation();
  const isDemoMode = conversationId === DEMO_CONVERSATION_ID;
  const { data: serverMessages = [] } = useListOpenaiMessages(conversationId!, {
    query: {
      enabled: !!conversationId && !isDemoMode,
      queryKey: getListOpenaiMessagesQueryKey(conversationId!),
    },
  });
  const messages = isDemoMode ? demoMessages : serverMessages;

  // Create a conversation on mount and fire analytics tracking
  useEffect(() => {
    let mounted = true;
    if (!conversationId) {
      createConversation.mutate(
        { data: { title: "Legal Intake" } },
        {
          onSuccess: (data) => {
            if (mounted) setConversationId(data.id);
          },
          onError: () => {
            if (mounted) setConversationId(DEMO_CONVERSATION_ID);
          },
        }
      );
    }
    // Fire visitor analytics asynchronously — never blocks UX
    trackVisit();
    return () => { mounted = false; };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, isTyping]);

  const handleLeadSubmit = (data: { name: string; email: string; phone: string; legalIssue: string }) => {
    setLeadSubmitted(true);
    setLeadName(data.name.split(" ")[0]);
    // Pre-fill the legal issue as first message after a brief delay
    setTimeout(() => handleSendMessage(`I need help with ${data.legalIssue}.`), 400);
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const activeConversationId = conversationId ?? DEMO_CONVERSATION_ID;
    const localDemoMode = activeConversationId === DEMO_CONVERSATION_ID;
    const messageContent = text.trim();
    if (!conversationId) setConversationId(activeConversationId);
    setInputValue("");
    setHasSentMessage(true);
    setIsTyping(true);
    setStreamingContent("");

    const tempUserMessage = {
      id: Date.now(),
      conversationId: activeConversationId,
      role: "user",
      content: messageContent,
      createdAt: new Date().toISOString(),
    };

    if (localDemoMode) {
      setDemoMessages((old) => [...old, { ...tempUserMessage, role: "user" }]);
      window.setTimeout(() => {
        setDemoMessages((old) => [
          ...old,
          {
            id: Date.now() + 1,
            conversationId: activeConversationId,
            role: "assistant",
            content: buildDemoResponse(messageContent),
            createdAt: new Date().toISOString(),
          },
        ]);
        setIsTyping(false);
      }, 500);
      return;
    }

    queryClient.setQueryData(
      getListOpenaiMessagesQueryKey(activeConversationId),
      (old: unknown) => [...((old as unknown[]) || []), tempUserMessage]
    );

    try {
      const res = await fetch(resolveApiPath(`/api/openai/conversations/${activeConversationId}/messages`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: messageContent }),
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;
      let currentStreaming = "";

      setIsTyping(false);

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const dataStr = line.replace("data: ", "").trim();
              if (dataStr) {
                try {
                  const data = JSON.parse(dataStr);
                  if (data.content) {
                    currentStreaming += data.content;
                    setStreamingContent(currentStreaming);
                  }
                  if (data.done) done = true;
                } catch {
                  // ignore parse error
                }
              }
            }
          }
        }
      }

      setStreamingContent("");
      queryClient.invalidateQueries({ queryKey: getListOpenaiMessagesQueryKey(activeConversationId) });
    } catch {
      setIsTyping(false);
      setConversationId(DEMO_CONVERSATION_ID);
      setDemoMessages((old) => [
        ...old,
        { ...tempUserMessage, role: "user" },
        {
          id: Date.now() + 1,
          conversationId: DEMO_CONVERSATION_ID,
          role: "assistant",
          content: buildDemoResponse(messageContent),
          createdAt: new Date().toISOString(),
        },
      ]);
    }
  };

  useEffect(() => {
    if (embedMode) {
      document.body.style.margin = "0";
      document.body.style.padding = "0";
      document.body.style.overflow = "hidden";
    }
  }, [embedMode]);

  const containerClass = `flex flex-col bg-white shadow-xl ${
    embedMode ? "w-full h-screen" : "w-full max-w-[400px] h-[600px] rounded-xl overflow-hidden border"
  }`;

  // Show lead form until submitted
  if (!leadSubmitted) {
    return (
      <div className={containerClass}>
        <LeadForm conversationId={conversationId} onSubmit={handleLeadSubmit} />
      </div>
    );
  }

  return (
    <div className={containerClass}>
      {/* Header */}
      <div className="bg-primary px-4 py-3 flex items-center gap-3 shrink-0">
        <Avatar className="h-14 w-14 border-2 border-primary-foreground/30 shrink-0">
          <AvatarImage src={SARAH_IMAGE_SRC} alt="Sarah" className="object-cover object-top scale-125 origin-top" />
          <AvatarFallback className="bg-primary-foreground/10 text-primary-foreground">
            <Scale className="h-6 w-6" />
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <h2 className="font-semibold text-primary-foreground leading-tight">Sarah | Legal Intake</h2>
          <p className="text-xs text-primary-foreground/80 leading-tight">MD Law Group</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
        {/* Welcome Message personalized with lead name */}
        <div className="flex justify-start">
          <div className="flex gap-2 max-w-[85%]">
            <Avatar className="h-8 w-8 mt-auto shrink-0">
              <AvatarImage src={SARAH_IMAGE_SRC} alt="Sarah" />
              <AvatarFallback className="bg-muted text-muted-foreground text-xs">S</AvatarFallback>
            </Avatar>
            <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm text-foreground">
              {leadName ? `Hi ${leadName}! ` : ""}{WELCOME_MESSAGE.replace("Hi! ", "")}
            </div>
          </div>
        </div>

        {messages.map((msg: { id: number; role: string; content: string; createdAt: string }) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`flex gap-2 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              <Avatar className="h-8 w-8 mt-auto shrink-0">
                {msg.role === "user" ? (
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                ) : (
                  <>
                    <AvatarImage src={SARAH_IMAGE_SRC} alt="Sarah" />
                    <AvatarFallback className="bg-muted text-muted-foreground text-xs">S</AvatarFallback>
                  </>
                )}
              </Avatar>
              <div
                className={`rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted text-foreground rounded-bl-sm"
                }`}
              >
                {msg.content}
              </div>
            </div>
          </div>
        ))}

        {streamingContent && (
          <div className="flex justify-start">
            <div className="flex gap-2 max-w-[85%]">
              <Avatar className="h-8 w-8 mt-auto shrink-0">
                <AvatarImage src={SARAH_IMAGE_SRC} alt="Sarah" />
                <AvatarFallback className="bg-muted text-muted-foreground text-xs">S</AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm text-foreground whitespace-pre-wrap">
                {streamingContent}
                <span className="inline-block w-1.5 h-4 ml-1 bg-primary align-middle animate-pulse" />
              </div>
            </div>
          </div>
        )}

        {isTyping && (
          <div className="flex justify-start">
            <div className="flex gap-2 max-w-[85%]">
              <Avatar className="h-8 w-8 mt-auto shrink-0">
                <AvatarFallback className="bg-muted text-muted-foreground text-xs">S</AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-foreground flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        {!hasSentMessage && (
          <div className="pt-2 flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-2">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleSendMessage(suggestion)}
                className="text-xs bg-white border border-input text-foreground hover:bg-muted px-3 py-1.5 rounded-full transition-colors font-medium"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-white border-t border-border shrink-0">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputValue); }}
          className="relative flex items-center"
        >
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your legal question here..."
            className="pr-10 rounded-full h-11 border-input shadow-none bg-muted/50 focus-visible:bg-white"
            disabled={!conversationId || isTyping}
            data-testid="input-message"
          />
          <Button
            type="submit"
            size="icon"
            variant="ghost"
            disabled={!inputValue.trim() || !conversationId || isTyping}
            className="absolute right-1 h-9 w-9 rounded-full text-primary hover:bg-primary/10"
            data-testid="button-send"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
