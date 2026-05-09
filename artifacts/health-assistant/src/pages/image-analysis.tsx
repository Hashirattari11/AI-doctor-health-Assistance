import { useState, useRef, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useAnalyzeImage } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AIDisclaimer } from "@/components/ai-disclaimer";
import { User, Camera, UploadCloud, X, Loader2, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ImageAnalysis() {
  const { user } = useAuth();
  const { toast } = useToast();
  const analyzeMutation = useAnalyzeImage();
  
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFile = (selectedFile: File) => {
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    } else {
      toast({ title: "Invalid file", description: "Please upload an image file.", variant: "destructive" });
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file || !user?.id) return;
    
    try {
      const res = await analyzeMutation.mutateAsync({
        data: { file, userId: user.id }
      });
      setResult(res);
      toast({ title: "Analysis complete", description: "Your wellness scan is ready." });
    } catch (err: any) {
      toast({ title: "Scan failed", description: err?.message || "An error occurred.", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight">Visual Wellness Scan</h1>
        <p className="text-muted-foreground mt-1">Upload a clear photo of your face for AI hints on hydration, fatigue, and general skin wellness.</p>
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
            <Card className="border-2 border-dashed border-muted-foreground/20 overflow-hidden">
              <CardContent className="p-0">
                <div 
                  className={`flex flex-col items-center justify-center p-8 md:p-12 transition-colors duration-200 min-h-[400px] relative
                    ${isDragging ? 'bg-primary/5 border-primary' : 'hover:bg-muted/30'}
                    ${previewUrl ? 'bg-black/5 dark:bg-white/5' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {previewUrl ? (
                    <div className="flex flex-col items-center space-y-6 w-full max-w-sm">
                      <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-background shadow-xl">
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        {analyzeMutation.isPending && (
                          <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm flex flex-col items-center justify-center text-primary-foreground">
                            <div className="w-full h-1 bg-primary/50 absolute top-0 animate-[scan_2s_ease-in-out_infinite]"></div>
                            <Loader2 className="w-8 h-8 animate-spin" />
                          </div>
                        )}
                      </div>
                      
                      {!analyzeMutation.isPending && (
                        <div className="flex gap-3 w-full">
                          <Button variant="outline" onClick={resetForm} className="flex-1">
                            <X className="w-4 h-4 mr-2" /> Cancel
                          </Button>
                          <Button onClick={handleAnalyze} className="flex-1">
                            Scan Face
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-6 text-center max-w-sm">
                      <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center text-secondary relative">
                        <User className="w-10 h-10" />
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-background rounded-full flex items-center justify-center border border-border">
                          <Camera className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                      <div>
                        <p className="text-xl font-medium">Take a photo or upload</p>
                        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                          Ensure good lighting and a clear view of your face without accessories like sunglasses.
                        </p>
                      </div>
                      <div className="pt-4 flex gap-4">
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          accept="image/*"
                          capture="user"
                          onChange={handleFileChange}
                        />
                        <Button onClick={() => fileInputRef.current?.click()} className="rounded-full px-8 shadow-lg shadow-primary/20">
                          <UploadCloud className="w-4 h-4 mr-2" /> Upload Image
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
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
                <X className="w-4 h-4 mr-2" /> New Scan
              </Button>
              <Badge variant="outline" className="text-xs bg-card">
                <CheckCircle2 className="w-3 h-3 mr-1 text-green-500" /> Scan Complete
              </Badge>
            </div>

            <AIDisclaimer confidence={result.confidence} />

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="md:col-span-1 border-none shadow-md overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-primary/10 z-0"></div>
                <CardHeader className="relative z-10">
                  <CardTitle>Overall Wellness</CardTitle>
                  <CardDescription className="text-foreground/70">General impression</CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-bold tracking-tight text-balance leading-tight">
                    {result.overallWellness}
                  </div>
                  {previewUrl && (
                    <div className="mt-8 w-24 h-24 rounded-full overflow-hidden border-4 border-background/50 shadow-sm mx-auto">
                      <img src={previewUrl} alt="Thumbnail" className="w-full h-full object-cover grayscale opacity-80" />
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="md:col-span-2 space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" /> Visual Indicators
                </h3>
                <div className="grid gap-3">
                  {result.results?.map((res: any, idx: number) => (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      key={idx}
                    >
                      <Card className="hover-elevate transition-colors hover:border-primary/30">
                        <CardContent className="p-4 flex items-start gap-4">
                          <Badge variant={
                            res.severity === 'high' ? 'destructive' : 
                            res.severity === 'medium' ? 'default' : 'secondary'
                          } className="mt-0.5 shrink-0 uppercase tracking-wider text-[10px]">
                            {res.severity}
                          </Badge>
                          <div>
                            <h4 className="font-medium text-foreground">{res.indicator}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{res.message}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
