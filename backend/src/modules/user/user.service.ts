import { findAll, findById, findByEmail, updateUser, deleteUser } from './user.repo';

export class UserError extends Error {
    constructor(
        public statusCode: number,
        public code: string,
        message: string,
    ) {
        super(message);
    }
}

export async function listUsers(opts: {
    page: number;
    limit: number;
    search?: string;
    role?: string;
    kota?: string;
    sort: string;
    order: string;
}) {
    const { rows, total } = await findAll(opts);
    const totalPages = Math.ceil(total / opts.limit);
    return {
        data: rows.map(sanitizeUser),
        meta: { page: opts.page, limit: opts.limit, total, totalPages },
    };
}

export async function getUserById(id: number) {
    const user = await findById(id);
    if (!user) {
        throw new UserError(404, 'NOT_FOUND', 'User tidak ditemukan');
    }
    return sanitizeUser(user);
}

export async function getUserByEmail(email: string) {
    const user = await findByEmail(email);
    if (!user) {
        throw new UserError(404, 'NOT_FOUND', 'User tidak ditemukan');
    }
    return sanitizeUser(user);
}

export async function updateUserProfile(userId: number, data: Record<string, unknown>) {
    const updated = await updateUser(userId, data);
    if (!updated) {
        throw new UserError(404, 'NOT_FOUND', 'User tidak ditemukan');
    }
    return sanitizeUser(updated);
}

export async function deleteUserById(id: number) {
    const user = await findById(id);
    if (!user) {
        throw new UserError(404, 'NOT_FOUND', 'User tidak ditemukan');
    }
    await deleteUser(id);
    return true;
}

function sanitizeUser(user: any) {
    const { password, ...rest } = user;
    return rest;
}
