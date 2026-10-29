import type { Pool, RowDataPacket, ResultSetHeader } from "mysql2/promise";
import type { FeedbackInput, FeedbackTopic } from "./input";
import { FEEDBACK_TOPICS } from "./input";
import { removeFeedbackImage } from "./images";

export interface FeedbackRow extends RowDataPacket {
  id: number; created_at: Date; topic: FeedbackTopic; rating: number; message: string;
  name: string | null; contact: string | null; image_key: string | null; is_read: number;
}
export type FeedbackFilter = { topic?: string; rating?: number; unread?: boolean; page?: number };
export async function createFeedback(pool: Pool, input: FeedbackInput, imageKey: string | null): Promise<number> {
  const [row] = await pool.execute<ResultSetHeader>(
    "INSERT INTO feedbacks (topic, rating, message, name, contact, image_key, lang) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [input.topic, input.rating, input.message, input.name, input.contact, imageKey, input.lang],
  );
  return row.insertId;
}
export async function listFeedback(pool: Pool, filter: FeedbackFilter) {
  const clauses: string[] = [];
  const params: Array<string | number> = [];
  if (filter.topic && Object.hasOwn(FEEDBACK_TOPICS, filter.topic)) { clauses.push("topic = ?"); params.push(filter.topic); }
  if (filter.rating && Number.isInteger(filter.rating) && filter.rating >= 1 && filter.rating <= 5) { clauses.push("rating = ?"); params.push(filter.rating); }
  if (filter.unread) clauses.push("is_read = 0");
  const where = clauses.length ? ` WHERE ${clauses.join(" AND ")}` : "";
  const [[count]] = await pool.query<RowDataPacket[]>(`SELECT COUNT(*) AS n FROM feedbacks${where}`, params);
  const pages = Math.max(1, Math.ceil(Number(count.n) / 30));
  const page = Math.min(pages, Math.max(1, Math.floor(filter.page || 1)));
  const [items] = await pool.query<FeedbackRow[]>(`SELECT * FROM feedbacks${where} ORDER BY created_at DESC, id DESC LIMIT 30 OFFSET ?`, [...params, (page - 1) * 30]);
  return { items, page, pages, total: Number(count.n) };
}
export async function feedbackSummary(pool: Pool) {
  const [[row]] = await pool.query<RowDataPacket[]>("SELECT COALESCE(SUM(is_read = 0), 0) AS unread, AVG(CASE WHEN created_at >= UTC_TIMESTAMP() - INTERVAL 30 DAY THEN rating END) AS average FROM feedbacks");
  const [latest] = await pool.query<FeedbackRow[]>("SELECT id, message FROM feedbacks ORDER BY created_at DESC, id DESC LIMIT 3");
  return { unread: Number(row.unread), average: row.average === null ? null : Number(row.average), latest };
}
export async function markFeedbackRead(pool: Pool, id: number): Promise<void> {
  await pool.execute("UPDATE feedbacks SET is_read = 1 WHERE id = ?", [id]);
}
export async function deleteFeedback(pool: Pool, id: number): Promise<void> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[row]] = await conn.query<FeedbackRow[]>("SELECT image_key FROM feedbacks WHERE id = ? FOR UPDATE", [id]);
    if (row?.image_key) await removeFeedbackImage(row.image_key);
    await conn.execute("DELETE FROM feedbacks WHERE id = ?", [id]);
    await conn.commit();
  } catch (e) { await conn.rollback(); throw e; } finally { conn.release(); }
}
