import nodemailer, { Transporter } from 'nodemailer';
import env from './env';

interface EmailOptions {
  receiver: string;
  subject: string;
  content: string;
  isHTML?: boolean;
}

interface HTMLEmailOptions {
  receiver: string;
  subject: string;
  html: string;
}

interface TextEmailOptions {
  receiver: string;
  subject: string;
  text: string;
}

const transporter: Transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: true,
  auth: {
    user: env.EMAIL_USERNAME,
    pass: env.EMAIL_PASSWORD,
  },
});

/**
 * Send an email using the provided options
 * @param {EmailOptions} options - The email options
 * @returns {Promise<Object>} - The result of the email sending operation
 */
async function sendEmail({
  receiver,
  subject,
  content,
  isHTML = false,
}: EmailOptions): Promise<nodemailer.SentMessageInfo> {
  const mailOptions = {
    from: env.EMAIL_USERNAME,
    to: receiver,
    subject,
    [isHTML ? 'html' : 'text']: content,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send email. Please try again later.');
  }
}

/**
 * Send an HTML email
 * @param {HTMLEmailOptions} params - The email parameters
 * @returns {Promise<Object>} - The result of the email sending operation
 */
export async function sendHTMLEmail({
  receiver,
  subject,
  html,
}: HTMLEmailOptions): Promise<nodemailer.SentMessageInfo> {
  return sendEmail({ receiver, subject, content: html, isHTML: true });
}

/**
 * Send a plain text email
 * @param {TextEmailOptions} params - The email parameters
 * @returns {Promise<Object>} - The result of the email sending operation
 */
export async function sendTextEmail({
  receiver,
  subject,
  text,
}: TextEmailOptions): Promise<nodemailer.SentMessageInfo> {
  return sendEmail({ receiver, subject, content: text });
}

export default sendEmail;
