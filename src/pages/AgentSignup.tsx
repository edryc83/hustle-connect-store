import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import AfristallLogo from "@/components/AfristallLogo";
import { toast } from "sonner";

export default function AgentSignup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const slugify = (text: string) =>
    text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

  const handleSignup = async () => {
    if (!firstName.trim()) { toast.error("First name is required"); return; }
    if (!email.trim()) { toast.error("Email is required"); return; }
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (password !== confirmPassword) { toast.error("Passwords don't match"); return; }

    setLoading(true);
    try {
      // 0. Check slug uniqueness
      const slug = slugify(firstName);
      if (!slug) { toast.error("Please enter a valid name"); setLoading(false); return; }

      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("store_slug", slug)
        .maybeSingle();

      let finalSlug = slug;
      if (existing) {
        // Append random suffix if taken
        finalSlug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
        toast.info(`Username "${slug}" was taken, using "${finalSlug}" instead.`);
      }

      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      if (authError) {
        const msg = authError.message?.toLowerCase() || "";
        if (msg.includes("already registered") || msg.includes("duplicate")) {
          toast.error("This email already has an account. Try logging in.");
        } else {
          toast.error(authError.message);
        }
        return;
      }
      if (!authData.user) throw new Error("Signup failed");

      const userId = authData.user.id;

      // 2. Update profile with agent's name
      await supabase.from("profiles").update({
        first_name: firstName.trim(),
        store_name: `${firstName.trim()}'s Referrals`,
        store_slug: finalSlug,
      } as any).eq("id", userId);

      // 3. Assign agent role
      await (supabase.from("user_roles" as any) as any).insert({
        user_id: userId,
        role: "agent",
      });

      toast.success("Welcome to the Agent Programme! 🎉");
      navigate("/agent");
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-8 bg-background">
      <div className="pointer-events-none absolute -top-32 -left-20 h-[400px] w-[400px] rounded-full bg-primary/8 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-32 right-0 h-[350px] w-[350px] rounded-full bg-primary/6 blur-[80px]" />

      <Link to="/agents" className="relative z-10 mb-6 flex items-center gap-2">
        <AfristallLogo />
        <span className="text-xl font-extrabold tracking-tight">
          Afri<span className="text-primary">stall</span>
        </span>
      </Link>

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl p-6 shadow-lg">
        <div className="text-center mb-5">
          <span className="inline-block rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-3">
            Agent Programme
          </span>
          <h1 className="text-xl font-bold text-foreground">Become an Agent</h1>
          <p className="text-sm text-muted-foreground mt-1">Create your free agent account</p>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="firstName">First name</Label>
            <Input id="firstName" placeholder="e.g. Aisha" value={firstName} onChange={(e) => setFirstName(e.target.value)} maxLength={30} className="h-11" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email address</Label>
            <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className="h-11" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input id="password" type={showPassword ? "text" : "password"} placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" className="h-11" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input id="confirmPassword" type={showPassword ? "text" : "password"} placeholder="Repeat password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" className="h-11" />
          </div>

          <Button className="w-full h-11 gap-2 text-sm font-semibold mt-1" onClick={handleSignup} disabled={loading}>
            {loading ? "Creating account..." : "Create Agent Account"} {!loading && <ArrowRight className="h-4 w-4" />}
          </Button>

          <p className="text-center text-xs text-muted-foreground mt-4">
            Already an agent?{" "}
            <Link to="/agent-login" className="font-medium text-primary hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
