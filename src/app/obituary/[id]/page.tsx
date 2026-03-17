import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TEMPLATES, TemplateKey } from "@/lib/templates";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import CopyButton from "@/components/CopyButton";
import Guestbook from "@/components/Guestbook";
import ShareButtons from "@/components/ShareButtons";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

// 동적 OG 메타데이터
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const obituary = await prisma.obituary.findUnique({
    where: { id },
    select: { deceasedName: true, funeralHall: true },
  });

  if (!obituary) return { title: "부고장" };

  const title = `[부고] 故 ${obituary.deceasedName}님의 부고`;
  const description = `빈소: ${obituary.funeralHall} | 삼가 고인의 명복을 빕니다.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

export default async function ObituaryPage({ params }: PageProps) {
  const { id } = await params;

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
        },
      },
      gallery: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!obituary) {
    notFound();
  }

  const t = TEMPLATES[(obituary.template as TemplateKey) || "classic"];

  const formatDate = (dateStr: string) => {
    try {
      // datetime-local format: "2025-03-20T10:00"
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return format(date, "yyyy년 M월 d일 (EEE) a h시", { locale: ko });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      className={`min-h-screen ${t.bgColor} ${t.textColor} hide-scrollbar`}
    >
      <div className="max-w-md mx-auto">
        {/* ===== 헤더 (고인 정보) ===== */}
        <section className="text-center py-12 px-6">
          <div className="text-4xl mb-4">{t.flower}</div>
          <p className={`text-sm ${t.accentColor} mb-2`}>삼가 고인의 명복을 빕니다</p>
          <h1 className={`text-3xl ${t.headerFont} font-bold mb-2`}>
            故 {obituary.deceasedName}
          </h1>
          {obituary.birthDate && (
            <p className={`text-sm ${t.accentColor}`}>
              {obituary.birthDate.replace(/-/g, ". ")} ~{" "}
              {obituary.deathDate.replace(/-/g, ". ")}
            </p>
          )}
        </section>

        {/* 구분선 */}
        <div className="flex items-center gap-4 px-8">
          <div className={`flex-1 border-t ${t.borderColor}`} />
          <span className={`text-xs ${t.accentColor}`}>{t.flower}</span>
          <div className={`flex-1 border-t ${t.borderColor}`} />
        </div>

        {/* ===== 장례 정보 ===== */}
        <section className="py-8 px-6">
          <h2
            className={`text-center text-lg ${t.headerFont} font-semibold mb-6`}
          >
            장례 안내
          </h2>
          <div
            className={`${t.cardBg} rounded-xl border ${t.borderColor} p-5 space-y-4`}
          >
            <div className="flex justify-between items-start">
              <span className={`text-sm ${t.accentColor} w-20 shrink-0`}>
                빈소
              </span>
              <span className="text-sm text-right">{obituary.funeralHall}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className={`text-sm ${t.accentColor} w-20 shrink-0`}>
                주소
              </span>
              <span className="text-sm text-right">
                {obituary.funeralAddress}
              </span>
            </div>
            <div className="flex justify-between items-start">
              <span className={`text-sm ${t.accentColor} w-20 shrink-0`}>
                발인
              </span>
              <span className="text-sm text-right">
                {formatDate(obituary.funeralDate)}
              </span>
            </div>
            {obituary.burialPlace && (
              <div className="flex justify-between items-start">
                <span className={`text-sm ${t.accentColor} w-20 shrink-0`}>
                  장지
                </span>
                <span className="text-sm text-right">
                  {obituary.burialPlace}
                </span>
              </div>
            )}
            {obituary.funeralPhone && (
              <div className="flex justify-between items-center">
                <span className={`text-sm ${t.accentColor} w-20 shrink-0`}>
                  연락처
                </span>
                <a
                  href={`tel:${obituary.funeralPhone}`}
                  className="text-sm underline"
                >
                  {obituary.funeralPhone}
                </a>
              </div>
            )}
          </div>

          {/* 지도 영역 (주소 기반) */}
          <div className="mt-4">
            <a
              href={`https://map.kakao.com/?q=${encodeURIComponent(
                obituary.funeralAddress
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`block w-full py-3 text-center border ${t.borderColor} rounded-xl text-sm hover:bg-stone-100 transition-colors`}
            >
              🗺️ 카카오맵에서 길찾기
            </a>
            <a
              href={`https://map.naver.com/v5/search/${encodeURIComponent(
                obituary.funeralAddress
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`block w-full py-3 mt-2 text-center border ${t.borderColor} rounded-xl text-sm hover:bg-stone-100 transition-colors`}
            >
              🗺️ 네이버맵에서 길찾기
            </a>
          </div>
        </section>

        {/* 구분선 */}
        <div className="flex items-center gap-4 px-8">
          <div className={`flex-1 border-t ${t.borderColor}`} />
          <span className={`text-xs ${t.accentColor}`}>{t.flower}</span>
          <div className={`flex-1 border-t ${t.borderColor}`} />
        </div>

        {/* ===== 상주 & 조의금 ===== */}
        <section className="py-8 px-6">
          <h2
            className={`text-center text-lg ${t.headerFont} font-semibold mb-6`}
          >
            상주 안내
          </h2>
          <div className="space-y-3">
            {obituary.mourners.map((mourner) => (
              <div
                key={mourner.id}
                className={`${t.cardBg} rounded-xl border ${t.borderColor} p-4`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-medium text-sm">{mourner.name}</span>
                    <span className={`text-xs ${t.accentColor} ml-2`}>
                      ({mourner.relation})
                    </span>
                  </div>
                  {mourner.phone && (
                    <a
                      href={`tel:${mourner.phone}`}
                      className="text-xs bg-stone-100 px-3 py-1.5 rounded-lg hover:bg-stone-200 transition-colors"
                    >
                      📞 전화
                    </a>
                  )}
                </div>
                {mourner.bankName && mourner.accountNo && (
                  <div className="bg-stone-50 rounded-lg p-3 mt-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs">
                        <span className={t.accentColor}>
                          {mourner.bankName}
                        </span>{" "}
                        <span>{mourner.accountNo}</span>
                        {mourner.accountHolder && (
                          <span className={`${t.accentColor} ml-1`}>
                            ({mourner.accountHolder})
                          </span>
                        )}
                      </div>
                      <CopyButton
                        text={mourner.accountNo}
                        label="복사"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 구분선 */}
        <div className="flex items-center gap-4 px-8">
          <div className={`flex-1 border-t ${t.borderColor}`} />
          <span className={`text-xs ${t.accentColor}`}>{t.flower}</span>
          <div className={`flex-1 border-t ${t.borderColor}`} />
        </div>

        {/* ===== 추모 갤러리 ===== */}
        {obituary.gallery.length > 0 && (
          <>
            <section className="py-8 px-6">
              <h2
                className={`text-center text-lg ${t.headerFont} font-semibold mb-6`}
              >
                추모 갤러리
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {obituary.gallery.map((img) => (
                  <div key={img.id} className="aspect-square rounded-xl overflow-hidden bg-stone-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={img.caption || "추모 사진"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </section>
            <div className="flex items-center gap-4 px-8">
              <div className={`flex-1 border-t ${t.borderColor}`} />
              <span className={`text-xs ${t.accentColor}`}>{t.flower}</span>
              <div className={`flex-1 border-t ${t.borderColor}`} />
            </div>
          </>
        )}

        {/* ===== 방명록 ===== */}
        <section className="py-8 px-6">
          <h2
            className={`text-center text-lg ${t.headerFont} font-semibold mb-6`}
          >
            조문 방명록
          </h2>
          <Guestbook
            obituaryId={obituary.id}
            initialEntries={obituary.guestbooks.map((g) => ({
              ...g,
              createdAt: g.createdAt.toISOString(),
            }))}
          />
        </section>

        {/* 구분선 */}
        <div className="flex items-center gap-4 px-8">
          <div className={`flex-1 border-t ${t.borderColor}`} />
          <span className={`text-xs ${t.accentColor}`}>{t.flower}</span>
          <div className={`flex-1 border-t ${t.borderColor}`} />
        </div>

        {/* ===== 공유 ===== */}
        <section className="py-8 px-6">
          <h2
            className={`text-center text-lg ${t.headerFont} font-semibold mb-6`}
          >
            부고 공유하기
          </h2>
          <ShareButtons
            title={`[부고] 故 ${obituary.deceasedName}님의 부고`}
            deceasedName={obituary.deceasedName}
          />
        </section>

        {/* 푸터 */}
        <footer className={`py-8 text-center text-xs ${t.accentColor}`}>
          <p>삼가 고인의 명복을 빕니다</p>
        </footer>
      </div>
    </div>
  );
}
