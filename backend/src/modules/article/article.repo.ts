import { eq, ilike, and, desc, sql } from 'drizzle-orm';
import { db } from '../../db/client';
import { articles, users } from '../../db/schema';

export async function findAll(opts: { page: number; limit: number; kategori?: string; search?: string; publishedOnly?: boolean }) {
    const conditions = [];
    if (opts.kategori) conditions.push(eq(articles.kategori, opts.kategori as any));
    if (opts.search) conditions.push(ilike(articles.title, `%${opts.search}%`));
    if (opts.publishedOnly) conditions.push(eq(articles.is_published, true));
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const rows = await db.select({
        id: articles.id, title: articles.title, slug: articles.slug, excerpt: articles.excerpt,
        kategori: articles.kategori, foto: articles.foto, is_published: articles.is_published,
        published_at: articles.published_at, createdAt: articles.createdAt,
        author_nama: users.nama,
    })
    .from(articles)
    .leftJoin(users, eq(articles.author_id, users.id))
    .where(where)
    .orderBy(desc(articles.createdAt))
    .limit(opts.limit)
    .offset((opts.page - 1) * opts.limit);

    const countResult = await db.select({ count: sql<number>`count(*)` }).from(articles).where(where);
    return { rows, total: Number(countResult[0].count) };
}

export async function findById(id: number) {
    const rows = await db.select({
        id: articles.id, title: articles.title, slug: articles.slug, content: articles.content,
        excerpt: articles.excerpt, kategori: articles.kategori, foto: articles.foto,
        is_published: articles.is_published, published_at: articles.published_at,
        createdAt: articles.createdAt, updatedAt: articles.updatedAt,
        author_id: articles.author_id, author_nama: users.nama,
    })
    .from(articles)
    .leftJoin(users, eq(articles.author_id, users.id))
    .where(eq(articles.id, id))
    .limit(1);
    return rows[0] ?? null;
}

export async function findBySlug(slug: string) {
    const rows = await db.select({
        id: articles.id, title: articles.title, slug: articles.slug, content: articles.content,
        excerpt: articles.excerpt, kategori: articles.kategori, foto: articles.foto,
        is_published: articles.is_published, published_at: articles.published_at,
        createdAt: articles.createdAt, updatedAt: articles.updatedAt,
        author_id: articles.author_id, author_nama: users.nama,
    })
    .from(articles)
    .leftJoin(users, eq(articles.author_id, users.id))
    .where(eq(articles.slug, slug))
    .limit(1);
    return rows[0] ?? null;
}

export async function create(data: { title: string; slug: string; content?: string; excerpt?: string; kategori: string; author_id: number; foto?: string; is_published: boolean }) {
    const rows = await db.insert(articles).values({
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt,
        kategori: data.kategori as any,
        author_id: data.author_id,
        foto: data.foto,
        is_published: data.is_published,
        published_at: data.is_published ? new Date() : null,
    }).returning();
    return rows[0];
}

export async function update(id: number, data: Record<string, unknown>) {
    const updateData: Record<string, unknown> = { ...data, updatedAt: new Date() };
    if (data.is_published === true) updateData.published_at = new Date();
    if (data.kategori) updateData.kategori = data.kategori as any;
    const rows = await db.update(articles).set(updateData as any).where(eq(articles.id, id)).returning();
    return rows[0] ?? null;
}

export async function remove(id: number) {
    await db.delete(articles).where(eq(articles.id, id));
    return true;
}

export function generateSlug(title: string): string {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') + '-' + Date.now().toString(36);
}
