import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sanitizeInput, validateLength, checkRateLimit } from "@/lib/sanitize";

export async function POST(request: NextRequest) {
  try {
    // Rate Limiting
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    if (!checkRateLimit(`create-${ip}`, 5, 60000)) {
      return NextResponse.json(
        { error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
        { status: 429 }
      );
    }

    const body = await request.json();

    // 필수값 검증
    const required = ["deceasedName", "deathDate", "funeralHall", "funeralAddress", "funeralDate"];
    for (const field of required) {
      if (!body[field] || typeof body[field] !== "string" || !body[field].trim()) {
        return NextResponse.json(
          { error: `${field} 필드는 필수입니다.` },
          { status: 400 }
        );
      }
    }

    // 길이 검증
    const lengthErrors = [
      validateLength(body.deceasedName, 50, "고인 성함"),
      validateLength(body.funeralHall, 100, "장례식장명"),
      validateLength(body.funeralAddress, 200, "주소"),
    ].filter(Boolean);

    if (lengthErrors.length > 0) {
      return NextResponse.json({ error: lengthErrors[0] }, { status: 400 });
    }

    // Sanitize & 생성
    const obituary = await prisma.obituary.create({
      data: {
        deceasedName: sanitizeInput(body.deceasedName),
        deceasedPhoto: body.deceasedPhoto || null,
        birthDate: body.birthDate ? sanitizeInput(body.birthDate) : null,
        deathDate: sanitizeInput(body.deathDate),
        funeralHall: sanitizeInput(body.funeralHall),
        funeralAddress: sanitizeInput(body.funeralAddress),
        funeralLat: body.funeralLat ? parseFloat(body.funeralLat) : null,
        funeralLng: body.funeralLng ? parseFloat(body.funeralLng) : null,
        funeralPhone: body.funeralPhone ? sanitizeInput(body.funeralPhone) : null,
        funeralDate: sanitizeInput(body.funeralDate),
        burialPlace: body.burialPlace ? sanitizeInput(body.burialPlace) : null,
        template: ["classic", "modern", "warm", "serene"].includes(body.template)
          ? body.template
          : "classic",
        mourners: {
          create: Array.isArray(body.mourners)
            ? body.mourners.slice(0, 10).map((m: Record<string, string>) => ({
                name: sanitizeInput(m.name || ""),
                relation: sanitizeInput(m.relation || ""),
                phone: m.phone ? sanitizeInput(m.phone) : null,
                bankName: m.bankName ? sanitizeInput(m.bankName) : null,
                accountNo: m.accountNo ? sanitizeInput(m.accountNo) : null,
                accountHolder: m.accountHolder ? sanitizeInput(m.accountHolder) : null,
              }))
            : [],
        },
      },
    });

    return NextResponse.json({ id: obituary.id }, { status: 201 });
  } catch (error) {
    console.error("부고장 생성 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
