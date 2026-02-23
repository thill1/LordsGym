-- Validation: Verify media bucket exists and is public
-- Run against target after provisioning.

SELECT
  name,
  public,
  file_size_limit,
  CASE
    WHEN name = 'media' AND public = true THEN 'OK'
    WHEN name = 'media' AND public = false THEN 'WARN: media bucket not public'
    WHEN name = 'media' THEN 'OK'
    ELSE 'INFO'
  END AS status
FROM storage.buckets
WHERE name = 'media';
