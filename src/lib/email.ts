import nodemailer from 'nodemailer';

// SMTP 설정
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  try {
    const info = await transporter.sendMail({
      from: `"선박조종연구소" <${from}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // HTML 태그 제거한 텍스트 버전
    });

    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
}

// 비밀번호 재설정 이메일 템플릿
export function getPasswordResetEmailTemplate(resetUrl: string, userName?: string) {
  const name = userName || '회원';

  return {
    subject: '[선박조종연구소] 비밀번호 재설정 안내',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>비밀번호 재설정</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center; background-color: #1e3a5f; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">선박조종연구소</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; color: #1e3a5f; font-size: 20px; font-weight: 600;">비밀번호 재설정 안내</h2>

              <p style="margin: 0 0 16px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                안녕하세요, ${name}님.
              </p>

              <p style="margin: 0 0 24px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                비밀번호 재설정 요청이 접수되었습니다.<br>
                아래 버튼을 클릭하여 새 비밀번호를 설정해 주세요.
              </p>

              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; background-color: #2563eb; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 6px;">비밀번호 재설정</a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 8px 0; color: #666666; font-size: 14px; line-height: 1.6;">
                버튼이 작동하지 않으면 아래 링크를 복사하여 브라우저에 붙여넣기 해주세요:
              </p>
              <p style="margin: 0 0 24px 0; color: #2563eb; font-size: 14px; word-break: break-all;">
                ${resetUrl}
              </p>

              <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;">

              <p style="margin: 0; color: #999999; font-size: 13px; line-height: 1.6;">
                이 링크는 <strong>1시간</strong> 후에 만료됩니다.<br>
                본인이 요청하지 않았다면 이 이메일을 무시해 주세요.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; background-color: #f9f9f9; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0; color: #999999; font-size: 12px;">
                &copy; ${new Date().getFullYear()} 선박조종연구소. All rights reserved.<br>
                본 메일은 발신 전용이며, 회신되지 않습니다.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  };
}
