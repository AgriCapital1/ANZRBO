import { supabase } from "@/integrations/supabase/client";

export type MemberDraft = {
  id: string;
  createdAt: string;
  member: {
    nom: string; prenoms: string; telephone: string; contact2: string | null;
    sous_prefecture: string; village: string; quartier: string | null; ville: string;
    date_naissance: string; lieu_naissance: string; date_inscription: string;
    statut: "en_attente"; urgence_nom: string; urgence_contact1: string;
    urgence_contact2: string | null; urgence_adresse: string;
    inscription_mode_paiement: string; inscription_type_preuve: string;
    inscription_reference: string | null; notes: string; created_by: string | null;
  };
};

const KEY = "anzrbo:pending-member-writes:v1";

function readQueue(): MemberDraft[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed as MemberDraft[] : [];
  } catch { return []; }
}
function writeQueue(queue: MemberDraft[]) {
  if (typeof window !== "undefined") window.localStorage.setItem(KEY, JSON.stringify(queue));
}
export function queueMemberDraft(draft: MemberDraft) {
  const queue = readQueue();
  if (!queue.some((item) => item.id === draft.id)) queue.push(draft);
  writeQueue(queue);
}
export function pendingMemberDraftCount() { return readQueue().length; }

/** Local storage is an offline outbox only, never a member directory or search source. */
export async function syncPendingMemberDrafts() {
  if (typeof window === "undefined" || !navigator.onLine) return { synced: 0, pending: readQueue().length };
  let queue = readQueue();
  let synced = 0;
  for (const draft of queue) {
    const marker = `offline_draft_id:${draft.id}`;
    const { data: existing, error: lookupError } = await supabase
      .from("members").select("id").eq("notes", marker).maybeSingle();
    if (lookupError) break;
    if (existing) {
      queue = queue.filter((item) => item.id !== draft.id);
      writeQueue(queue);
      synced++;
      continue;
    }
    const { error } = await (supabase as any).from("members").insert({ ...draft.member, notes: marker });
    if (error) break;
    queue = queue.filter((item) => item.id !== draft.id);
    writeQueue(queue);
    synced++;
  }
  return { synced, pending: queue.length };
}

if (typeof window !== "undefined") {
  window.addEventListener("online", () => { void syncPendingMemberDrafts(); });
}
