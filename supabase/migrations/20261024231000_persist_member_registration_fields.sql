-- Persist all fields captured by the member registration form.
alter table public.members
  add column if not exists sous_prefecture text,
  add column if not exists village text,
  add column if not exists urgence_nom text,
  add column if not exists urgence_contact1 text,
  add column if not exists urgence_contact2 text,
  add column if not exists urgence_adresse text,
  add column if not exists inscription_mode_paiement text,
  add column if not exists inscription_type_preuve text,
  add column if not exists inscription_reference text;
