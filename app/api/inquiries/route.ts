import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendInquiryEmail } from "@/lib/email";

export async function GET() {
  const inquiries = await prisma.inquiry.findMany({
    orderBy: { createdAt: "desc" },
  });
  const unread = inquiries.filter((i) => i.status === "unread").length;
  return NextResponse.json({ inquiries, total: inquiries.length, unread });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, company, email, phone, product, message, cartItems } = body;

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "Name, email, and message are required." }, { status: 400 });
  }

  const cartItemsStr = cartItems ? JSON.stringify(cartItems) : "";

  const inquiry = await prisma.inquiry.create({
    data: {
      name: name.trim(),
      company: company?.trim() ?? "",
      email: email.trim(),
      phone: phone?.trim() ?? "",
      product: product?.trim() ?? "",
      message: message.trim(),
      cartItems: cartItemsStr,
    },
  });

  // Send email notification (non-blocking — inquiry is saved even if email fails)
  sendInquiryEmail({
    name: name.trim(),
    company: company?.trim() ?? "",
    email: email.trim(),
    phone: phone?.trim() ?? "",
    product: product?.trim() ?? "",
    message: message.trim(),
  }).catch((err) => console.error("[email] inquiry notification failed:", err));

  return NextResponse.json({ inquiry }, { status: 201 });
}
