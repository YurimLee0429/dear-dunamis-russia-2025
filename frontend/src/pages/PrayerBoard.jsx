import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function PrayerBoard() {
  const [prayers, setPrayers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user"));

  // ✅ 기도 목록 불러오기
  const fetchPrayers = async () => {
    try {
      const res = await fetch("https://dear-dunamis-russia-2025-1.onrender.com/api/prayers");
      const data = await res.json();
      setPrayers(data);
    } catch (err) {
      console.error("기도제목 불러오기 실패:", err);
    }
  };

  useEffect(() => {
    fetchPrayers();
  }, []);

  const totalPages = Math.ceil(prayers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPrayers = prayers.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // ✅ 제목 클릭 시 로그인 여부 확인
  const handlePrayerClick = (id) => {
    if (currentUser) {
      navigate(`/prayers/${id}`);
    } else {
      alert("🙏 로그인 후 기도 내용을 볼 수 있습니다 💜");
      navigate("/login");
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-20 py-8 sm:py-12 max-w-full mx-auto">
      {/* 상단 헤더 */}
      <div className="text-center mb-10 sm:mb-12">
        <h1 className="text-3xl sm:text-5xl font-bold text-purple-600 mb-3 sm:mb-4">
          🙏 러시아팀 기도제목
        </h1>
        <p className="text-base sm:text-lg text-gray-500">
          함께 마음 모아 기도해요 💜
        </p>
      </div>

      {/* 새 글 작성 버튼 */}
      <div className="flex justify-end mb-6 sm:mb-8">
        {currentUser ? (
          <button
            onClick={() => navigate("/prayers/new")}
            className="bg-gradient-to-r from-purple-500 to-purple-700 text-white px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-lg shadow hover:scale-105 transform transition rounded"
          >
            ✍️ 새 기도 작성
          </button>
        ) : (
          <p className="text-gray-500 italic text-sm sm:text-base">
            ✍️ 로그인 후 작성할 수 있습니다.
          </p>
        )}
      </div>

      {/* 목록 */}
      {prayers.length === 0 ? (
        <div className="text-center py-16 sm:py-24 bg-purple-50 shadow-inner rounded">
          <p className="text-xl sm:text-3xl text-purple-500 mb-3 sm:mb-4">
            📭 아직 등록된 기도제목이 없습니다.
          </p>
          <p className="text-gray-500 mb-6 sm:mb-8">기도를 함께 나눠주세요!</p>
        </div>
      ) : (
        <>
          {/* ✅ 모바일: 카드 뷰 */}
          <div className="grid grid-cols-1 gap-4 sm:hidden">
            {currentPrayers.map((p) => (
              <div
                key={p.id}
                onClick={() => handlePrayerClick(p.id)}
                className="bg-white shadow-md rounded p-4 hover:shadow-lg transition cursor-pointer"
              >
                <h2 className="text-lg font-bold text-purple-600 mb-2">{p.title}</h2>
                <p className="text-gray-700 text-sm">✍️ {p.author}</p>
                <p className="text-gray-500 text-xs mt-1">
                  {new Date(p.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>

          {/* ✅ 데스크탑: 테이블 뷰 */}
          <div className="hidden sm:block bg-white shadow-xl overflow-hidden rounded">
            <table className="w-full text-left border-collapse text-base sm:text-lg">
              <thead className="bg-purple-200 text-purple-800 text-sm sm:text-xl">
                <tr>
                  <th className="px-4 sm:px-10 py-3 sm:py-5 w-2/5">제목</th>
                  <th className="px-4 sm:px-10 py-3 sm:py-5 w-1/4">작성자</th>
                  <th className="px-4 sm:px-10 py-3 sm:py-5 w-1/4">작성일</th>
                </tr>
              </thead>
              <tbody>
                {currentPrayers.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-purple-50 transition cursor-pointer border-b"
                    onClick={() => handlePrayerClick(p.id)}
                  >
                    <td className="px-4 sm:px-10 py-4 sm:py-6 font-bold text-purple-600 text-base sm:text-xl">
                      {p.title}
                    </td>
                    <td className="px-4 sm:px-10 py-4 sm:py-6 text-gray-700 text-sm sm:text-lg">
                      ✍️ {p.author}
                    </td>
                    <td className="px-4 sm:px-10 py-4 sm:py-6 text-gray-500 text-sm sm:text-lg">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* 페이지네이션 */}
      {prayers.length > itemsPerPage && (
        <div className="flex justify-center mt-6 sm:mt-8 space-x-1 sm:space-x-2">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 sm:px-4 py-1 sm:py-2 rounded bg-purple-200 text-purple-800 disabled:opacity-50 text-sm sm:text-base"
          >
            ◀ 이전
          </button>

          {Array.from({ length: totalPages }, (_, idx) => (
            <button
              key={idx + 1}
              onClick={() => goToPage(idx + 1)}
              className={`px-3 sm:px-4 py-1 sm:py-2 rounded text-sm sm:text-base ${
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
            className="px-3 sm:px-4 py-1 sm:py-2 rounded bg-purple-200 text-purple-800 disabled:opacity-50 text-sm sm:text-base"
          >
            다음 ▶
          </button>
        </div>
      )}
    </div>
  );
}
