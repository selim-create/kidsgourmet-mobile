export interface Greeting {
  text: string;
  emoji: string;
}

export function useGreeting(): Greeting {
  const h = new Date().getHours();
  if (h < 6)  return { text: 'İyi geceler',   emoji: '🌙' };
  if (h < 12) return { text: 'Günaydın',      emoji: '☀️' };
  if (h < 17) return { text: 'İyi günler',    emoji: '🌤️' };
  if (h < 21) return { text: 'İyi akşamlar',  emoji: '🌆' };
  return             { text: 'İyi geceler',   emoji: '🌙' };
}
