import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PrayerForm() {
  const [form, setForm] = useState({
    title: "",
    content: "",
    file: null,
  });
  const navigate = useNavigate();

  // ✅ 현재 로그인한 사용자 정보 가져오기
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      alert("로그인이 필요합니다!");
      navigate("/login");
      return;
    }

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("content", form.content);
    formData.append("author", currentUser.nickname); // ✅ 로그인 사용자 닉네임 자동 지정
    if (form.file) {
      formData.append("image", form.file);
    }

    await fetch("https://dear-dunamis-russia-2025-1.onrender.com/api/prayers/upload", {
      method: "POST",
      body: formData,
    });

    navigate("/prayers");
  };

  return (
    <div className="px-4 sm:px-6 lg:px-12 py-6 max-w-3xl sm:max-w-5xl mx-auto">
      <h1 className="text-2xl sm:text-4xl font-extrabold text-purple-600 mb-6 sm:mb-8 text-center">
        📝 새 기도 작성
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-purple-100 p-6 sm:p-10 shadow-xl rounded-lg"
        encType="multipart/form-data"
      >
        {/* 제목 */}
        <input
          className="w-full mb-4 p-3 sm:p-4 text-base sm:text-lg border border-purple-300 rounded"
          placeholder="제목"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />

        {/* 내용 */}
        <textarea
          className="w-full mb-4 p-3 sm:p-4 text-base sm:text-lg border border-purple-300 rounded"
          placeholder="기도제목 내용"
          rows={8}
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          required
        />

        {/* 이미지 파일 선택 */}
        <input
          type="file"
          accept="image/*"
          className="w-full mb-4 sm:mb-6 p-3 sm:p-4 text-base sm:text-lg border border-purple-300 bg-white rounded"
          onChange={(e) => setForm({ ...form, file: e.target.files[0] })}
        />

        {/* 작성자 정보 표시 */}
        {currentUser && (
          <p className="mb-4 sm:mb-6 text-gray-600 text-sm sm:text-base">
            ✍️ 작성자:{" "}
            <span className="font-bold text-purple-600">{currentUser.nickname}</span>
          </p>
        )}

        {/* 등록 버튼 */}
        <button
          type="submit"
          className="bg-purple-500 text-white px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg hover:bg-purple-600 transition w-full rounded"
        >
          🙌 등록하기
        </button>
      </form>
    </div>
  );
}