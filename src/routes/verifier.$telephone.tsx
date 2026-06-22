import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, ShieldCheck, UserCircle2, MapPin, BadgeCheck, XCircle } from "lucide-react";
import { MEMBRES } from "@/lib/data";

export const Route = createFileRoute("/verifier/$telephone")({
  component: Page,
  head: () => ({ meta: [
    { title: "Vérification membre — ANZRBO" },
    { name: "description", content: "Vérifiez l'identité et le statut d'un membre ANZRBO via son numéro de téléphone." },
  ]}),
});

function clean(v: string) { return v.replace(/\D/g, ""); }

function Page() {
  const { telephone } = Route.useParams();
  const tel = clean(decodeURIComponent(telephone));
  const m = MEMBRES.find((x) => clean(x.telephone) === tel || x.numeroMembre.toLowerCase() === decodeURIComponent(telephone).toLowerCase());

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="container mx-auto max-w-2xl px-4 py-12">
        <Link to="/scanner" className="text-sm text-muted-foreground underline">← Nouvelle vérification</Link>

        <Card className="mt-4 overflow-hidden">
          <div className="p-4" style={{ background: "var(--gradient-primary, hsl(var(--primary)))" }}>
            <div className="flex items-center gap-2 text-primary-foreground">
              <ShieldCheck className="h-5 w-5" />
              <span className="text-sm font-medium uppercase tracking-wider">Carte membre ANZRBO</span>
            </div>
          </div>
          <CardContent className="p-6">
            {!m ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <XCircle className="h-10 w-10 text-destructive" />
                <h1 className="text-xl font-bold">Aucun membre trouvé</h1>
                <p className="text-sm text-muted-foreground">Le numéro <span className="font-mono">{tel || telephone}</span> ne correspond à aucun membre enregistré.</p>
                <Button asChild className="mt-2"><Link to="/scanner">Réessayer</Link></Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-5">
                  <div className="flex h-28 w-24 shrink-0 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
                    <UserCircle2 className="h-10 w-10" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-xl font-bold">{m.prenoms} {m.nom}</h1>
                    <p className="font-mono text-xs text-muted-foreground">{m.numeroMembre}</p>
                    <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"><Phone className="h-4 w-4" /><span className="font-mono">{m.telephone}</span></p>
                    <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4" /><span>{m.village} — {m.sousPrefecture}</span></p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {m.statut === "actif" && <Badge className="bg-emerald-100 text-emerald-700"><BadgeCheck className="mr-1 h-3 w-3" />Actif</Badge>}
                      {m.statut === "suspendu" && <Badge className="bg-amber-100 text-amber-700">Suspendu</Badge>}
                      {m.statut === "decede" && <Badge className="bg-rose-100 text-rose-700">Décédé</Badge>}
                    </div>
                  </div>
                </div>
                <p className="rounded-md bg-muted/40 p-3 text-xs text-muted-foreground">
                  Informations confidentielles (ayants droit, cotisations, NSIA, personne d'urgence) consultables uniquement par les administrateurs ANZRBO.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
      <SiteFooter />
    </div>
  );
}
