-- BuhatonKo demo data. Run AFTER schema.sql, ONE time only.
-- Every demo account's password is: demo12345

USE buhatonko;
SET NAMES utf8mb4;

INSERT IGNORE INTO users (full_name, email, password_hash, is_verified) VALUES ('Miguel Santos', 'miguel@uc.edu.ph', '$2b$10$TAJK0NTL5sP/7I/D9f6EAeJHI3Jh/kRLlV67Du8/O3WKLtJZUEVMm', 1);
INSERT IGNORE INTO users (full_name, email, password_hash, is_verified) VALUES ('Ana Reyes', 'ana@uc.edu.ph', '$2b$10$TAJK0NTL5sP/7I/D9f6EAeJHI3Jh/kRLlV67Du8/O3WKLtJZUEVMm', 1);
INSERT IGNORE INTO users (full_name, email, password_hash, is_verified) VALUES ('Jasmine Cruz', 'jasmine@uc.edu.ph', '$2b$10$TAJK0NTL5sP/7I/D9f6EAeJHI3Jh/kRLlV67Du8/O3WKLtJZUEVMm', 1);
INSERT IGNORE INTO users (full_name, email, password_hash, is_verified) VALUES ('Paolo Villanueva', 'paolo@uc.edu.ph', '$2b$10$TAJK0NTL5sP/7I/D9f6EAeJHI3Jh/kRLlV67Du8/O3WKLtJZUEVMm', 0);
INSERT IGNORE INTO users (full_name, email, password_hash, is_verified) VALUES ('Bea Lim', 'bea@uc.edu.ph', '$2b$10$TAJK0NTL5sP/7I/D9f6EAeJHI3Jh/kRLlV67Du8/O3WKLtJZUEVMm', 1);
INSERT IGNORE INTO users (full_name, email, password_hash, is_verified) VALUES ('Carlo Mendoza', 'demo@uc.edu.ph', '$2b$10$TAJK0NTL5sP/7I/D9f6EAeJHI3Jh/kRLlV67Du8/O3WKLtJZUEVMm', 1);

INSERT IGNORE INTO profiles (user_id, bio, skills, school) SELECT id, '2nd-year IT student. I design logos, posters and pubmats for orgs, and edit short videos for reels and reports.', 'Graphic design, Video editing, Canva, Photoshop', 'University of Cebu - Main' FROM users WHERE email = 'miguel@uc.edu.ph';
INSERT IGNORE INTO profiles (user_id, bio, skills, school) SELECT id, 'Math education student. Patient tutor for algebra, calculus and stats. Online via Google Meet or in person on campus.', 'Math tutoring, Statistics, Excel', 'University of Cebu - Banilad' FROM users WHERE email = 'ana@uc.edu.ph';
INSERT IGNORE INTO profiles (user_id, bio, skills, school) SELECT id, 'AB English student. I proofread and format papers (APA/MLA) and write captions for small business pages. I don''t write graded work for you.', 'Proofreading, APA formatting, Caption writing', 'University of Cebu - Main' FROM users WHERE email = 'jasmine@uc.edu.ph';
INSERT IGNORE INTO profiles (user_id, bio, skills, school) SELECT id, 'Computer Engineering student. I fix slow laptops, install Windows and Office, and help set up printers.', 'PC troubleshooting, Windows setup, MS Office', 'University of Cebu - METC' FROM users WHERE email = 'paolo@uc.edu.ph';
INSERT IGNORE INTO profiles (user_id, bio, skills, school) SELECT id, 'Hobby photographer for school events. Graduation photos, org events and product shots.', 'Photography, Lightroom, Event coverage', 'University of Cebu - Main' FROM users WHERE email = 'bea@uc.edu.ph';
INSERT IGNORE INTO profiles (user_id, bio, skills, school) SELECT id, 'Accountancy student. Demo account: I mostly hire other students for design and tutoring.', 'Accounting, Bookkeeping', 'University of Cebu - Main' FROM users WHERE email = 'demo@uc.edu.ph';

