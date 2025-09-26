-- Comments 테이블
CREATE TABLE Comments (
    id INT PRIMARY KEY IDENTITY(1,1),
    postId INT NOT NULL,
    author VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME NULL
);


-- Notices 테이블
CREATE TABLE Notices (
    id INT PRIMARY KEY IDENTITY(1,1),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    author VARCHAR(100) NOT NULL,
    image_url VARCHAR(255) NULL,
    created_at DATETIME NULL
);

-- Photos 테이블
CREATE TABLE Photos (
    id INT PRIMARY KEY IDENTITY(1,1),
    image_url VARCHAR(500) NOT NULL,
    uploader VARCHAR(100) NOT NULL,
    description NVARCHAR(MAX) NULL,
    created_at DATETIME NULL,
    likes_count INT NULL,
    comments_count INT NULL,
    is_public BIT NULL
);

-- Prayers 테이블
CREATE TABLE Prayers (
    id INT PRIMARY KEY IDENTITY(1,1),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    author VARCHAR(100) NOT NULL,
    created_at DATETIME NULL,
    image_url VARCHAR(255) NULL
);

-- Users 테이블
CREATE TABLE Users (
    id INT PRIMARY KEY IDENTITY(1,1),
    generation VARCHAR(50) NOT NULL,
    name VARCHAR(50) NOT NULL,
    nickname VARCHAR(100) NOT NULL,
    role VARCHAR(20) NULL,
    created_at DATETIME NULL,
    is_admin BIT NOT NULL DEFAULT 0
);