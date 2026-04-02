import { HourCalculator } from "@/components/hour-calculator";
import { getFormatBNF } from "@/lib/time-parser";
import { Card } from "@/components/ui/card";

export default function Home() {
  const bnf = getFormatBNF();

  return (
    <main className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <HourCalculator />

        <Card className="p-6 bg-muted/50 border-muted">
          Valid input in Backus-Naur Form grammar
          <pre className="font-mono text-muted-foreground whitespace-pre-wrap wrap-break-word">
            {bnf}
          </pre>
        </Card>

        <a href="https://github.com/startracex" className="text-muted-foreground/50">
          Made by Shiro Wang
        </a>
      </div>
    </main>
  );
}
