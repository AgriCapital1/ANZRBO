-- Rotate the two known-leaked admin passwords to random values.
-- The plaintext passwords @Mugec-CI26 and @Massa29012020 were committed in a
-- previous migration file and must be considered compromised. This migration
-- replaces them with cryptographically random throwaway passwords so the
-- leaked credentials can no longer be used to sign in. Operators must set
-- the new admin passwords out-of-band via the Supabase Auth dashboard
-- (Users → ... → Send password recovery / Update password).
UPDATE auth.users
   SET encrypted_password = crypt(encode(gen_random_bytes(32), 'base64'), gen_salt('bf')),
       updated_at = now()
 WHERE email IN ('adminmgec@mugec-ci.local', 'admininoce@miprojet.local');