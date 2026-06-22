// Données 100% locales conformes au CDC ANZRBO / DigitOrg (UI uniquement).
// Aucune requête vers une base de données.

export type Statut = "actif" | "suspendu" | "decede";

export type AyantDroit = {
  id: string;
  membreId: string;
  lien: "pere" | "mere" | "beau-pere" | "belle-mere" | "conjoint" | "enfant";
  nom: string;
  dateNaissance: string;
  lieuNaissance: string;
};

export type Membre = {
  id: string;
  numeroMembre: string;        // ANZRBO-2026-00001
  photoUrl: string | null;
  nom: string;
  prenoms: string;
  telephone: string;
  contact2?: string;
  sousPrefecture: "Bonon";
  village: string;
  quartier?: string;
  dateNaissance: string;
  lieuNaissance: string;
  dateInscription: string;
  statut: Statut;
  urgence: { nom: string; contact1: string; contact2?: string; adresse: string };
  paiementInscription: {
    mode: "especes" | "mobile_money";
    typePreuve: "id_transaction" | "photo_document";
    idTransaction?: string;
    montant: number; // 1500 FCFA frais inscription DigitOrg
    date: string;
  };
};

export type SouscriptionNsia = {
  id: string;
  membreId: string;
  formule: number;            // 1..10
  benefice: number;           // FCFA par personne
  cotisationUnitaire: number; // FCFA / an
  nbPersonnes: number;
  cotisationAnnuelle: number; // unitaire x nb
  dateSouscription: string;
  actif: boolean;
};

export type DeclarationDeces = {
  id: string;
  membreId: string;             // membre principal lié
  defuntType: "principal" | "ayant_droit";
  ayantDroitId?: string;
  nomDefunt: string;
  dateDeces: string;
  dateDeclaration: string;
};

export type Cotisation = {
  id: string;
  declarationId: string;
  membreId: string;       // celui qui doit payer
  montant: number;        // 1200 FCFA
  statut: "payee" | "en_retard" | "en_attente";
  date?: string;
};

export type Assistance = {
  id: string;
  declarationId: string;
  beneficiaire: string;
  montant: number;         // 500 000 ANZRBO
  statut: "versee" | "refusee" | "en_attente";
  motifRefus?: string;
  dateTraitement?: string;
};

export type PaiementNsia = {
  id: string;
  declarationId: string;
  souscriptionId: string;
  beneficeBrut: number;       // versé par NSIA
  commissionAssoc: number;    // 25% prélevés par ANZRBO
  netFamille: number;         // 75%
  date: string;
};

// ---------------------------------------------------------------
// Tarifs NSIA Décès (cf. CDC §5.1)
// ---------------------------------------------------------------
export const FORMULES_NSIA = [
  { n: 1, benefice: 100_000,  cotisation: 2_500 },
  { n: 2, benefice: 200_000,  cotisation: 5_000 },
  { n: 3, benefice: 300_000,  cotisation: 7_500 },
  { n: 4, benefice: 400_000,  cotisation: 10_000 },
  { n: 5, benefice: 500_000,  cotisation: 12_500 },
  { n: 6, benefice: 600_000,  cotisation: 15_000 },
  { n: 7, benefice: 700_000,  cotisation: 17_500 },
  { n: 8, benefice: 800_000,  cotisation: 20_000 },
  { n: 9, benefice: 900_000,  cotisation: 22_500 },
  { n: 10, benefice: 1_000_000, cotisation: 25_000 },
] as const;

export const ASSISTANCE_ANZRBO = 500_000;
export const COTISATION_PAR_DECES = 1_200;
export const FRAIS_INSCRIPTION_DIGITORG = 1_500;
export const TAUX_COMMISSION_NSIA = 0.25;

// ---------------------------------------------------------------
// Jeu de données (10 membres) — fixtures pédagogiques
// ---------------------------------------------------------------
function num(i: number) {
  return `ANZRBO-2026-${String(i).padStart(5, "0")}`;
}

