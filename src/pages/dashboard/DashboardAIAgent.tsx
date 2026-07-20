import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Facebook, MessageSquare, Sparkles, Trash2, Zap, Send } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

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
  const [availablePages, setAvailablePages] = useState<any[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedPageIds, setSelectedPageIds] = useState<string[]>([]);
  const [fbShortToken, setFbShortToken] = useState<string | null>(null);
  const [saving2, setSaving2] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testQuestion, setTestQuestion] = useState("How much is your cheapest item?");
  const [testAnswer, setTestAnswer] = useState("");
  const [testing, setTesting] = useState(false);

  // Autopilot state
  const [autopilot, setAutopilot] = useState<any>({
    enabled: false,
    post_times: ["09:00", "13:00", "18:00"],
    tone: "friendly",
    timezone: "Africa/Kampala",
  });
  const [savingAuto, setSavingAuto] = useState(false);
  const [postingNow, setPostingNow] = useState(false);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    loadFbSdk();
    (async () => {
      const [{ data: conns }, { data: s }, { data: a }, { data: posts }] = await Promise.all([
        supabase.from("meta_connections").select("*").eq("user_id", user.id),
        supabase.from("agent_settings").select("*").eq("user_id", user.id).maybeSingle(),
        (supabase.from("autopilot_settings" as any).select("*").eq("user_id", user.id).maybeSingle() as any),
        (supabase.from("scheduled_posts" as any).select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10) as any),
      ]);
      setConnections(conns || []);
      if (s) setSettings(s);
      if (a) setAutopilot({ ...autopilot, ...a });
      setRecentPosts(posts || []);
    })();
  }, [user]);

  const refreshPosts = async () => {
    if (!user) return;
    const { data } = await (supabase.from("scheduled_posts" as any)
      .select("*").eq("user_id", user.id)
      .order("created_at", { ascending: false }).limit(10) as any);
    setRecentPosts(data || []);
  };

  const saveAutopilot = async (patch: Partial<any> = {}) => {
    if (!user) return;
    setSavingAuto(true);
    const next = { ...autopilot, ...patch };
    setAutopilot(next);
    const { error } = await (supabase.from("autopilot_settings" as any).upsert({
      user_id: user.id,
      enabled: next.enabled,
      post_times: next.post_times,
      tone: next.tone,
      timezone: next.timezone,
    }, { onConflict: "user_id" }) as any);
    setSavingAuto(false);
    if (error) toast.error(error.message); else toast.success("Autopilot saved");
  };

  const postNow = async () => {
    if (!user) return;
    setPostingNow(true);
    try {
      const { data, error } = await supabase.functions.invoke("autopilot-run", {
        body: { manual: true, userId: user.id },
      });
      if (error) throw error;
      if ((data as any)?.status === "posted") toast.success(`Posted "${(data as any).product}"`);
      else toast.error((data as any)?.error || (data as any)?.failed || "Nothing to post");
      await refreshPosts();
    } catch (e: any) {
      toast.error(e.message || "Post failed");
    } finally {
      setPostingNow(false);
    }
  };

  const updateTime = (i: number, v: string) => {
    const next = [...autopilot.post_times];
    next[i] = v;
    setAutopilot({ ...autopilot, post_times: next });
  };

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
        body: { access_token: resp.authResponse.accessToken, action: "list" },
      });
      if (error) throw error;
      const pages = (data as any)?.pages || [];
      if (pages.length === 0) {
        toast.error("No Facebook Pages found on this account");
        return;
      }
      setFbShortToken(resp.authResponse.accessToken);
      setAvailablePages(pages);
      setSelectedPageIds(pages.length === 1 ? [pages[0].page_id] : []);
      setPickerOpen(true);
    } catch (e: any) {
      toast.error(e.message || "Connection failed");
    } finally {
      setConnecting(false);
    }
  };

  const confirmConnect = async () => {
    if (!fbShortToken || selectedPageIds.length === 0) return;
    setSaving2(true);
    try {
      const { data, error } = await supabase.functions.invoke("meta-oauth-connect", {
        body: { access_token: fbShortToken, action: "connect", page_ids: selectedPageIds },
      });
      if (error) throw error;
      toast.success(`Connected ${(data as any)?.connected?.length || 0} page(s)`);
      setPickerOpen(false);
      setAvailablePages([]);
      setSelectedPageIds([]);
      setFbShortToken(null);
      await refreshConnections();
    } catch (e: any) {
      toast.error(e.message || "Connection failed");
    } finally {
      setSaving2(false);
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
          <Sparkles className="h-6 w-6 text-primary" /> 24/7 Shop Assistant
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your AI shop manager: auto-posts products, replies to DMs and comments on Facebook &amp; Instagram — around the clock.
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

      {/* ===== Autopilot ===== */}
      <section className="rounded-xl border bg-card p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" /> Autopilot posting
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Automatically post one of your products to Facebook &amp; Instagram at set times each day.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm shrink-0">
            <Switch
              checked={!!autopilot.enabled}
              onCheckedChange={(v) => saveAutopilot({ enabled: v })}
              disabled={savingAuto || connections.length === 0}
            />
            <span className="text-muted-foreground">{autopilot.enabled ? "On" : "Off"}</span>
          </div>
        </div>

        {connections.length === 0 && (
          <div className="text-xs rounded-lg border border-dashed p-3 text-muted-foreground">
            Connect a Facebook Page first to enable autopilot.
          </div>
        )}

        <div className="grid gap-3">
          <div>
            <Label>Post times (24h, local time)</Label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {autopilot.post_times.map((t: string, i: number) => (
                <Input key={i} type="time" value={t} onChange={(e) => updateTime(i, e.target.value)} />
              ))}
            </div>
          </div>
          <div>
            <Label>Caption style</Label>
            <select
              className="w-full h-10 rounded-md border bg-background px-3 text-sm mt-1"
              value={autopilot.tone}
              onChange={(e) => setAutopilot({ ...autopilot, tone: e.target.value })}
            >
              <option value="friendly">Friendly</option>
              <option value="fun">Fun</option>
              <option value="professional">Professional</option>
              <option value="bold">Bold</option>
            </select>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => saveAutopilot()} disabled={savingAuto}>
              {savingAuto ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save schedule"}
            </Button>
            <Button variant="outline" onClick={postNow} disabled={postingNow || connections.length === 0} className="gap-2">
              {postingNow ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Post one now
            </Button>
          </div>
        </div>

        {recentPosts.length > 0 && (
          <div className="pt-3 border-t space-y-2">
            <div className="text-xs font-medium text-muted-foreground">Recent activity</div>
            <ul className="space-y-2">
              {recentPosts.map((p) => (
                <li key={p.id} className="flex items-start gap-3 rounded-lg border p-2 text-xs">
                  {p.image_url && (
                    <img src={p.image_url} alt="" className="h-12 w-12 rounded object-cover shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        p.status === "posted" ? "bg-green-500/10 text-green-600" :
                        p.status === "failed" ? "bg-destructive/10 text-destructive" :
                        "bg-muted text-muted-foreground"
                      }`}>{p.status}</span>
                      {p.slot && <span className="text-muted-foreground">{p.slot}</span>}
                      <span className="text-muted-foreground ml-auto">
                        {new Date(p.created_at).toLocaleString()}
                      </span>
                    </div>
                    {p.caption && <div className="mt-1 line-clamp-2 text-foreground/80">{p.caption}</div>}
                    {p.error && <div className="mt-1 text-destructive line-clamp-2">{p.error}</div>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
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