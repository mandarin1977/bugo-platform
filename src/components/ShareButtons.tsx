"use client";

import { useState } from "react";

export default function ShareButtons({
  title,
  deceasedName,
}: {
  title: string;
  deceasedName: string;
}) {
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = `[부고] ${deceasedName}님의 부고를 알려드립니다.`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* noop */
    }
  };

  const shareKakao = () => {
    // 카카오톡 공유 (Kakao SDK 필요 - 추후 연동)
    // 현재는 모바일 공유 API fallback
    if (navigator.share) {
      navigator.share({
        title,
        text: shareText,
        url: shareUrl,
      });
    } else {
      copyLink();
    }
  };

  const shareSMS = () => {
    const body = encodeURIComponent(`${shareText}\n${shareUrl}`);
    window.location.href = `sms:?body=${body}`;
  };

  return (
    <div className="grid grid-cols-3 gap-3">
      <button
        onClick={shareKakao}
        className="flex flex-col items-center gap-1.5 py-3 bg-[#FEE500] rounded-xl hover:bg-[#F5DC00] transition-colors"
      >
        <span className="text-xl">💬</span>
        <span className="text-xs font-medium text-stone-800">카카오톡</span>
      </button>
      <button
        onClick={shareSMS}
        className="flex flex-col items-center gap-1.5 py-3 bg-green-100 rounded-xl hover:bg-green-200 transition-colors"
      >
        <span className="text-xl">✉️</span>
        <span className="text-xs font-medium text-stone-800">문자</span>
      </button>
      <button
        onClick={copyLink}
        className="flex flex-col items-center gap-1.5 py-3 bg-stone-100 rounded-xl hover:bg-stone-200 transition-colors"
      >
        <span className="text-xl">{copied ? "✓" : "🔗"}</span>
        <span className="text-xs font-medium text-stone-800">
          {copied ? "복사됨" : "링크복사"}
        </span>
      </button>
    </div>
  );
}
