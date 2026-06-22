import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faq = [
  { q: "Qui peut adhérer à l'ANZRBO ?", a: "Les N'Zipris résidents à Bonon et les membres acceptés selon les règles internes de l'association." },
  { q: "Quel est le principe de solidarité ?", a: "Chaque membre participe aux cotisations prévues afin de soutenir les familles lors des décès déclarés." },
  { q: "Comment vérifier un membre ?", a: "La vérification publique se fait par numéro de téléphone ou par QR code." },
  { q: "Comment obtenir ma carte de membre ?", a: "Après validation de votre dossier, votre carte est générée et téléchargeable depuis votre espace membre." },
  { q: "Mes données sont-elles protégées ?", a: "Oui. Les accès sont cloisonnés par rôle et les informations sensibles ne sont pas exposées publiquement." },
];

export const Route = createFileRoute("/faq")({
  component: Page,
  head: () => ({
    meta: [
      { title: "Foire aux questions — ANZRBO" },
      { name: "description", content: "Questions fréquentes sur l'adhésion à l'ANZRBO, les cotisations solidaires, la vérification d'un membre et la protection des données." },
      { property: "og:title", content: "Foire aux questions — ANZRBO" },
      { property: "og:description", content: "Réponses aux questions fréquentes sur l'ANZRBO : adhésion, cotisations, vérification d'un membre, données." },
      { property: "og:url", content: "https://anzrbo1.lovable.app/faq" },
      { name: "twitter:title", content: "Foire aux questions — ANZRBO" },
      { name: "twitter:description", content: "Réponses aux questions fréquentes sur l'ANZRBO." },
    ],
    links: [{ rel: "canonical", href: "https://anzrbo1.lovable.app/faq" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faq.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
});

function Page() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="container mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-4xl font-bold tracking-tight">Foire aux questions ANZRBO</h1>
        <Accordion type="single" collapsible className="mt-8">
          {faq.map((f, i) => (
            <AccordionItem key={i} value={`i${i}`}>
              <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
              <AccordionContent>{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
      <SiteFooter />
    </div>
  );
}