INSERT INTO services (provider_id, category_id, title, description, price, price_type, delivery_days, delivery_mode)
  SELECT u.id, c.id, 'I will design a logo for your org or small business', 'You get 2 logo concepts, 2 rounds of revisions, and final files in PNG, JPG and PDF.\n\nPlease send: your org name, colors you like, and 2-3 logos you like for reference.', 350, 'starting', 3, 'online' FROM users u, categories c WHERE u.email = 'miguel@uc.edu.ph' AND c.name = 'Graphic Design';
INSERT INTO services (provider_id, category_id, title, description, price, price_type, delivery_days, delivery_mode)
  SELECT u.id, c.id, 'I will make an event pubmat or poster', 'One poster or pubmat sized for Facebook/Instagram. Includes 1 revision. Rush delivery (24 hours) available.', 200, 'fixed', 2, 'online' FROM users u, categories c WHERE u.email = 'miguel@uc.edu.ph' AND c.name = 'Graphic Design';
INSERT INTO services (provider_id, category_id, title, description, price, price_type, delivery_days, delivery_mode)
  SELECT u.id, c.id, 'I will edit your short video, reel or video report', 'Up to 3 minutes of footage edited with cuts, captions, music and transitions. Send raw clips via Google Drive.', 400, 'starting', 3, 'online' FROM users u, categories c WHERE u.email = 'miguel@uc.edu.ph' AND c.name = 'Video & Photo';
INSERT INTO services (provider_id, category_id, title, description, price, price_type, delivery_days, delivery_mode)
  SELECT u.id, c.id, 'Algebra and Calculus tutoring (1 hour session)', 'One-on-one session for College Algebra, Calculus 1 or Statistics. Bring your problem sets and I''ll explain step by step. I won''t answer graded quizzes for you.', 150, 'fixed', 1, 'both' FROM users u, categories c WHERE u.email = 'ana@uc.edu.ph' AND c.name = 'Tutoring';
INSERT INTO services (provider_id, category_id, title, description, price, price_type, delivery_days, delivery_mode)
  SELECT u.id, c.id, 'Excel basics for reports and thesis data', 'Learn formulas, charts and pivot tables for your report or thesis data in 2 sessions.', 300, 'fixed', 3, 'online' FROM users u, categories c WHERE u.email = 'ana@uc.edu.ph' AND c.name = 'Tutoring';
INSERT INTO services (provider_id, category_id, title, description, price, price_type, delivery_days, delivery_mode)
  SELECT u.id, c.id, 'I will proofread and format your paper in APA 7', 'Grammar and spelling check, citation format, headings, page numbers and references list. Up to 15 pages. I edit your work; I don''t write it.', 250, 'starting', 2, 'online' FROM users u, categories c WHERE u.email = 'jasmine@uc.edu.ph' AND c.name = 'Writing & Editing';
INSERT INTO services (provider_id, category_id, title, description, price, price_type, delivery_days, delivery_mode)
  SELECT u.id, c.id, 'Captions and product descriptions for your online shop', '10 captions or product descriptions in English or Bisaya for your Facebook or Shopee page.', 180, 'fixed', 2, 'online' FROM users u, categories c WHERE u.email = 'jasmine@uc.edu.ph' AND c.name = 'Writing & Editing';
INSERT INTO services (provider_id, category_id, title, description, price, price_type, delivery_days, delivery_mode)
  SELECT u.id, c.id, 'Laptop cleanup and speed-up', 'Remove bloatware, check startup programs, update drivers and run a virus scan. On campus or online through screen sharing. I will never ask for your passwords.', 200, 'fixed', 1, 'both' FROM users u, categories c WHERE u.email = 'paolo@uc.edu.ph' AND c.name = 'Computer Help';
INSERT INTO services (provider_id, category_id, title, description, price, price_type, delivery_days, delivery_mode)
  SELECT u.id, c.id, 'Graduation and portrait photoshoot on campus', '1-hour shoot on campus, 15 edited photos delivered via Google Drive within 5 days.', 800, 'starting', 5, 'in_person' FROM users u, categories c WHERE u.email = 'bea@uc.edu.ph' AND c.name = 'Video & Photo';

