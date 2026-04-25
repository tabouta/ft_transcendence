import { Resend } from "resend";
import { RESEND_API_KEY } from "$env/static/private";

export async function sendGdprExportEmail(to: string, confirmUrl: string) {
  const resend = new Resend(RESEND_API_KEY);
  await resend.emails.send({
    from: "onboarding@resend.dev",
    to,
    subject: "Confirm your data download request",
    html: `
      <p>You requested a download of your personal data from Bibi's Farm.</p>
      <p><a href="${confirmUrl}">Download my data</a></p>
      <p>This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>
    `,
  });
}

export async function sendGdprDeleteEmail(to: string, confirmUrl: string) {
  const resend = new Resend(RESEND_API_KEY);
  await resend.emails.send({
    from: "onboarding@resend.dev",
    to,
    subject: "Confirm your account deletion",
    html: `
      <p>You requested to permanently delete your Bibi's Farm account. This action cannot be undone.</p>
      <p><a href="${confirmUrl}">Confirm account deletion</a></p>
      <p>This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
    `,
  });
}
