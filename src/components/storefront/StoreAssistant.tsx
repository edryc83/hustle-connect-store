import { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

type Msg = { role: "user" | "assistant"; content: string; time: string };

function formatTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

interface StoreAssistantProps {
  storeSlug: string;
  storeName: string;
  profilePicUrl: string | null;
  whatsappNumber: string;
  sellerId: string;
}

export function StoreAssistantButton({ storeSlug, storeName, profilePicUrl, whatsappNumber, sellerId }: StoreAssistantProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-5 z-40 h-14 w-14 rounded-full shadow-lg flex items-center justify-center text-white animate-pulse hover:scale-105 transition-transform"
          style={{ backgroundColor: "#FF6B35" }}
          aria-label="Chat with AI assistant"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat Modal */}
      {open && (
        <StoreAssistantModal
          storeSlug={storeSlug}
          storeName={storeName}
          profilePicUrl={profilePicUrl}
          whatsappNumber={whatsappNumber}
          sellerId={sellerId}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function StoreAssistantModal({
  storeSlug,
  storeName,
  profilePicUrl,
  whatsappNumber,
  sellerId,
  onClose,
}: StoreAssistantProps & { onClose: () => void }) {
  const isMobile = useIsMobile();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Send welcome message on mount
  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        content: `Hey! 👋 I'm ${storeName}'s assistant. Ask me anything about our products — prices, sizes, availability. What are you looking for today?`,
        time: formatTime(),
      },
    ]);
  }, [storeName]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Msg = { role: "user", content: text, time: formatTime() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setError(false);

    try {
      const apiMessages = newMessages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({ role: m.role, content: m.content }));

      // Remove the initial welcome message from API calls (it's client-generated)
      const toSend = apiMessages.slice(1);

      const { data, error: fnError } = await supabase.functions.invoke("store-assistant", {
        body: { store_slug: storeSlug, messages: toSend },
      });

      if (fnError || !data?.reply) throw new Error(fnError?.message || "No response");

      const reply = data.reply as string;
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: reply, time: formatTime() },
      ]);
    } catch {
      setError(true);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I'm having a moment 😅 Tap below to chat with the seller directly",
          time: formatTime(),
        },
      ]);
    }
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Detect READY_TO_ORDER
  const buildWhatsAppUrl = (msg: Msg) => {
    const cleanNumber = whatsappNumber.replace(/[^0-9+]/g, "").replace(/^\+/, "");
    // Try to extract order details from conversation
    const allText = messages.map((m) => m.content).join("\n");

    // Simple extraction
    const nameMatch = allText.match(/(?:name|Name)[:\s]+([^\n,]+)/i);
    const phoneMatch = allText.match(/(?:phone|Phone|number)[:\s]+([^\n,]+)/i);
    const addressMatch = allText.match(/(?:address|Address|deliver|Deliver)[:\s]+([^\n,]+)/i);

    const lines = [
      "🤖 Order via Afristall AI",
      "",
      `Store: ${storeName}`,
    ];
    if (nameMatch) lines.push(`👤 Customer: ${nameMatch[1].trim()}`);
    if (phoneMatch) lines.push(`📞 Phone: ${phoneMatch[1].trim()}`);
    if (addressMatch) lines.push(`📍 Delivery: ${addressMatch[1].trim()}`);
    lines.push("", `Assisted by Afristall AI ✨`, `afristall.com/${storeSlug}`);

    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(lines.join("\n"))}`;
  };

  const containerClass = isMobile
    ? "fixed inset-x-0 bottom-0 z-50 flex flex-col bg-background border-t rounded-t-3xl shadow-2xl"
    : "fixed inset-0 z-50 flex items-center justify-center bg-black/50";

  const modalClass = isMobile
    ? "flex flex-col w-full"
    : "flex flex-col w-full max-w-md rounded-2xl border bg-background shadow-2xl overflow-hidden";

  const modalStyle = isMobile ? { height: "85vh" } : { height: "600px" };

  return (
    <div className={containerClass} onClick={!isMobile ? onClose : undefined}>
      <div className={modalClass} style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b bg-background shrink-0">
          {profilePicUrl ? (
            <img src={profilePicUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
          ) : (
            <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
              {storeName?.[0] || "S"}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{storeName}</p>
            <span
              className="inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
              style={{ backgroundColor: "#FF6B35" }}
            >
              AI Assistant
            </span>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {messages.map((msg, i) => {
            const isAssistant = msg.role === "assistant";
            const isReadyToOrder = isAssistant && msg.content.includes("READY_TO_ORDER");
            const displayContent = isReadyToOrder
              ? msg.content.replace("READY_TO_ORDER", "").trim()
              : msg.content;

            return (
              <div key={i}>
                <div className={`flex ${isAssistant ? "justify-start" : "justify-end"}`}>
                  {isAssistant && (
                    <Sparkles className="h-3.5 w-3.5 mt-2 mr-1.5 shrink-0 text-muted-foreground" />
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      isAssistant
                        ? "bg-card/80 backdrop-blur border border-border/50 text-foreground"
                        : "text-white"
                    }`}
                    style={!isAssistant ? { backgroundColor: "#FF6B35" } : undefined}
                  >
                    {displayContent}
                  </div>
                </div>
                <p className={`text-[10px] text-muted-foreground mt-0.5 ${isAssistant ? "ml-5" : "text-right"}`}>
                  {msg.time}
                </p>

                {/* WhatsApp handoff button */}
                {isReadyToOrder && (
                  <a
                    href={buildWhatsAppUrl(msg)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-2 w-full rounded-xl py-3 text-center text-white font-bold text-sm shadow-lg hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: "#FF6B35" }}
                  >
                    Complete order on WhatsApp →
                  </a>
                )}
              </div>
            );
          })}

          {/* Typing indicator */}
          {loading && (
            <div className="flex justify-start">
              <Sparkles className="h-3.5 w-3.5 mt-2 mr-1.5 shrink-0 text-muted-foreground" />
              <div className="bg-card/80 backdrop-blur border border-border/50 rounded-2xl px-4 py-3 flex gap-1.5">
                <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}

          {/* Error fallback WhatsApp button */}
          {error && (
            <a
              href={`https://wa.me/${whatsappNumber.replace(/[^0-9+]/g, "").replace(/^\+/, "")}?text=${encodeURIComponent("Hi! I was chatting with your AI assistant on Afristall and need some help 🙏")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-2 w-full rounded-xl py-3 text-center font-semibold text-sm border border-border bg-green-600 text-white hover:bg-green-700 transition-colors"
            >
              💬 Chat with seller on WhatsApp
            </a>
          )}
        </div>

        {/* Input */}
        <div className="border-t px-3 py-3 bg-background shrink-0">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about products, sizes, prices..."
              className="flex-1 h-10 rounded-xl border border-border bg-muted/30 px-3.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="h-10 w-10 rounded-xl flex items-center justify-center text-white disabled:opacity-40 transition-opacity"
              style={{ backgroundColor: "#FF6B35" }}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <p className="text-center text-[10px] text-muted-foreground/60 mt-2">
            Powered by Afristall AI ✨
          </p>
        </div>
      </div>
    </div>
  );
}
