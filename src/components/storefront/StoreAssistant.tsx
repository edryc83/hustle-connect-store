import whatsappIcon from "@/assets/whatsapp-icon.png";

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
