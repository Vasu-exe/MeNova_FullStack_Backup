import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Leaf, Loader2 } from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const SUGGESTED_QUESTIONS = [
  "What is BHRT?",
  "Common menopause symptoms?",
  "How does telehealth work?",
  "Is BHRT safe for me?",
];

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi! I'm MeNova's menopause health assistant. I can answer questions about menopause symptoms, BHRT, and how our telehealth care works. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          history: messages.slice(-6).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply || "I'm sorry, I couldn't process that. Please try again.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            "I'm having trouble connecting right now. For immediate help, please book a consultation at cal.com/menova/30min or email us directly.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      {/* Chat Bubble Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          style={{ backgroundColor: "oklch(0.24 0.07 155)" }}
          aria-label="Open chat"
        >
          <MessageCircle className="w-6 h-6 text-white" />
          {/* Notification dot */}
          <span
            className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white"
            style={{ backgroundColor: "oklch(0.60 0.12 42)" }}
          />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          style={{
            height: "min(580px, calc(100vh - 3rem))",
            border: "1px solid oklch(0.88 0.01 90)",
            backgroundColor: "white",
          }}
        >
          {/* Header */}
          <div
            className="px-5 py-4 flex items-center justify-between flex-shrink-0"
            style={{ backgroundColor: "oklch(0.24 0.07 155)" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center bg-white/15">
                <Leaf className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  MeNova Health Assistant
                </p>
                <p className="text-xs text-white/60" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  Ask about menopause & BHRT
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
            style={{ backgroundColor: "oklch(0.97 0.015 90)" }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className="max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    backgroundColor: msg.role === "user" ? "oklch(0.24 0.07 155)" : "white",
                    color: msg.role === "user" ? "white" : "oklch(0.30 0.005 65)",
                    border: msg.role === "assistant" ? "1px solid oklch(0.88 0.01 90)" : "none",
                    borderBottomRightRadius: msg.role === "user" ? "4px" : undefined,
                    borderBottomLeftRadius: msg.role === "assistant" ? "4px" : undefined,
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div
                  className="rounded-2xl px-4 py-3 flex items-center gap-2"
                  style={{ backgroundColor: "white", border: "1px solid oklch(0.88 0.01 90)" }}
                >
                  <Loader2 className="w-4 h-4 animate-spin" style={{ color: "oklch(0.24 0.07 155)" }} />
                  <span className="text-sm" style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.55 0.005 65)" }}>
                    Thinking...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions (only show when few messages) */}
          {messages.length <= 2 && !isLoading && (
            <div className="px-4 py-2 flex flex-wrap gap-2 border-t" style={{ borderColor: "oklch(0.92 0.01 90)", backgroundColor: "white" }}>
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-xs px-3 py-1.5 rounded-full transition-colors hover:opacity-80"
                  style={{
                    backgroundColor: "oklch(0.24 0.07 155 / 0.08)",
                    color: "oklch(0.24 0.07 155)",
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 600,
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="px-4 py-3 flex items-center gap-2 border-t flex-shrink-0"
            style={{ borderColor: "oklch(0.88 0.01 90)", backgroundColor: "white" }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about menopause, BHRT..."
              className="flex-1 px-3 py-2.5 rounded-xl border focus:outline-none text-sm"
              style={{
                borderColor: "oklch(0.88 0.01 90)",
                fontFamily: "'DM Sans', sans-serif",
                color: "oklch(0.22 0.005 65)",
              }}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2.5 rounded-xl transition-all disabled:opacity-40"
              style={{ backgroundColor: "oklch(0.24 0.07 155)" }}
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </form>

          {/* Disclaimer */}
          <div className="px-4 py-2 flex-shrink-0" style={{ backgroundColor: "oklch(0.97 0.015 90)" }}>
            <p className="text-[10px] text-center" style={{ fontFamily: "'DM Sans', sans-serif", color: "oklch(0.60 0.005 65)" }}>
              This AI assistant provides general information only. It is not medical advice. Always consult a licensed healthcare provider.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
