import { NextResponse } from "next/server";
import { getActiveLanguages } from "@/lib/i18n";

export async function GET() {
  const languages = await getActiveLanguages();
  return NextResponse.json(languages);
}
