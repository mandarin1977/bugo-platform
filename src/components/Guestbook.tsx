"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface GuestbookEntry {
  id: string;
  author: string;
  message: string;
  createdAt: string;
}

export default function Guestbook({
  obituaryId,
  initialEntries,
}: {
  obituaryId: string;
  initialEntries: GuestbookEntry[];
}) {
  const [entries, setEntries] = useState<GuestbookEntry[]>(initialEntries);
  const [author, setAuthor] = useState("");
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 삭제 관련
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deletePw, setDeletePw] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !message.trim() || !password.trim()) {
      setError("모든 항목을 입력해주세요.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          obituaryId,
          author: author.trim(),
          message: message.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      setEntries([data, ...entries]);
      setAuthor("");
      setMessage("");
      setPassword("");
    } catch {
      setError("오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!deletePw.trim()) return;

    try {
      const res = await fetch("/api/guestbook", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, password: deletePw }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error);
        return;
      }

      setEntries(entries.filter((e) => e.id !== id));
      setDeleteId(null);
      setDeletePw("");
    } catch {
      alert("오류가 발생했습니다.");
    }
  };

  return (
    <div className="space-y-6">
      {/* 작성 폼 */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="이름"
          maxLength={30}
          className="w-full px-4 py-3 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="조문 메시지를 남겨주세요"
          maxLength={500}
          rows={3}
          className="w-full px-4 py-3 border border-stone-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-stone-400"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호 (삭제 시 필요)"
          maxLength={20}
          className="w-full px-4 py-3 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
        />
        {error && <p className="text-red-500 text-xs">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-stone-700 text-white py-3 rounded-lg text-sm font-medium hover:bg-stone-800 transition-colors disabled:opacity-50"
        >
          {loading ? "등록 중..." : "조문 메시지 남기기"}
        </button>
      </form>

      {/* 방명록 목록 */}
      <div className="space-y-3">
        {entries.length === 0 && (
          <p className="text-center text-stone-400 text-sm py-4">
            아직 조문 메시지가 없습니다.
          </p>
        )}
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="bg-stone-50 rounded-lg p-4 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm text-stone-700">
                {entry.author}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-400">
                  {format(new Date(entry.createdAt), "M월 d일 HH:mm", {
                    locale: ko,
                  })}
                </span>
                <button
                  onClick={() =>
                    setDeleteId(deleteId === entry.id ? null : entry.id)
                  }
                  className="text-xs text-stone-400 hover:text-red-500"
                >
                  삭제
                </button>
              </div>
            </div>
            <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-wrap">
              {entry.message}
            </p>
            {deleteId === entry.id && (
              <div className="flex gap-2 pt-1">
                <input
                  type="password"
                  value={deletePw}
                  onChange={(e) => setDeletePw(e.target.value)}
                  placeholder="비밀번호"
                  className="flex-1 px-3 py-2 border border-stone-300 rounded text-xs"
                />
                <button
                  onClick={() => handleDelete(entry.id)}
                  className="px-3 py-2 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                >
                  확인
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
