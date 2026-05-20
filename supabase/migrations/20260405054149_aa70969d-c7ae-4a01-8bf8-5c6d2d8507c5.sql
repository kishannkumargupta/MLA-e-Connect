
-- 1. Block UPDATE on user_roles for non-admins
CREATE POLICY "Only admins can update roles"
ON public.user_roles FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. Fix citizen comment policy to enforce user_id = auth.uid()
DROP POLICY IF EXISTS "Citizens can add comments to own complaints" ON public.complaint_comments;
CREATE POLICY "Citizens can add comments to own complaints"
ON public.complaint_comments FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND is_internal = false
  AND EXISTS (
    SELECT 1 FROM complaints
    WHERE complaints.id = complaint_comments.complaint_id
    AND complaints.user_id = auth.uid()
  )
);
