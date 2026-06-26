-- Migration: tambah unique index case-insensitive pada users.email
-- Memastikan tidak bisa ada 2 user dengan email yang sama hanya beda huruf besar/kecil.
-- Index ini komplementer dengan unique constraint bawaan pada kolom email (yang case-sensitive).
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_lower_unique"
    ON "users" (lower("email"));
