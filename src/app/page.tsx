import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* 헤더 */}
      <header className="py-6 px-4 text-center border-b border-stone-200">
        <h1 className="text-2xl font-serif text-stone-800">부고장</h1>
        <p className="text-sm text-stone-500 mt-1">
          온라인 모바일 부고 서비스
        </p>
      </header>

      {/* 메인 */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center space-y-8">
          {/* 아이콘 */}
          <div className="text-6xl">🪷</div>

          <div className="space-y-3">
            <h2 className="text-3xl font-serif text-stone-800">
              소중한 분의 마지막 길을
              <br />
              정중하게 알려드립니다
            </h2>
            <p className="text-stone-500 leading-relaxed">
              모바일 부고장을 쉽고 빠르게 만들어
              <br />
              카카오톡으로 공유하세요.
            </p>
          </div>

          {/* 주요 기능 소개 */}
          <div className="grid grid-cols-2 gap-4 text-left">
            {[
              { icon: "📋", title: "간편한 작성", desc: "5분이면 완성" },
              { icon: "📱", title: "모바일 최적화", desc: "어디서든 확인" },
              { icon: "💐", title: "조의금 안내", desc: "계좌번호 복사" },
              { icon: "📖", title: "온라인 방명록", desc: "조문 메시지" },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-xl p-4 border border-stone-200"
              >
                <div className="text-2xl mb-2">{item.icon}</div>
                <div className="font-medium text-stone-800 text-sm">
                  {item.title}
                </div>
                <div className="text-xs text-stone-500">{item.desc}</div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <Link
            href="/create"
            className="inline-block w-full bg-stone-800 text-white py-4 rounded-xl text-lg font-medium hover:bg-stone-900 transition-colors"
          >
            부고장 만들기
          </Link>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="py-6 text-center text-xs text-stone-400 border-t border-stone-200">
        <p>삼가 고인의 명복을 빕니다</p>
      </footer>
    </div>
  );
}
