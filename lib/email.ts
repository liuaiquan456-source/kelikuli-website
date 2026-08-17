import nodemailer from "nodemailer";
import { prisma } from "./prisma";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? "smtp.qq.com",
  port: parseInt(process.env.SMTP_PORT ?? "465"),
  secure: (process.env.SMTP_PORT ?? "465") === "465",
  auth: {
    user: process.env.SMTP_USER ?? "",
    pass: process.env.SMTP_PASS ?? "",
  },
});

export async function sendInquiryEmail(data: {
  name: string;
  company: string;
  email: string;
  phone: string;
  product: string;
  message: string;
}) {
  const siteEmail = await prisma.setting.findUnique({ where: { key: "siteEmail" } });
  const to = siteEmail?.value || process.env.INQUIRY_EMAIL || "681682@qq.com";
  const from = process.env.SMTP_USER ?? "";

  await transporter.sendMail({
    from: `"Kelikuli Inquiry" <${from}>`,
    to,
    subject: `New Inquiry from ${data.name}${data.company ? ` (${data.company})` : ""}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
        <div style="background:#1a1a1a;padding:20px 24px">
          <h2 style="color:#C9A55A;margin:0;font-size:18px">New Inquiry — Kelikuli</h2>
        </div>
        <div style="padding:24px;background:#fff">
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:8px 0;color:#6b7280;width:120px;vertical-align:top">Name</td><td style="padding:8px 0;font-weight:600;color:#111">${data.name}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;vertical-align:top">Company</td><td style="padding:8px 0;color:#111">${data.company || "—"}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;vertical-align:top">Email</td><td style="padding:8px 0;color:#111"><a href="mailto:${data.email}" style="color:#C9A55A">${data.email}</a></td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;vertical-align:top">Phone/WhatsApp</td><td style="padding:8px 0;color:#111">${data.phone || "—"}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;vertical-align:top">Products</td><td style="padding:8px 0;color:#111">${data.product || "—"}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;vertical-align:top;border-top:1px solid #f3f4f6">Message</td><td style="padding:8px 0;color:#111;border-top:1px solid #f3f4f6;white-space:pre-line">${data.message}</td></tr>
          </table>
        </div>
        <div style="padding:12px 24px;background:#f9fafb;font-size:12px;color:#9ca3af">
          Sent automatically by Kelikuli website inquiry system
        </div>
      </div>
    `,
  });
}