-- Job: I will design a logo for your org or small business (completed)
INSERT INTO jobs (service_id, customer_id, provider_id, brief, budget, deadline, status)
  SELECT s.id, c.id, s.provider_id, 'Logo for our Junior Philippine Institute of Accountants chapter. Blue and gold, simple and modern.', 400, DATE_ADD(CURDATE(), INTERVAL 7 DAY), 'completed'
  FROM services s, users c WHERE s.title = 'I will design a logo for your org or small business' AND c.email = 'demo@uc.edu.ph' LIMIT 1;
INSERT INTO job_status_history (job_id, status, changed_by) SELECT j.id, 'requested', j.customer_id FROM jobs j WHERE j.brief = 'Logo for our Junior Philippine Institute of Accountants chapter. Blue and gold, simple and modern.';
INSERT INTO job_status_history (job_id, status, changed_by) SELECT j.id, 'accepted', j.provider_id FROM jobs j WHERE j.brief = 'Logo for our Junior Philippine Institute of Accountants chapter. Blue and gold, simple and modern.';
INSERT INTO job_status_history (job_id, status, changed_by) SELECT j.id, 'in_progress', j.provider_id FROM jobs j WHERE j.brief = 'Logo for our Junior Philippine Institute of Accountants chapter. Blue and gold, simple and modern.';
INSERT INTO job_status_history (job_id, status, changed_by) SELECT j.id, 'submitted', j.provider_id FROM jobs j WHERE j.brief = 'Logo for our Junior Philippine Institute of Accountants chapter. Blue and gold, simple and modern.';
INSERT INTO job_status_history (job_id, status, changed_by) SELECT j.id, 'completed', j.customer_id FROM jobs j WHERE j.brief = 'Logo for our Junior Philippine Institute of Accountants chapter. Blue and gold, simple and modern.';
INSERT INTO messages (job_id, sender_id, body) SELECT j.id, u.id, 'Hi! Can you include our founding year 2019?' FROM jobs j, users u WHERE j.brief = 'Logo for our Junior Philippine Institute of Accountants chapter. Blue and gold, simple and modern.' AND u.email = 'demo@uc.edu.ph';
INSERT INTO messages (job_id, sender_id, body) SELECT j.id, u.id, 'Sure! I''ll send 2 concepts by tomorrow.' FROM jobs j, users u WHERE j.brief = 'Logo for our Junior Philippine Institute of Accountants chapter. Blue and gold, simple and modern.' AND u.email = 'miguel@uc.edu.ph';
INSERT INTO messages (job_id, sender_id, body) SELECT j.id, u.id, 'Here are the final files: drive.google.com/... (demo link)' FROM jobs j, users u WHERE j.brief = 'Logo for our Junior Philippine Institute of Accountants chapter. Blue and gold, simple and modern.' AND u.email = 'miguel@uc.edu.ph';
INSERT INTO reviews (job_id, reviewer_id, reviewee_id, rating, comment) SELECT j.id, j.customer_id, j.provider_id, 5, 'Very fast and the logo looks professional. Our officers loved it!' FROM jobs j WHERE j.brief = 'Logo for our Junior Philippine Institute of Accountants chapter. Blue and gold, simple and modern.';

-- Job: Algebra and Calculus tutoring (1 hour session) (completed)
INSERT INTO jobs (service_id, customer_id, provider_id, brief, budget, deadline, status)
  SELECT s.id, c.id, s.provider_id, 'I need help with limits and derivatives before our midterm next week.', 150, DATE_ADD(CURDATE(), INTERVAL 7 DAY), 'completed'
  FROM services s, users c WHERE s.title = 'Algebra and Calculus tutoring (1 hour session)' AND c.email = 'jasmine@uc.edu.ph' LIMIT 1;
