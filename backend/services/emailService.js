const nodemailer = require('nodemailer');
require('dotenv').config();
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});
const createTemplate = (title, content) => {
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
            <div style="background-color: #1e1e1e; padding: 20px; text-align: center;">
                <h1 style="color: #f1c40f; margin: 0;">BarberDyy</h1>
            </div>
            <div style="padding: 20px; background-color: #fff; color: #333;">
                <h2 style="color: #333;">${title}</h2>
                <p style="font-size: 16px; line-height: 1.5;">${content}</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #888; text-align: center;">
                    Email ini dikirim otomatis oleh sistem BarberDyy.<br>
                    Mohon jangan membalas email ini.
                </p>
            </div>
        </div>
    `;
};
const sendEmail = async (to, subject, htmlContent) => {
    try {
        const mailOptions = {
            from: `"BarberDyy Admin" <${process.env.SMTP_USER}>`,
            to: to,
            subject: subject,
            html: htmlContent
        };
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email terkirim: ' + info.response);
        return true;
    } catch (error) {
        console.error('❌ Gagal kirim email:', error);
        return false;
    }
};

module.exports = { sendEmail, createTemplate };