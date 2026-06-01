-- Query to view all reports with top 3 career choices
-- Run this in Supabase SQL Editor

SELECT
  u.student_name,
  u.email,
  r.generated_at,
  r.id as report_id,
  -- Extract individual careers from the top_careers JSONB array
  jsonb_array_elements(r.top_careers->'careers') as career
FROM reports r
LEFT JOIN users u ON r.user_id = u.id
ORDER BY r.generated_at DESC;

-- Alternative: More readable version that extracts specific career fields
-- Uncomment to use instead:
/*
SELECT
  u.student_name,
  u.email,
  r.generated_at,
  r.id as report_id,
  (career->>'rank')::int as rank,
  career->>'title' as career_title,
  (career->>'match_percentage')::int as match_percentage,
  career->>'summary' as summary,
  career->>'why_suited' as why_suited
FROM reports r
LEFT JOIN users u ON r.user_id = u.id
CROSS JOIN jsonb_array_elements(r.top_careers->'careers') as career
ORDER BY r.generated_at DESC, rank ASC;
*/

-- Count of reports by month
-- SELECT
--   DATE_TRUNC('month', r.generated_at) as month,
--   COUNT(*) as report_count
-- FROM reports r
-- GROUP BY DATE_TRUNC('month', r.generated_at)
-- ORDER BY month DESC;
