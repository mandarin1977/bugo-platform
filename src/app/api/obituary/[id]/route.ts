import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// UUID 형식 검증
function isValidUUID(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
    }

    const obituary = await prisma.obituary.findUnique({
      where: { id },
      include: {
        mourners: true,
        guestbooks: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            author: true,
            message: true,
            createdAt: true,
            // password는 절대 반환하지 않음 (보안)
          },
        },
        gallery: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!obituary) {
      return NextResponse.json(
        { error: "부고장을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json(obituary);
  } catch (error) {
    console.error("부고장 조회 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
