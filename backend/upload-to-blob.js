const { BlobServiceClient } = require("@azure/storage-blob");
require("dotenv").config();
const fs = require("fs");
const path = require("path");

async function main() {
  const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!AZURE_STORAGE_CONNECTION_STRING) {
    throw new Error("❌ AZURE_STORAGE_CONNECTION_STRING 환경 변수가 없습니다!");
  }

  // Blob 서비스 클라이언트 생성
  const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);

  // photos 컨테이너 사용
  const containerName = "photos";
  const containerClient = blobServiceClient.getContainerClient(containerName);

  // 업로드할 로컬 파일 경로 (예: ./uploads/test.jpg)
  const localFilePath = path.join(__dirname, "uploads", "test.jpg");
  const fileName = path.basename(localFilePath);

  // Blob 업로드
  const blockBlobClient = containerClient.getBlockBlobClient(fileName);
  await blockBlobClient.uploadFile(localFilePath);

  console.log(`✅ 업로드 성공!`);
  console.log(`🌐 Blob URL: ${blockBlobClient.url}`);
}

main().catch((err) => console.error("❌ 에러:", err.message));
