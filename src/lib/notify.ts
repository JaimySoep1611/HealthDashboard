import { prisma } from "@/lib/prisma";
import { getWebPush } from "@/lib/webPush";

type Subscription = { id: string; endpoint: string; p256dh: string; auth: string };

// Shared by the cron routes that send push notifications — sends to every
// subscription, cleaning up any that Apple/Google/etc. report as gone
// (404/410) rather than leaving them to fail silently forever.
export async function sendPushToSubscriptions(
  subscriptions: Subscription[],
  payload: string
): Promise<{ notified: number; removed: number }> {
  const webpush = getWebPush();
  let notified = 0;
  let removed = 0;

  for (const subscription of subscriptions) {
    try {
      await webpush.sendNotification(
        { endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth } },
        payload
      );
      notified++;
    } catch (error) {
      const statusCode = (error as { statusCode?: number }).statusCode;
      if (statusCode === 404 || statusCode === 410) {
        await prisma.pushSubscription.delete({ where: { id: subscription.id } }).catch(() => {});
        removed++;
      }
    }
  }

  return { notified, removed };
}
