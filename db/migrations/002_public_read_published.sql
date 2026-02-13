-- Allow anonymous/public read only for published invitations

-- Invitations: public can read published rows
DROP POLICY IF EXISTS invitations_public_read_published ON public.invitations;
CREATE POLICY invitations_public_read_published
ON public.invitations
FOR SELECT
USING (status = 'published');

-- Invitation contents: public can read snapshots that belong to published invitations
DROP POLICY IF EXISTS invitation_contents_public_read_published ON public.invitation_contents;
CREATE POLICY invitation_contents_public_read_published
ON public.invitation_contents
FOR SELECT
USING (
  is_published_snapshot = true
  AND EXISTS (
    SELECT 1
    FROM public.invitations i
    WHERE i.id = invitation_id
      AND i.status = 'published'
  )
);
