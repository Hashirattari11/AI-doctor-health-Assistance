import { Router, type IRouter } from "express";
import webpush from "web-push";
import { db } from "@workspace/db";
import { pushSubscriptionsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { SubscribePushBody, UnsubscribePushBody } from "@workspace/api-zod";

const router: IRouter = Router();

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY!;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY!;
const VAPID_EMAIL = process.env.VAPID_EMAIL ?? "admin@lumina-health.app";

webpush.setVapidDetails(`mailto:${VAPID_EMAIL}`, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

router.get("/notifications/vapid-public-key", (_req, res): void => {
  res.json({ publicKey: VAPID_PUBLIC_KEY });
});

router.post("/notifications/subscribe", async (req, res): Promise<void> => {
  const parsed = SubscribePushBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation error", message: parsed.error.message });
    return;
  }

  const { endpoint, p256dh, auth, userId } = parsed.data;

  await db
    .insert(pushSubscriptionsTable)
    .values({ endpoint, p256dh, auth, userId: userId ?? null })
    .onConflictDoUpdate({
      target: pushSubscriptionsTable.endpoint,
      set: { p256dh, auth, userId: userId ?? null },
    });

  req.log.info({ endpoint: endpoint.substring(0, 40) }, "Push subscription saved");
  res.json({ success: true, message: "Subscribed to push notifications" });
});

router.post("/notifications/unsubscribe", async (req, res): Promise<void> => {
  const parsed = UnsubscribePushBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation error", message: parsed.error.message });
    return;
  }

  await db
    .delete(pushSubscriptionsTable)
    .where(eq(pushSubscriptionsTable.endpoint, parsed.data.endpoint));

  res.json({ success: true, message: "Unsubscribed from push notifications" });
});

export async function sendPushToUser(userId: string, payload: object): Promise<void> {
  const subs = await db
    .select()
    .from(pushSubscriptionsTable)
    .where(eq(pushSubscriptionsTable.userId, userId));

  await Promise.allSettled(
    subs.map((sub) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify(payload)
      )
    )
  );
}

export default router;
