import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useGetDietSuggestions } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Apple, Utensils, Ban, HeartPulse, Loader2, Sparkles, PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function DietPlan() {
  const { user } = useAuth();
  const { toast } = useToast();
  const suggestMutation = useGetDietSuggestions();
  
  const [preferences, setPreferences] = useState("");
  const [conditions, setConditions] = useState("");
  const [plan, setPlan] = useState<any>(null);

  const handleGenerate = async () => {
    if (!user?.id) return;
    
    const condList = conditions.split(',').map(c => c.trim()).filter(Boolean);
    
    try {
      const res = await suggestMutation.mutateAsync({
        data: { 
          userId: user.id,
          preferences: preferences || undefined,
          conditions: condList.length > 0 ? condList : undefined
        }
      });
      setPlan(res);
      toast({ title: "Diet plan generated", description: "Your personalized nutrition guidance is ready." });
    } catch (err: any) {
      toast({ title: "Generation failed", description: err?.message || "An error occurred.", variant: "destructive" });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-chart-4/10 flex items-center justify-center text-chart-4">
            <Apple className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">AI Diet Suggestions</h1>
            <p className="text-muted-foreground mt-1">Personalized nutrition guidance based on your profile.</p>
          </div>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {!plan && (
          <motion.div
            key="form"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card className="border-border/50 shadow-md max-w-2xl mx-auto overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-chart-4 to-primary w-full"></div>
              <CardHeader>
                <CardTitle>Customize Your Plan</CardTitle>
                <CardDescription>Tell us a bit about what you need right now.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="conditions">Specific health goals or conditions (optional)</Label>
                  <Input 
                    id="conditions" 
                    placeholder="e.g. High blood pressure, fatigue, low iron..." 
                    value={conditions}
                    onChange={e => setConditions(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preferences">Dietary preferences (optional)</Label>
                  <Input 
                    id="preferences" 
                    placeholder="e.g. Vegetarian, keto, no dairy..." 
                    value={preferences}
                    onChange={e => setPreferences(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 pt-6">
                <Button 
                  onClick={handleGenerate} 
                  disabled={suggestMutation.isPending} 
                  className="w-full bg-chart-4 hover:bg-chart-4/90 text-chart-4-foreground"
                >
                  {suggestMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating Plan...</>
                  ) : (
                    <><Sparkles className="w-4 h-4 mr-2" /> Generate Personalized Plan</>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}

        {plan && (
          <motion.div
            key="plan"
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-8"
          >
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setPlan(null)} size="sm">
                <PlusCircle className="w-4 h-4 mr-2" /> Generate New Plan
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <motion.div variants={itemVariants}>
                <Card className="h-full border-green-500/20 shadow-sm overflow-hidden bg-gradient-to-b from-green-500/5 to-transparent">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                      <Utensils className="w-5 h-5" /> Foods to Include
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      {plan.toEat?.map((item: any, i: number) => (
                        <li key={i} className="border-b border-border/50 pb-3 last:border-0 last:pb-0">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-semibold text-foreground">{item.food}</span>
                            <Badge variant="outline" className="text-[10px] bg-background">{item.category}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{item.reason}</p>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="h-full border-destructive/20 shadow-sm overflow-hidden bg-gradient-to-b from-destructive/5 to-transparent">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-destructive">
                      <Ban className="w-5 h-5" /> Foods to Limit
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      {plan.toAvoid?.map((item: any, i: number) => (
                        <li key={i} className="border-b border-border/50 pb-3 last:border-0 last:pb-0">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-semibold text-foreground">{item.food}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{item.reason}</p>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-6">
              <Card className="border-primary/20 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <HeartPulse className="w-5 h-5" /> Lifestyle Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.lifestyleTips?.map((tip: string, i: number) => (
                      <li key={i} className="flex gap-3 text-sm">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold text-xs mt-0.5">
                          {i+1}
                        </div>
                        <span className="text-muted-foreground pt-1">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {plan.doctorRecommendation && (
                <Card className="bg-secondary/10 border-secondary/20 shadow-none h-min">
                  <CardContent className="p-6">
                    <h4 className="font-semibold text-secondary mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" /> Clinical Note
                    </h4>
                    <p className="text-sm text-foreground/80 leading-relaxed italic border-l-2 border-secondary pl-3">
                      "{plan.doctorRecommendation}"
                    </p>
                  </CardContent>
                </Card>
              )}
            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
