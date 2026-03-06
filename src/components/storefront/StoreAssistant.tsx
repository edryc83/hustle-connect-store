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
      className="fixed bottom-6 right-5 z-40 h-14 w-14 rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
      aria-label="Chat on WhatsApp"
    >
      <img src={whatsappIcon} alt="WhatsApp" className="h-14 w-14" />
    </a>
  );
}