export const MEMBRES: Membre[] = [
  {
    id: "m01", numeroMembre: num(1), photoUrl: null,
    nom: "KOUASSI", prenoms: "Yao Marc", telephone: "0701020301",
    sousPrefecture: "Bonon", village: "Bonon Centre", quartier: "Sokoura",
    dateNaissance: "1962-03-12", lieuNaissance: "Bonon",
    dateInscription: "2025-01-15", statut: "decede",
    urgence: { nom: "KOUASSI Affoué", contact1: "0701020399", adresse: "Bonon Centre" },
    paiementInscription: { mode: "especes", typePreuve: "id_transaction", idTransaction: "REC-0001", montant: 1500, date: "2025-01-15" },
  },
  {
    id: "m02", numeroMembre: num(2), photoUrl: null,
    nom: "N'GUESSAN", prenoms: "Adjoua Marie", telephone: "0701020302",
    sousPrefecture: "Bonon", village: "Diahouin",
    dateNaissance: "1955-07-22", lieuNaissance: "Diahouin",
    dateInscription: "2025-02-01", statut: "decede",
    urgence: { nom: "N'GUESSAN Konan", contact1: "0701020398", adresse: "Diahouin" },
    paiementInscription: { mode: "mobile_money", typePreuve: "id_transaction", idTransaction: "MM-2025-0002", montant: 1500, date: "2025-02-01" },
  },
  {
    id: "m03", numeroMembre: num(3), photoUrl: null,
    nom: "KOUADIO", prenoms: "Amani Étienne", telephone: "0701020303",
    sousPrefecture: "Bonon", village: "Pakouabo",
    dateNaissance: "1970-09-09", lieuNaissance: "Bouaké",
    dateInscription: "2026-03-01", statut: "decede",
    urgence: { nom: "KOUADIO Akissi", contact1: "0701020397", adresse: "Pakouabo" },
    paiementInscription: { mode: "especes", typePreuve: "photo_document", montant: 1500, date: "2026-03-01" },
  },
  {
    id: "m04", numeroMembre: num(4), photoUrl: null,
    nom: "DIABATÉ", prenoms: "Aminata", telephone: "0701020304", contact2: "0501020304",
    sousPrefecture: "Bonon", village: "Bonon Centre", quartier: "Résidentiel",
    dateNaissance: "1980-11-30", lieuNaissance: "Daloa",
    dateInscription: "2024-09-12", statut: "actif",
    urgence: { nom: "DIABATÉ Sékou", contact1: "0701020396", adresse: "Bonon" },
    paiementInscription: { mode: "mobile_money", typePreuve: "id_transaction", idTransaction: "MM-2024-0004", montant: 1500, date: "2024-09-12" },
  },
  {
    id: "m05", numeroMembre: num(5), photoUrl: null,
    nom: "BAMBA", prenoms: "Issa", telephone: "0701020305",
    sousPrefecture: "Bonon", village: "Zaibo",
    dateNaissance: "1975-05-05", lieuNaissance: "Bonon",
    dateInscription: "2024-10-04", statut: "actif",
    urgence: { nom: "BAMBA Awa", contact1: "0701020395", adresse: "Zaibo" },
    paiementInscription: { mode: "especes", typePreuve: "id_transaction", idTransaction: "REC-0005", montant: 1500, date: "2024-10-04" },
  },
  {
    id: "m06", numeroMembre: num(6), photoUrl: null,
    nom: "KONÉ", prenoms: "Mariam", telephone: "0701020306",
    sousPrefecture: "Bonon", village: "Bonon Centre",
    dateNaissance: "1982-12-18", lieuNaissance: "Yamoussoukro",
    dateInscription: "2024-06-01", statut: "actif",
    urgence: { nom: "KONÉ Salif", contact1: "0701020394", adresse: "Bonon Centre" },
    paiementInscription: { mode: "mobile_money", typePreuve: "id_transaction", idTransaction: "MM-2024-0006", montant: 1500, date: "2024-06-01" },
  },
  {
    id: "m07", numeroMembre: num(7), photoUrl: null,
    nom: "TRAORÉ", prenoms: "Boubacar", telephone: "0701020307",
    sousPrefecture: "Bonon", village: "Diahouin",
    dateNaissance: "1968-04-14", lieuNaissance: "Korhogo",
    dateInscription: "2025-05-20", statut: "actif",
    urgence: { nom: "TRAORÉ Fatim", contact1: "0701020393", adresse: "Diahouin" },
    paiementInscription: { mode: "especes", typePreuve: "id_transaction", idTransaction: "REC-0007", montant: 1500, date: "2025-05-20" },
  },
  {
    id: "m08", numeroMembre: num(8), photoUrl: null,
    nom: "OUATTARA", prenoms: "Fanta", telephone: "0701020308",
    sousPrefecture: "Bonon", village: "Pakouabo",
    dateNaissance: "1990-08-08", lieuNaissance: "Bouaflé",
    dateInscription: "2024-12-01", statut: "actif",
    urgence: { nom: "OUATTARA Adama", contact1: "0701020392", adresse: "Pakouabo" },
    paiementInscription: { mode: "mobile_money", typePreuve: "photo_document", montant: 1500, date: "2024-12-01" },
  },
  {
    id: "m09", numeroMembre: num(9), photoUrl: null,
    nom: "SORO", prenoms: "Drissa", telephone: "0701020309",
    sousPrefecture: "Bonon", village: "Bonon Centre",
    dateNaissance: "1972-02-25", lieuNaissance: "Ferké",
    dateInscription: "2024-07-15", statut: "actif",
    urgence: { nom: "SORO Mariam", contact1: "0701020391", adresse: "Bonon Centre" },
    paiementInscription: { mode: "especes", typePreuve: "id_transaction", idTransaction: "REC-0009", montant: 1500, date: "2024-07-15" },
  },
  {
    id: "m10", numeroMembre: num(10), photoUrl: null,
    nom: "YAO", prenoms: "Akissi Hortense", telephone: "0701020310",
    sousPrefecture: "Bonon", village: "Zaibo",
    dateNaissance: "1988-10-02", lieuNaissance: "Daloa",
    dateInscription: "2024-11-09", statut: "actif",
    urgence: { nom: "YAO Konan", contact1: "0701020390", adresse: "Zaibo" },
    paiementInscription: { mode: "mobile_money", typePreuve: "id_transaction", idTransaction: "MM-2024-0010", montant: 1500, date: "2024-11-09" },
  },
];

