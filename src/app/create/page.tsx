"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TEMPLATES, TemplateKey } from "@/lib/templates";

interface MournerInput {
  name: string;
  relation: string;
  phone: string;
  bankName: string;
  accountNo: string;
  accountHolder: string;
}

const emptyMourner: MournerInput = {
  name: "",
  relation: "",
  phone: "",
  bankName: "",
  accountNo: "",
  accountHolder: "",
};

export default function CreatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");

  // 고인 정보
  const [deceasedName, setDeceasedName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [deathDate, setDeathDate] = useState("");

  // 장례 정보
  const [funeralHall, setFuneralHall] = useState("");
  const [funeralAddress, setFuneralAddress] = useState("");
  const [funeralPhone, setFuneralPhone] = useState("");
  const [funeralDate, setFuneralDate] = useState("");
  const [burialPlace, setBurialPlace] = useState("");

  // 상주
  const [mourners, setMourners] = useState<MournerInput[]>([
    { ...emptyMourner },
  ]);

  // 템플릿
  const [template, setTemplate] = useState<TemplateKey>("classic");

  const addMourner = () => {
    if (mourners.length < 10) {
      setMourners([...mourners, { ...emptyMourner }]);
    }
  };

  const removeMourner = (index: number) => {
    if (mourners.length > 1) {
      setMourners(mourners.filter((_, i) => i !== index));
    }
  };

  const updateMourner = (
    index: number,
    field: keyof MournerInput,
    value: string
  ) => {
    const updated = [...mourners];
    updated[index] = { ...updated[index], [field]: value };
    setMourners(updated);
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/obituary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deceasedName,
          birthDate,
          deathDate,
          funeralHall,
          funeralAddress,
          funeralPhone,
          funeralDate,
          burialPlace,
          template,
          mourners: mourners.filter((m) => m.name.trim()),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "오류가 발생했습니다.");
        return;
      }

      router.push(`/obituary/${data.id}`);
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400 text-stone-800 bg-white";
  const labelClass = "block text-sm font-medium text-stone-700 mb-1";

  return (
    <div className="min-h-screen bg-stone-50">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-stone-50/80 backdrop-blur-sm border-b border-stone-200 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <button
            onClick={() => (step > 1 ? setStep(step - 1) : router.push("/"))}
            className="text-stone-600 text-sm"
          >
            ← 이전
          </button>
          <h1 className="font-serif text-lg text-stone-800">부고장 만들기</h1>
          <span className="text-sm text-stone-400">{step}/4</span>
        </div>
        {/* 프로그레스 바 */}
        <div className="max-w-lg mx-auto mt-3">
          <div className="h-1 bg-stone-200 rounded-full">
            <div
              className="h-1 bg-stone-700 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Step 1: 고인 정보 */}
        {step === 1 && (
          <section className="space-y-6">
            <div>
              <h2 className="text-xl font-serif text-stone-800 mb-1">
                고인 정보
              </h2>
              <p className="text-sm text-stone-500">
                고인의 기본 정보를 입력해주세요.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className={labelClass}>
                  고인 성함 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={deceasedName}
                  onChange={(e) => setDeceasedName(e.target.value)}
                  placeholder="홍길동"
                  className={inputClass}
                  maxLength={50}
                />
              </div>
              <div>
                <label className={labelClass}>생년월일</label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>
                  별세일 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={deathDate}
                  onChange={(e) => setDeathDate(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <button
              onClick={() => {
                if (!deceasedName.trim() || !deathDate) {
                  setError("고인 성함과 별세일은 필수입니다.");
                  return;
                }
                setError("");
                setStep(2);
              }}
              className="w-full bg-stone-800 text-white py-3 rounded-xl font-medium hover:bg-stone-900 transition-colors"
            >
              다음
            </button>
          </section>
        )}

        {/* Step 2: 장례 정보 */}
        {step === 2 && (
          <section className="space-y-6">
            <div>
              <h2 className="text-xl font-serif text-stone-800 mb-1">
                장례 정보
              </h2>
              <p className="text-sm text-stone-500">
                장례식장과 발인 일정을 입력해주세요.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className={labelClass}>
                  장례식장명 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={funeralHall}
                  onChange={(e) => setFuneralHall(e.target.value)}
                  placeholder="OO병원 장례식장"
                  className={inputClass}
                  maxLength={100}
                />
              </div>
              <div>
                <label className={labelClass}>
                  장례식장 주소 <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={funeralAddress}
                    readOnly
                    placeholder="주소 검색을 눌러주세요"
                    className={`${inputClass} bg-stone-50 cursor-pointer`}
                    onClick={() => {
                      new (window as any).daum.Postcode({
                        oncomplete: (data: any) => {
                          setFuneralAddress(data.roadAddress || data.jibunAddress);
                          setFuneralHall(funeralHall || data.buildingName || "");
                        },
                      }).open();
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      new (window as any).daum.Postcode({
                        oncomplete: (data: any) => {
                          setFuneralAddress(data.roadAddress || data.jibunAddress);
                          if (!funeralHall && data.buildingName) {
                            setFuneralHall(data.buildingName);
                          }
                        },
                      }).open();
                    }}
                    className="shrink-0 px-4 py-3 bg-stone-700 text-white text-sm rounded-lg hover:bg-stone-800 transition-colors"
                  >
                    주소 검색
                  </button>
                </div>
              </div>
              <div>
                <label className={labelClass}>장례식장 연락처</label>
                <input
                  type="tel"
                  value={funeralPhone}
                  onChange={(e) => setFuneralPhone(e.target.value)}
                  placeholder="02-1234-5678"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>
                  발인 일시 <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={funeralDate}
                  onChange={(e) => setFuneralDate(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>장지</label>
                <input
                  type="text"
                  value={burialPlace}
                  onChange={(e) => setBurialPlace(e.target.value)}
                  placeholder="OO공원묘지"
                  className={inputClass}
                />
              </div>
            </div>

            <button
              onClick={() => {
                if (
                  !funeralHall.trim() ||
                  !funeralAddress.trim() ||
                  !funeralDate
                ) {
                  setError("장례식장명, 주소, 발인 일시는 필수입니다.");
                  return;
                }
                setError("");
                setStep(3);
              }}
              className="w-full bg-stone-800 text-white py-3 rounded-xl font-medium hover:bg-stone-900 transition-colors"
            >
              다음
            </button>
          </section>
        )}

        {/* Step 3: 상주 정보 */}
        {step === 3 && (
          <section className="space-y-6">
            <div>
              <h2 className="text-xl font-serif text-stone-800 mb-1">
                상주 정보
              </h2>
              <p className="text-sm text-stone-500">
                상주 정보와 조의금 계좌를 입력해주세요.
              </p>
            </div>

            {mourners.map((mourner, index) => (
              <div
                key={index}
                className="bg-white border border-stone-200 rounded-xl p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-stone-700">
                    상주 {index + 1}
                  </span>
                  {mourners.length > 1 && (
                    <button
                      onClick={() => removeMourner(index)}
                      className="text-xs text-red-500"
                    >
                      삭제
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={mourner.name}
                    onChange={(e) =>
                      updateMourner(index, "name", e.target.value)
                    }
                    placeholder="이름"
                    className={inputClass}
                    maxLength={30}
                  />
                  <input
                    type="text"
                    value={mourner.relation}
                    onChange={(e) =>
                      updateMourner(index, "relation", e.target.value)
                    }
                    placeholder="관계 (장남, 며느리 등)"
                    className={inputClass}
                    maxLength={20}
                  />
                </div>
                <input
                  type="tel"
                  value={mourner.phone}
                  onChange={(e) =>
                    updateMourner(index, "phone", e.target.value)
                  }
                  placeholder="연락처"
                  className={inputClass}
                />
                <div className="border-t border-stone-100 pt-3 mt-2">
                  <p className="text-xs text-stone-500 mb-2">
                    조의금 계좌 (선택)
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={mourner.bankName}
                      onChange={(e) =>
                        updateMourner(index, "bankName", e.target.value)
                      }
                      placeholder="은행명"
                      className={inputClass}
                      maxLength={20}
                    />
                    <input
                      type="text"
                      value={mourner.accountHolder}
                      onChange={(e) =>
                        updateMourner(index, "accountHolder", e.target.value)
                      }
                      placeholder="예금주"
                      className={inputClass}
                      maxLength={30}
                    />
                  </div>
                  <input
                    type="text"
                    value={mourner.accountNo}
                    onChange={(e) =>
                      updateMourner(index, "accountNo", e.target.value)
                    }
                    placeholder="계좌번호"
                    className={`${inputClass} mt-3`}
                    maxLength={30}
                  />
                </div>
              </div>
            ))}

            {mourners.length < 10 && (
              <button
                onClick={addMourner}
                className="w-full py-3 border-2 border-dashed border-stone-300 rounded-xl text-stone-500 text-sm hover:border-stone-400 transition-colors"
              >
                + 상주 추가
              </button>
            )}

            <button
              onClick={() => {
                const hasAtLeastOne = mourners.some((m) => m.name.trim());
                if (!hasAtLeastOne) {
                  setError("상주를 최소 1명 이상 입력해주세요.");
                  return;
                }
                setError("");
                setStep(4);
              }}
              className="w-full bg-stone-800 text-white py-3 rounded-xl font-medium hover:bg-stone-900 transition-colors"
            >
              다음
            </button>
          </section>
        )}

        {/* Step 4: 템플릿 선택 & 완료 */}
        {step === 4 && (
          <section className="space-y-6">
            <div>
              <h2 className="text-xl font-serif text-stone-800 mb-1">
                디자인 선택
              </h2>
              <p className="text-sm text-stone-500">
                부고장 디자인 테마를 선택해주세요.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(TEMPLATES) as TemplateKey[]).map((key) => {
                const t = TEMPLATES[key];
                return (
                  <button
                    key={key}
                    onClick={() => setTemplate(key)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      template === key
                        ? "border-stone-700 bg-stone-100"
                        : "border-stone-200 bg-white hover:border-stone-300"
                    }`}
                  >
                    <div className="text-2xl mb-2">{t.flower}</div>
                    <div className="font-medium text-stone-800 text-sm">
                      {t.name}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* 미리보기 요약 */}
            <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-2">
              <h3 className="text-sm font-medium text-stone-700">입력 요약</h3>
              <div className="text-sm text-stone-600 space-y-1">
                <p>
                  <span className="text-stone-400">고인:</span> {deceasedName}
                </p>
                <p>
                  <span className="text-stone-400">장례식장:</span>{" "}
                  {funeralHall}
                </p>
                <p>
                  <span className="text-stone-400">발인:</span> {funeralDate}
                </p>
                <p>
                  <span className="text-stone-400">상주:</span>{" "}
                  {mourners
                    .filter((m) => m.name.trim())
                    .map((m) => `${m.name}(${m.relation})`)
                    .join(", ")}
                </p>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-stone-800 text-white py-3 rounded-xl font-medium hover:bg-stone-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "생성 중..." : "부고장 생성하기"}
            </button>
          </section>
        )}
      </main>
    </div>
  );
}
