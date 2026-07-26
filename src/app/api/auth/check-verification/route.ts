import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/server/db/prisma";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  
  if (!email || typeof email !== "string") {
    return NextResponse.json({ verified: false }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { emailVerified: true },
    });

    return NextResponse.json({
      verified: user?.emailVerified ?? false,
    });
  } catch (error) {
    console.error("Failed to check email verification:", error);
    return NextResponse.json({ verified: false }, { status: 500 });
  }
}
