import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbars.jsx";


// 페이지들
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";

// 공지사항
import NoticeBoard from "./pages/NoticeBoard.jsx";
import NoticeForm from "./pages/NoticeForm.jsx";
import PostDetail from "./pages/PostDetail.jsx"; // 공지 상세

// 기도제목
import PrayerBoard from "./pages/PrayerBoard.jsx";
import PrayerForm from "./pages/PrayerForm.jsx";
import PrayerDetail from "./pages/PrayerDetail.jsx";

// 사진방
import PhotoList from "./pages/PhotoList.jsx";
import PhotoForm from "./pages/PhotoForm.jsx";
import PhotoDetail from "./pages/PhotoDetail.jsx";

// 사진방 & 게임

import LiarGame from "./pages/LiarGame.jsx";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <Navbar />
        <div className="max-w-6xl mx-auto p-4">
       
          <Routes>
            {/* 홈 */}
            <Route path="/" element={<Home />} />

            {/* 로그인 */}
            <Route path="/login" element={<Login />} />

            {/* 공지사항 */}
        <Route path="/notices" element={<NoticeBoard />} />   {/* 목록 */}
        <Route path="/notices/new" element={<NoticeForm />} /> {/* 작성 */}
        <Route path="/notices/:id" element={<PostDetail />} /> {/* 상세 */}

            {/* 기도제목 */}
            <Route path="/prayers" element={<PrayerBoard />} /> {/* 목록 */}
            <Route path="/prayers/new" element={<PrayerForm />} /> {/* 작성 */}
            <Route path="/prayers/:id" element={<PrayerDetail />} /> {/* 상세 */}

          {/* 사진방 */}
        <Route path="/photos" element={<PhotoList />} />   {/* 사진첩 목록 */}
        <Route path="/photos/new" element={<PhotoForm />} /> {/* 업로드 */}
        <Route path="/photos/:id" element={<PhotoDetail />} /> {/* 상세 보기 */}


            {/* 라이어 게임 */}
            <Route path="/liargame" element={<LiarGame />} />

            {/* (기존) 공통 게시판 상세 - 필요시 유지 */}
            <Route path="/post/:boardType/:id" element={<PostDetail />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
