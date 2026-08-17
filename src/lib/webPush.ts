import webpush from "web-push";

let configured = false;

// Lazy so a missing key doesn't crash routes that don't need push (e.g. during
// local dev without the VAPID env vars set).
export function getWebPush() {
  if (!configured) {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    const subject = process.env.VAPID_SUBJECT ?? "mailto:noreply@example.com";
    if (!publicKey || !privateKey) {
      throw new Error("VAPID keys are not configured");
    }
    webpush.setVapidDetails(subject, publicKey, privateKey);
    configured = true;
  }
  return webpush;
}
