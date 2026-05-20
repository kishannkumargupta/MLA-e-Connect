CREATE POLICY "Citizens can resolve own complaints"
ON public.complaints
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id AND status = 'resolved'::complaint_status);