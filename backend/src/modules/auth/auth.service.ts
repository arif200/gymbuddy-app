import bcrypt from 'bcrypt';
import crypto from 'crypto';
import NodeCache from 'node-cache';
import { findUserByEmail, findUserById, createUser, updatePassword } from './auth.repo';
import { signToken } from '../../utils/jwt';

// Token store: key = token, value = { userId, email }, TTL = 15 minutes
const resetTokenCache = new NodeCache({ stdTTL: 900, checkperiod: 120 });

export class AuthError extends Error {
    constructor(
        public statusCode: number,
        public code: string,
        message: string,
    ) {
        super(message);
    }
}

export async function registerCustomer(data: {
    nama: string;
    email: string;
    password: string;
    jenis_kelamin?: string;
    no_telp?: string;
    tanggal_lahir?: string;
    propinsi?: string;
    kota?: string;
}) {
    const existing = await findUserByEmail(data.email);
    if (existing) {
        throw new AuthError(409, 'CONFLICT', 'Email sudah digunakan');
    }

    const hashed = await bcrypt.hash(data.password, 10);
    const user = await createUser({
        nama: data.nama,
        email: data.email,
        password: hashed,
        role: 'customer',
        jenis_kelamin: data.jenis_kelamin,
        no_telp: data.no_telp,
        tanggal_lahir: data.tanggal_lahir,
        propinsi: data.propinsi,
        kota: data.kota,
    });

    const token = signToken({ id: user.id, role: user.role });
    return { user: sanitizeUser(user), token };
}

export async function registerTrainer(data: {
    nama: string;
    email: string;
    password: string;
    spesialisasi: string;
    bio?: string;
    no_telp?: string;
    propinsi?: string;
    kota?: string;
}) {
    const existing = await findUserByEmail(data.email);
    if (existing) {
        throw new AuthError(409, 'CONFLICT', 'Email sudah digunakan');
    }

    const hashed = await bcrypt.hash(data.password, 10);
    const user = await createUser({
        nama: data.nama,
        email: data.email,
        password: hashed,
        role: 'trainer',
        spesialisasi: data.spesialisasi,
        bio: data.bio,
        no_telp: data.no_telp,
        propinsi: data.propinsi,
        kota: data.kota,
    });

    const token = signToken({ id: user.id, role: user.role });
    return { user: sanitizeUser(user), token };
}

export async function registerAdmin(data: { nama: string; email: string; password: string }) {
    const existing = await findUserByEmail(data.email);
    if (existing) {
        throw new AuthError(409, 'CONFLICT', 'Email sudah digunakan');
    }

    const hashed = await bcrypt.hash(data.password, 10);
    const user = await createUser({
        nama: data.nama,
        email: data.email,
        password: hashed,
        role: 'admin',
    });

    const token = signToken({ id: user.id, role: user.role });
    return { user: sanitizeUser(user), token };
}

export async function login(email: string, password: string) {
    const user = await findUserByEmail(email);
    if (!user) {
        throw new AuthError(401, 'UNAUTHORIZED', 'Email atau password salah');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
        throw new AuthError(401, 'UNAUTHORIZED', 'Email atau password salah');
    }

    const token = signToken({ id: user.id, role: user.role });
    return { user: sanitizeUser(user), token };
}

export async function getMe(userId: number) {
    const user = await findUserById(userId);
    if (!user) {
        throw new AuthError(404, 'NOT_FOUND', 'User tidak ditemukan');
    }
    return sanitizeUser(user);
}

export async function forgotPassword(email: string) {
    const user = await findUserByEmail(email);
    if (!user) {
        throw new AuthError(404, 'NOT_FOUND', 'Email tidak terdaftar');
    }

    // Generate random token
    const token = crypto.randomBytes(32).toString('hex');
    resetTokenCache.set(token, { userId: user.id, email: user.email });

    return { message: 'Token reset password berhasil dibuat', token };
}

export async function resetPassword(token: string, newPassword: string) {
    const stored = resetTokenCache.get<{ userId: number; email: string }>(token);
    if (!stored) {
        throw new AuthError(400, 'INVALID_TOKEN', 'Token tidak valid atau sudah kedaluwarsa');
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    const updated = await updatePassword(stored.userId, hashed);
    if (!updated) {
        throw new AuthError(404, 'NOT_FOUND', 'User tidak ditemukan');
    }

    // Hapus token setelah digunakan
    resetTokenCache.del(token);

    return { message: 'Password berhasil diubah. Silakan login dengan password baru.' };
}

function sanitizeUser(user: any) {
    const { password, ...rest } = user;
    return rest;
}
