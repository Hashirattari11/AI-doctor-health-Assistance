import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Activity, ArrowRight, ShieldCheck, Zap, Brain } from "lucide-react";

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, setLocation]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-background text-foreground flex flex-col">
      {/* Animated gradient blobs */}
      <div className="gradient-blob gradient-blob-1"></div>
      <div className="gradient-blob gradient-blob-2"></div>

      <header className="px-6 py-4 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <Activity className="w-8 h-8 text-primary" />
          <span className="font-bold text-xl tracking-tight">Lumina Health</span>
        </div>
        <div className="flex gap-4">
          <Link href="/login">
            <Button variant="ghost" className="font-medium">Sign In</Button>
          </Link>
          <Link href="/register">
            <Button className="font-medium rounded-full px-6 shadow-lg shadow-primary/20">Get Started</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center relative z-10 px-6 pb-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4"
          >
            <Brain className="w-4 h-4" />
            <span>Intelligent Health Companion</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            className="text-5xl md:text-7xl font-bold tracking-tight text-balance leading-tight"
          >
            Understand your body with <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              calm confidence.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            A premium AI health assistant that analyzes medical reports and provides personalized wellness guidance. Private, secure, and always there for you.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
            className="pt-8 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/register">
              <Button size="lg" className="h-14 px-8 text-base rounded-full shadow-xl shadow-primary/20 hover:scale-105 transition-transform w-full sm:w-auto">
                Start Your Journey <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="pt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left border-t border-border/50 mt-12"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg">Report Analysis</h3>
              <p className="text-muted-foreground text-sm">Upload medical reports and get clear, jargon-free explanations of your results.</p>
            </div>
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary mb-4">
                <User className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg">Visual Wellness</h3>
              <p className="text-muted-foreground text-sm">Scan physical wellness hints through private facial and body analysis.</p>
            </div>
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center text-accent-foreground mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg">Private & Secure</h3>
              <p className="text-muted-foreground text-sm">Your health data is encrypted and completely private. Never shared without consent.</p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

// Need to import missing icons
import { FileText, User } from "lucide-react";
