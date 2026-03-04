import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Phone, Eye, EyeOff } from "lucide-react";
import AfristallLogo from "@/components/AfristallLogo";
import EmojiGrid from "@/components/landing/EmojiGrid";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const COUNTRY_CODES = [
  { code: "+256", country: "🇺🇬 Uganda" },
  { code: "+254", country: "🇰🇪 Kenya" },
  { code: "+234", country: "🇳🇬 Nigeria" },
  { code: "+233", country: "🇬🇭 Ghana" },
  { code: "+255", country: "🇹🇿 Tanzania" },
  { code: "+250", country: "🇷🇼 Rwanda" },
  { code: "+27", country: "🇿🇦 South Africa" },
  { code: "+1", country: "🇺🇸 USA" },
  { code: "+44", country: "🇬🇧 UK" },
];

const Login = () => {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneCountryCode, setPhoneCountryCode] = useState("+256");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (authMode === "email" && !email.trim()) {
      toast.error("Email is required");
      return;
    }
    if (authMode === "phone" && !phone.trim()) {
      toast.error("Phone number is required");
      return;
    }
    if (!password) {
      toast.error("Password is required");
      return;
    }

    setLoading(true);
    try {
      let error;
      if (authMode === "email") {
        const result = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        error = result.error;
      } else {
        const result = await supabase.auth.signInWithPassword({
          phone: phoneCountryCode + phone.replace(/^0+/, ""),
          password,
        });
        error = result.error;
      }
      if (error) throw error;

      toast.success("Welcome back! 👋");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 overflow-hidden">
      {/* Background effects */}
      <EmojiGrid />
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
          <h1 className="text-xl font-bold text-foreground">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to manage your store</p>
        </div>
        <div className="space-y-4">
          <div className="flex gap-1 rounded-lg bg-muted p-1">
            <button
              type="button"
              onClick={() => setAuthMode("email")}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-sm font-medium transition-colors ${
                authMode === "email"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              <Mail className="h-4 w-4" /> Email
            </button>
            <button
              type="button"
              onClick={() => setAuthMode("phone")}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-sm font-medium transition-colors ${
                authMode === "phone"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              <Phone className="h-4 w-4" /> Phone
            </button>
          </div>

          {authMode === "email" ? (
            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone number</Label>
              <div className="flex gap-2">
                <Select value={phoneCountryCode} onValueChange={setPhoneCountryCode}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRY_CODES.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.country} {c.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="7XX XXX XXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          )}

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
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button className="w-full shadow-sm shadow-primary/20" onClick={handleLogin} disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="font-medium text-primary hover:underline">
              Create your store
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
