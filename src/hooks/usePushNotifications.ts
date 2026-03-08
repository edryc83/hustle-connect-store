import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    const isSupported = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
    setSupported(isSupported);
    if (isSupported) {
      setPermission(Notification.permission);
      checkSubscription();
    }
  }, [user]);

  const checkSubscription = async () => {
    if (!("serviceWorker" in navigator) || !user) return;
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      setIsSubscribed(!!sub);
    } catch {
      setIsSubscribed(false);
    }
  };

  const subscribe = useCallback(async () => {
    if (!user || !supported) return false;

    setLoading(true);
    try {
      // Get VAPID public key from edge function
      const { data: keyData, error: keyError } = await supabase.functions.invoke(
        "push-notifications",
        { body: { action: "get-key" } }
      );

      if (keyError || !keyData?.publicKey) {
        console.error("Failed to get VAPID key:", keyError);
        setLoading(false);
        return false;
      }

      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") {
        setLoading(false);
        return false;
      }

      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(keyData.publicKey),
      });

      // Save subscription to database via edge function
      await supabase.functions.invoke("push-notifications", {
        body: {
          action: "subscribe",
          user_id: user.id,
          subscription: subscription.toJSON(),
        },
      });

      setIsSubscribed(true);
      setLoading(false);
      return true;
    } catch (err) {
      console.error("Push subscription failed:", err);
      setLoading(false);
      return false;
    }
  }, [user, supported]);

  const unsubscribe = useCallback(async () => {
    if (!("serviceWorker" in navigator)) return;
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await sub.unsubscribe();
        if (user) {
          await supabase
            .from("push_subscriptions")
            .delete()
            .eq("user_id", user.id)
            .eq("endpoint", sub.endpoint);
        }
      }
      setIsSubscribed(false);
    } catch (err) {
      console.error("Unsubscribe failed:", err);
    }
  }, [user]);

  return { permission, isSubscribed, loading, supported, subscribe, unsubscribe };
}
