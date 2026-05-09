import { useState, useEffect, useCallback } from "react";
import { useSubscribePush, useUnsubscribePush } from "@workspace/api-client-react";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export type NotificationPermission = "default" | "granted" | "denied" | "unsupported";

export function useNotifications(userId?: string) {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [vapidKey, setVapidKey] = useState<string | null>(null);

  const subscribeMutation = useSubscribePush();
  const unsubscribeMutation = useUnsubscribePush();

  const isSupported =
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window;

  useEffect(() => {
    if (!isSupported) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission as NotificationPermission);
  }, [isSupported]);

  useEffect(() => {
    fetch("/api/notifications/vapid-public-key")
      .then((r) => r.json())
      .then((d) => setVapidKey(d.publicKey))
      .catch(() => {});
  }, []);

  const checkSubscription = useCallback(async () => {
    if (!isSupported) return;
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      setSubscribed(!!sub);
    } catch {}
  }, [isSupported]);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  const subscribe = useCallback(async () => {
    if (!isSupported || !vapidKey) return;
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const perm = await Notification.requestPermission();
      setPermission(perm as NotificationPermission);
      if (perm !== "granted") return;

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      const json = sub.toJSON();
      await subscribeMutation.mutateAsync({
        data: {
          endpoint: json.endpoint!,
          p256dh: (json.keys as Record<string, string>).p256dh,
          auth: (json.keys as Record<string, string>).auth,
          userId: userId,
        },
      });
      setSubscribed(true);
    } catch (e) {
      console.error("Push subscribe failed:", e);
    } finally {
      setLoading(false);
    }
  }, [isSupported, vapidKey, userId, subscribeMutation]);

  const unsubscribe = useCallback(async () => {
    if (!isSupported) return;
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await unsubscribeMutation.mutateAsync({ data: { endpoint: sub.endpoint } });
        await sub.unsubscribe();
        setSubscribed(false);
      }
    } catch (e) {
      console.error("Push unsubscribe failed:", e);
    } finally {
      setLoading(false);
    }
  }, [isSupported, unsubscribeMutation]);

  return { permission, subscribed, loading, isSupported, subscribe, unsubscribe };
}
