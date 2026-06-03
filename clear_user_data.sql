-- ============================================================
-- PickMyPath — Pre-Launch User Data Clear
-- ============================================================
-- Removes ALL user-generated data from the database.
-- Safe to run before going live to clear test records.
--
-- Tables cleared:   answers, reports, assessments, payments,
--                   audit_log, users
-- Tables preserved: system_config (prices, settings)
--
-- HOW TO RUN:
--   Supabase Dashboard → SQL Editor → New Query → paste → Run
--
-- WARNING: This is irreversible. Make sure you mean it.
-- ============================================================

-- Delete in dependency order (children before parents)
-- to avoid foreign key constraint errors.

DELETE FROM answers;       -- references assessments
DELETE FROM reports;       -- references assessments + users
DELETE FROM assessments;   -- references payments + users
DELETE FROM payments;      -- references users
DELETE FROM audit_log;     -- no foreign keys, but clear for a clean slate
DELETE FROM users;         -- root table — cleared last

-- Verify everything is empty
SELECT 'users'       AS tbl, COUNT(*) AS remaining FROM users
UNION ALL
SELECT 'payments'    AS tbl, COUNT(*) AS remaining FROM payments
UNION ALL
SELECT 'assessments' AS tbl, COUNT(*) AS remaining FROM assessments
UNION ALL
SELECT 'answers'     AS tbl, COUNT(*) AS remaining FROM answers
UNION ALL
SELECT 'reports'     AS tbl, COUNT(*) AS remaining FROM reports
UNION ALL
SELECT 'audit_log'   AS tbl, COUNT(*) AS remaining FROM audit_log;

-- Expected output: every row shows remaining = 0
-- system_config is untouched and should still have its rows.
