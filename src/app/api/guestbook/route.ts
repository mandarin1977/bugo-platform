import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  sanitizeInput,
  hashPassword,
  checkRateLimit,
  validateLength,
} from "@/lib/sanitize";

// 방명록 작성
export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    if (!checkRateLimit(`guestbook-${ip}`, 10, 60000)) {
      return NextResponse.json(
        { error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
        { status: 429 }
      );
    }

    const body = await request.json();

    if (!body.obituaryId || !body.author || !body.message || !body.password) {
      return NextResponse.json(
        { error: "모든 필드를 입력해주세요." },
        { status: 400 }
      );
    }

    // 길이 검증
    const errors = [
      validateLength(body.author, 30, "작성자명"),
      validateLength(body.message, 500, "조문 메시지"),
      validateLength(body.password, 20, "비밀번호"),
    ].filter(Boolean);

    if (errors.length > 0) {
      return NextResponse.json({ error: errors[0] }, { status: 400 });
    }

    const hashedPw = await hashPassword(body.password);

    const entry = await prisma.guestbook.create({
      data: {
        obituaryId: body.obituaryId,
        author: sanitizeInput(body.author),
        message: sanitizeInput(body.message),
        password: hashedPw,
      },
      select: {
        id: true,
        author: true,
        message: true,
        createdAt: true,
      },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error("방명록 작성 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 방명록 삭제
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.id || !body.password) {
      return NextResponse.json(
        { error: "ID와 비밀번호를 입력해주세요." },
        { status: 400 }
      );
    }

    const entry = await prisma.guestbook.findUnique({
      where: { id: body.id },
    });

    if (!entry) {
      return NextResponse.json(
        { error: "방명록을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const hashedPw = await hashPassword(body.password);
    if (entry.password !== hashedPw) {
      return NextResponse.json(
        { error: "비밀번호가 일치하지 않습니다." },
        { status: 403 }
      );
    }

    await prisma.guestbook.delete({ where: { id: body.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("방명록 삭제 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