export const AYANTS_DROIT: AyantDroit[] = [
  // M01
  { id: "a01a", membreId: "m01", lien: "conjoint", nom: "KOUASSI Affoué Reine", dateNaissance: "1965-04-10", lieuNaissance: "Bonon" },
  { id: "a01b", membreId: "m01", lien: "mere", nom: "KOUASSI N'Da", dateNaissance: "1938-01-01", lieuNaissance: "Bonon" },
  // M02
  { id: "a02a", membreId: "m02", lien: "pere", nom: "N'GUESSAN Kouassi", dateNaissance: "1930-06-15", lieuNaissance: "Diahouin" },
  { id: "a02b", membreId: "m02", lien: "conjoint", nom: "N'GUESSAN Konan Marius", dateNaissance: "1952-03-20", lieuNaissance: "Bonon" },
  // M03
  { id: "a03a", membreId: "m03", lien: "conjoint", nom: "KOUADIO Akissi Lucie", dateNaissance: "1972-05-11", lieuNaissance: "Bonon" },
  { id: "a03b", membreId: "m03", lien: "mere", nom: "KOUADIO Amenan", dateNaissance: "1945-09-01", lieuNaissance: "Pakouabo" },
  // M04
  { id: "a04a", membreId: "m04", lien: "pere", nom: "DIABATÉ Sékou", dateNaissance: "1950-02-02", lieuNaissance: "Daloa" },
  { id: "a04b", membreId: "m04", lien: "mere", nom: "DIABATÉ Aïcha", dateNaissance: "1955-07-19", lieuNaissance: "Daloa" },
  { id: "a04c", membreId: "m04", lien: "conjoint", nom: "DIABATÉ Moussa", dateNaissance: "1978-12-01", lieuNaissance: "Bouaké" },
  // M05
  { id: "a05a", membreId: "m05", lien: "conjoint", nom: "BAMBA Awa", dateNaissance: "1980-03-03", lieuNaissance: "Bonon" },
  { id: "a05b", membreId: "m05", lien: "mere", nom: "BAMBA Sali", dateNaissance: "1948-11-11", lieuNaissance: "Bonon" },
  // M06
  { id: "a06a", membreId: "m06", lien: "mere", nom: "KONÉ Aminata", dateNaissance: "1948-06-22", lieuNaissance: "Yamoussoukro" },
  { id: "a06b", membreId: "m06", lien: "conjoint", nom: "KONÉ Salif", dateNaissance: "1980-01-30", lieuNaissance: "Bonon" },
  // M07
  { id: "a07a", membreId: "m07", lien: "mere", nom: "TRAORÉ Kady", dateNaissance: "1942-04-04", lieuNaissance: "Korhogo" },
  { id: "a07b", membreId: "m07", lien: "conjoint", nom: "TRAORÉ Fatim", dateNaissance: "1970-09-09", lieuNaissance: "Bonon" },
  // M08
  { id: "a08a", membreId: "m08", lien: "pere", nom: "OUATTARA Lassina", dateNaissance: "1940-08-08", lieuNaissance: "Bouaflé" },
  { id: "a08b", membreId: "m08", lien: "conjoint", nom: "OUATTARA Adama", dateNaissance: "1988-05-12", lieuNaissance: "Bonon" },
  // M09
  { id: "a09a", membreId: "m09", lien: "conjoint", nom: "SORO Mariam", dateNaissance: "1975-10-10", lieuNaissance: "Ferké" },
  { id: "a09b", membreId: "m09", lien: "mere", nom: "SORO Nawa", dateNaissance: "1945-03-15", lieuNaissance: "Ferké" },
  // M10
  { id: "a10a", membreId: "m10", lien: "mere", nom: "YAO Affoué", dateNaissance: "1950-12-25", lieuNaissance: "Daloa" },
  { id: "a10b", membreId: "m10", lien: "conjoint", nom: "YAO Konan", dateNaissance: "1985-07-07", lieuNaissance: "Bonon" },
];

