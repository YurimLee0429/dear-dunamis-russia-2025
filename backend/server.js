const express = require("express");
const cors = require("cors");
const sql = require("mssql");
const http = require("http");
const { Server } = require("socket.io");
const multer = require("multer");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// 업로드 폴더 정적 제공
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// multer 저장소 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });


function requireAdmin(req, res, next) {
  try {
    const user = req.body.user || req.query.user || req.headers["x-user"];
    if (!req.body.currentUser && !req.headers["x-user"]) {
      return res.status(401).json({ message: "로그인이 필요합니다." });
    }
    const currentUser = req.body.currentUser || JSON.parse(req.headers["x-user"] || "{}");

    if (!currentUser.is_admin) {
      return res.status(403).json({ message: "관리자 권한이 필요합니다." });
    }

    next();
  } catch (err) {
    res.status(500).json({ message: "권한 확인 중 오류 발생" });
  }
}
/* -------------------- DB 연결 -------------------- */
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: false,
  },
};

const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then((pool) => {
    console.log("✅ MSSQL Connected!");
    return pool;
  })
  .catch((err) => console.error("❌ DB Connection Failed:", err));

/* -------------------- 사용자 -------------------- */

// 🔧 보조 함수: 두 자리 문자열 보장
function to2digits(str) {
  const s = String(str || "").trim();
  return /^\d{2}$/.test(s) ? s : null;
}

// ✅ 회원가입 (관리자만 가능)
app.post("/api/users/register", requireAdmin, async (req, res) => {
  try {
    const gen = to2digits(req.body.generation);
    const name = String(req.body.name || "").trim();
    if (!gen) return res.status(400).json({ message: "generation은 2자리 숫자여야 합니다." });
    if (!name) return res.status(400).json({ message: "name을 입력하세요." });

    const nickname = `${gen}${name}`;

    const pool = await poolPromise;
    await pool.request()
      .input("generation", sql.VarChar, gen)
      .input("name", sql.NVarChar, name)
      .input("nickname", sql.NVarChar, nickname)
      .input("is_admin", sql.Bit, 0)
      .query(`
        INSERT INTO Users (generation, name, nickname, is_admin)
        VALUES (@generation, @name, @nickname, @is_admin)
      `);

    res.json({ message: "회원 생성 완료", user: { generation: gen, name, nickname, is_admin: 0 } });
  } catch (err) {
    if (String(err.message).includes("UQ_")) {
      return res.status(409).json({ message: "이미 존재하는 사용자 또는 닉네임입니다." });
    }
    res.status(500).send(err.message);
  }
});


// ✅ 로그인
app.post("/api/users/login", async (req, res) => {
  try {
    let gen = String(req.body.generation || "").trim();
    const name = String(req.body.name || "").trim();

    if (!gen) return res.status(400).json({ message: "generation을 입력하세요." });
    if (!name) return res.status(400).json({ message: "name을 입력하세요." });

    const pool = await poolPromise;

    let query, result;
    if (gen === "교역자") {
      // 교역자는 generation='교역자'로만 검색
      result = await pool.request()
        .input("generation", sql.NVarChar, "교역자")
        .input("name", sql.NVarChar, name)
        .query(`
          SELECT TOP 1 id, generation, name, nickname, is_admin
          FROM Users
          WHERE generation=@generation AND name=@name
        `);
    } else {
      if (!/^\d{2}$/.test(gen)) {
        return res.status(400).json({ message: "generation은 2자리 숫자 또는 '교역자'여야 합니다." });
      }
      gen = gen.padStart(2, "0");

      result = await pool.request()
        .input("generation", sql.VarChar, gen)
        .input("name", sql.NVarChar, name)
        .query(`
          SELECT TOP 1 id, generation, name, nickname, is_admin
          FROM Users
          WHERE generation=@generation AND name=@name
        `);
    }

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    res.json({ success: true, user: result.recordset[0] });
  } catch (err) {
    console.error("❌ 로그인 오류:", err);
    res.status(500).send(err.message);
  }
});


/* -------------------- 공지사항 CRUD -------------------- */
/* -------------------- 공지사항 CRUD -------------------- */
app.use(express.json({ limit: "50mb" })); // base64 이미지 허용

