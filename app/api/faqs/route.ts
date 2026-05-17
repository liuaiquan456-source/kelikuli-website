import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const page            = req.nextUrl.searchParams.get("page");
  const includeInactive = req.nextUrl.searchParams.get("includeInactive") === "true";
  const faqs = await prisma.fAQ.findMany({
    where: {
      ...(page && page !== "all" ? { page } : {}),
      ...(!includeInactive ? { active: true } : {}),
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json(faqs);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { question, answer, page, sortOrder, active } = body;
  if (!question?.trim() || !answer?.trim()) {
    return NextResponse.json({ error: "Question and answer are required." }, { status: 400 });
  }
  const faq = await prisma.fAQ.create({
    data: {
      question: question.trim(),
      answer: answer.trim(),
      page: page?.trim() || "faq",
      sortOrder: Number(sortOrder ?? 0),
      active: active !== false,
    },
  });
  return NextResponse.json(faq, { status: 201 });
}
