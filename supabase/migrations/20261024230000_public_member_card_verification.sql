-- Public, minimal lookup for QR codes printed on ANZRBO membership cards.
-- Exposes only fields needed to verify a card; never returns emergency contacts,
-- payments, CNI, email, or dependants.
create or replace function public.verify_member_card(p_numero_membre text)
returns table (
  numero_membre text,
  nom text,
  prenoms text,
  telephone text,
  quartier text,
  ville text,
  photo_url text,
  date_inscription date,
  statut text
)
language sql
stable
security definer
set search_path = ''
as $function$
  select
    m.numero_membre,
    m.nom,
    m.prenoms,
    m.telephone,
    m.quartier,
    m.ville,
    m.photo_url,
    m.date_inscription,
    m.statut::text
  from public.members as m
  where m.numero_membre = btrim(p_numero_membre)
  limit 1;
$function$;

revoke all on function public.verify_member_card(text) from public;
grant execute on function public.verify_member_card(text) to anon, authenticated;
