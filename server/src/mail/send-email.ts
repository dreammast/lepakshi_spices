import transporter from "./transporter.js";

type SendEmailOptions = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  const from = process.env.EMAIL_FROM || "Lepakshi Spices <noreply@lepakshispices.com>";

  const info = await transporter.sendMail({
    from,
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]*>/g, ""),
  });

  return info;
}

export function verificationEmailTemplate(name: string, verificationUrl: string) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#FAF8F3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
  <div style="background:#2A4A3C;padding:32px;text-align:center;">
    <h1 style="color:#C9920A;font-size:24px;margin:0;font-family:'Georgia',serif;">Lepakshi Spices</h1>
    <p style="color:#fff;opacity:0.8;font-size:13px;margin:6px 0 0;">Premium Quality Spices</p>
  </div>
  <div style="padding:40px 32px;">
    <h2 style="color:#1A1714;font-size:20px;margin:0 0 16px;">Verify Your Email</h2>
    <p style="color:#7A7064;font-size:14px;line-height:1.6;margin:0 0 24px;">
      Hi ${name || "there"},<br><br>
      Thank you for creating an account with Lepakshi Spices. Please verify your email address to get started.
    </p>
    <a href="${verificationUrl}" style="display:inline-block;background:#2A4A3C;color:#fff;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:600;font-size:14px;">Verify Email Address</a>
    <p style="color:#7A7064;font-size:12px;margin:24px 0 0;line-height:1.6;">
      This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.
    </p>
  </div>
  <div style="padding:16px 32px;background:#FAF8F3;text-align:center;">
    <p style="color:#7A7064;font-size:11px;margin:0;">Lepakshi Spices &copy; ${new Date().getFullYear()}. All rights reserved.</p>
  </div>
</div>
</body>
</html>`;
}

export function forgotPasswordOtpTemplate(name: string, otp: string) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#FAF8F3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
  <div style="background:#2A4A3C;padding:32px;text-align:center;">
    <h1 style="color:#C9920A;font-size:24px;margin:0;font-family:'Georgia',serif;">Lepakshi Spices</h1>
    <p style="color:#fff;opacity:0.8;font-size:13px;margin:6px 0 0;">Premium Quality Spices</p>
  </div>
  <div style="padding:40px 32px;text-align:center;">
    <h2 style="color:#1A1714;font-size:20px;margin:0 0 16px;">Password Reset</h2>
    <p style="color:#7A7064;font-size:14px;line-height:1.6;margin:0 0 24px;">
      Hi ${name || "there"},<br><br>
      We received a request to reset your password. Use the code below:
    </p>
    <div style="background:#FAF8F3;border-radius:12px;padding:20px;margin:0 0 24px;">
      <p style="font-size:32px;font-weight:700;color:#2A4A3C;letter-spacing:8px;margin:0;font-family:'Courier New',monospace;">${otp}</p>
    </div>
    <p style="color:#7A7064;font-size:12px;margin:0;line-height:1.6;">
      This code expires in 10 minutes. If you didn't request this, please ignore this email.
    </p>
  </div>
  <div style="padding:16px 32px;background:#FAF8F3;text-align:center;">
    <p style="color:#7A7064;font-size:11px;margin:0;">Lepakshi Spices &copy; ${new Date().getFullYear()}. All rights reserved.</p>
  </div>
</div>
</body>
</html>`;
}

export function welcomeEmailTemplate(name: string) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#FAF8F3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
  <div style="background:#2A4A3C;padding:32px;text-align:center;">
    <h1 style="color:#C9920A;font-size:24px;margin:0;font-family:'Georgia',serif;">Lepakshi Spices</h1>
    <p style="color:#fff;opacity:0.8;font-size:13px;margin:6px 0 0;">Premium Quality Spices</p>
  </div>
  <div style="padding:40px 32px;">
    <h2 style="color:#1A1714;font-size:20px;margin:0 0 16px;">Welcome to Lepakshi Spices!</h2>
    <p style="color:#7A7064;font-size:14px;line-height:1.6;margin:0 0 24px;">
      Hi ${name || "there"},<br><br>
      Your account has been created successfully. Start exploring our premium spice collection and enjoy the authentic flavors of India.
    </p>
    <a href="${process.env.FRONTEND_URL || "http://localhost:5174"}" style="display:inline-block;background:#2A4A3C;color:#fff;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:600;font-size:14px;">Shop Now</a>
  </div>
  <div style="padding:16px 32px;background:#FAF8F3;text-align:center;">
    <p style="color:#7A7064;font-size:11px;margin:0;">Lepakshi Spices &copy; ${new Date().getFullYear()}. All rights reserved.</p>
  </div>
</div>
</body>
</html>`;
}

export function passwordResetSuccessTemplate(name: string) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#FAF8F3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
  <div style="background:#2A4A3C;padding:32px;text-align:center;">
    <h1 style="color:#C9920A;font-size:24px;margin:0;font-family:'Georgia',serif;">Lepakshi Spices</h1>
    <p style="color:#fff;opacity:0.8;font-size:13px;margin:6px 0 0;">Premium Quality Spices</p>
  </div>
  <div style="padding:40px 32px;">
    <h2 style="color:#1A1714;font-size:20px;margin:0 0 16px;">Password Reset Successful</h2>
    <p style="color:#7A7064;font-size:14px;line-height:1.6;margin:0 0 24px;">
      Hi ${name || "there"},<br><br>
      Your password has been successfully reset. You can now log in with your new password.
    </p>
    <a href="${process.env.FRONTEND_URL || "http://localhost:5174"}" style="display:inline-block;background:#2A4A3C;color:#fff;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:600;font-size:14px;">Sign In</a>
    <p style="color:#7A7064;font-size:12px;margin:24px 0 0;line-height:1.6;">
      If you didn't reset your password, please contact our support team immediately.
    </p>
  </div>
  <div style="padding:16px 32px;background:#FAF8F3;text-align:center;">
    <p style="color:#7A7064;font-size:11px;margin:0;">Lepakshi Spices &copy; ${new Date().getFullYear()}. All rights reserved.</p>
  </div>
</div>
</body>
</html>`;
}
