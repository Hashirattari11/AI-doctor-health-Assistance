import { useRoute } from "wouter";
import { useGetHistoryItem, getGetHistoryItemQueryKey, useGenerateReportPdf } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, ArrowLeft, Loader2, Calendar } from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReportGenerator() {
  const [, params] = useRoute("/report-generator/:id");
  const id = params?.id || "";
  const { toast } = useToast();

  const { data: item, isLoading } = useGetHistoryItem(id, {
    query: { enabled: !!id, queryKey: getGetHistoryItemQueryKey(id) }
  });

  const pdfMutation = useGenerateReportPdf();

  const handleDownload = async () => {
    if (!id) return;
    try {
      const res = await pdfMutation.mutateAsync({ id });
      // In a real app, we'd trigger a download using res.downloadUrl
      window.open(res.downloadUrl, '_blank');
      toast({ title: "Report generated", description: "Your PDF is downloading." });
    } catch (err) {
      toast({ title: "Generation failed", description: "Could not create PDF report.", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <Skeleton className="h-10 w-32 mb-8" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!item || item.type !== 'report') {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-2">Report Not Found</h2>
        <p className="text-muted-foreground mb-6">This report doesn't exist or isn't a document analysis.</p>
        <Link href="/history">
          <Button><ArrowLeft className="w-4 h-4 mr-2" /> Back to History</Button>
        </Link>
      </div>
    );
  }

  // Type assertion since we know it's a report based on the check above
  const reportData = item.data as any;

  return (
    <div className="space-y-8 max-w-3xl mx-auto pb-12">
      <Link href="/history" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to History
      </Link>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-mono text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{item.title}</h1>
        </motion.div>

        <Button 
          onClick={handleDownload} 
          disabled={pdfMutation.isPending}
          className="shrink-0"
        >
          {pdfMutation.isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          Download PDF
        </Button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.1 }}
      >
        <Card className="border-primary/20 shadow-sm overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-primary to-secondary"></div>
          <CardHeader className="bg-muted/20 pb-4 border-b border-border/50">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" /> Executive Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-foreground leading-relaxed">{item.summary}</p>
          </CardContent>
        </Card>
      </motion.div>

      {reportData?.values && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-xl font-semibold mb-4">Detailed Metrics</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {reportData.values.map((val: any, idx: number) => (
              <Card key={idx} className="shadow-none border-border/50">
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{val.name}</p>
                    <p className="text-xl font-bold mt-1 text-foreground">
                      {val.value} <span className="text-xs font-normal text-muted-foreground ml-1">{val.unit}</span>
                    </p>
                  </div>
                  <div className={`px-2.5 py-1 rounded-md text-xs font-medium uppercase tracking-wider
                    ${val.status === 'normal' ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 
                      val.status === 'high' ? 'bg-destructive/10 text-destructive' : 
                      'bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}
                  >
                    {val.status}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
