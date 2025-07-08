-- Add a comment to document the index purpose and set up monitoring
COMMENT ON INDEX public.idx_business_profiles_category IS 
'Index for filtering businesses by category. Created for future use when business listings are populated. Monitor usage and remove if unused after significant data growth.';

-- Optional: Check index usage stats (for future reference)
-- SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch 
-- FROM pg_stat_user_indexes 
-- WHERE indexname = 'idx_business_profiles_category';