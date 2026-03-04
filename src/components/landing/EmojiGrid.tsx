const emojis = [
  "👗", "📱", "👟", "🍲", "💄", "🎧", "👜", "🕶️",
  "🧴", "📦", "🎒", "⌚", "💍", "🧢", "👠", "🎁",
  "🛍️", "✨", "🧥", "📸", "💻", "🎨", "🪴", "🍰",
  "👔", "🧴", "🎵", "📚", "🛒", "🌺", "💅", "🧳",
  "👗", "📱", "👟", "🍲", "💄", "🎧", "👜", "🕶️",
  "🧴", "📦", "🎒", "⌚", "💍", "🧢", "👠", "🎁",
];

const EmojiGrid = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.07] dark:opacity-[0.05]">
    <div className="grid grid-cols-8 gap-6 p-4 sm:gap-8 sm:p-8">
      {emojis.map((emoji, i) => (
        <div
          key={i}
          className="flex items-center justify-center text-3xl sm:text-4xl lg:text-5xl animate-emoji-pulse select-none"
          style={{ animationDelay: `${(i % 7) * 0.4}s` }}
        >
          {emoji}
        </div>
      ))}
    </div>
  </div>
);

export default EmojiGrid;
