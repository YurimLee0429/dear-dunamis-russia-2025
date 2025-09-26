import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [generation, setGeneration] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const nickname = useMemo(() => {
    const gen = generation.trim();
    const nm = name.trim();

    if (!gen || !nm) return "";

    // ✅ 교역자 예외 처리
    if (gen === "교역자") {
      return `${gen}${nm}`;
    }

    // ✅ 일반 숫자 2자리 처리
    const numGen = gen.replace(/\D/g, "").slice(0, 2);
    return numGen ? `${numGen.padStart(2, "0")}${nm}` : "";
  }, [generation, name]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const genInput = generation.trim();
    const nm = name.trim();

    // ✅ 유효성 검사
    if (genInput !== "교역자" && (genInput.length !== 2 || isNaN(genInput))) {
      return setError("또래는 생년 끝 2자리 또는 '교역자'로 입력해주세요.");
    }
    if (!nm) return setError("이름을 입력해주세요.");

    const payload = {
      generation: genInput,
      name: nm,
    };

    try {
      const res = await fetch("https://dear-dunamis-russia-2025-1.onrender.com/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return setError(data.message || "로그인 실패");
      }

      localStorage.setItem("user", JSON.stringify(data.user));

      // NavBar 갱신 이벤트 발생
      window.dispatchEvent(new Event("storage"));

      navigate("/");
    } catch (err) {
      console.error("로그인 오류:", err);
      setError("서버와 연결할 수 없습니다.");
    }
  };

  return (
    <div className="px-6 py-10 max-w-md mx-auto">
      <h1 className="text-3xl font-extrabold text-purple-600 mb-6 text-center">
        🔐 로그인
      </h1>
      <form onSubmit={handleLogin} className="bg-white shadow p-6 space-y-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            또래 (생년 마지막 두 자리 또는 '교역자')
          </label>
          <input
            value={generation}
            onChange={(e) => setGeneration(e.target.value)}
            placeholder="예: 05 또는 교역자"
            className="w-full border p-3"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">이름</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 홍길동"
            className="w-full border p-3"
          />
        </div>

        <div className="text-sm text-gray-500">
          닉네임 미리보기:{" "}
          <span className="font-bold text-purple-600">{nickname || "-"}</span>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          className="w-full bg-purple-600 text-white py-3 hover:bg-purple-700"
        >
          로그인
        </button>
      </form>
    </div>
  );
}