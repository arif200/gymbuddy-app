import { findAllTrainers, findTrainerById, findTrainerByName, updateTrainer, getTrainerSessions } from './trainer.repo';

export class TrainerError extends Error {
    constructor(
        public statusCode: number,
        public code: string,
        message: string,
    ) {
        super(message);
    }
}

export async function listTrainers(opts: {
    page: number;
    limit: number;
    search?: string;
    kota?: string;
    spesialisasi?: string;
    sort: string;
    order: string;
}) {
    const { rows, total } = await findAllTrainers(opts);
    const totalPages = Math.ceil(total / opts.limit);
    return {
        data: rows,
        meta: { page: opts.page, limit: opts.limit, total, totalPages },
    };
}

export async function getTrainerById(id: number) {
    const trainer = await findTrainerById(id);
    if (!trainer) {
        throw new TrainerError(404, 'NOT_FOUND', 'Trainer tidak ditemukan');
    }
    return trainer;
}

export async function getTrainerByName(nama: string) {
    const trainers = await findTrainerByName(nama);
    return trainers;
}

export async function updateTrainerProfile(
    id: number,
    data: Record<string, unknown>,
    userId: number,
    userRole: string,
) {
    const trainer = await findTrainerById(id);
    if (!trainer) {
        throw new TrainerError(404, 'NOT_FOUND', 'Trainer tidak ditemukan');
    }

    if (userRole !== 'admin' && id !== userId) {
        throw new TrainerError(403, 'FORBIDDEN', 'Anda tidak memiliki izin untuk mengubah profil ini');
    }

    const updated = await updateTrainer(id, data);
    return sanitizeUser(updated);
}

export async function getTrainerSessionsByTrainerId(trainerId: number) {
    const trainer = await findTrainerById(trainerId);
    if (!trainer) {
        throw new TrainerError(404, 'NOT_FOUND', 'Trainer tidak ditemukan');
    }
    return await getTrainerSessions(trainerId);
}

function sanitizeUser(user: any) {
    if (!user) return null;
    const { password, ...rest } = user;
    return rest;
}
