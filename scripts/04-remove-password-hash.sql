-- Remove password_hash columns from users and admin_users tables
-- Since we're using Supabase Auth, we don't need to store passwords in our custom tables

ALTER TABLE users DROP COLUMN IF EXISTS password_hash;
ALTER TABLE admin_users DROP COLUMN IF EXISTS password_hash;

-- Update the trigger function to handle new user creation from Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    first_name,
    last_name,
    phone,
    base_currency,
    country,
    status,
    verification_status
  )
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'phone',
    COALESCE(new.raw_user_meta_data->>'base_currency', 'NGN'),
    new.raw_user_meta_data->>'country',
    'active',
    CASE WHEN new.email_confirmed_at IS NOT NULL THEN 'verified' ELSE 'pending' END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
