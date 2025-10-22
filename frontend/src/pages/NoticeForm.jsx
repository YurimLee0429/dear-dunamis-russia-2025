import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function NoticeForm() {
  const [form, setForm] = useState({
    title: "",
    content: "",
    files: [],
  });

  const [previewUrls, setPreviewUrls] = useState([]);
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user"));

  // ✅ 이미지 미리보기 생성
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setForm({ ...form, files });
    const previews = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(previews);
  };

  // ✅ 업로드 (FormData 방식)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      alert("로그인이 필요합니다!");
      return;
    }

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("content", form.content);
    formData.append("author", currentUser.nickname);

    // 여러 장 이미지 추가
    form.files.forEach((file) => formData.append("images", file));

    try {
      const res = await fetch(
        "https://dear-dunamis-russia-2025-1.onrender.com/api/notices/upload",
        {
          method: "POST",
          body: formData, // ✅ JSON 대신 FormData 직접 전송
        }
      );

      if (!res.ok) throw new Error("업로드 실패");

      // ✅ 미리보기 URL 해제
      previewUrls.forEach((url) => URL.revokeObjectURL(url));

      alert("등록 완료 💜");
      navigate("/notices");
    } catch (err) {
      console.error("❌ 업로드 중 오류:", err);
      alert("업로드 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-12 py-6 max-w-3xl mx-auto">
      <h1 className="text-2xl sm:text-4xl font-extrabold text-purple-600 mb-6 sm:mb-8 text-center">
        ✍️ 새 글 작성
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-purple-50 p-6 sm:p-10 shadow-xl rounded-lg"
      >
        {/* 제목 */}
        <input
          className="w-full mb-4 p-3 sm:p-4 text-base sm:text-lg border border-purple-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
          placeholder="제목"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />

        {/* 내용 */}
        <textarea
          className="w-full mb-4 p-3 sm:p-4 text-base sm:text-lg border border-purple-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
          placeholder="내용"
          rows={6}
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          required
        />

        {/* 작성자 */}
        {currentUser && (
          <p className="mb-4 text-gray-600 text-sm sm:text-base">
            ✍️ 작성자:{" "}
            <span className="font-bold text-purple-600">
              {currentUser.nickname}
            </span>
          </p>
        )}

        {/* 이미지 업로드 */}
        <input
          type="file"
          accept="image/*"
          multiple
          className="w-full mb-6 p-3 sm:p-4 text-base sm:text-lg border border-purple-300 rounded bg-white"
          onChange={handleFileChange}
        />

        {/* 미리보기 */}
        {previewUrls.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-6">
            {previewUrls.map((url, idx) => (
              <div
                key={idx}
                className="relative border border-purple-200 rounded-lg overflow-hidden"
              >
                <img
                  src={url}
                  alt={`미리보기 ${idx + 1}`}
                  className="w-full h-24 sm:h-28 object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {/* 등록 버튼 */}
        <button
          type="submit"
          className="bg-purple-500 text-white px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg hover:bg-purple-600 transition w-full rounded-lg font-bold"
        >
          등록하기 💜
        </button>
      </form>
    </div>
  );
}
