import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PhotoForm() {
  const [form, setForm] = useState({ file: null, description: "" });
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem("user"));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      alert("로그인 후 사진을 업로드할 수 있습니다.");
      navigate("/login");
      return;
    }

    const formData = new FormData();
    formData.append("photo", form.file);
    formData.append("uploader", currentUser.nickname);
    formData.append("description", form.description);

    try {
      await fetch(
        "https://dear-dunamis-russia-2025-1.onrender.com/api/photos/upload",
        {
          method: "POST",
          body: formData,
        }
      );
      alert("사진이 등록되었습니다 📸");
      navigate("/photos");
    } catch (err) {
      console.error("업로드 실패:", err);
      alert("업로드에 실패했습니다.");
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-12 py-6 max-w-3xl mx-auto">
      <h1 className="text-2xl sm:text-4xl font-extrabold text-purple-600 mb-6 sm:mb-8 text-center">
        러시아팀 사진을 올려주세요
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-purple-50 p-6 sm:p-10 shadow-xl rounded-lg"
        encType="multipart/form-data"
      >
        {/* 파일 선택 */}
        <input
          type="file"
          accept="image/*"
          className="w-full mb-4 p-3 sm:p-4 text-base sm:text-lg border border-purple-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
          onChange={(e) => setForm({ ...form, file: e.target.files[0] })}
          required
        />

        {/* 설명 */}
        <textarea
          className="w-full mb-4 p-3 sm:p-4 text-base sm:text-lg border border-purple-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
          placeholder="사진 설명"
          rows={5}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        {/* 업로더 표시 */}
        {currentUser && (
          <p className="mb-4 text-sm sm:text-base text-gray-600">
            업로더:{" "}
            <span className="font-semibold text-purple-600">
              {currentUser.nickname}
            </span>
          </p>
        )}

        {/* 버튼 */}
        <button
          type="submit"
          className="bg-purple-500 text-white px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg hover:bg-purple-600 transition w-full rounded-lg font-bold"
        >
          등록하기 📸
        </button>
      </form>
    </div>
  );
}
