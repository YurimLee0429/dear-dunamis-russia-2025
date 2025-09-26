import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function NoticeBoard() {
  const [notices, setNotices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const fetchNotices = async () => {
    try {
      const res = await fetch(
        "https://dear-dunamis-russia-2025-1.onrender.com/api/notices"
      );
      const data = await res.json();
      setNotices(data);
    } catch (err) {
      console.error("공지 불러오기 실패:", err);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await fetch(
        `https://dear-dunamis-russia-2025-1.onrender.com/api/notices/${id}`,
        { method: "DELETE" }
      );
      fetchNotices();
    } catch (err) {
      console.error("삭제 실패:", err);
    }
  };

  const totalPages = Math.ceil(notices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentNotices = notices.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-20 py-8 sm:py-12 max-w-full mx-auto">
      {/* 제목 */}
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-5xl font-bold text-purple-600 mb-3 sm:mb-4">
          🐻 러시아팀의 소식
        </h1>
        <p className="text-base sm:text-lg text-gray-500">
          좋은 소식을 전하며 ✨
        </p>
      </div>

      {/* 새 글 작성 버튼 */}
      {currentUser && (
        <div className="flex justify-end mb-6 sm:mb-8">
          <Link
            to="/notices/new"
            className="bg-gradient-to-r from-purple-500 to-purple-700 text-white px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-lg shadow hover:scale-105 transform transition rounded"
          >
            ✍️ 새 글 작성
          </Link>
        </div>
      )}

      {/* 공지 없음 */}
      {notices.length === 0 ? (
        <div className="text-center py-16 sm:py-24 bg-purple-50 shadow-inner rounded-lg">
          <p className="text-2xl sm:text-3xl text-purple-500 mb-4">
            📭 아직 등록된 공지가 없습니다.
          </p>
          <p className="text-gray-500 mb-6 sm:mb-8">
            새로운 소식을 공유해주세요!
          </p>
          {currentUser && (
            <Link
              to="/notices/new"
              className="bg-purple-500 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg hover:bg-purple-600 transition text-sm sm:text-base"
            >
              공지 작성하기
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* 목록 */}
          <div className="flex flex-col gap-6 sm:gap-10">
            {currentNotices.map((n) => (
              <div
                key={n.id}
                className="bg-white shadow-md sm:shadow-xl rounded-lg overflow-hidden hover:shadow-2xl transition w-full"
              >
                {/* 카드 내부 */}
                <div className="flex flex-col md:flex-row">
                  {n.image_url && (
                    <img
                      src={`https://dear-dunamis-russia-2025-1.onrender.com${n.image_url}`}
                      alt="공지"
                      className="w-full md:w-1/3 h-48 sm:h-64 object-cover"
                    />
                  )}

                  <div className="flex-1 p-4 sm:p-8 flex flex-col justify-between">
                    <div>
                      <Link to={`/notices/${n.id}`}>
                        <h2 className="text-xl sm:text-3xl font-bold text-purple-600 mb-2 sm:mb-4 hover:underline">
                          {n.title}
                        </h2>
                      </Link>
                      <p className="text-gray-700 text-base sm:text-lg mb-3 sm:mb-4 line-clamp-4">
                        {n.content}
                      </p>
                    </div>
                    <div className="flex justify-between items-center text-sm sm:text-base text-gray-500">
                      <span>✍️ {n.author}</span>
                      <span>
                        📅 {new Date(n.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 삭제 버튼 */}
                {currentUser &&
                  (currentUser.role === "admin" ||
                    currentUser.nickname === n.author) && (
                    <div className="flex justify-end p-3 sm:p-4 border-t">
                      <button
                        onClick={() => handleDelete(n.id)}
                        className="bg-red-400 px-4 sm:px-5 py-1.5 sm:py-2 text-white hover:bg-red-500 text-xs sm:text-sm rounded"
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
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded bg-purple-200 text-purple-800 disabled:opacity-50 text-sm sm:text-base"
              >
                ◀ 이전
              </button>

              {Array.from({ length: totalPages }, (_, idx) => (
                <button
                  key={idx + 1}
                  onClick={() => goToPage(idx + 1)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded text-sm sm:text-base ${
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
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded bg-purple-200 text-purple-800 disabled:opacity-50 text-sm sm:text-base"
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