// 공지 목록
app.get("/api/notices", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .query("SELECT * FROM notices ORDER BY created_at DESC");
    res.json(result.recordset);
  } catch (err) {
    console.error("❌ 공지 목록 불러오기 오류:", err);
    res.status(500).send(err.message);
  }
});

// ✅ base64 이미지 저장 (multer 제거)
app.post("/api/notices/upload", async (req, res) => {
  const { title, content, author, images } = req.body;

  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input("title", sql.NVarChar, title)
      .input("content", sql.NVarChar(sql.MAX), content)
      .input("author", sql.NVarChar, author)
      .input("image_urls", sql.NVarChar(sql.MAX), JSON.stringify(images))
      .query(`
        INSERT INTO notices (title, content, author, image_urls, created_at)
        VALUES (@title, @content, @author, @image_urls, GETDATE())
      `);

    res.json({ message: "공지사항 등록 완료", images });
  } catch (err) {
    console.error("❌ 공지 등록 오류:", err);
    res.status(500).send(err.message);
  }
});

// 공지 상세
app.get("/api/notices/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query("SELECT * FROM notices WHERE id=@id");

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "공지사항을 찾을 수 없습니다." });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error("❌ 공지 상세 불러오기 오류:", err);
    res.status(500).send(err.message);
  }
});