// 6 souscriptions NSIA (M01, M04, M05, M06, M09, M10)
export const SOUSCRIPTIONS_NSIA: SouscriptionNsia[] = [
  mkSouscription("s01", "m01", 5, 2, "2024-08-10"),  // 12500 x 2 = 25000
  mkSouscription("s04", "m04", 3, 3, "2024-10-05"),  // 7500 x 3 = 22500
  mkSouscription("s05", "m05", 6, 2, "2024-11-20"),  // 15000 x 2 = 30000
  mkSouscription("s06", "m06", 4, 4, "2024-07-12"),  // 10000 x 4 = 40000
  mkSouscription("s09", "m09", 4, 3, "2024-09-01"),  // 10000 x 3 = 30000
  mkSouscription("s10", "m10", 2, 5, "2025-01-05"),  // 5000 x 5 = 25000
];

function mkSouscription(id: string, membreId: string, formule: number, nbPersonnes: number, date: string): SouscriptionNsia {
  const f = FORMULES_NSIA.find((x) => x.n === formule)!;
  return {
    id, membreId, formule, benefice: f.benefice, cotisationUnitaire: f.cotisation,
    nbPersonnes, cotisationAnnuelle: f.cotisation * nbPersonnes, dateSouscription: date, actif: true,
  };
}

