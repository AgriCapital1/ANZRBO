import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, ShieldCheck, MapPin, BadgeCheck, XCircle, CalendarDays, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MemberCardRecto, MemberCardVerso } from "@/components/MemberCard";

export const Route = createFileRoute("/verifier/$telephone")({
  component: Page,
  head: () => ({
    meta: [
      { title: "Vérification membre ANZRBO" },
      { name: "description", content: "Vérification publique du statut d'une carte de membre ANZRBO." },
    ],
  }),
});

type PublicMember = {
  numero_membre: string;
  nom: string;
  prenoms: string;
  telephone: string;
  quartier: string | null;
  ville: string | null;
  photo_url: string | null;
  date_inscription: string;
  statut: string;
};

function cardStatus(value: string): "actif" | "suspendu" | "decede" | "en_attente" {
  const s = value.toLowerCase();
  if (s === "actif" || s === "active") return "actif";
  if (s === "decede" || s === "décédé" || s === "deceased") return "decede";
  if (s === "en_attente" || s === "pending" || s === "en attente") return "en_attente";
  return "suspendu";
}
function statusText(value: string) {
  const s = cardStatus(value);
  if (s === "actif") return "Membre actif";
  if (s === "decede") return "Membre décédé";
  if (s === "en_attente") return "Adhésion en attente";
  return "Membre suspendu";
}

function Page() {
  const { telephone } = Route.useParams();
  const raw = decodeURIComponent(telephone).trim();
  const [member, setMember] = useState<PublicMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [lookupError, setLookupError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function lookup() {
      setLoading(true);
      setLookupError(null);
      try {
        // QR imprimé : /verifier/<matricule>. The RPC returns only the fields
        // needed to verify a card and never exposes private member records.
        const { data, error } = await (supabase as any).rpc("verify_member_card", {
          p_numero_membre: raw,
        });
        if (error) throw error;
        const rows = Array.isArray(data) ? data : data ? [data] : [];
        if (!cancelled) setMember((rows[0] ?? null) as PublicMember | null);
      } catch {
        if (!cancelled) {
          setMember(null);
          setLookupError("La vérification en ligne est temporairement indisponible. Réessayez ou contactez le secrétariat.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void lookup();
    return () => { cancelled = true; };
  }, [raw]);

  const status = member ? cardStatus(member.statut) : null;
  const cardMember = member ? {
    numeroMembre: member.numero_membre,
    nom: member.nom,
    prenoms: member.prenoms,
    photoUrl: member.photo_url,
    dateInscription: member.date_inscription,
    statut: cardStatus(member.statut),
  } : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7f3e9] via-white to-[#eaf2ec]">
      <SiteHeader />
      <section className="container mx-auto max-w-5xl px-4 py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[#0c5b2e]">
            <ShieldCheck className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-widest">Vérification officielle de la carte</span>
          </div>
          <Link to="/scanner" className="text-sm font-medium text-[#0c5b2e] underline underline-offset-4">
            ← Nouvelle vérification
          </Link>
        </div>

        {loading ? (
          <Card><CardContent className="flex items-center justify-center gap-3 p-10 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" /> Recherche du membre dans le registre officiel…
          </CardContent></Card>
        ) : !member ? (
          <Card className="border-red-200">
            <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
              <XCircle className="h-12 w-12 text-destructive" />
              <h1 className="text-2xl font-bold">{lookupError ? "Vérification indisponible" : "Aucun membre trouvé"}</h1>
              <p className="max-w-md text-sm text-muted-foreground">
                {lookupError ?? <>Le code <span className="font-mono">{raw}</span> ne correspond à aucun membre du registre officiel. Vérifiez que la carte est bien enregistrée.</>}
              </p>
              <Button asChild className="mt-2 bg-[#0c5b2e] hover:bg-[#0a4a26]"><Link to="/scanner">Réessayer</Link></Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_auto]">
            <Card className="overflow-hidden border-[#0c5b2e]/15">
              <div className="bg-gradient-to-r from-[#0c5b2e] to-[#0a4a26] px-6 py-5 text-white">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#c9a24c]">Association des N'Zipris Résidents à Bonon</div>
                    <h1 className="mt-1 text-2xl font-extrabold leading-tight">{member.prenoms} {member.nom}</h1>
                    <div className="font-mono text-xs opacity-80">{member.numero_membre}</div>
                  </div>
                  <StatusBadge status={status!} />
                </div>
              </div>
              <CardContent className="grid gap-5 p-6 sm:grid-cols-2">
                <Info icon={<MapPin className="h-4 w-4" />} label="Localisation">
                  {member.ville || "Bonon"}{member.quartier ? ` — ${member.quartier}` : ""}
                  <br /><span className="text-xs text-muted-foreground">Côte d'Ivoire</span>
                </Info>
                <Info icon={<Phone className="h-4 w-4" />} label="Contact public">
                  <span className="font-mono">{member.telephone}</span>
                </Info>
                <Info icon={<CalendarDays className="h-4 w-4" />} label="Date d'adhésion">
                  {member.date_inscription ? new Date(member.date_inscription).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }) : "—"}
                </Info>
                <Info icon={<BadgeCheck className="h-4 w-4" />} label="Statut administratif">{statusText(member.statut)}</Info>
                <div className="sm:col-span-2 rounded-md border border-dashed border-[#c9a24c]/60 bg-[#fdfaf1] p-3 text-xs text-[#5b4a1c]">
                  Seules les informations nécessaires à la vérification de la carte sont affichées. Les données confidentielles restent protégées.
                </div>
              </CardContent>
            </Card>
            <div className="flex flex-col items-center gap-4">
              <div className="text-xs font-semibold uppercase tracking-widest text-[#0c5b2e]">Carte officielle du membre</div>
              <MemberCardRecto m={cardMember!} />
              <MemberCardVerso m={cardMember!} />
            </div>
          </div>
        )}
      </section>
      <SiteFooter />
    </div>
  );
}

function Info({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return <div className="rounded-md border bg-white/60 p-3">
    <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-[#0c5b2e]">{icon} {label}</div>
    <div className="mt-1 text-sm text-foreground">{children}</div>
  </div>;
}

function StatusBadge({ status }: { status: "actif" | "suspendu" | "decede" | "en_attente" }) {
  if (status === "actif") return <Badge className="bg-[#c9a24c] text-[#1a1a1a] hover:bg-[#c9a24c]">Membre actif</Badge>;
  if (status === "en_attente") return <Badge className="bg-amber-100 text-amber-900 hover:bg-amber-100">En attente</Badge>;
  if (status === "suspendu") return <Badge className="bg-amber-100 text-amber-900 hover:bg-amber-100">Suspendu</Badge>;
  return <Badge className="bg-rose-100 text-rose-900 hover:bg-rose-100">Décédé</Badge>;
}
