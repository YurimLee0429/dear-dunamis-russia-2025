import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function PrayerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prayer, setPrayer] = useState(null);
  const currentUser = JSON.parse(localStorage.getItem("user")); // ✅ 로그인된 사용자

  const fetchPrayer = async () => {
    try {
      const res = await fetch(`https://dear-dunamis-russia-2025-1.onrender.com/api/prayers/${id}`);
      const data = await res.json();
      setPrayer(data);
    } catch (err) {
      console.error("기도제목 불러오기 실패:", err);
    }
  };

  useEffect(() => {
    fetchPrayer();
  }, [id]);

  // 삭제
  const handleDelete = async () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await fetch(`https://dear-dunamis-russia-2025-1.onrender.com/api/prayers/${id}`, {
        method: "DELETE",
      });
      alert("삭제되었습니다 🙏");
      navigate("/prayers");
    } catch (err) {
      console.error("삭제 실패:", err);
    }
  };

  if (!prayer) {
    return (
      <div className="flex justify-center items-center h-72 sm:h-96">
        <p className="text-gray-500 text-base sm:text-lg">⏳ 불러오는 중...</p>
      </div>
    );
  }

  // 삭제 권한: 작성자 본인 or 관리자
  const canDelete =
    currentUser &&
    (currentUser.nickname === prayer.author || currentUser.nickname === "00관리자");

  return (
    <div className="mt-20 sm:mt-30 px-4 sm:px-6 lg:px-12 py-6 sm:py-8 max-w-3xl sm:max-w-4xl mx-auto">
      <div className="bg-white p-6 sm:p-8 shadow-xl rounded-lg">
        {/* 제목 */}
        <h1 className="text-2xl sm:text-3xl font-bold text-purple-600 mb-3 sm:mb-4 leading-snug">
          🙏 {prayer.title}
        </h1>

        {/* 작성자 & 작성일 */}
        <div className="flex flex-col sm:flex-row sm:justify-between text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
          <span className="mb-1 sm:mb-0">✍️ {prayer.author}</span>
          <span>🕒 {new Date(prayer.created_at).toLocaleString()}</span>
        </div>

        {/* 이미지 */}
        {prayer.image_url && (
          <img
            src={
              prayer.image_url.startsWith("http")
                ? prayer.image_url
                : `https://dear-dunamis-russia-2025-1.onrender.com${prayer.image_url}`
            }
            alt="기도"
            className="mb-6 w-full max-h-[300px] sm:max-h-[400px] object-cover rounded"
          />
        )}

        {/* 내용 */}
        <p className="text-gray-800 text-base sm:text-lg leading-relaxed whitespace-pre-line">
          {prayer.content}
        </p>

        {/* 버튼 영역 */}
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row sm:justify-end gap-3 sm:gap-4">
          <button
            onClick={() => navigate("/prayers")}
            className="bg-purple-100 text-purple-700 px-4 sm:px-6 py-2 text-sm sm:text-base hover:bg-purple-200 transition rounded"
          >
            목록으로
          </button>
          {canDelete && (
            <button
              onClick={handleDelete}
              className="bg-red-500 text-white px-4 sm:px-6 py-2 text-sm sm:text-base hover:bg-red-600 transition rounded"
            >
              삭제
            </button>
          )}
        </div>
      </div>
    </div>
  );
}