// 8 déclarations de décès (3 principaux + 5 ayants droit)
export const DECLARATIONS: DeclarationDeces[] = [
  { id: "d1", membreId: "m01", defuntType: "principal", nomDefunt: "KOUASSI Yao Marc", dateDeces: "2026-04-12", dateDeclaration: "2026-04-13" },
  { id: "d2", membreId: "m02", defuntType: "principal", nomDefunt: "N'GUESSAN Adjoua Marie", dateDeces: "2026-04-25", dateDeclaration: "2026-04-26" },
  { id: "d3", membreId: "m03", defuntType: "principal", nomDefunt: "KOUADIO Amani Étienne", dateDeces: "2026-05-08", dateDeclaration: "2026-05-09" },
  { id: "d4", membreId: "m06", defuntType: "ayant_droit", ayantDroitId: "a06a", nomDefunt: "KONÉ Aminata (mère)", dateDeces: "2026-03-02", dateDeclaration: "2026-03-03" },
  { id: "d5", membreId: "m08", defuntType: "ayant_droit", ayantDroitId: "a08a", nomDefunt: "OUATTARA Lassina (père)", dateDeces: "2026-03-22", dateDeclaration: "2026-03-23" },
  { id: "d6", membreId: "m09", defuntType: "ayant_droit", ayantDroitId: "a09a", nomDefunt: "SORO Mariam (conjoint)", dateDeces: "2026-04-04", dateDeclaration: "2026-04-05" },
  { id: "d7", membreId: "m07", defuntType: "ayant_droit", ayantDroitId: "a07a", nomDefunt: "TRAORÉ Kady (mère)", dateDeces: "2026-02-18", dateDeclaration: "2026-02-19" },
  { id: "d8", membreId: "m10", defuntType: "ayant_droit", ayantDroitId: "a10a", nomDefunt: "YAO Affoué (mère)", dateDeces: "2026-05-28", dateDeclaration: "2026-05-30" },
];

// Assistances ANZRBO (8 déclarations) : 5 versées, 3 refusées/en attente
export const ASSISTANCES: Assistance[] = [
  { id: "as1", declarationId: "d1", beneficiaire: "Famille KOUASSI", montant: ASSISTANCE_ANZRBO, statut: "versee", dateTraitement: "2026-04-15" },
  { id: "as2", declarationId: "d2", beneficiaire: "Famille N'GUESSAN", montant: ASSISTANCE_ANZRBO, statut: "versee", dateTraitement: "2026-04-28" },
  { id: "as3", declarationId: "d3", beneficiaire: "Famille KOUADIO", montant: 0, statut: "refusee", motifRefus: "Membre principal non à jour des cotisations" },
  { id: "as4", declarationId: "d4", beneficiaire: "KONÉ Mariam", montant: ASSISTANCE_ANZRBO, statut: "versee", dateTraitement: "2026-03-05" },
  { id: "as5", declarationId: "d5", beneficiaire: "OUATTARA Fanta", montant: ASSISTANCE_ANZRBO, statut: "versee", dateTraitement: "2026-03-25" },
  { id: "as6", declarationId: "d6", beneficiaire: "SORO Drissa", montant: ASSISTANCE_ANZRBO, statut: "versee", dateTraitement: "2026-04-07" },
  { id: "as7", declarationId: "d7", beneficiaire: "TRAORÉ Boubacar", montant: 0, statut: "refusee", motifRefus: "Membre principal non à jour des cotisations" },
  { id: "as8", declarationId: "d8", beneficiaire: "YAO Akissi Hortense", montant: 0, statut: "en_attente" },
];

// Paiements NSIA : 4 décès couverts NSIA → versés (D1, D4, D6, D8)
export const PAIEMENTS_NSIA: PaiementNsia[] = [
  mkPaiementNsia("p1", "d1", "s01", "2026-04-30"),
  mkPaiementNsia("p2", "d4", "s06", "2026-03-20"),
  mkPaiementNsia("p3", "d6", "s09", "2026-04-22"),
  mkPaiementNsia("p4", "d8", "s10", "2026-05-31"),
];

function mkPaiementNsia(id: string, declId: string, souscriptionId: string, date: string): PaiementNsia {
  const s = SOUSCRIPTIONS_NSIA.find((x) => x.id === souscriptionId)!;
  const commission = Math.round(s.benefice * TAUX_COMMISSION_NSIA);
  return {
    id, declarationId: declId, souscriptionId,
    beneficeBrut: s.benefice, commissionAssoc: commission,
    netFamille: s.benefice - commission, date,
  };
}

