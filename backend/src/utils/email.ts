import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from './logger';

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
    if (transporter) return transporter;

    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: env.EMAIL_USER,
            pass: env.EMAIL_PASS,
        },
    });

    return transporter;
}

export async function sendPasswordResetEmail(toEmail: string, resetLink: string): Promise<void> {
    if (!env.EMAIL_USER || !env.EMAIL_PASS) {
        logger.warn('[EMAIL] EMAIL_USER atau EMAIL_PASS belum dikonfigurasi. Reset link: ' + resetLink);
        throw new Error('Layanan email belum dikonfigurasi');
    }

    const transport = getTransporter();

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #ef4444; font-size: 28px; margin: 0;">GymBuddy</h1>
            <p style="color: #666; font-size: 14px;">Platform Fitness Purwokerto</p>
        </div>
        <h2 style="color: #333; font-size: 22px;">Reset Password Anda</h2>
        <p style="color: #555; font-size: 16px; line-height: 1.6;">
            Anda menerima email ini karena ada permintaan untuk mereset password akun GymBuddy Anda.
        </p>
        <p style="color: #555; font-size: 16px; line-height: 1.6;">
            Klik tombol di bawah untuk membuat password baru:
        </p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background-color: #ef4444; color: #ffffff; padding: 14px 40px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
                Reset Password
            </a>
        </div>
        <p style="color: #999; font-size: 14px; line-height: 1.6;">
            Jika Anda tidak meminta reset password, abaikan email ini. Link ini akan kedaluwarsa dalam 15 menit.
        </p>
        <p style="color: #999; font-size: 14px;">
            Atau salin link berikut ke browser Anda:<br>
            <span style="color: #ef4444; word-break: break-all;">${resetLink}</span>
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">
            &copy; ${new Date().getFullYear()} GymBuddy. Email ini dikirim secara otomatis, mohon tidak membalas.
        </p>
    </div>
    `;

    await transport.sendMail({
        from: env.EMAIL_FROM,
        to: toEmail,
        subject: 'Reset Password - GymBuddy',
        html,
    });

    logger.info({ to: toEmail }, '[EMAIL] Password reset email sent');
}
