-- Public, minimal lookup for QR codes printed on ANZRBO membership cards.
-- Only the fields needed for card verification are returned. No CNI, email,
-- emergency contacts, payments, dependants, or other private data are exposed.
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
     or regexp_replace(coalesce(m.telephone, ''), '[^0-9]', '', 'g')
        = regexp_replace(coalesce(btrim(p_numero_membre), ''), '[^0-9]', '', 'g')
  order by (m.numero_membre = btrim(p_numero_membre)) desc
  limit 1;
$function$;

revoke all on function public.verify_member_card(text) from public;
grant execute on function public.verify_member_card(text) to anon, authenticated;
