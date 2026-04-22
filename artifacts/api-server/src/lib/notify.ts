import nodemailer from "nodemailer";
import { db, siteSettingsTable } from "@workspace/db";

interface NotificationData {
  customerName: string;
  customerEmail: string;
  referenceNumber: string;
  newStatus: string;
  trackingUrl: string;
}

const STATUS_LABELS: Record<string, string> = {
  new: "Enquiry Received",
  in_discussion: "In Discussion",
  quoted: "Quote Sent",
  closed: "Closed",
};

function buildEmailHtml(data: NotificationData): string {
  const statusLabel = STATUS_LABELS[data.newStatus] ?? data.newStatus;
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Enquiry Status Update – Stone World</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="background:#000000;padding:28px 40px;">
              <span style="color:#00B4B4;font-size:22px;font-weight:700;letter-spacing:2px;">STONE WORLD</span>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 8px;color:#999;font-size:13px;text-transform:uppercase;letter-spacing:1px;">Enquiry Update</p>
              <h1 style="margin:0 0 24px;font-size:26px;font-weight:600;color:#111;">Your enquiry status has been updated</h1>
              <p style="margin:0 0 4px;color:#555;font-size:14px;">Hi <strong>${data.customerName}</strong>,</p>
              <p style="margin:0 0 28px;color:#555;font-size:14px;line-height:1.6;">
                Your enquiry <strong style="color:#000;">${data.referenceNumber}</strong> has been updated to:
              </p>
              <div style="background:#f0fafa;border-left:4px solid #00B4B4;padding:16px 20px;border-radius:0 6px 6px 0;margin-bottom:28px;">
                <span style="color:#00B4B4;font-size:18px;font-weight:700;">${statusLabel}</span>
              </div>
              <a href="${data.trackingUrl}"
                 style="display:inline-block;background:#000;color:#fff;text-decoration:none;padding:14px 28px;border-radius:6px;font-size:14px;font-weight:600;letter-spacing:0.5px;">
                Track Your Enquiry
              </a>
              <p style="margin:32px 0 0;color:#aaa;font-size:12px;line-height:1.6;">
                If you have any questions, reply to this email or contact us directly.<br/>
                You are receiving this because you submitted an enquiry with AB Stone World Pvt. Ltd.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#f9f9f9;padding:20px 40px;text-align:center;">
              <p style="margin:0;color:#bbb;font-size:12px;">© ${new Date().getFullYear()} AB Stone World Pvt. Ltd. · Est. 2003</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

export async function sendStatusNotification(data: NotificationData): Promise<void> {
  const [settings] = await db.select().from(siteSettingsTable).limit(1);

  if (!settings?.notificationsEnabled) return;
  if (!settings.smtpHost || !settings.smtpUser || !settings.smtpPass) return;

  const transporter = nodemailer.createTransport({
    host: settings.smtpHost,
    port: settings.smtpPort ? parseInt(settings.smtpPort, 10) : 587,
    secure: settings.smtpPort === "465",
    auth: {
      user: settings.smtpUser,
      pass: settings.smtpPass,
    },
  });

  const from = settings.smtpFrom ?? settings.smtpUser;
  const statusLabel = STATUS_LABELS[data.newStatus] ?? data.newStatus;

  await transporter.sendMail({
    from: `"Stone World" <${from}>`,
    to: data.customerEmail,
    subject: `Your enquiry ${data.referenceNumber} – ${statusLabel}`,
    html: buildEmailHtml(data),
    text: `Hi ${data.customerName},\n\nYour enquiry ${data.referenceNumber} has been updated to: ${statusLabel}.\n\nTrack your enquiry: ${data.trackingUrl}\n\n– Stone World`,
  });
}