INSERT INTO job_status_history (job_id, status, changed_by) SELECT j.id, 'requested', j.customer_id FROM jobs j WHERE j.brief = 'I need help with limits and derivatives before our midterm next week.';
INSERT INTO job_status_history (job_id, status, changed_by) SELECT j.id, 'accepted', j.provider_id FROM jobs j WHERE j.brief = 'I need help with limits and derivatives before our midterm next week.';
INSERT INTO job_status_history (job_id, status, changed_by) SELECT j.id, 'in_progress', j.provider_id FROM jobs j WHERE j.brief = 'I need help with limits and derivatives before our midterm next week.';
INSERT INTO job_status_history (job_id, status, changed_by) SELECT j.id, 'submitted', j.provider_id FROM jobs j WHERE j.brief = 'I need help with limits and derivatives before our midterm next week.';
INSERT INTO job_status_history (job_id, status, changed_by) SELECT j.id, 'completed', j.customer_id FROM jobs j WHERE j.brief = 'I need help with limits and derivatives before our midterm next week.';
INSERT INTO reviews (job_id, reviewer_id, reviewee_id, rating, comment) SELECT j.id, j.customer_id, j.provider_id, 5, 'Ana explains really clearly. I finally understand the chain rule.' FROM jobs j WHERE j.brief = 'I need help with limits and derivatives before our midterm next week.';

-- Job: I will proofread and format your paper in APA 7 (completed)
INSERT INTO jobs (service_id, customer_id, provider_id, brief, budget, deadline, status)
  SELECT s.id, c.id, s.provider_id, '12-page case study for Auditing. Please check the references and the tables.', 300, DATE_ADD(CURDATE(), INTERVAL 7 DAY), 'completed'
  FROM services s, users c WHERE s.title = 'I will proofread and format your paper in APA 7' AND c.email = 'demo@uc.edu.ph' LIMIT 1;
INSERT INTO job_status_history (job_id, status, changed_by) SELECT j.id, 'requested', j.customer_id FROM jobs j WHERE j.brief = '12-page case study for Auditing. Please check the references and the tables.';
INSERT INTO job_status_history (job_id, status, changed_by) SELECT j.id, 'accepted', j.provider_id FROM jobs j WHERE j.brief = '12-page case study for Auditing. Please check the references and the tables.';
INSERT INTO job_status_history (job_id, status, changed_by) SELECT j.id, 'in_progress', j.provider_id FROM jobs j WHERE j.brief = '12-page case study for Auditing. Please check the references and the tables.';
INSERT INTO job_status_history (job_id, status, changed_by) SELECT j.id, 'submitted', j.provider_id FROM jobs j WHERE j.brief = '12-page case study for Auditing. Please check the references and the tables.';
INSERT INTO job_status_history (job_id, status, changed_by) SELECT j.id, 'completed', j.customer_id FROM jobs j WHERE j.brief = '12-page case study for Auditing. Please check the references and the tables.';
INSERT INTO reviews (job_id, reviewer_id, reviewee_id, rating, comment) SELECT j.id, j.customer_id, j.provider_id, 4, 'Good formatting and caught a lot of citation mistakes. Delivered on time.' FROM jobs j WHERE j.brief = '12-page case study for Auditing. Please check the references and the tables.';

-- Job: I will make an event pubmat or poster (completed)
INSERT INTO jobs (service_id, customer_id, provider_id, brief, budget, deadline, status)
  SELECT s.id, c.id, s.provider_id, 'Poster for our photography club exhibit on December 5.', 200, DATE_ADD(CURDATE(), INTERVAL 7 DAY), 'completed'
  FROM services s, users c WHERE s.title = 'I will make an event pubmat or poster' AND c.email = 'bea@uc.edu.ph' LIMIT 1;
INSERT INTO job_status_history (job_id, status, changed_by) SELECT j.id, 'requested', j.customer_id FROM jobs j WHERE j.brief = 'Poster for our photography club exhibit on December 5.';
INSERT INTO job_status_history (job_id, status, changed_by) SELECT j.id, 'accepted', j.provider_id FROM jobs j WHERE j.brief = 'Poster for our photography club exhibit on December 5.';
INSERT INTO job_status_history (job_id, status, changed_by) SELECT j.id, 'in_progress', j.provider_id FROM jobs j WHERE j.brief = 'Poster for our photography club exhibit on December 5.';
INSERT INTO job_status_history (job_id, status, changed_by) SELECT j.id, 'submitted', j.provider_id FROM jobs j WHERE j.brief = 'Poster for our photography club exhibit on December 5.';
INSERT INTO job_status_history (job_id, status, changed_by) SELECT j.id, 'completed', j.customer_id FROM jobs j WHERE j.brief = 'Poster for our photography club exhibit on December 5.';
INSERT INTO reviews (job_id, reviewer_id, reviewee_id, rating, comment) SELECT j.id, j.customer_id, j.provider_id, 5, 'Exactly what we wanted, and super quick.' FROM jobs j WHERE j.brief = 'Poster for our photography club exhibit on December 5.';