app.put("/api/notices/:id", async (req, res) => {
  const { id } = req.params;
  const { title, content, image_urls } = req.body;

  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input("id", sql.Int, id)
      .input("title", sql.NVarChar, title)
      .input("content", sql.NVarChar(sql.MAX), content)
      .input("image_urls", sql.NVarChar, image_urls || null)
      .query(
        "UPDATE notices SET title=@title, content=@content, image_urls=@image_urls WHERE id=@id"
      );

    res.json({ message: "공지사항 수정 완료" });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.delete("/api/notices/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    await pool.request().input("id", sql.Int, id).query("DELETE FROM notices WHERE id=@id");
    res.json({ message: "공지사항 삭제 완료" });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

/* -------------------- 기도제목 CRUD -------------------- */
app.get("/api/prayers", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .query("SELECT * FROM prayers ORDER BY created_at DESC");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post("/api/prayers/upload", upload.single("image"), async (req, res) => {
  const { title, content, author } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input("title", sql.NVarChar, title)
      .input("content", sql.NVarChar(sql.MAX), content)
      .input("author", sql.NVarChar, author)
      .input("image_url", sql.NVarChar, image_url)
      .query(
        "INSERT INTO prayers (title, content, author, image_url, created_at) VALUES (@title, @content, @author, @image_url, GETDATE())"
      );

    res.json({ message: "기도제목 등록 완료", image_url });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get("/api/prayers/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query("SELECT * FROM prayers WHERE id=@id");

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "기도제목을 찾을 수 없습니다." });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.put("/api/prayers/:id", async (req, res) => {
  const { id } = req.params;
  const { title, content, image_url } = req.body;
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input("id", sql.Int, id)
      .input("title", sql.NVarChar, title)
      .input("content", sql.NVarChar(sql.MAX), content)
      .input("image_url", sql.NVarChar, image_url || null)
      .query(
        "UPDATE prayers SET title=@title, content=@content, image_url=@image_url WHERE id=@id"
      );
    res.json({ message: "기도제목 수정 완료" });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.delete("/api/prayers/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    await pool.request().input("id", sql.Int, id).query("DELETE FROM prayers WHERE id=@id");
    res.json({ message: "기도제목 삭제 완료" });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

/* -------------------- 사진방 CRUD -------------------- */
app.get("/api/photos", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .query("SELECT * FROM photos ORDER BY created_at DESC");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

const { BlobServiceClient } = require("@azure/storage-blob");

const fs = require("fs");

// Azure Blob 연결
const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING
);
const containerClient = blobServiceClient.getContainerClient("photos");

app.post("/api/photos/upload", upload.single("photo"), async (req, res) => {
  const { uploader, description } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: "사진 파일이 필요합니다." });
  }

  try {
    // 업로드된 파일 경로
    const filePath = req.file.path;
    const blobName = Date.now() + "-" + req.file.originalname; // 중복 방지
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Azure Blob에 업로드
    await blockBlobClient.uploadFile(filePath);

    // Blob URL
    const image_url = blockBlobClient.url;

    // DB에 Blob URL 저장
    const pool = await poolPromise;
    await pool
      .request()
      .input("image_url", sql.NVarChar, image_url)
      .input("uploader", sql.NVarChar, uploader)
      .input("description", sql.NVarChar(sql.MAX), description || null)
      .query(
        "INSERT INTO Photos (image_url, uploader, description, created_at) VALUES (@image_url, @uploader, @description, GETDATE())"
      );

    // 로컬 업로드 파일 삭제 (선택)
    fs.unlinkSync(filePath);

    res.json({ message: "사진 등록 완료", image_url });
  } catch (err) {
    console.error("❌ 업로드 에러:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/photos/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query("SELECT * FROM photos WHERE id=@id");

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "사진을 찾을 수 없습니다." });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.put("/api/photos/:id", async (req, res) => {
  const { id } = req.params;
  const { uploader, description, image_url } = req.body;
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input("id", sql.Int, id)
      .input("uploader", sql.NVarChar, uploader)
      .input("description", sql.NVarChar(sql.MAX), description)
      .input("image_url", sql.NVarChar, image_url || null)
      .query(
        "UPDATE photos SET uploader=@uploader, description=@description, image_url=@image_url WHERE id=@id"
      );
    res.json({ message: "사진 수정 완료" });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.delete("/api/photos/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input("id", sql.Int, id)
      .query("DELETE FROM photos WHERE id=@id");
    res.json({ message: "사진 삭제 완료" });
  } catch (err) {
    res.status(500).send(err.message);
  }
});
/* -------------------- 댓글 CRUD -------------------- */
app.get("/api/comments/:postId", async (req, res) => {
  const { postId } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("postId", sql.Int, postId)
      .query("SELECT * FROM Comments WHERE postId=@postId ORDER BY created_at ASC");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post("/api/comments", async (req, res) => {
  const { postId, author, content } = req.body;
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input("postId", sql.Int, postId)
      .input("author", sql.NVarChar, author)
      .input("content", sql.NVarChar(sql.MAX), content)
      .query("INSERT INTO Comments (postId, author, content) VALUES (@postId, @author, @content)");
    res.json({ message: "댓글 등록 완료" });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.delete("/api/comments/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    await pool.request().input("id", sql.Int, id).query("DELETE FROM Comments WHERE id=@id");
    res.json({ message: "댓글 삭제 완료" });
  } catch (err) {
    res.status(500).send(err.message);
  }
});
/* -------------------- 라이어 게임 -------------------- */
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

let rooms = {};
const words = [
  "이보라 목사님", "두나미스", "러시아", "전한솔 팀장님", "비행기", "청년", "불곰", "어린이",
  "김밥", "치킨", "피자", "삼겹살", "아이스크림", "라면", "떡볶이", "냉면",
  "헬스장", "노래방", "놀이공원", "롤러코스터", "붕어빵", "호떡", "포켓몬", "마리오",
  "아이돌", "유재석", "강호동", "신동엽", "언더우드 선교사님", "런닝맨", "무한도전", "신서유기"
];

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  // 방 참가
  socket.on("joinRoom", ({ roomId, nickname }) => {
    if (!rooms[roomId]) {
      rooms[roomId] = { users: [], liar: null, word: "", hostId: null, votes: {}, voted: {} };
    }
    rooms[roomId].users.push({ id: socket.id, nickname });

    if (!rooms[roomId].hostId) {
      rooms[roomId].hostId = socket.id;
    }

    socket.join(roomId);

    io.to(roomId).emit("updateUsers", rooms[roomId].users);
    io.to(roomId).emit("updateHost", { hostId: rooms[roomId].hostId });
    io.to(roomId).emit("message", `👋 ${nickname}님이 입장하셨습니다.`);
  });

  // 게임 시작
  socket.on("startGame", ({ roomId }) => {
    const room = rooms[roomId];
    if (!room) return;

    room.votes = {};
    room.voted = {};

    const randomWord = words[Math.floor(Math.random() * words.length)];
    room.word = randomWord;

    if (room.users.length > 1) {
      const liarIndex = Math.floor(Math.random() * room.users.length);
      room.liar = room.users[liarIndex].id;
    } else {
      room.liar = null;
    }

    room.users.forEach((user) => {
      if (user.id === room.liar) {
        io.to(user.id).emit("yourRole", { role: "라이어" });
      } else {
        io.to(user.id).emit("yourRole", { role: "시민", word: room.word });
      }
    });

    io.to(roomId).emit("stageChange", "explaining");
    io.to(roomId).emit("message", "🎮 라이어 게임이 시작되었습니다!");

    // 설명 라운드 타이머
    let turnIndex = 0;
    let timer = 15;

    const interval = setInterval(() => {
      if (!rooms[roomId]) {
        clearInterval(interval);
        return;
      }

      io.to(roomId).emit("updateTurn", { turnIndex, timer });

      if (timer > 0) {
        timer--;
      } else {
        if (turnIndex < room.users.length * 2 - 1) {
          turnIndex++;
          timer = 15;
        } else {
          io.to(roomId).emit("stageChange", "voting");
          clearInterval(interval);
        }
      }
    }, 1000);
  });

  // 채팅
  socket.on("chatMessage", ({ roomId, nickname, message }) => {
    io.to(roomId).emit("chatMessage", { nickname, message });
  });

  // 투표
  socket.on("vote", ({ roomId, voter, target }) => {
    const room = rooms[roomId];
    if (!room) return;

    if (!room.voted) room.voted = {};
    if (room.voted[voter]) {
      io.to(socket.id).emit("message", "⚠️ 이미 투표했습니다!");
      return;
    }

    room.voted[voter] = target;
    room.votes[target] = (room.votes[target] || 0) + 1;

    io.to(roomId).emit("voteResult", { target });

    if (Object.keys(room.voted).length === room.users.length) {
      const maxVotes = Math.max(...Object.values(room.votes));
      const topCandidates = Object.keys(room.votes).filter(
        (name) => room.votes[name] === maxVotes
      );

      const liarUser = room.users.find((u) => u.id === room.liar);

      if (topCandidates.length > 1) {
        io.to(roomId).emit(
          "finalResult",
          `⚖️ 투표가 무승부로 끝났습니다. 진짜 라이어는 ${liarUser?.nickname || "???"}`
        );
      } else {
        const chosen = topCandidates[0];
        if (liarUser && liarUser.nickname === chosen) {
          io.to(roomId).emit("finalResult", `🎉 라이어는 ${chosen}님! 정답입니다!`);
        } else {
          io.to(roomId).emit(
            "finalResult",
            `❌ ${chosen}님은 라이어가 아니었습니다... (진짜 라이어는 ${liarUser?.nickname || "???"})`
          );
        }
      }
      io.to(roomId).emit("stageChange", "result");
    }
  });

  // 게임 재시작
  socket.on("restartGame", ({ roomId }) => {
    if (rooms[roomId]) {
      rooms[roomId].liar = null;
      rooms[roomId].word = "";
      rooms[roomId].votes = {};
      rooms[roomId].voted = {};
    }
    io.to(roomId).emit("restartGame");
    io.to(roomId).emit("message", "🔄 게임이 다시 시작됩니다!");
  });

  // 방 나가기
  socket.on("leaveRoom", ({ roomId, nickname }) => {
    const room = rooms[roomId];
    if (room) {
      room.users = room.users.filter((u) => u.id !== socket.id);

      io.to(roomId).emit("updateUsers", room.users);
      io.to(roomId).emit("message", `👋 ${nickname}님이 퇴장하셨습니다.`);

      socket.leave(roomId);

      if (room.hostId === socket.id) {
        room.hostId = room.users.length > 0 ? room.users[0].id : null;
        io.to(roomId).emit("updateHost", { hostId: room.hostId });
      }

      if (room.users.length === 0) {
        delete rooms[roomId];
      }
    }
  });

  // 연결 종료
  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);

    for (const roomId in rooms) {
      const room = rooms[roomId];
      const user = room.users.find((u) => u.id === socket.id);

      if (user) {
        room.users = room.users.filter((u) => u.id !== socket.id);
        io.to(roomId).emit("updateUsers", room.users);
        io.to(roomId).emit("message", `👋 ${user.nickname}님이 퇴장하셨습니다.`);

        if (room.hostId === socket.id) {
          room.hostId = room.users.length > 0 ? room.users[0].id : null;
          io.to(roomId).emit("updateHost", { hostId: room.hostId });
        }

        if (room.users.length === 0) {
          delete rooms[roomId];
        }
      }
    }
  });
});


/* -------------------- 서버 실행 -------------------- */
/* -------------------- 서버 실행 -------------------- */
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
