-- BuhatonKo database schema
-- Run this whole file in TiDB Cloud's SQL Editor.
-- Safe to run more than once: it only creates tables that don't exist yet.

USE buhatonko;

-- 1. Accounts (you already have this one)
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  full_name     VARCHAR(100) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('student', 'admin') NOT NULL DEFAULT 'student',
  is_verified   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Public profile (one per user)
CREATE TABLE IF NOT EXISTS profiles (
  user_id     INT PRIMARY KEY,
  bio         TEXT,
  skills      VARCHAR(500),
  school      VARCHAR(150),
  avatar_url  VARCHAR(500),
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Service categories
CREATE TABLE IF NOT EXISTS categories (
  id    INT AUTO_INCREMENT PRIMARY KEY,
  name  VARCHAR(100) NOT NULL UNIQUE
);

-- 4. Services students offer (Fiverr-style listings)
CREATE TABLE IF NOT EXISTS services (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  provider_id    INT NOT NULL,
  category_id    INT NOT NULL,
  title          VARCHAR(120) NOT NULL,
  description    TEXT NOT NULL,
  price          DECIMAL(10,2) NOT NULL,
  price_type     ENUM('fixed', 'starting') NOT NULL DEFAULT 'starting',
  delivery_days  INT NOT NULL DEFAULT 3,
  delivery_mode  ENUM('online', 'in_person', 'both') NOT NULL DEFAULT 'online',
  status         ENUM('active', 'paused') NOT NULL DEFAULT 'active',
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- 5. Jobs: a customer requests a service from a provider
CREATE TABLE IF NOT EXISTS jobs (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  service_id   INT NOT NULL,
  customer_id  INT NOT NULL,
  provider_id  INT NOT NULL,
  brief        TEXT NOT NULL,
  budget       DECIMAL(10,2),
  deadline     DATE,
  status       ENUM('requested', 'accepted', 'declined', 'in_progress',
                    'submitted', 'completed', 'cancelled')
               NOT NULL DEFAULT 'requested',
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (service_id)  REFERENCES services(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. Who changed a job's status, and when
CREATE TABLE IF NOT EXISTS job_status_history (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  job_id      INT NOT NULL,
  status      VARCHAR(20) NOT NULL,
  changed_by  INT NOT NULL,
  changed_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

-- 7. Messages inside a job
CREATE TABLE IF NOT EXISTS messages (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  job_id      INT NOT NULL,
  sender_id   INT NOT NULL,
  body        TEXT NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id)    REFERENCES jobs(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 8. Reviews: one per completed job, written by the customer
CREATE TABLE IF NOT EXISTS reviews (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  job_id       INT NOT NULL UNIQUE,
  reviewer_id  INT NOT NULL,
  reviewee_id  INT NOT NULL,
  rating       TINYINT NOT NULL,
  comment      TEXT,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id)      REFERENCES jobs(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewee_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Starting categories (INSERT IGNORE skips ones that already exist)
INSERT IGNORE INTO categories (name) VALUES
  ('Graphic Design'),
  ('Tutoring'),
  ('Writing & Editing'),
  ('Video & Photo'),
  ('Computer Help'),
  ('Other Tasks');
