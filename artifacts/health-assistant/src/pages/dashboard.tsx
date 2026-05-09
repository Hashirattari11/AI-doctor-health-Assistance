import { useAuth } from "@/hooks/use-auth";
import { useGetDashboardSummary, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, FileText, ImageIcon, Apple, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { user } = useAuth();
  
  const { data: summary, isLoading } = useGetDashboardSummary(
    { userId: user?.id || "" },
    { query: { enabled: !!user?.id, queryKey: getGetDashboardSummaryQueryKey({ userId: user?.id || "" }) } }
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl font-bold tracking-tight">Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'}, {user?.name?.split(' ')[0]}</h1>
          <p className="text-muted-foreground mt-1">Here is your wellness overview for today.</p>
        </motion.div>
        
        {summary?.alertsCount ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 bg-destructive/10 text-destructive px-4 py-2 rounded-full text-sm font-medium"
          >
            <AlertCircle className="w-4 h-4" />
            {summary.alertsCount} action item{summary.alertsCount > 1 ? 's' : ''} require attention
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium"
          >
            <ShieldCheck className="w-4 h-4" />
            All clear
          </motion.div>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <motion.div variants={itemVariants}>
            <Card className="hover-elevate overflow-hidden border-none shadow-sm bg-gradient-to-br from-card to-card/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Analyses</CardTitle>
                <Activity className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{summary?.totalAnalyses || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">+1 this week</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="hover-elevate overflow-hidden border-none shadow-sm bg-gradient-to-br from-card to-card/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Reports Analyzed</CardTitle>
                <FileText className="h-4 w-4 text-secondary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{summary?.reportsAnalyzed || 0}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="hover-elevate overflow-hidden border-none shadow-sm bg-gradient-to-br from-card to-card/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Images Processed</CardTitle>
                <ImageIcon className="h-4 w-4 text-accent-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{summary?.imagesAnalyzed || 0}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="hover-elevate overflow-hidden border-none shadow-sm bg-gradient-to-br from-card to-card/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Diet Plans</CardTitle>
                <Apple className="h-4 w-4 text-chart-4" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{summary?.dietPlansGenerated || 0}</div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="lg:col-span-2 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight">Recent Activity</h2>
            <Link href="/history">
              <Button variant="ghost" size="sm" className="text-primary">
                View all <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          
          <Card className="border-border/50 shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : !summary?.recentActivity?.length ? (
              <div className="p-12 text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center text-secondary mb-4">
                  <Activity className="w-8 h-8" />
                </div>
                <h3 className="font-semibold text-lg">No recent activity</h3>
                <p className="text-muted-foreground mt-2 max-w-sm mb-6">
                  You haven't run any health analyses yet. Upload a report or an image to get started.
                </p>
                <div className="flex gap-4">
                  <Link href="/report-analyzer">
                    <Button variant="outline">Analyze Report</Button>
                  </Link>
                  <Link href="/image-analysis">
                    <Button>Analyze Image</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {summary.recentActivity.slice(0, 5).map((item) => (
                  <div key={item.id} className="p-4 flex items-start gap-4 hover:bg-muted/50 transition-colors">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 
                      ${item.type === 'report' ? 'bg-secondary/10 text-secondary' : 
                        item.type === 'image' ? 'bg-accent text-accent-foreground' : 
                        'bg-chart-4/10 text-chart-4'}`}
                    >
                      {item.type === 'report' ? <FileText className="w-5 h-5" /> :
                       item.type === 'image' ? <ImageIcon className="w-5 h-5" /> : 
                       <Apple className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-medium text-foreground truncate">{item.title}</h4>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{item.summary}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          <h2 className="text-xl font-bold tracking-tight">Quick Actions</h2>
          <div className="grid gap-3">
            <Link href="/report-analyzer">
              <Card className="hover-elevate cursor-pointer border-border/50 transition-colors hover:border-primary/50 group">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium group-hover:text-primary transition-colors">Upload Report</h4>
                    <p className="text-xs text-muted-foreground">PDF or image</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/image-analysis">
              <Card className="hover-elevate cursor-pointer border-border/50 transition-colors hover:border-secondary/50 group">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium group-hover:text-secondary transition-colors">Analyze Face</h4>
                    <p className="text-xs text-muted-foreground">Wellness hints</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/diet-plan">
              <Card className="hover-elevate cursor-pointer border-border/50 transition-colors hover:border-chart-4/50 group">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-chart-4/10 flex items-center justify-center text-chart-4 group-hover:scale-110 transition-transform">
                    <Apple className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium group-hover:text-chart-4 transition-colors">Get Diet Plan</h4>
                    <p className="text-xs text-muted-foreground">AI recommendations</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
