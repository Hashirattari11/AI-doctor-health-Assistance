import { AlertTriangle, Info, ShieldAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AIDisclaimerProps {
  confidence: number;
  emergencyAlert?: boolean;
}

export function AIDisclaimer({ confidence, emergencyAlert }: AIDisclaimerProps) {
  const isLowConfidence = confidence < 60;

  return (
    <div className="space-y-4 w-full">
      {emergencyAlert && (
        <Alert variant="destructive" className="border-2 shadow-sm animate-in fade-in slide-in-from-top-4">
          <ShieldAlert className="h-5 w-5" />
          <AlertTitle className="text-lg font-semibold">Immediate Attention Recommended</AlertTitle>
          <AlertDescription>
            The analysis has detected potential critical values. Please seek professional medical assistance immediately.
          </AlertDescription>
        </Alert>
      )}

      {isLowConfidence && (
        <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900 text-amber-800 dark:text-amber-200">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          <AlertTitle>Low Confidence Analysis</AlertTitle>
          <AlertDescription>
            The AI is less certain about this analysis. Please consult a doctor for a proper evaluation.
          </AlertDescription>
        </Alert>
      )}

      <Card className="bg-primary/5 border-primary/10">
        <CardContent className="pt-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">
                This is AI-generated guidance, not a medical diagnosis.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Always consult with a qualified healthcare provider for medical advice, diagnosis, or treatment.
              </p>
            </div>
          </div>
          <Badge variant={isLowConfidence ? "secondary" : "default"} className="shrink-0 font-mono">
            {confidence}% confidence
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}
