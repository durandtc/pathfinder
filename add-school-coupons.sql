-- ============================================================
-- Add School Discount Coupons to PickMyPath
-- Run this in Supabase SQL Editor to create coupon codes
-- ============================================================

-- Example: Add coupons for school pilots
-- Adjust school names, codes, discount amounts, and max uses as needed

INSERT INTO coupons (school, code, discount_amount, code_number, is_active)
VALUES
  ('Greenside High', 'GREENSIDE50', 199.50, 30, true),         -- R199.50 discount (50% off), max 30 uses
  ('Parktown School', 'PARKTOWN75', 299.25, 20, true),         -- R299.25 discount (75% off), max 20 uses
  ('Braamfontein Academy', 'BRAAMFONTEIN100', 399.00, 50, true) -- Full free (R399 discount), max 50 uses
ON CONFLICT (code) DO NOTHING;

-- Query to see all active coupons
-- SELECT school, code, discount_amount, code_number FROM coupons WHERE is_active = true;

-- Query to see coupon usage
-- SELECT
--   c.school,
--   c.code,
--   c.code_number,
--   COUNT(p.id) as times_used,
--   (c.code_number - COUNT(p.id)) as remaining_uses
-- FROM coupons c
-- LEFT JOIN payments p ON c.code = p.coupon_code AND p.status = 'completed'
-- WHERE c.is_active = true
-- GROUP BY c.id, c.school, c.code, c.code_number;

-- To disable a coupon:
-- UPDATE coupons SET is_active = false WHERE code = 'GREENSIDE50';
