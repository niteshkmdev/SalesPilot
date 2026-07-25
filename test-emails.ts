import { sendEmail } from "./src/server/email/mailer";

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildVerificationEmailHtml(params: {
  name: string;
  url: string;
}): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <style>
    :root { color-scheme: light dark; supported-color-schemes: light dark; }
    @media (prefers-color-scheme: dark) {
      body, .body-bg { background-color: #030712 !important; }
      .container { background-color: #111827 !important; border: 1px solid #374151 !important; }
      h1, .text-heading { color: #f9fafb !important; }
      p, .text-body { color: #d1d5db !important; }
      .button { background-color: #6366f1 !important; color: #ffffff !important; border: 1px solid #6366f1 !important; }
      .footer-text { color: #6b7280 !important; border-top-color: #374151 !important; }
    }
    @media (max-width: 480px) {
      .body-bg { padding: 16px 8px !important; }
      .container { padding: 32px 16px !important; }
      h1 { font-size: 20px !important; }
      .button-wrapper { text-align: center !important; }
      .button { display: block !important; width: 100% !important; box-sizing: border-box !important; }
    }
  </style>
</head>
<body class="body-bg" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 40px 20px;">
  <div class="container" style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 40px; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
    <h1 class="text-heading" style="font-size: 24px; font-weight: 700; color: #111827; margin-top: 0; margin-bottom: 24px; text-align: left;">
      Verify your email address
    </h1>
    <p class="text-body" style="color: #4b5563; font-size: 16px; line-height: 24px; margin-top: 0; margin-bottom: 16px;">
      Hi ${escapeHtml(params.name)},
    </p>
    <p class="text-body" style="color: #4b5563; font-size: 16px; line-height: 24px; margin-top: 0; margin-bottom: 16px;">
      Thank you for signing up for SalesPilot. Please verify your email address by clicking the button below.
    </p>
    <div class="button-wrapper" style="text-align: left; margin-top: 32px; margin-bottom: 32px;">
      <a href="${params.url}" class="button" style="display: inline-block; background-color: #4f46e5; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; text-align: center;">
        Verify email
      </a>
    </div>
    <p class="footer-text" style="color: #9ca3af; font-size: 14px; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center; line-height: 20px;">
      This link expires in 24 hours. If you didn&apos;t create an account, you can safely ignore this email.
    </p>
  </div>
</body>
</html>`.trim();
}

function buildPasswordResetEmailHtml(params: {
  name: string;
  url: string;
}): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <style>
    :root { color-scheme: light dark; supported-color-schemes: light dark; }
    @media (prefers-color-scheme: dark) {
      body, .body-bg { background-color: #030712 !important; }
      .container { background-color: #111827 !important; border: 1px solid #374151 !important; }
      h1, .text-heading { color: #f9fafb !important; }
      p, .text-body { color: #d1d5db !important; }
      .button { background-color: #6366f1 !important; color: #ffffff !important; border: 1px solid #6366f1 !important; }
      .footer-text { color: #6b7280 !important; border-top-color: #374151 !important; }
    }
    @media (max-width: 480px) {
      .body-bg { padding: 16px 8px !important; }
      .container { padding: 32px 16px !important; }
      h1 { font-size: 20px !important; }
      .button-wrapper { text-align: center !important; }
      .button { display: block !important; width: 100% !important; box-sizing: border-box !important; }
    }
  </style>
</head>
<body class="body-bg" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 40px 20px;">
  <div class="container" style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 40px; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
    <h1 class="text-heading" style="font-size: 24px; font-weight: 700; color: #111827; margin-top: 0; margin-bottom: 24px; text-align: left;">
      Reset your password
    </h1>
    <p class="text-body" style="color: #4b5563; font-size: 16px; line-height: 24px; margin-top: 0; margin-bottom: 16px;">
      Hi ${escapeHtml(params.name)},
    </p>
    <p class="text-body" style="color: #4b5563; font-size: 16px; line-height: 24px; margin-top: 0; margin-bottom: 16px;">
      We received a request to reset your SalesPilot password. Click the button below to choose a new one.
    </p>
    <div class="button-wrapper" style="text-align: left; margin-top: 32px; margin-bottom: 32px;">
      <a href="${params.url}" class="button" style="display: inline-block; background-color: #4f46e5; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; text-align: center;">
        Reset password
      </a>
    </div>
    <p class="footer-text" style="color: #9ca3af; font-size: 14px; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center; line-height: 20px;">
      If you didn&apos;t request a password reset you can safely ignore this email. This link expires in 1 hour.
    </p>
  </div>
</body>
</html>`.trim();
}

async function runTest() {
  const targetEmail = "nk.technical.org@gmail.com";
  const targetName = "Nitesh Kumar Mishra";
  const dummyUrl = "http://localhost:3000/verify?token=test-dummy-token-123";

  try {
    console.log("Sending verification email test...");
    await sendEmail({
      to: targetEmail,
      subject: "TEST: Verify your SalesPilot email address",
      html: buildVerificationEmailHtml({ name: targetName, url: dummyUrl }),
      text: `TEST: Verify your email: ${dummyUrl}`,
    });
    console.log("Verification email sent successfully.\n");

    console.log("Sending password reset email test...");
    await sendEmail({
      to: targetEmail,
      subject: "TEST: Reset your SalesPilot password",
      html: buildPasswordResetEmailHtml({ name: targetName, url: dummyUrl }),
      text: `TEST: Reset your password: ${dummyUrl}`,
    });
    console.log("Password reset email sent successfully.\n");

    console.log("All tests passed!");
  } catch (error) {
    console.error("Failed to send emails:", error);
  }
}

runTest();
