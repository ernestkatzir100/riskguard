'use server';

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(to: string, subject: string, html: string) {
  const from = process.env.EMAIL_FROM || 'noreply@riskguard.co.il';

  try {
    await resend.emails.send({ from, to, subject, html });
  } catch (error) {
    console.error('Failed to send email:', error);
    // Don't throw -- email failures shouldn't break the app
  }
}
