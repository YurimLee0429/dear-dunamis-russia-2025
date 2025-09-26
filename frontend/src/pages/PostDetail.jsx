import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");
  const currentUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetch(`https://dear-dunamis-russia-2025-1.onrender.com/api/notices/${id}`)
      .then((res) => res.json())
      .then((data) => setPost(data));

    fetch(`https://dear-dunamis-russia-2025-1.onrender.com/api/comments/${id}`)
      .then((res) => res.json())
      .then(setComments);
  }, [id]);

  const handleComment = async () => {
    if (!comment.trim()) return;
    if (!currentUser) {
      alert("로그인이 필요합니다!");
      return;
    }

    await fetch(`https://dear-dunamis-russia-2025-1.onrender.com/api/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        postId: id,
        author: currentUser.nickname,
        content: comment,
      }),
    });

    setComment("");
    const res = await fetch(`https://dear-dunamis-russia-2025-1.onrender.com/api/comments/${id}`);
    setComments(await res.json());
  };

  const handleDeleteComment = async (commentId, author) => {
    if (!currentUser) return;
    if (currentUser.nickname !== author && currentUser.nickname !== "관리자") {
      alert("본인 또는 관리자만 삭제할 수 있습니다.");
      return;
    }

    await fetch(`https://dear-dunamis-russia-2025-1.onrender.com/api/comments/${commentId}`, {
      method: "DELETE",
    });
    const res = await fetch(`https://dear-dunamis-russia-2025-1.onrender.com/api/comments/${id}`);
    setComments(await res.json());
  };

  const handleDeletePost = async () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await fetch(`https://dear-dunamis-russia-2025-1.onrender.com/api/notices/${id}`, {
        method: "DELETE",
      });
      alert("삭제되었습니다.");
      navigate("/notices");
    } catch (err) {
      console.error("삭제 실패:", err);
    }
  };

  if (!post) return <p className="text-center text-gray-500">⏳ 로딩중...</p>;

  const canDelete =
    currentUser &&
    (currentUser.nickname === post.author || currentUser.nickname === "관리자");

  return (
    <div className="px-4 sm:px-6 lg:px-12 py-6 sm:py-8 max-w-4xl mx-auto mt-20 sm:mt-28">
      <div className="bg-white p-4 sm:p-8 shadow-xl rounded-lg">
        {/* 제목 */}
        <h1 className="text-2xl sm:text-3xl font-bold text-purple-600 mb-3 sm:mb-4">
          📢 {post.title}
        </h1>

        {/* 작성자 & 작성일 */}
        <div className="flex flex-col sm:flex-row sm:justify-between text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
          <span>✍️ {post.author}</span>
          <span>🕒 {new Date(post.created_at).toLocaleString()}</span>
        </div>

        {/* 이미지 */}
        {post.image_url && (
          <img
            src={
              post.image_url.startsWith("http")
                ? post.image_url
                : `https://dear-dunamis-russia-2025-1.onrender.com${post.image_url}`
            }
            alt="공지"
            className="mb-4 sm:mb-6 w-full max-h-[300px] sm:max-h-[400px] object-cover rounded"
          />
        )}

        {/* 내용 */}
        <p className="text-gray-800 text-base sm:text-lg leading-relaxed whitespace-pre-line">
          {post.content}
        </p>

        {/* 버튼 영역 */}
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-end gap-3">
          <button
            onClick={() => navigate("/notices")}
            className="bg-purple-100 text-purple-700 px-4 sm:px-6 py-2 rounded hover:bg-purple-200 transition"
          >
            목록으로
          </button>
          {canDelete && (
            <button
              onClick={handleDeletePost}
              className="bg-red-500 text-white px-4 sm:px-6 py-2 rounded hover:bg-red-600 transition"
            >
              삭제
            </button>
          )}
        </div>
      </div>

      {/* 댓글 */}
      <div className="bg-white shadow-md p-4 sm:p-6 mt-6 rounded-lg">
        <h3 className="font-bold text-lg text-purple-600 mb-4">💬 댓글</h3>

        {/* 댓글 입력 */}
        {currentUser ? (
          <div className="flex flex-col sm:flex-row mb-4 gap-2">
            <input
              className="border flex-1 p-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm sm:text-base"
              placeholder="댓글을 입력하세요"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button
              onClick={handleComment}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition text-sm sm:text-base"
            >
              댓글 등록 💜
            </button>
          </div>
        ) : (
          <p className="text-gray-500 mb-4">✍️ 댓글을 작성하려면 로그인하세요.</p>
        )}

        {/* 댓글 목록 */}
        <ul className="space-y-2 sm:space-y-3">
          {comments.map((c) => (
            <li
              key={c.id}
              className="flex justify-between items-center bg-purple-50 p-2 sm:p-3 rounded"
            >
              <span className="text-sm sm:text-base">
                <span className="font-semibold text-purple-700">{c.author}</span>
                : {c.content}
              </span>
              {currentUser &&
                (currentUser.nickname === c.author || currentUser.nickname === "관리자") && (
                  <button
                    onClick={() => handleDeleteComment(c.id, c.author)}
                    className="text-xs sm:text-sm bg-red-400 text-white px-2 sm:px-3 py-1 rounded hover:bg-red-500 transition"
                  >
                    삭제
                  </button>
                )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}