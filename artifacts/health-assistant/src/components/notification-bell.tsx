import { Bell, BellOff, BellRing, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNotifications } from "@/hooks/use-notifications";
import { useAuth } from "@/hooks/use-auth";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function NotificationBell() {
  const { user } = useAuth();
  const { permission, subscribed, loading, isSupported, subscribe, unsubscribe } =
    useNotifications(user?.id);

  if (!isSupported) return null;

  const handleToggle = () => {
    if (subscribed) {
      unsubscribe();
    } else {
      subscribe();
    }
  };

  const label = subscribed
    ? "Notifications on — click to turn off"
    : permission === "denied"
    ? "Notifications blocked in browser"
    : "Enable health notifications";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggle}
          disabled={loading || permission === "denied"}
          className={cn(
            "relative",
            subscribed && "text-primary hover:text-primary"
          )}
          aria-label={label}
        >
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Loader2 className="w-4 h-4 animate-spin" />
              </motion.div>
            ) : subscribed ? (
              <motion.div
                key="on"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <BellRing className="w-4 h-4" />
              </motion.div>
            ) : permission === "denied" ? (
              <motion.div key="off" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <BellOff className="w-4 h-4 text-muted-foreground" />
              </motion.div>
            ) : (
              <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Bell className="w-4 h-4" />
              </motion.div>
            )}
          </AnimatePresence>
          {subscribed && (
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  );
}
