
-- 1. Make attachments bucket private
UPDATE storage.buckets SET public = false WHERE id = 'attachments';

-- 2. Drop the overly permissive SELECT policy on storage.objects
DROP POLICY IF EXISTS "Anyone can view attachments" ON storage.objects;

-- 3. Add SELECT policy: owner or admin can view attachments
CREATE POLICY "Owners and admins can view attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'attachments'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.has_role(auth.uid(), 'admin')
  )
);

-- 4. Add UPDATE policy: only file owner or admin
CREATE POLICY "Owners and admins can update attachments"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'attachments'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.has_role(auth.uid(), 'admin')
  )
);

-- 5. Add DELETE policy: only file owner or admin
CREATE POLICY "Owners and admins can delete attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'attachments'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.has_role(auth.uid(), 'admin')
  )
);

-- 6. Fix citizen comment is_internal bypass
DROP POLICY IF EXISTS "Citizens can add comments to own complaints" ON public.complaint_comments;
CREATE POLICY "Citizens can add comments to own complaints"
ON public.complaint_comments FOR INSERT
TO authenticated
WITH CHECK (
  is_internal = false
  AND EXISTS (
    SELECT 1 FROM complaints
    WHERE complaints.id = complaint_comments.complaint_id
    AND complaints.user_id = auth.uid()
  )
);

-- 7. Add restrictive INSERT policy on user_roles (admin only)
CREATE POLICY "Only admins can insert roles"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 8. Add restrictive DELETE policy on user_roles (admin only)
CREATE POLICY "Only admins can delete roles"
ON public.user_roles FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
