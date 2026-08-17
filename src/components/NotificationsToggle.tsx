"use client";

import { useEffect, useState } from "react";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

type Status = "checking" | "unsupported" | "off" | "on" | "denied";

export function NotificationsToggle() {
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window) || !VAPID_PUBLIC_KEY) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- support check runs once on mount, not reacting to external state
      setStatus("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setStatus("denied");
      return;
    }
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => registration.pushManager.getSubscription())
      .then((existing) => setStatus(existing ? "on" : "off"))
      .catch(() => setStatus("unsupported"));
  }, []);

  async function enable() {
    setStatus("checking");
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      setStatus(permission === "denied" ? "denied" : "off");
      return;
    }
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY!),
    });
    await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subscription.toJSON()),
    });
    setStatus("on");
  }

  async function disable() {
    setStatus("checking");
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await fetch("/api/push/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });
      await subscription.unsubscribe();
    }
    setStatus("off");
  }

  if (status === "unsupported") {
    return <p className="text-xs text-muted">Reminders aren&apos;t supported in this browser.</p>;
  }

  if (status === "denied") {
    return (
      <p className="text-xs text-muted">
        Notifications are blocked for this site — allow them in your browser/phone settings to enable reminders.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <p className="text-xs text-muted">
        Get a reminder in the evening if you haven&apos;t hit your water or steps goal yet that day.
      </p>
      <button
        onClick={status === "on" ? disable : enable}
        disabled={status === "checking"}
        className={`flex-none rounded-lg px-3 py-1.5 text-xs font-medium transition disabled:opacity-50 ${
          status === "on"
            ? "border border-border text-muted hover:border-red-400 hover:text-red-400"
            : "bg-navy text-white hover:bg-navy-light"
        }`}
      >
        {status === "on" ? "Enabled ✓ — tap to disable" : status === "checking" ? "…" : "Enable reminders"}
      </button>
    </div>
  );
}