-- Job: I will edit your short video, reel or video report (in_progress)
INSERT INTO jobs (service_id, customer_id, provider_id, brief, budget, deadline, status)
  SELECT s.id, c.id, s.provider_id, '2-minute reel for our org''s recruitment week. Clips are in a Google Drive folder.', 450, DATE_ADD(CURDATE(), INTERVAL 7 DAY), 'in_progress'
  FROM services s, users c WHERE s.title = 'I will edit your short video, reel or video report' AND c.email = 'demo@uc.edu.ph' LIMIT 1;
INSERT INTO job_status_history (job_id, status, changed_by) SELECT j.id, 'requested', j.customer_id FROM jobs j WHERE j.brief = '2-minute reel for our org''s recruitment week. Clips are in a Google Drive folder.';
INSERT INTO job_status_history (job_id, status, changed_by) SELECT j.id, 'accepted', j.provider_id FROM jobs j WHERE j.brief = '2-minute reel for our org''s recruitment week. Clips are in a Google Drive folder.';
INSERT INTO job_status_history (job_id, status, changed_by) SELECT j.id, 'in_progress', j.provider_id FROM jobs j WHERE j.brief = '2-minute reel for our org''s recruitment week. Clips are in a Google Drive folder.';
INSERT INTO messages (job_id, sender_id, body) SELECT j.id, u.id, 'I shared the Drive folder with you.' FROM jobs j, users u WHERE j.brief = '2-minute reel for our org''s recruitment week. Clips are in a Google Drive folder.' AND u.email = 'demo@uc.edu.ph';
INSERT INTO messages (job_id, sender_id, body) SELECT j.id, u.id, 'Got it, starting today. First draft by Friday!' FROM jobs j, users u WHERE j.brief = '2-minute reel for our org''s recruitment week. Clips are in a Google Drive folder.' AND u.email = 'miguel@uc.edu.ph';

-- Job: Laptop cleanup and speed-up (requested)
INSERT INTO jobs (service_id, customer_id, provider_id, brief, budget, deadline, status)
  SELECT s.id, c.id, s.provider_id, 'My laptop takes 5 minutes to start. Can we meet at the library on Monday?', 200, DATE_ADD(CURDATE(), INTERVAL 7 DAY), 'requested'
  FROM services s, users c WHERE s.title = 'Laptop cleanup and speed-up' AND c.email = 'demo@uc.edu.ph' LIMIT 1;
INSERT INTO job_status_history (job_id, status, changed_by) SELECT j.id, 'requested', j.customer_id FROM jobs j WHERE j.brief = 'My laptop takes 5 minutes to start. Can we meet at the library on Monday?';

-- Job: Excel basics for reports and thesis data (accepted)
INSERT INTO jobs (service_id, customer_id, provider_id, brief, budget, deadline, status)
  SELECT s.id, c.id, s.provider_id, 'I need to learn pivot tables for our capstone survey results.', 300, DATE_ADD(CURDATE(), INTERVAL 7 DAY), 'accepted'
  FROM services s, users c WHERE s.title = 'Excel basics for reports and thesis data' AND c.email = 'miguel@uc.edu.ph' LIMIT 1;
INSERT INTO job_status_history (job_id, status, changed_by) SELECT j.id, 'requested', j.customer_id FROM jobs j WHERE j.brief = 'I need to learn pivot tables for our capstone survey results.';
INSERT INTO job_status_history (job_id, status, changed_by) SELECT j.id, 'accepted', j.provider_id FROM jobs j WHERE j.brief = 'I need to learn pivot tables for our capstone survey results.';

