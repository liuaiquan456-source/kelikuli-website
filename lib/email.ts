import nodemailer from "nodemailer";
import { prisma } from "./prisma";
import type { InquiryAttribution } from "./inquiry-data";
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? "smtp.qq.com",
  port: parseInt(process.env.SMTP_PORT ?? "465"),
  secure: (process.env.SMTP_PORT ?? "465") === "465",
  auth: {
    user: process.env.SMTP_USER ?? "",
    pass: process.env.SMTP_PASS ?? "",
  },
});
export function escapeEmailText(value: string) {
  return value.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
}
export async function sendInquiryEmail(data: {
  name: string;
  company: string;
  email: string;
  phone: string;
  product: string;
  message: string;
  attachments?: { url: string; name: string }[];
  attribution?: InquiryAttribution;
}) {
  const siteEmail = await prisma.setting.findUnique({
    where: { key: "siteEmail" },
  });
  const rows = {
    Name: data.name,
    Company: data.company,
    Email: data.email,
    "Phone / WhatsApp": data.phone,
    Product: data.product,
    Message: data.message,
    ...(data.attribution || {}),
  };
  await transporter.sendMail({
    from: `"Kelikuli Inquiry" <${process.env.SMTP_USER ?? ""}>`,
    to: siteEmail?.value || process.env.INQUIRY_EMAIL || "681682@qq.com",
    ...(data.email ? { replyTo: data.email } : {}),
    subject: `New Inquiry from ${data.name.replace(/[\r\n]/g, " ")}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:680px;margin:auto"><h2>New Inquiry — KELIKULI</h2><table>${Object.entries(
      rows,
    )
      .map(
        ([label, value]) =>
          `<tr><th style="padding:8px;text-align:left;vertical-align:top">${escapeEmailText(label)}</th><td style="padding:8px;white-space:pre-wrap">${escapeEmailText(value || "—")}</td></tr>`,
      )
      .join(
        "",
      )}</table><p>${data.attachments?.length || 0} design attachment(s). Sign in to the <a href="https://kelikuli.com/admin/inquiries">inquiry dashboard</a> to view the request and download files.</p></div>`,
  });
}
