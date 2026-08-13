import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/cardiolab/Navbar";
import { Hero } from "@/components/cardiolab/Hero";
import { LearningPath } from "@/components/cardiolab/LearningPath";
import { HighYieldTopics } from "@/components/cardiolab/HighYieldTopics";
import { ECGPreview } from "@/components/cardiolab/ECGPreview";
import { AnatomyPreview } from "@/components/cardiolab/AnatomyPreview";
import { CTA } from "@/components/cardiolab/CTA";
import { Footer } from "@/components/cardiolab/Footer";

const TITLE = "CardioLab — Master the Cardiovascular System";
const DESCRIPTION =
  "A visual, interactive cardiovascular medicine module for high-yield USMLE Step 1 preparation: anatomy, physiology, pathology, pharmacology, ECG and clinical reasoning.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <LearningPath />
        <HighYieldTopics />
        <ECGPreview />
        <AnatomyPreview />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
