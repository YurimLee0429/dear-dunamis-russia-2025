require("dotenv").config();
const { BlobServiceClient } = require("@azure/storage-blob");
const fs = require("fs");
const path = require("path");
const sql = require("mssql");

// 📌 환경변수
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = "photos";

// 📌 MSSQL 연결
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_SERVER,  // e.g. dear-russia-team.database.windows.net
  database: process.env.DB_NAME,
  options: {
    encrypt: true
  }
};

async function main() {
  // Blob 클라이언트
  const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
  const containerClient = blobServiceClient.getContainerClient(containerName);

  // DB 연결
  const pool = await sql.connect(dbConfig);

  // uploads 폴더 스캔
  const uploadsDir = path.join(__dirname, "uploads");
  const files = fs.readdirSync(uploadsDir);

  for (const file of files) {
    const filePath = path.join(uploadsDir, file);

    console.log(`📤 업로드 중: ${file}`);

    // Blob 업로드
    const blockBlobClient = containerClient.getBlockBlobClient(file);
    await blockBlobClient.uploadFile(filePath);

    // Blob URL
    const blobUrl = `https://${process.env.STORAGE_ACCOUNT_NAME}.blob.core.windows.net/${containerName}/${file}`;

    console.log(`✅ 업로드 완료 → ${blobUrl}`);

    // DB 업데이트
    await pool.request()
      .input("newUrl", sql.NVarChar, blobUrl)
      .input("oldUrl", sql.NVarChar, `/uploads/${file}`)
      .query("UPDATE Photos SET image_url=@newUrl WHERE image_url=@oldUrl");
  }

  console.log("🎉 모든 파일 업로드 + DB 업데이트 완료!");
  process.exit(0);
}

main().catch(err => {
  console.error("❌ 에러:", err.message);
  process.exit(1);
});
