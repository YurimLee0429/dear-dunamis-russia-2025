import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const updateUser = () => {
      setUser(JSON.parse(localStorage.getItem("user")));
    };
    updateUser();

    window.addEventListener("storage", updateUser);
    return () => window.removeEventListener("storage", updateUser);
  }, []);

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    window.dispatchEvent(new Event("storage"));
    navigate("/");
    setMenuOpen(false);
  };

  return (
    <nav className="bg-purple-600 shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* 로고 */}
        <Link
          to="/"
          className="text-2xl font-extrabold text-white tracking-wide"
          onClick={() => setMenuOpen(false)}
        >
          두나미스 러시아
        </Link>

        {/* 햄버거 버튼 (모바일) */}
        <button
          className="sm:hidden text-white text-2xl focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "✖" : "☰"}
        </button>

        {/* PC 메뉴 */}
        <div className="hidden sm:flex items-center gap-6 text-white font-semibold text-lg">
          <Link to="/notices" className="hover:text-purple-200 transition">소식</Link>
          <Link to="/prayers" className="hover:text-purple-200 transition">기도</Link>
          <Link to="/photos" className="hover:text-purple-200 transition">사진</Link>
          <Link to="/liargame" className="hover:text-purple-200 transition">게임</Link>

          {!user ? (
            <Link
              to="/login"
              className="bg-white text-purple-700 px-4 py-2 rounded-lg font-bold hover:bg-purple-100 transition"
            >
              로그인
            </Link>
          ) : (
            <>
              <span className="text-sm">
                안녕하세요, <b>{user.nickname}</b>님
              </span>
              <button
                onClick={logout}
                className="bg-purple-800 px-4 py-2 rounded-lg hover:bg-purple-900 transition"
              >
                로그아웃
              </button>
            </>
          )}
        </div>
      </div>

      {/* 모바일 메뉴 (드롭다운) */}
      {menuOpen && (
        <div className="sm:hidden bg-purple-700 text-white flex flex-col space-y-4 px-6 py-4">
          <Link to="/notices" onClick={() => setMenuOpen(false)} className="hover:text-purple-200 transition">소식</Link>
          <Link to="/prayers" onClick={() => setMenuOpen(false)} className="hover:text-purple-200 transition">기도</Link>
          <Link to="/photos" onClick={() => setMenuOpen(false)} className="hover:text-purple-200 transition">사진</Link>
          <Link to="/liargame" onClick={() => setMenuOpen(false)} className="hover:text-purple-200 transition">게임</Link>

          {!user ? (
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="bg-white text-purple-700 px-4 py-2 rounded-lg font-bold hover:bg-purple-100 transition"
            >
              로그인
            </Link>
          ) : (
            <>
              <span className="text-sm">
                안녕하세요, <b>{user.nickname}</b>님
              </span>
              <button
                onClick={logout}
                className="bg-purple-800 px-4 py-2 rounded-lg hover:bg-purple-900 transition"
              >
                로그아웃
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}