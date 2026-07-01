-- ============================================================
--  CariMakan Database v2 — Multi-Seller
--  Jalankan file ini di phpMyAdmin SEBELUM npm run seed
-- ============================================================

DROP DATABASE IF EXISTS carimakan_db;
CREATE DATABASE carimakan_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE carimakan_db;

-- ─── users ──────────────────────────────────────────────────
CREATE TABLE users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100)  NOT NULL,
  email       VARCHAR(255)  NOT NULL UNIQUE,
  password    VARCHAR(255)  NOT NULL,
  role        ENUM('admin','seller','buyer') NOT NULL DEFAULT 'buyer',
  phone       VARCHAR(20)   DEFAULT NULL,
  address     TEXT          DEFAULT NULL,
  avatarUrl   VARCHAR(500)  DEFAULT NULL,
  createdAt   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── categories ─────────────────────────────────────────────
CREATE TABLE categories (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100)  NOT NULL UNIQUE,
  createdAt   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── stores ─────────────────────────────────────────────────
CREATE TABLE stores (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  userId      INT           NOT NULL UNIQUE,
  name        VARCHAR(100)  NOT NULL,
  description TEXT          DEFAULT NULL,
  address     TEXT          DEFAULT NULL,
  phone       VARCHAR(20)   DEFAULT NULL,
  logoUrl     VARCHAR(500)  DEFAULT NULL,
  bannerUrl   VARCHAR(500)  DEFAULT NULL,
  isOpen      TINYINT(1)    NOT NULL DEFAULT 1,
  status      ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  createdAt   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── foods ──────────────────────────────────────────────────
CREATE TABLE foods (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  storeId         INT             NOT NULL,
  categoryId      INT             NOT NULL,
  name            VARCHAR(255)    NOT NULL,
  description     TEXT            NOT NULL,
  price           DECIMAL(10,2)   NOT NULL,
  imageUrl        VARCHAR(500)    DEFAULT NULL,
  stock           INT             NOT NULL DEFAULT 999,
  isAvailable     TINYINT(1)      NOT NULL DEFAULT 1,
  ratingAverage   FLOAT           DEFAULT 0,
  ratingCount     INT             DEFAULT 0,
  createdAt       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (storeId)    REFERENCES stores(id)     ON DELETE CASCADE,
  FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── carts ──────────────────────────────────────────────────
CREATE TABLE carts (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  userId      INT             NOT NULL,
  foodId      INT             NOT NULL,
  quantity    INT             NOT NULL DEFAULT 1,
  notes       VARCHAR(255)    DEFAULT NULL,
  createdAt   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (foodId) REFERENCES foods(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── favorites ──────────────────────────────────────────────
CREATE TABLE favorites (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  userId      INT NOT NULL,
  foodId      INT NOT NULL,
  createdAt   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_fav (userId, foodId),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (foodId) REFERENCES foods(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── ratings ────────────────────────────────────────────────
CREATE TABLE ratings (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  userId      INT      NOT NULL,
  foodId      INT      NOT NULL,
  rating      TINYINT  NOT NULL,
  review      TEXT     DEFAULT NULL,
  createdAt   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_rating (userId, foodId),
  INDEX idx_foodId (foodId),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (foodId) REFERENCES foods(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SELECT 'Database carimakan_db v2 berhasil dibuat!' AS status;
SHOW TABLES;
