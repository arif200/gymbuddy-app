import { findAll, findById, findBySlug, create, update, remove, generateSlug } from './article.repo';

export class ArticleError extends Error {
    constructor(public statusCode: number, public code: string, message: string) {
        super(message);
    }
}

export async function listArticles(opts: { page: number; limit: number; kategori?: string; search?: string; publishedOnly?: boolean }) {
    const { rows, total } = await findAll(opts);
    const totalPages = Math.ceil(total / opts.limit);
    return { data: rows, meta: { page: opts.page, limit: opts.limit, total, totalPages } };
}

export async function getArticleById(id: number) {
    const article = await findById(id);
    if (!article) throw new ArticleError(404, 'NOT_FOUND', 'Artikel tidak ditemukan');
    return article;
}

export async function getArticleBySlug(slug: string) {
    const article = await findBySlug(slug);
    if (!article) throw new ArticleError(404, 'NOT_FOUND', 'Artikel tidak ditemukan');
    return article;
}

export async function createArticle(data: { title: string; content?: string; excerpt?: string; kategori: string; author_id: number; foto?: string; is_published: boolean }) {
    const slug = generateSlug(data.title);
    return await create({ ...data, slug });
}

export async function updateArticle(id: number, data: Record<string, unknown>) {
    const article = await findById(id);
    if (!article) throw new ArticleError(404, 'NOT_FOUND', 'Artikel tidak ditemukan');
    if (data.title && !data.slug) data.slug = generateSlug(data.title as string);
    return await update(id, data);
}

export async function deleteArticle(id: number) {
    const article = await findById(id);
    if (!article) throw new ArticleError(404, 'NOT_FOUND', 'Artikel tidak ditemukan');
    await remove(id);
    return true;
}
