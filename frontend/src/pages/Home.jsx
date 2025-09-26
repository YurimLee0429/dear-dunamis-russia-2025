import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";  // ✅ 추가
import LoveImg from "../../img/Love.jpg";
import RussiaImg from "../../img/Russia.jpg";
import TeamImg from "../../img/Team.jpg";

export default function Home() {
  const [slides] = useState([LoveImg, RussiaImg, TeamImg]);
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate(); // ✅ 페이지 이동 함수

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="p-4 sm:p-6">
      {/* 상단 제목 */}
      <h1 className="text-3xl sm:text-5xl font-bold text-purple-500 text-center mb-6 sm:mb-8 mt-8 sm:mt-12 font-cute leading-snug">
        💖 사랑 가득 2025 두나미스 러시아 💖
      </h1>
      <h2 className="text-base sm:text-xl font-bold text-gray-700 text-center mb-6 sm:mb-4">
        사랑하는 러시아팀을 위한 웹 어플리케이션! <br className="sm:hidden" />
        우리의 모든 소중한 순간들을 함께 나눠요 ✨
      </h2>

      {/* 슬라이드 배너 */}
      <div className="w-full max-w-7xl h-64 sm:h-[500px] mx-auto mb-8 sm:mb-12 mt-6 sm:mt-8 relative rounded-xl overflow-hidden shadow-2xl">
        <img
          src={slides[current]}
          alt="슬라이드"
          className="w-full h-full object-cover transition-all duration-700"
        />
        <div className="absolute bottom-2 sm:bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2 sm:space-x-3">
          {slides.map((_, idx) => (
            <span
              key={idx}
              className={`w-2.5 h-2.5 sm:w-4 sm:h-4 rounded-full ${
                current === idx ? "bg-purple-600" : "bg-purple-300"
              }`}
            />
          ))}
        </div>
      </div>

      {/* 카드 메뉴 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 max-w-6xl mx-auto">
        <div
          className="bg-purple-100 rounded-2xl shadow-xl p-6 sm:p-10 text-center hover:scale-105 transition cursor-pointer"
          onClick={() => navigate("/notices")}
        >
          <h2 className="text-xl sm:text-2xl font-bold text-purple-700 mb-3 sm:mb-4">📢 우리들의 소식</h2>
          <p className="text-sm sm:text-lg text-gray-700">좋은 소식을 전하며~</p>
        </div>

        <div
          className="bg-purple-100 rounded-2xl shadow-xl p-6 sm:p-10 text-center hover:scale-105 transition cursor-pointer"
          onClick={() => navigate("/prayers")}
        >
          <h2 className="text-xl sm:text-2xl font-bold text-purple-700 mb-3 sm:mb-4">🙏 기도제목</h2>
          <p className="text-sm sm:text-lg text-gray-700">하나님이 너를 엄청 사랑하신대</p>
        </div>

        <div
          className="bg-purple-100 rounded-2xl shadow-xl p-6 sm:p-10 text-center hover:scale-105 transition cursor-pointer"
          onClick={() => navigate("/photos")}
        >
          <h2 className="text-xl sm:text-2xl font-bold text-purple-700 mb-3 sm:mb-4">📷 추억 사진방</h2>
          <p className="text-sm sm:text-lg text-gray-700">러시아팀의 모든 날 모든 순간</p>
        </div>

        <div
          className="bg-purple-100 rounded-2xl shadow-xl p-6 sm:p-10 text-center hover:scale-105 transition cursor-pointer"
          onClick={() => navigate("/liargame")}
        >
          <h2 className="text-xl sm:text-2xl font-bold text-purple-700 mb-3 sm:mb-4">🎮 라이어게임</h2>
          <p className="text-sm sm:text-lg text-gray-700">같이 즐겨요!</p>
        </div>
      </div>
    </div>
  );
}