export const FEEDBACK_TOPICS = {
  taste: "Lezzet ve kalite", speed: "Hizmet hızı", staff: "Personel", hygiene: "Hijyen", other: "Diğer",
} as const;
export type FeedbackTopic = keyof typeof FEEDBACK_TOPICS;
export type FeedbackInput = { topic: FeedbackTopic; rating: number; message: string; name: string | null; contact: string | null; lang: string };

export function parseFeedback(raw: Record<string, unknown>): FeedbackInput {
  const text = (key: string) => typeof raw[key] === "string" ? (raw[key] as string).trim() : "";
  const topic = text("topic");
  const rating = Number(text("rating"));
  const message = text("message");
  const name = text("name");
  const contact = text("contact");
  const lang = text("lang") || "tr";
  if (!Object.hasOwn(FEEDBACK_TOPICS, topic)) throw new Error("Bir konu seç.");
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new Error("1 ile 5 arasında puan seç.");
  if (!message || message.length > 1000) throw new Error("Mesajını 1–1000 karakter arasında yaz.");
  if (name.length > 80) throw new Error("Adın en fazla 80 karakter olabilir.");
  if (contact.length > 120 || (contact && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact) && !/^\+?[\d ()-]{7,25}$/.test(contact))) throw new Error("Geçerli bir telefon veya e-posta yaz.");
  if (!["tr", "en", "ar"].includes(lang)) throw new Error("Dil geçersiz.");
  return { topic: topic as FeedbackTopic, rating, message, name: name || null, contact: contact || null, lang };
}

/** Yalnızca özet anahtarlar bellekte tutulur; IP ve mesaj veritabanına oran sınırı için yazılmaz. */
export class FeedbackGuard {
  private ips = new Map<string, { count: number; until: number }>();
  private messages = new Map<string, number>();
  release(messageHash: string): void { this.messages.delete(messageHash); }
  accept(ipHash: string, messageHash: string, honeypot: string, now = Date.now()): boolean {
    if (honeypot) return false;
    for (const [key, value] of this.ips) if (value.until <= now) this.ips.delete(key);
    for (const [key, until] of this.messages) if (until <= now) this.messages.delete(key);
    const ip = this.ips.get(ipHash) ?? { count: 0, until: now + 3_600_000 };
    if (ip.count >= 5 || this.ips.size >= 10_000 || this.messages.size >= 50_000) return false;
    ip.count++;
    this.ips.set(ipHash, ip);
    if (this.messages.has(messageHash)) return false;
    this.messages.set(messageHash, now + 600_000);
    return true;
  }
}
