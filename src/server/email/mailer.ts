import nodemailer, { type SendMailOptions, type Transporter } from "nodemailer";
import { env } from "@/server/env";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Creates a Nodemailer transporter configured from environment variables.
 *
 * Returns `null` when SMTP credentials are not present, which allows the
 * application to start without a mailer configured (e.g., during local
 * development without email setup).
 */
function createTransporter(): Transporter | null {
  if (
    !env.SMTP_HOST ||
    !env.SMTP_PORT ||
    !env.SMTP_USER ||
    !env.SMTP_PASSWORD
  ) {
    return null;
  }

  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASSWORD,
    },
  });
}

const transporter = createTransporter();

/**
 * Sends an email using the configured SMTP transport.
 *
 * Throws when SMTP credentials are missing, so callers can decide whether
 * to propagate the error or swallow it for non-critical emails.
 */
export async function sendEmail(options: SendEmailOptions): Promise<void> {
  if (!transporter) {
    throw new Error(
      "SMTP transport is not configured. Provide SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASSWORD.",
    );
  }

  const from = env.EMAIL_FROM ?? "SalesPilot <noreply@salespilot.app>";

  const mailOptions: SendMailOptions = {
    from,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  };

  await transporter.sendMail(mailOptions);
}
