import { RequirementRefiner } from "@/components/requirement-refiner";
import { FlaskConical } from "lucide-react";

export default function Home() {
  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16">
        <header className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4 border border-primary/20">
            <FlaskConical className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold font-headline text-foreground">
            Requirement Refiner
          </h1>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            Turn your vague ideas into actionable requirements. Upload your documents, notes, or audio files, and see the extracted and structured results.
          </p>
        </header>
        <main>
          <RequirementRefiner />
        </main>
        <footer className="text-center mt-12">
            <p className="text-sm text-muted-foreground">Powered by Firebase</p>
        </footer>
      </div>
    </div>
  );
}
