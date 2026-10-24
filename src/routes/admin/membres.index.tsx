import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { DashboardHeader, ADMIN_NAV } from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth, clientRoleGuard } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { syncPendingMemberDrafts, pendingMemberDraftCount } from "@/lib/offline-sync";
import { Search, Users, RefreshCw, WifiOff, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/membres/")({
  beforeLoad: () => { const r = clientRoleGuard(["admin_anzrbo"]); if (r) throw r; },
  component: ListeMembres,
  head: () => ({ meta: [{ title: "Membres — Admin ANZRBO" }] }),
});

type MemberRow = {
  id: string; numero_membre: string; nom: string; prenoms: string;
  telephone: string; village: string | null; quartier: string | null;
  statut: string; date_inscription: string; created_at: string;
};

function StatutBadge({ s }: { s: string }) {
  const styles: Record<string, string> = {
    actif: "bg-emerald-100 text-emerald-700",
    suspendu: "bg-amber-100 text-amber-700",
    decede: "bg-rose-100 text-rose-700",
    archive: "bg-slate-100 text-slate-700",
    en_attente: "bg-blue-100 text-blue-700",
  };
  return <Badge className={styles[s] ?? "bg-muted"}>{s.replace("_", " ")}</Badge>;
}

function ListeMembres() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [total, setTotal] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(0);

  useEffect(() => { if (!loading && (!user || user.role !== "admin_anzrbo")) nav({ to: "/login" }); }, [user, loading, nav]);

  const loadMembers = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const db = (supabase as any);
      let query = db.from("members")
        .select("id,numero_membre,nom,prenoms,telephone,village,quartier,statut,date_inscription,created_at", { count: "exact" })
        .order("created_at", { ascending: false });
      const term = q.trim().replace(/[,%()]/g, " ");
      if (term) {
        const pattern = `%${term}%`;
        query = query.or([
          `nom.ilike.${pattern}`, `prenoms.ilike.${pattern}`,
          `telephone.ilike.${pattern}`, `numero_membre.ilike.${pattern}`,
          `village.ilike.${pattern}`, `quartier.ilike.${pattern}`,
        ].join(","));
      }
      const { data, error: queryError, count } = await query;
      if (queryError) throw queryError;
      setMembers((data ?? []) as MemberRow[]);
      setTotal(count ?? data?.length ?? 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Impossible de lire le registre officiel.");
      setMembers([]);
      setTotal(0);
    } finally {
      setBusy(false);
      setPending(pendingMemberDraftCount());
    }
  }, [q]);

  useEffect(() => {
    if (loading || !user) return;
    void (async () => {
      const sync = await syncPendingMemberDrafts();
      setPending(sync.pending);
      await loadMembers();
    })();
  }, [loading, user, loadMembers]);

  useEffect(() => {
    if (loading || !user) return;
    const timer = window.setTimeout(() => { void loadMembers(); }, 250);
    return () => window.clearTimeout(timer);
  }, [q, loading, user, loadMembers]);

  if (loading || !user) return <div className="flex min-h-screen items-center justify-center">Chargement…</div>;

  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardHeader title="Membres — ANZRBO" nav={ADMIN_NAV} />
      <main className="container mx-auto max-w-7xl space-y-6 px-4 py-8">
        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> Registre officiel des membres</CardTitle>
              <CardDescription>{total} résultat(s) lus depuis la base de données centrale.</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input className="w-full pl-9 sm:w-80" placeholder="Nom, téléphone, matricule, village…" value={q} onChange={(e) => setQ(e.target.value)} />
              </div>
              <Button variant="outline" onClick={() => void loadMembers()} disabled={busy}><RefreshCw className={`mr-2 h-4 w-4 ${busy ? "animate-spin" : ""}`} /> Actualiser</Button>
              <Button asChild><Link to="/admin/membres/nouveau">+ Nouveau membre</Link></Button>
            </div>
          </CardHeader>
          {pending > 0 && <div className="mx-6 mb-3 flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900"><WifiOff className="h-4 w-4" /> {pending} inscription(s) en attente de synchronisation. Elles seront renvoyées lorsque le réseau sera disponible.</div>}
          {error && <div className="mx-6 mb-3 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /><div><b>Lecture de la base de données impossible.</b><div>{error}</div></div></div>}
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Matricule</TableHead><TableHead>Nom complet</TableHead><TableHead>Téléphone</TableHead>
                <TableHead>Village</TableHead><TableHead>Statut</TableHead><TableHead>Inscription</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {members.map((m) => <TableRow key={m.id}>
                  <TableCell className="font-mono text-xs">{m.numero_membre}</TableCell>
                  <TableCell className="font-medium">{m.prenoms} {m.nom}</TableCell>
                  <TableCell>{m.telephone}</TableCell>
                  <TableCell>{m.village || m.quartier || "—"}</TableCell>
                  <TableCell><StatutBadge s={m.statut} /></TableCell>
                  <TableCell>{m.date_inscription ? new Date(m.date_inscription).toLocaleDateString("fr-FR") : "—"}</TableCell>
                </TableRow>)}
                {!busy && !error && members.length === 0 && <TableRow><TableCell colSpan={6} className="py-10 text-center text-muted-foreground">Aucun membre trouvé dans le registre central.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
