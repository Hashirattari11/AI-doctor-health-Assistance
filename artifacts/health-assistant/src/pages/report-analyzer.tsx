import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useAnalyzeReport } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AIDisclaimer } from "@/components/ai-disclaimer";
import { FileText, UploadCloud, File, X, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function ReportAnalyzer() {
  const { user } = useAuth();
  const { toast } = useToast();
  const analyzeMutation = useAnalyzeReport();
  
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === "application/pdf" || droppedFile.type.startsWith("image/"))) {
      setFile(droppedFile);
    } else {
      toast({ title: "Invalid file", description: "Please upload a PDF or image.", variant: "destructive" });
    }
  }, [toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleAnalyze = async () => {
    if (!file || !user?.id) return;
    
    try {
      const res = await analyzeMutation.mutateAsync({
        data: { file, userId: user.id }
      });
      setResult(res);
      toast({ title: "Analysis complete", description: "Your report has been successfully analyzed." });
    } catch (err: any) {
      toast({ title: "Analysis failed", description: err?.message || "An error occurred.", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setFile(null);
    setResult(null);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight">Report Analyzer</h1>
        <p className="text-muted-foreground mt-1">Upload your medical reports for AI-powered explanations and insights.</p>
      </motion.div>

      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full"
          >
            <Card className="border-2 border-dashed border-muted-foreground/20">
              <CardContent className="p-0">
                <div 
                  className={`flex flex-col items-center justify-center p-12 transition-colors duration-200 min-h-[300px]
                    ${isDragging ? 'bg-primary/5 border-primary' : 'hover:bg-muted/30'}
                    ${file ? 'bg-primary/5' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {file ? (
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <File className="w-8 h-8" />
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-lg">{file.name}</p>
                        <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <div className="flex gap-3 pt-4">
                        <Button variant="outline" onClick={() => setFile(null)}>
                          <X className="w-4 h-4 mr-2" /> Remove
                        </Button>
                        <Button onClick={handleAnalyze} disabled={analyzeMutation.isPending} className="min-w-[120px]">
                          {analyzeMutation.isPending ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</>
                          ) : (
                            <>Analyze Report</>
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-4 text-center">
                      <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center text-secondary mb-2">
                        <UploadCloud className="w-8 h-8" />
                      </div>
                      <div>
                        <p className="text-lg font-medium">Drag & drop your report here</p>
                        <p className="text-sm text-muted-foreground mt-1">Supports PDF, JPG, PNG up to 10MB</p>
                      </div>
                      <div className="pt-2">
                        <input
                          type="file"
                          id="file-upload"
                          className="hidden"
                          accept=".pdf,image/*"
                          onChange={handleFileChange}
                        />
                        <label htmlFor="file-upload">
                          <Button variant="outline" asChild className="cursor-pointer">
                            <span>Browse Files</span>
                          </Button>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {analyzeMutation.isPending && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-8 p-6 rounded-xl bg-card border border-border flex flex-col items-center space-y-4"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse"></div>
                  <Loader2 className="w-10 h-10 text-primary animate-spin relative z-10" />
                </div>
                <div className="text-center space-y-1">
                  <p className="font-medium text-lg">AI is scanning your document</p>
                  <p className="text-sm text-muted-foreground animate-pulse">Extracting values and analyzing indicators...</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <Button variant="outline" onClick={resetForm} size="sm">
                <X className="w-4 h-4 mr-2" /> Start Over
              </Button>
              <Badge variant="outline" className="text-xs bg-card">
                <CheckCircle2 className="w-3 h-3 mr-1 text-green-500" /> Analysis Complete
              </Badge>
            </div>

            <AIDisclaimer confidence={result.confidence} emergencyAlert={result.emergencyAlert} />

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Extracted Values</CardTitle>
                  <CardDescription>Key metrics identified in the report</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border border-border overflow-hidden">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow>
                          <TableHead>Biomarker</TableHead>
                          <TableHead>Value</TableHead>
                          <TableHead>Normal Range</TableHead>
                          <TableHead className="text-right">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {result.values?.map((val: any, idx: number) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium">{val.name}</TableCell>
                            <TableCell>{val.value} <span className="text-muted-foreground text-xs">{val.unit}</span></TableCell>
                            <TableCell className="text-muted-foreground">{val.normalRange || 'N/A'}</TableCell>
                            <TableCell className="text-right">
                              <Badge variant={
                                val.status === 'normal' ? 'outline' : 
                                val.status === 'high' ? 'default' : 
                                val.status === 'low' ? 'secondary' : 'destructive'
                              } className={val.status === 'normal' ? 'border-green-500/30 text-green-600 dark:text-green-400' : ''}>
                                {val.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" /> Explanation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground leading-relaxed">
                    {result.explanation}
                  </CardContent>
                </Card>

                {result.possibleConditions?.length > 0 && (
                  <Card className="border-secondary/20 bg-secondary/5">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-secondary" /> Possible Conditions
                      </CardTitle>
                      <CardDescription className="text-xs">Based on pattern analysis</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc pl-4 space-y-1 text-sm font-medium">
                        {result.possibleConditions.map((cond: string, idx: number) => (
                          <li key={idx}>{cond}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
                
                {result.recommendations?.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {result.recommendations.map((rec: string, idx: number) => (
                          <li key={idx} className="flex gap-2">
                            <span className="text-primary">•</span> <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
