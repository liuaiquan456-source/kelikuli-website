import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendInquiryEmail } from "@/lib/email";
import { hasAdminSession } from "@/lib/admin-auth";
import { normalizeInquiry } from "@/lib/inquiry-data";

export async function GET(req: NextRequest) {
  if (!(await hasAdminSession(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const inquiries = await prisma.inquiry.findMany({
    orderBy: { createdAt: "desc" },
  });
  const unread = inquiries.filter((i) => i.status === "unread").length;
  return NextResponse.json(
    { inquiries, total: inquiries.length, unread },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}

export async function POST(req: NextRequest) {
  let input;
  try {
    input = normalizeInquiry(await req.json());
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof SyntaxError
            ? "Invalid request."
            : error instanceof Error
              ? error.message
              : "Invalid inquiry.",
      },
      { status: 400 },
    );
  }
  try {
    const inquiry = await prisma.inquiry.create({
      data: {
        ...input,
        cartItems: JSON.stringify(input.cartItems),
        attachments: JSON.stringify(input.attachments),
        attribution: JSON.stringify(input.attribution),
      },
      select: { id: true },
    });
    sendInquiryEmail(input).catch(() =>
      console.error("[email] Inquiry saved; notification delivery failed."),
    );
    return NextResponse.json(
      { success: true, id: inquiry.id },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    console.error("[inquiries] Could not save inquiry.");
    return NextResponse.json(
      { error: "We could not save your inquiry. Please try again." },
      { status: 500 },
    );
  }
}
