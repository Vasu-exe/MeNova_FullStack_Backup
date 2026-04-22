# MeNova Health — Full-Stack Upgrade TODO

## Backend Infrastructure
- [x] Upgrade project to full-stack (Express + DB)
- [x] Create quiz_submissions table
- [x] Create follow_up_requests table
- [x] Create waitlist table
- [x] Create pageviews table for analytics
- [x] Write DB query helpers in server/db.ts
- [x] Write tRPC routers (quiz, followUp, waitlist, chat, admin)
- [x] Add Make.com webhook receiver at /api/followup-result
- [x] Add REST bridge API routes for all frontend components
- [x] Set up admin password authentication

## Frontend — Restore Existing Pages
- [x] Restore ScheduleFollowup page with real-time verification polling
- [x] Restore PrivacyPolicy page
- [x] Restore TermsAndConditions page
- [x] Restore CookiePolicy page
- [x] Restore Accessibility page

## Frontend — New Features
- [x] Admin Dashboard at /admin (stats, quiz table, follow-up table, waitlist table, CSV export)
- [x] AI Chat widget (floating bubble on homepage)
- [x] Waitlist / notify-me section on homepage
- [x] Referral/source tracking (UTM params captured and saved)
- [x] Update SymptomQuiz to also save submissions to database via REST API
- [x] Update App.tsx with all routes (/admin, /schedule-followup, policy pages)

## Verification & Testing
- [x] Mount AI Chat widget globally in App.tsx so it appears on all pages
- [x] Write API-level vitest for admin login and protected endpoints
- [x] Verify quiz submission saves to database via API test
- [x] Verify waitlist submission saves to database via API test
- [x] Verify follow-up request + polling + webhook resolution via API test
- [x] Save checkpoint
- [x] Push changes to GitHub

## Patient Portal
- [x] Patient login/registration (email + password)
- [x] Patient dashboard with welcome, next appointment, BHRT status
- [x] Quiz history page with symptom severity trend chart
- [x] BHRT prescription view (hormone type, dosage, frequency, duration)
- [x] Appointment tracking (upcoming, past)
- [x] Document upload (PDF, images, medical records) to S3
- [x] Document list with download/delete
- [x] Messaging with clinic (chat interface)

## NP Portal
- [x] NP login/registration (email + password, role-based)
- [x] Patient management dashboard (list all patients, search, filter)
- [x] Patient profile view (full history, quiz results, documents, notes)
- [x] Treatment plan creator (hormone type, dosage, duration, instructions)
- [x] Treatment plan edit/update
- [x] Appointment management (view, schedule, mark complete)
- [x] View/download patient documents
- [x] Mark documents as reviewed
- [x] Messaging with patients
- [x] Patient progress tracking (symptom improvement chart)
- [x] Analytics (patients on BHRT, avg improvement, common symptoms)
- [x] Export patient data to CSV

## Shared Portal Infrastructure
- [x] Update database schema with all new tables
- [x] Build REST API endpoints for both portals
- [x] Update App.tsx with portal routes
- [x] Write vitest tests for portal APIs
- [x] Push all changes to GitHub (Vasu-exe/MeNova_FullStack)
- [x] Save checkpoint
