import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function PhotoList() {
  const [photos, setPhotos] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem("user"));

  const fetchPhotos = async () => {
    try {
      const res = await fetch("https://dear-dunamis-russia-2025-1.onrender.com/api/photos");
      const data = await res.json();
      setPhotos(data);
    } catch (err) {
      console.error("사진 불러오기 실패:", err);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await fetch(`https://dear-dunamis-russia-2025-1.onrender.com/api/photos/${id}`, {
        method: "DELETE",
      });
      fetchPhotos();
    } catch (err) {
      console.error("삭제 실패:", err);
    }
  };

  const totalPages = Math.ceil(photos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPhotos = photos.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-12 py-8 max-w-7xl mx-auto">
      {/* 헤더 */}
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-5xl font-bold text-purple-600 mb-3 sm:mb-4">
          📸 러시아팀의 모든 순간
        </h1>
        <p className="text-base sm:text-lg text-gray-500">러시아팀 사랑해 💜</p>
      </div>

      {/* 새 사진 업로드 버튼 */}
      {currentUser && (
        <div className="flex justify-end mb-6 sm:mb-8">
          <button
            onClick={() => navigate("/photos/new")}
            className="bg-gradient-to-r from-purple-500 to-purple-700 text-white px-5 sm:px-8 py-2 sm:py-3 text-sm sm:text-lg shadow hover:scale-105 transform transition rounded-lg"
          >
            🌟 새 사진 올리기
          </button>
        </div>
      )}

      {/* 사진 갤러리 */}
      {photos.length === 0 ? (
        <div className="text-center py-16 sm:py-24 bg-purple-50 shadow-inner rounded-lg">
          <p className="text-xl sm:text-3xl text-purple-500 mb-3 sm:mb-4">
            📭 아직 등록된 사진이 없습니다.
          </p>
          <p className="text-gray-500 mb-6 sm:mb-8">첫 번째 추억을 남겨보세요!</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
            {currentPhotos.map((p) => (
              <div
                key={p.id}
                className="bg-white shadow-md sm:shadow-lg rounded-lg sm:rounded-none overflow-hidden hover:shadow-xl sm:hover:shadow-2xl transition cursor-pointer flex flex-col"
                onClick={() => navigate(`/photos/${p.id}`)}
              >
                {/* 📱 모바일: 그냥 카드, 🖥 데스크탑: 폴라로이드 */}
                <div className="bg-white p-0 sm:p-3">
                  <img
                    src={
                      p.image_url.startsWith("http")
                        ? p.image_url
                        : `https://dear-dunamis-russia-2025-1.onrender.com${p.image_url}`
                    }
                    alt="추억"
                    className="w-full h-40 sm:h-64 object-cover border border-gray-200"
                  />
                </div>

                {/* 설명 영역 */}
                <div className="p-2 sm:p-4 text-center flex-1 flex flex-col justify-between">
                  {/* 설명 (모바일은 강조X, 데스크탑은 본문처럼) */}
                  <p className="text-gray-700 text-xs sm:text-sm md:text-base line-clamp-2">
                    {p.description}
                  </p>

                  {/* 사용자명 + 날짜 (아래쪽 작게) */}
                  <div className="mt-2">
                    <p className="text-[10px] sm:text-xs text-gray-500">
                      ✍️ {p.uploader}
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-400">
                      {new Date(p.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* 삭제 버튼 */}
                {currentUser &&
                  (currentUser.nickname === p.uploader || currentUser.role === "admin") && (
                    <div className="flex justify-end p-1 sm:p-2 border-t">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(p.id);
                        }}
                        className="bg-red-500 text-white px-2 sm:px-3 py-1 text-[10px] sm:text-xs rounded hover:bg-red-600 transition"
                      >
                        삭제
                      </button>
                    </div>
                  )}
              </div>
            ))}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8 sm:mt-10 space-x-1 sm:space-x-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-2 sm:px-3 py-1 sm:py-2 rounded bg-purple-200 text-purple-800 text-xs sm:text-sm disabled:opacity-50"
              >
                ◀ 이전
              </button>

              {Array.from({ length: totalPages }, (_, idx) => (
                <button
                  key={idx + 1}
                  onClick={() => goToPage(idx + 1)}
                  className={`px-2 sm:px-3 py-1 sm:py-2 rounded text-xs sm:text-sm ${
                    currentPage === idx + 1
                      ? "bg-purple-600 text-white"
                      : "bg-purple-200 text-purple-800"
                  }`}
                >
                  {idx + 1}
                </button>
              ))}

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-2 sm:px-3 py-1 sm:py-2 rounded bg-purple-200 text-purple-800 text-xs sm:text-sm disabled:opacity-50"
              >
                다음 ▶
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}