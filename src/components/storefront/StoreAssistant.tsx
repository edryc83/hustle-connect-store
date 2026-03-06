interface StoreAssistantProps {
  whatsappNumber: string;
}

export function StoreAssistantButton({ whatsappNumber }: StoreAssistantProps) {
  const cleanNumber = whatsappNumber.replace(/[^0-9+]/g, "").replace(/^\+/, "");
  const whatsappUrl = `https://wa.me/${cleanNumber}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-5 z-40 h-14 w-14 rounded-full shadow-lg flex items-center justify-center text-white hover:scale-105 transition-transform"
      style={{ backgroundColor: "#25D366" }}
      aria-label="Chat on WhatsApp"
    >
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-5.031 1.378c-1.57.92-2.846 2.318-3.645 3.785-1.644 2.69-1.332 5.953.768 8.477 1.231 1.438 2.979 2.579 4.884 2.929.846.131 1.667.072 2.228-.236l.5.766a.264.264 0 00.231.141h.004c.402 0 .734-.328.734-.73V4.889c0-.234.188-.424.42-.424h.456c1.202 0 2.359-.367 3.29-1.095 1.395-1.062 2.269-2.655 2.269-4.394 0-.326-.024-.645-.07-.946-.204-1.409-.844-2.646-1.769-3.54C14.686.672 13.607.138 12.406.138z"/>
      </svg>
    </a>
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
