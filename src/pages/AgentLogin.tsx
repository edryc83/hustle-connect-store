import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import AfristallLogo from "@/components/AfristallLogo";
import { toast } from "sonner";

export default function AgentLogin() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // If already logged in, check agent role and redirect
  useState(() => {
    if (user) {
      supabase
        .from("user_roles" as any)
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "agent")
        .maybeSingle()
        .then(({ data }) => {
          if (data) navigate("/agent", { replace: true });
        });
    }
  });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleForgotPassword = async () => {
    if (!email.trim()) { toast.error("Enter your email first"); return; }
    setForgotLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("Check your email for a reset link! 📧");
      setForgotMode(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset email");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email.trim()) { toast.error("Email is required"); return; }
    if (!password) { toast.error("Password is required"); return; }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;

      // Verify agent role
      const { data: roleData } = await (supabase
        .from("user_roles" as any)
        .select("role")
        .eq("user_id", data.user.id)
        .eq("role", "agent")
        .maybeSingle() as any);

      if (!roleData) {
        await supabase.auth.signOut();
        toast.error("This account does not have agent access.");
        return;
      }

      toast.success("Welcome back! 👋");
      navigate("/agent");
    } catch (error: any) {
      toast.error(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 bg-background">
      <div className="pointer-events-none absolute -top-32 -left-20 h-[400px] w-[400px] rounded-full bg-primary/8 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-32 right-0 h-[350px] w-[350px] rounded-full bg-primary/6 blur-[80px]" />

      <Link to="/" className="relative z-10 mb-8 flex items-center gap-2">
        <AfristallLogo />
        <span className="text-xl font-extrabold tracking-tight">
          Afri<span className="text-primary">stall</span>
        </span>
      </Link>

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-6 shadow-sm">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-foreground">Agent Portal</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to your agent account</p>
        </div>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email address</Label>
            <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          {!forgotMode ? (
            <>
              <div className="flex justify-end">
                <button type="button" onClick={() => setForgotMode(true)} className="text-xs text-primary hover:underline">
                  Forgot password?
                </button>
              </div>
              <Button className="w-full shadow-sm shadow-primary/20" onClick={handleLogin} disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </>
          ) : (
            <>
              <Button className="w-full shadow-sm shadow-primary/20" onClick={handleForgotPassword} disabled={forgotLoading}>
                {forgotLoading ? "Sending…" : "Send Reset Link"}
              </Button>
              <button type="button" onClick={() => setForgotMode(false)} className="w-full text-sm text-muted-foreground hover:text-foreground text-center">
                Back to sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
