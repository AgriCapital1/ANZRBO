## Objectif

Appliquer la séparation stricte exigée par le cahier des charges entre l'espace **MUGEC-CI** (admins applicatifs) et le **back-office MiProjet** (super admin invisible), corriger les fuites visuelles et techniques, et poser les bases d'un audit complet des 13 rôles.

Vu l'ampleur de la demande (refonte UI complète + 13 rôles + audit total + dashboards modernes), je propose de découper en **3 lots livrés successivement**. Ce plan couvre les **lots 1 et 2** (corrections obligatoires immédiates + refonte menu/dashboard admin). Le lot 3 (audit complet RBAC sur 13 rôles, workflows séparés par rôle, dashboards par rôle) sera planifié séparément après validation.

---

## Lot 1 — Confidentialité MiProjet (correction obligatoire immédiate)

### Frontend — purge des références MiProjet dans l'espace MUGEC

- `src/components/DashboardHeader.tsx` : retirer `{ to: "/admin/miprojet", label: "MiProjet" }` de `ADMIN_NAV`. L'espace MUGEC n'aura plus aucun lien vers MiProjet.
- `src/routes/admin/index.tsx` :
  - Retirer le KPI "MiProjet" (carte `transactions_miprojet_total`).
  - Retirer la mention "opérations MiProjet" du sous-titre du hero.
  - Retirer `transactions_miprojet_total` du type `Stats`.
- Créer un nav dédié `MIPROJET_NAV` (séparé) pour le back-office super admin.

### Backend — RLS et RPC

- Migration : modifier `admin_dashboard_stats()` pour **ne plus retourner** `transactions_miprojet_total`. Cette donnée reste exclusivement disponible via `miprojet_dashboard_stats()` (déjà protégée par `is_super_admin`).
- Vérifier que `transactions_miprojet` reste strictement `is_super_admin` (déjà OK).
- Confirmer que `payment_sessions.provider_payload` (qui contient les splits) n'est pas exposé aux admins MUGEC : ajouter une politique séparant `can_manage_payments` (admins finance MUGEC) vs `is_super_admin` si besoin.

### Route guard

- `src/routes/admin/miprojet.tsx` : ajouter `beforeLoad` qui vérifie côté serveur (via un serverFn `requireSuperAdmin`) et redirige les non-super_admins vers `/admin`. Aujourd'hui la route est seulement protégée par la RPC, mais l'URL reste devinable.

---

## Lot 2 — Refonte menu + dashboard admin MUGEC-CI

### Architecture menu

Remplacer le menu actuel (Tableau de bord / Gestion ▾ / MiProjet) par une structure professionnelle à sections claires :

```text
[Logo MUGEC-CI]   Tableau de bord │ Membres │ Finances ▾ │ Prestations │ Communication ▾ │ Paramètres ▾
                                              ├ Cotisations           ├ Notifications
                                              └ Subscriptions         └ Forum / Actus
```

- Affichage conditionnel selon rôle (préparation lot 3) : chaque entrée déclare les rôles autorisés. Les rôles non habilités ne voient pas l'entrée.
- Mobile : drawer plein écran avec sections et icônes, pas de dropdown imbriqué.
- Indicateur de section active (pas seulement la page exacte).

### Dashboard admin moderne

- Garder la grille KPI premium existante, **sans la tuile MiProjet**.
- Ajouter : graphique d'évolution des prestations par statut, top 5 collectivités, taux de paiement des cotisations du mois.
- Conserver Recharts (déjà en place), animations légères via `transition` Tailwind.

---

## Lot 3 (à planifier ensuite — non couvert ici)

- Audit des 13 rôles : matrice `rôle × route × action` complète.
- Dashboards dédiés par rôle (président, trésoriers, délégués…).
- Workflows de validation séparés (prestations 4 niveaux déjà en place — vérifier UI).
- Routes API publiques `/api/public/*` non documentées pour MiProjet.
- Tests RLS automatisés.

---

## Détails techniques

- **Migration SQL** : `CREATE OR REPLACE FUNCTION public.admin_dashboard_stats()` sans le champ MiProjet, search_path préservé.
- **ServerFn** `requireSuperAdmin` dans `src/lib/auth.functions.ts` (nouveau) : utilise `requireSupabaseAuth`, appelle `is_super_admin(auth.uid())`.
- **Types** : régénération auto des types Supabase après migration (ne pas éditer `types.ts`).
- Pas de breaking change pour les membres (espace `/membre` non touché).

---

## Question avant exécution

Confirmez-vous ce découpage ? Je commence immédiatement par les **lots 1 + 2** dès approbation. Le lot 3 (audit complet RBAC 13 rôles + dashboards par rôle) sera un chantier séparé que je planifierai juste après.