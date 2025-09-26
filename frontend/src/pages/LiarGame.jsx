import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";

const socket = io("https://dear-dunamis-russia-2025-1.onrender.com");

export default function LiarGame() {
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const [roomId] = useState("room1");

  const [joined, setJoined] = useState(false);
  const [users, setUsers] = useState([]);
  const [hostId, setHostId] = useState(null);

  const [stage, setStage] = useState("waiting"); 
  const [role, setRole] = useState(null);
  const [word, setWord] = useState("");
  const [turnIndex, setTurnIndex] = useState(0);
  const [timer, setTimer] = useState(15);

  const [votes, setVotes] = useState({});
  const [hasVoted, setHasVoted] = useState(false);
  const [finalResult, setFinalResult] = useState("");

  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    socket.on("updateUsers", (data) => setUsers(data));
    socket.on("updateHost", ({ hostId }) => setHostId(hostId));
    socket.on("message", (msg) => setMessages((prev) => [...prev, msg]));
    socket.on("yourRole", ({ role, word }) => {
      setRole(role);
      if (word) setWord(word);
    });
    socket.on("updateTurn", ({ turnIndex, timer }) => {
      setTurnIndex(turnIndex);
      setTimer(timer);
    });
    socket.on("stageChange", (newStage) => {
      setStage(newStage);
      if (newStage === "voting") setHasVoted(false);
    });
    socket.on("voteResult", ({ target }) => {
      setVotes((prev) => {
        const newVotes = { ...prev };
        newVotes[target] = (newVotes[target] || 0) + 1;
        return newVotes;
      });
      setMessages((prev) => [...prev, `🗳 ${target}님에게 투표되었습니다.`]);
    });
    socket.on("chatMessage", ({ nickname, message }) => {
      setMessages((prev) => [...prev, `💬 ${nickname}: ${message}`]);
    });
    socket.on("restartGame", () => {
      setStage("waiting");
      setRole(null);
      setWord("");
      setVotes({});
      setHasVoted(false);
      setFinalResult("");
      setTurnIndex(0);
      setTimer(15);
      setMessages([]);
    });
    socket.on("finalResult", (resultMsg) => {
      setFinalResult(resultMsg);
      setStage("result");
    });

    return () => {
      socket.off();
    };
  }, []);

  const joinRoom = () => {
    if (!currentUser) return alert("로그인이 필요합니다!");
    socket.emit("joinRoom", { roomId, nickname: currentUser.nickname });
    setJoined(true);
  };

  const startGame = () => {
    socket.emit("startGame", { roomId });
  };

  const handleVote = (target) => {
    if (hasVoted) {
      alert("이미 투표했습니다!");
      return;
    }
    socket.emit("vote", { roomId, voter: currentUser.nickname, target });
    setHasVoted(true);
  };

  const restartGame = () => {
    socket.emit("restartGame", { roomId });
  };

  const sendChat = () => {
    if (!chatInput.trim()) return;

    const isMyTurn =
      stage === "explaining" &&
      users[turnIndex % users.length]?.nickname === currentUser.nickname;
    if (!isMyTurn) {
      alert("⏳ 지금은 내 차례가 아닙니다!");
      return;
    }

    socket.emit("chatMessage", {
      roomId,
      nickname: currentUser.nickname,
      message: chatInput,
    });
    setChatInput("");
  };

  const handleLeave = () => {
    if (stage !== "waiting" && stage !== "result") {
      alert("❌ 게임 중간에는 퇴장할 수 없습니다.");
      return;
    }
    socket.emit("leaveRoom", { roomId, nickname: currentUser.nickname });
    setJoined(false);
    setRole(null);
    setWord("");
    setUsers([]);
    setMessages([]);
    navigate("/");
  };

  return (
    <div className="p-3 sm:p-6 max-w-6xl mx-auto bg-white shadow-lg rounded-lg h-screen flex flex-col overflow-hidden">
      {!joined ? (
        <div className="flex-1 flex flex-col items-center justify-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-purple-700">
            🎭 라이어 게임
          </h2>
          <button
            onClick={joinRoom}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg w-3/4 sm:w-1/2 font-bold text-lg"
          >
            방 입장
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
          {/* 참가자 목록 */}
          <div className="p-3 border rounded bg-gray-50 shadow text-sm sm:text-base">
            <h3 className="font-bold mb-2">👥 참가자 목록</h3>
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {users.map((u, i) => (
                <li
                  key={u.id}
                  className={`p-2 rounded text-center ${
                    stage === "explaining" && turnIndex % users.length === i
                      ? "bg-yellow-200 font-bold"
                      : "bg-white"
                  }`}
                >
                  {u.nickname}
                  {i === 0 && u.id === hostId && " 👑"}
                </li>
              ))}
            </ul>
          </div>

          {/* 역할 */}
          {role && (
            <div
              className={`p-3 sm:p-4 text-center text-lg sm:text-xl font-bold rounded-lg shadow ${
                role === "라이어"
                  ? "bg-red-200 text-red-800"
                  : "bg-green-200 text-green-800"
              }`}
            >
              {role === "라이어"
                ? "❌ 당신은 라이어!"
                : `✅ 시민! 제시어: ${word}`}
            </div>
          )}

          {/* 게임 컨트롤 */}
          {stage === "waiting" && hostId === socket.id && (
            <button
              onClick={startGame}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold text-base sm:text-lg"
            >
              게임 시작
            </button>
          )}
          <button
            onClick={handleLeave}
            className="bg-gray-400 hover:bg-gray-500 text-white px-5 py-2 rounded-lg font-bold self-end text-sm sm:text-base"
          >
            퇴장
          </button>

          {/* 설명 단계 */}
          {stage === "explaining" && (
            <div className="text-center text-lg sm:text-xl font-bold text-purple-700">
              설명 차례: {users[turnIndex % users.length]?.nickname || "-"}{" "}
              <br />
              ⏳ {timer}초 남음
            </div>
          )}

          {/* 투표 단계 */}
          {stage === "voting" && (
            <div className="p-4 border rounded shadow text-sm sm:text-base">
              <h3 className="font-bold mb-3">🗳 투표하기</h3>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleVote(u.nickname)}
                    disabled={hasVoted}
                    className={`px-3 py-2 sm:px-4 sm:py-2 rounded text-white text-sm sm:text-base ${
                      hasVoted
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-purple-600 hover:bg-purple-700"
                    }`}
                  >
                    {u.nickname}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 결과 단계 */}
          {stage === "result" && (
            <div className="p-4 sm:p-6 bg-yellow-100 rounded-lg text-center text-lg sm:text-xl font-bold">
              {finalResult}
              <div className="mt-4">
                <button
                  onClick={restartGame}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm sm:text-base"
                >
                  🔄 게임 재시작
                </button>
              </div>
            </div>
          )}

          {/* 채팅 */}
          <div className="p-3 sm:p-4 border rounded bg-gray-50 flex flex-col flex-1 overflow-hidden text-sm sm:text-base">
            <h3 className="font-bold mb-2">💬 채팅</h3>
            <div className="flex-1 overflow-y-auto mb-2 bg-white p-2 rounded">
              {messages.map((msg, i) => (
                <p key={i} className="text-sm sm:text-lg">
                  {msg}
                </p>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                className="border p-2 flex-1 rounded text-sm sm:text-lg"
                placeholder="메시지 입력..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <button
                onClick={sendChat}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 sm:px-4 py-2 rounded text-sm sm:text-lg"
              >
                전송
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}