// Cotisations : pour chaque déclaration, chaque membre actif au moment du décès doit 1200 FCFA.
// Génération déterministe + 9 cotisations en retard pour illustrer "non cotisé".
function genererCotisations(): Cotisation[] {
  const enRetardTargets = new Set<string>([
    "d1:m07", "d1:m08",
    "d2:m07", "d2:m10",
    "d3:m04", "d3:m07",
    "d4:m07", "d5:m07", "d7:m10",
  ]); // 9 cotisations en retard
  const list: Cotisation[] = [];
  for (const d of DECLARATIONS) {
    // membres tenus de cotiser : tous les actifs sauf le défunt principal lui-même
    for (const m of MEMBRES) {
      if (m.id === d.membreId && d.defuntType === "principal") continue;
      if (m.statut === "decede" && d.dateDeces < m.dateInscription) continue;
      const key = `${d.id}:${m.id}`;
      const enRetard = enRetardTargets.has(key);
      list.push({
        id: `c-${d.id}-${m.id}`,
        declarationId: d.id, membreId: m.id,
        montant: COTISATION_PAR_DECES,
        statut: enRetard ? "en_retard" : "payee",
        date: enRetard ? undefined : d.dateDeclaration,
      });
    }
  }
  return list;
}

export const COTISATIONS: Cotisation[] = genererCotisations();

// ---------------------------------------------------------------
// Helpers de calcul
// ---------------------------------------------------------------
export function membre(id: string) {
  return MEMBRES.find((m) => m.id === id);
}

export function ayantsDroitDe(membreId: string) {
  return AYANTS_DROIT.filter((a) => a.membreId === membreId);
}

export function souscriptionDe(membreId: string) {
  return SOUSCRIPTIONS_NSIA.find((s) => s.membreId === membreId);
}

export function cotisationsDuMembre(membreId: string) {
  return COTISATIONS.filter((c) => c.membreId === membreId);
}

export function aJour(membreId: string) {
  return cotisationsDuMembre(membreId).every((c) => c.statut === "payee");
}

export function declarationsDuMembre(membreId: string) {
  return DECLARATIONS.filter((d) => d.membreId === membreId);
}

export function statsAnzrbo() {
  const total = MEMBRES.length;
  const actifs = MEMBRES.filter((m) => m.statut === "actif").length;
  const suspendus = MEMBRES.filter((m) => m.statut === "suspendu").length;
  const decedes = MEMBRES.filter((m) => m.statut === "decede").length;
  const fraisInscription = total * FRAIS_INSCRIPTION_DIGITORG;
  const cotisationsPayees = COTISATIONS.filter((c) => c.statut === "payee");
  const totalCotPayees = cotisationsPayees.reduce((s, c) => s + c.montant, 0);
  const enAttente = COTISATIONS.filter((c) => c.statut !== "payee");
  const totalEnAttente = enAttente.reduce((s, c) => s + c.montant, 0);
  const assistancesVersees = ASSISTANCES.filter((a) => a.statut === "versee");
  const totalAssistances = assistancesVersees.reduce((s, a) => s + a.montant, 0);
  const totalSouscriptionsNsia = SOUSCRIPTIONS_NSIA.reduce((s, x) => s + x.cotisationAnnuelle, 0);
  const totalNsiaRecu = PAIEMENTS_NSIA.reduce((s, x) => s + x.beneficeBrut, 0);
  const commissionsNsia = PAIEMENTS_NSIA.reduce((s, x) => s + x.commissionAssoc, 0);
  return {
    total, actifs, suspendus, decedes,
    fraisInscription, totalCotPayees, nbCotPayees: cotisationsPayees.length,
    totalEnAttente, nbEnAttente: enAttente.length,
    totalAssistances, nbAssistances: assistancesVersees.length,
    totalSouscriptionsNsia, nbSouscriptions: SOUSCRIPTIONS_NSIA.length,
    totalNsiaRecu, commissionsNsia, nbPaiementsNsia: PAIEMENTS_NSIA.length,
    nbDeclarations: DECLARATIONS.length,
    partAssociation: totalCotPayees,   // 100% cotisations vont à l'association
    partDigitorg: fraisInscription,    // DigitOrg = frais d'inscription uniquement
  };
}
