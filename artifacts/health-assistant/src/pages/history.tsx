import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useGetHistory, getGetHistoryQueryKey, useClearHistory } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { History as HistoryIcon, Trash2, FileText, ImageIcon, Apple, ChevronRight, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function History() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | "report" | "image" | "diet">("all");
  
  const { data: historyData, isLoading } = useGetHistory(
    { userId: user?.id || "", type: filter !== "all" ? filter as any : undefined },
    { query: { enabled: !!user?.id, queryKey: getGetHistoryQueryKey({ userId: user?.id || "", type: filter !== "all" ? filter as any : undefined }) } }
  );

  const clearMutation = useClearHistory();

  const handleClear = async () => {
    if (!user?.id) return;
    try {
      await clearMutation.mutateAsync({ data: { userId: user.id } });
      queryClient.invalidateQueries({ queryKey: getGetHistoryQueryKey() });
      toast({ title: "History cleared", description: "All your past records have been removed." });
    } catch (err) {
      toast({ title: "Failed to clear", description: "Could not remove history.", variant: "destructive" });
    }
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'report': return <FileText className="w-5 h-5 text-primary" />;
      case 'image': return <ImageIcon className="w-5 h-5 text-secondary" />;
      case 'diet': return <Apple className="w-5 h-5 text-chart-4" />;
      default: return <HistoryIcon className="w-5 h-5" />;
    }
  };

  const getBg = (type: string) => {
    switch(type) {
      case 'report': return 'bg-primary/10';
      case 'image': return 'bg-secondary/10';
      case 'diet': return 'bg-chart-4/10';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-bold tracking-tight">Analysis History</h1>
          <p className="text-muted-foreground mt-1">Review your past reports, scans, and diet plans.</p>
        </motion.div>

        {historyData?.items?.length ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-destructive hover:bg-destructive hover:text-destructive-foreground">
                <Trash2 className="w-4 h-4 mr-2" /> Clear History
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all your analysis records from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClear} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {clearMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete completely"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : null}
      </div>

      <Tabs defaultValue="all" onValueChange={(v) => setFilter(v as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-md">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="report">Reports</TabsTrigger>
          <TabsTrigger value="image">Scans</TabsTrigger>
          <TabsTrigger value="diet">Diet</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
      ) : !historyData?.items?.length ? (
        <Card className="border-dashed bg-transparent shadow-none border-2">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <HistoryIcon className="w-12 h-12 text-muted mb-4" />
            <h3 className="text-lg font-semibold">No records found</h3>
            <p className="text-muted-foreground mt-1 max-w-sm">
              {filter === 'all' 
                ? "You haven't run any analyses yet. Your history will appear here." 
                : `You don't have any ${filter} records yet.`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          <AnimatePresence>
            {historyData.items.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Link href={item.type === 'report' ? `/report-generator/${item.id}` : '#'}>
                  <Card className={`hover-elevate cursor-pointer border-border/50 transition-colors group
                    ${item.type === 'report' ? 'hover:border-primary/50' : ''}`}>
                    <CardContent className="p-4 sm:p-5 flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${getBg(item.type)} transition-transform group-hover:scale-105`}>
                        {getIcon(item.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-base truncate">{item.title}</h3>
                          {item.confidence && (
                            <Badge variant="outline" className="text-[10px] h-5 px-1.5 shrink-0">
                              {item.confidence}% cert.
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">{item.summary}</p>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className="text-xs text-muted-foreground font-mono">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                        {item.type === 'report' && (
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
