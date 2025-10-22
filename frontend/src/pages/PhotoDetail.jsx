import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function PhotoDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [photo, setPhoto] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem("user")); // 로그인 사용자

  const fetchPhoto = async () => {
    try {
      const res = await fetch(
        `https://dear-dunamis-russia-2025-1.onrender.com/api/photos/${id}`
      );
      const data = await res.json();
      setPhoto(data);
    } catch (err) {
      console.error("사진 불러오기 실패:", err);
    }
  };

  useEffect(() => {
    fetchPhoto();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await fetch(
        `https://dear-dunamis-russia-2025-1.onrender.com/api/photos/${id}`,
        { method: "DELETE" }
      );
      alert("삭제되었습니다 📸");
      navigate("/photos");
    } catch (err) {
      console.error("삭제 실패:", err);
    }
  };

  if (!photo) {
    return (
      <div className="flex justify-center items-center h-96">
        <p className="text-gray-500 text-lg">⏳ 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-12 py-8 max-w-4xl mx-auto mt-40">
      <div className="bg-white shadow-xl overflow-hidden">
        {/* ✅ base64와 URL 둘 다 대응 */}
        <img
          src={
            photo.image_url.startsWith("data:image")
              ? photo.image_url
              : photo.image_url.startsWith("http")
              ? photo.image_url
              : `https://dear-dunamis-russia-2025-1.onrender.com${photo.image_url}`
          }
          alt="추억"
          className="w-full max-h-[600px] object-cover"
        />

        <div className="p-6">
          <h2 className="text-2xl font-bold text-purple-600 mb-3">
            📸 {photo.uploader}
          </h2>
          <p className="text-gray-700 mb-4">{photo.description}</p>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => navigate("/photos")}
              className="bg-purple-100 text-purple-700 px-6 py-2 rounded-lg hover:bg-purple-200 transition"
            >
              목록으로
            </button>

            {/* 삭제 버튼: 작성자 본인 또는 관리자만 */}
            {currentUser &&
              (currentUser.nickname === photo.uploader ||
                currentUser.role === "admin") && (
                <button
                  onClick={handleDelete}
                  className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
                >
                  삭제
                </button>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
