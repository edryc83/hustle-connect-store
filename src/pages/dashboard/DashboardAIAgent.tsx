import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Facebook, MessageSquare, Sparkles, Trash2 } from "lucide-react";

const META_APP_ID = "909108912234825";
const SCOPES = [
  "pages_show_list",
  "pages_messaging",
  "pages_manage_metadata",
  "pages_read_engagement",
  "instagram_basic",
  "instagram_manage_messages",
].join(",");

declare global {
  interface Window {
    FB?: any;
    fbAsyncInit?: () => void;
  }
}

function loadFbSdk() {
  return new Promise<void>((resolve) => {
    if (window.FB) return resolve();
    window.fbAsyncInit = () => {
      window.FB.init({ appId: META_APP_ID, cookie: true, xfbml: false, version: "v19.0" });
      resolve();
    };
    const s = document.createElement("script");
    s.src = "https://connect.facebook.net/en_US/sdk.js";
    s.async = true; s.defer = true; s.crossOrigin = "anonymous";
    document.body.appendChild(s);
  });
}

export default function DashboardAIAgent() {
  const { user } = useAuth();
  const [connections, setConnections] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({
    agent_name: "Concierge",
    tone: "friendly, concise, professional",
    welcome_message: "Hi! How can I help you today?",
    fallback_message: "Let me check with the shop owner and get back to you shortly.",
    auto_reply_enabled: true,
  });
  const [connecting, setConnecting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testQuestion, setTestQuestion] = useState("How much is your cheapest item?");
  const [testAnswer, setTestAnswer] = useState("");
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadFbSdk();
    (async () => {
      const [{ data: conns }, { data: s }] = await Promise.all([
        supabase.from("meta_connections").select("*").eq("user_id", user.id),
        supabase.from("agent_settings").select("*").eq("user_id", user.id).maybeSingle(),
      ]);
      setConnections(conns || []);
      if (s) setSettings(s);
    })();
  }, [user]);

  const refreshConnections = async () => {
    if (!user) return;
    const { data } = await supabase.from("meta_connections").select("*").eq("user_id", user.id);
    setConnections(data || []);
  };

  const handleConnect = async () => {
    setConnecting(true);
    try {
      await loadFbSdk();
      const resp: any = await new Promise((resolve) =>
        window.FB.login(resolve, { scope: SCOPES }),
      );
      if (!resp?.authResponse?.accessToken) {
        toast.error("Facebook login cancelled");
        return;
      }
      const { data, error } = await supabase.functions.invoke("meta-oauth-connect", {
        body: { access_token: resp.authResponse.accessToken },
      });
      if (error) throw error;
      toast.success(`Connected ${data?.connected?.length || 0} page(s)`);
      await refreshConnections();
    } catch (e: any) {
      toast.error(e.message || "Connection failed");
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async (id: string) => {
    await supabase.from("meta_connections").update({ is_active: false }).eq("id", id);
    await refreshConnections();
  };

  const saveSettings = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("agent_settings").upsert({
      user_id: user.id,
      agent_name: settings.agent_name,
      tone: settings.tone,
      welcome_message: settings.welcome_message,
      fallback_message: settings.fallback_message,
      auto_reply_enabled: settings.auto_reply_enabled,
    }, { onConflict: "user_id" });
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Saved");
  };

  const runTest = async () => {
    if (!user || !testQuestion.trim()) return;
    setTesting(true); setTestAnswer("");
    try {
      const { data, error } = await supabase.functions.invoke("meta-agent-test", {
        body: { question: testQuestion },
      });
      if (error) throw error;
      setTestAnswer(data?.reply || "(no reply)");
    } catch (e: any) {
      toast.error(e.message || "Test failed");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" /> AI Concierge
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Auto-reply to Facebook Page &amp; Instagram DMs using your product catalog.
        </p>
      </div>

      <section className="rounded-xl border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold flex items-center gap-2"><Facebook className="h-4 w-4" /> Connected accounts</h2>
            <p className="text-xs text-muted-foreground">Link the Facebook Page (and its Instagram Business account).</p>
          </div>
          <Button onClick={handleConnect} disabled={connecting}>
            {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Connect Facebook"}
          </Button>
        </div>

        {connections.length === 0 ? (
          <div className="text-sm text-muted-foreground py-6 text-center border border-dashed rounded-lg">
            No pages connected yet.
          </div>
        ) : (
          <ul className="space-y-2">
            {connections.map((c) => (
              <li key={c.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                <div className="text-sm">
                  <div className="font-medium">Page ID: {c.page_id}</div>
                  <div className="text-xs text-muted-foreground">
                    {c.platform} {c.ig_account_id ? `• IG ${c.ig_account_id}` : ""} • {c.is_active ? "Active" : "Disabled"}
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDisconnect(c.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Agent personality</h2>
          <div className="flex items-center gap-2 text-sm">
            <Switch
              checked={settings.auto_reply_enabled}
              onCheckedChange={(v) => setSettings({ ...settings, auto_reply_enabled: v })}
            />
            <span className="text-muted-foreground">Auto-reply</span>
          </div>
        </div>
        <div className="grid gap-3">
          <div>
            <Label>Agent name</Label>
            <Input value={settings.agent_name || ""} onChange={(e) => setSettings({ ...settings, agent_name: e.target.value })} />
          </div>
          <div>
            <Label>Tone</Label>
            <Input value={settings.tone || ""} onChange={(e) => setSettings({ ...settings, tone: e.target.value })} />
          </div>
          <div>
            <Label>Welcome message</Label>
            <Textarea rows={2} value={settings.welcome_message || ""} onChange={(e) => setSettings({ ...settings, welcome_message: e.target.value })} />
          </div>
          <div>
            <Label>Fallback message</Label>
            <Textarea rows={2} value={settings.fallback_message || ""} onChange={(e) => setSettings({ ...settings, fallback_message: e.target.value })} />
          </div>
          <Button onClick={saveSettings} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save settings"}
          </Button>
        </div>
      </section>

      <section className="rounded-xl border bg-card p-5 space-y-3">
        <h2 className="font-semibold flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Test playground</h2>
        <p className="text-xs text-muted-foreground">Simulate a customer question using your live catalog.</p>
        <Textarea rows={2} value={testQuestion} onChange={(e) => setTestQuestion(e.target.value)} />
        <Button onClick={runTest} disabled={testing}>
          {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ask concierge"}
        </Button>
        {testAnswer && (
          <div className="rounded-lg bg-muted p-3 text-sm whitespace-pre-wrap">{testAnswer}</div>
        )}
      </section>
    </div>
  );
}