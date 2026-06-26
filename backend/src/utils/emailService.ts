import { Resend } from 'resend';
import { env } from '../config/env';
import { logger } from './logger';

const resend = new Resend(env.RESEND_API_KEY);

export async function sendOtpEmail(toEmail: string, otp: string, nama: string): Promise<void> {
    if (!env.RESEND_API_KEY) {
        logger.warn('[EMAIL] RESEND_API_KEY belum dikonfigurasi. OTP untuk ' + toEmail + ': ' + otp);
        throw new Error('Layanan email belum dikonfigurasi');
    }

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #ef4444, #dc2626); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">GymBuddy</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0;">Verifikasi Email Anda</p>
        </div>
        <div style="background: #f9fafb; padding: 40px; border-radius: 0 0 16px 16px; border: 1px solid #e5e7eb; border-top: none;">
            <h2 style="color: #1f2937; font-size: 22px;">Halo, ${nama}!</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                Terima kasih telah mendaftar di GymBuddy. Untuk menyelesaikan pendaftaran, silakan verifikasi email Anda dengan kode OTP di bawah ini:
            </p>
            <div style="text-align: center; margin: 30px 0;">
                <div style="display: inline-block; background: white; border: 2px dashed #ef4444; border-radius: 12px; padding: 20px 40px;">
                    <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #ef4444;">${otp}</span>
                </div>
            </div>
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
                Kode ini akan kedaluwarsa dalam 5 menit. Jangan bagikan kode ini kepada siapapun.
            </p>
            <p style="color: #9ca3af; font-size: 14px;">
                Jika Anda tidak mendaftar di GymBuddy, abaikan email ini.
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
                &copy; ${new Date().getFullYear()} GymBuddy. Email ini dikirim secara otomatis, mohon tidak membalas.
            </p>
        </div>
    </div>
    `;

    const { error } = await resend.emails.send({
        from: env.EMAIL_FROM,
        to: toEmail,
        subject: 'Kode Verifikasi OTP - GymBuddy',
        html,
    });

    if (error) {
        logger.error({ err: error, to: toEmail }, '[EMAIL] Gagal mengirim OTP email');
        throw new Error('Gagal mengirim email: ' + error.message);
    }

    logger.info({ to: toEmail }, '[EMAIL] OTP email sent successfully');
}

export async function sendResetPasswordOtpEmail(toEmail: string, otp: string, nama: string): Promise<void> {
    if (!env.RESEND_API_KEY) {
        logger.warn('[EMAIL] RESEND_API_KEY belum dikonfigurasi. Reset OTP untuk ' + toEmail + ': ' + otp);
        throw new Error('Layanan email belum dikonfigurasi');
    }

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #ef4444, #dc2626); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">GymBuddy</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0;">Reset Password</p>
        </div>
        <div style="background: #f9fafb; padding: 40px; border-radius: 0 0 16px 16px; border: 1px solid #e5e7eb; border-top: none;">
            <h2 style="color: #1f2937; font-size: 22px;">Halo, ${nama}!</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                Anda menerima email ini karena ada permintaan untuk mereset password akun GymBuddy Anda. Gunakan kode OTP di bawah ini untuk mengganti password Anda:
            </p>
            <div style="text-align: center; margin: 30px 0;">
                <div style="display: inline-block; background: white; border: 2px dashed #ef4444; border-radius: 12px; padding: 20px 40px;">
                    <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #ef4444;">${otp}</span>
                </div>
            </div>
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
                Kode ini akan kedaluwarsa dalam 5 menit. Jangan bagikan kode ini kepada siapapun.
            </p>
            <p style="color: #9ca3af; font-size: 14px;">
                Jika Anda tidak meminta reset password, abaikan email ini.
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
                &copy; ${new Date().getFullYear()} GymBuddy. Email ini dikirim secara otomatis, mohon tidak membalas.
            </p>
        </div>
    </div>
    `;

    const { error } = await resend.emails.send({
        from: env.EMAIL_FROM,
        to: toEmail,
        subject: 'Kode OTP Reset Password - GymBuddy',
        html,
    });

    if (error) {
        logger.error({ err: error, to: toEmail }, '[EMAIL] Gagal mengirim reset password OTP email');
        throw new Error('Gagal mengirim email: ' + error.message);
    }

    logger.info({ to: toEmail }, '[EMAIL] Reset password OTP email sent successfully');
}
