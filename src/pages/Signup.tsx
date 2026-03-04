import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail, Phone, Eye, EyeOff, ArrowRight, ArrowLeft, Upload, Check, MapPin, MessageCircle, Package, Wrench } from "lucide-react";
import AfristallLogo from "@/components/AfristallLogo";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CITIES = ["Kampala", "Nairobi", "Lagos", "Accra", "Dar es Salaam", "Kigali", "Other"];

const CATEGORIES = [
  { label: "Food & Drinks", icon: "🍲" },
  { label: "Fashion & Clothes", icon: "👗" },
  { label: "Beauty & Skincare", icon: "✨" },
  { label: "Phones & Electronics", icon: "📱" },
  { label: "Home & Decor", icon: "🏠" },
  { label: "Plants & Garden", icon: "🌿" },
  { label: "Other", icon: "📦" },
];

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

const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const Signup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1
  const [authMode, setAuthMode] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneCountryCode, setPhoneCountryCode] = useState("+256");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Step 2
  const [storeName, setStoreName] = useState("");
  const [storeSlug, setStoreSlug] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [businessType, setBusinessType] = useState<"product" | "service" | "both">("product");
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState("");

  // Step 3
  const [whatsappCountryCode, setWhatsappCountryCode] = useState("+256");
  const [whatsappNumber, setWhatsappNumber] = useState("");

  const handleStoreNameChange = (value: string) => {
    setStoreName(value);
    setStoreSlug(slugify(value));
  };

  const handleProfilePicture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image must be under 2MB");
        return;
      }
      setProfilePicture(file);
      setProfilePicturePreview(URL.createObjectURL(file));
    }
  };

  const validateStep1 = () => {
    if (authMode === "email" && !email.trim()) {
      toast.error("Email is required");
      return false;
    }
    if (authMode === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Enter a valid email");
      return false;
    }
    if (authMode === "phone" && !phone.trim()) {
      toast.error("Phone number is required");
      return false;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!storeName.trim()) {
      toast.error("Store name is required");
      return false;
    }
    if (!storeSlug.trim()) {
      toast.error("Store slug is required");
      return false;
    }
    if (!/^[a-z0-9-]+$/.test(storeSlug)) {
      toast.error("Slug can only contain lowercase letters, numbers, and hyphens");
      return false;
    }
    if (!city) {
      toast.error("Please select a city");
      return false;
    }
    if (!category) {
      toast.error("Please select a category");
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!whatsappNumber.trim()) {
      toast.error("WhatsApp number is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateStep3()) return;
    setLoading(true);

    try {
      const fullWhatsapp = whatsappCountryCode + whatsappNumber.replace(/^0+/, "");

      // Sign up with Supabase Auth
      let authData;
      let authError;

      if (authMode === "email") {
        const result = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        authData = result.data;
        authError = result.error;
      } else {
        const result = await supabase.auth.signUp({
          phone: phoneCountryCode + phone.replace(/^0+/, ""),
          password,
        });
        authData = result.data;
        authError = result.error;
      }

      if (authError) throw authError;
      if (!authData.user) throw new Error("Signup failed");

      // Upload profile picture if provided
      let profilePictureUrl = null;
      if (profilePicture) {
        const fileExt = profilePicture.name.split(".").pop();
        const filePath = `${authData.user.id}/avatar.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("store-images")
          .upload(filePath, profilePicture, { upsert: true });
        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from("store-images")
            .getPublicUrl(filePath);
          profilePictureUrl = urlData.publicUrl;
        }
      }

      // Update profile with store details
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          store_name: storeName.trim(),
          store_slug: storeSlug.trim(),
          city,
          category,
          whatsapp_number: fullWhatsapp,
          profile_picture_url: profilePictureUrl,
        })
        .eq("id", authData.user.id);

      if (profileError) throw profileError;

      toast.success("Welcome to Afristall! 🎉");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary/30 px-4 py-8">
      <Link to="/" className="mb-8 flex items-center gap-2">
        <AfristallLogo />
        <span className="text-xl font-extrabold tracking-tight">
          Afri<span className="text-primary">stall</span>
        </span>
      </Link>

      {/* Progress indicator */}
      <div className="mb-6 flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                step >= s
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {step > s ? <Check className="h-4 w-4" /> : s}
            </div>
            {s < 3 && (
              <div className={`h-0.5 w-8 sm:w-12 ${step > s ? "bg-primary" : "bg-muted"}`} />
            )}
          </div>
        ))}
      </div>

      <Card className="w-full max-w-md">
        {/* STEP 1 — Account */}
        {step === 1 && (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Create your account</CardTitle>
              <CardDescription>Sign up with your email or phone number</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Toggle email/phone */}
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
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
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

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>

              <Button
                className="w-full gap-2"
                onClick={() => validateStep1() && setStep(2)}
              >
                Next <ArrowRight className="h-4 w-4" />
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="font-medium text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </CardContent>
          </>
        )}

        {/* STEP 2 — Store Setup */}
        {step === 2 && (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Set up your store</CardTitle>
              <CardDescription>Tell us about what you sell</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="storeName">Store name</Label>
                <Input
                  id="storeName"
                  placeholder="e.g. Mama Aisha's Kitchen"
                  value={storeName}
                  onChange={(e) => handleStoreNameChange(e.target.value)}
                  maxLength={60}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="storeSlug">Store URL</Label>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">afristall.com/</span>
                  <Input
                    id="storeSlug"
                    placeholder="my-store"
                    value={storeSlug}
                    onChange={(e) => setStoreSlug(slugify(e.target.value))}
                    maxLength={40}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>City</Label>
                <Select value={city} onValueChange={setCity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your city" />
                  </SelectTrigger>
                  <SelectContent>
                    {CITIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" /> {c}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Profile picture</Label>
                <div className="flex items-center gap-3">
                  {profilePicturePreview ? (
                    <img
                      src={profilePicturePreview}
                      alt="Store profile"
                      className="h-14 w-14 rounded-full object-cover border"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                      <Upload className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <label className="cursor-pointer">
                    <span className="text-sm font-medium text-primary hover:underline">
                      {profilePicture ? "Change photo" : "Upload photo"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleProfilePicture}
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>What type of business?</Label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { value: "product" as const, label: "Products", icon: Package, emoji: "📦" },
                    { value: "service" as const, label: "Services", icon: Wrench, emoji: "🔧" },
                    { value: "both" as const, label: "Both", icon: Package, emoji: "📦🔧" },
                  ]).map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setBusinessType(t.value)}
                      className={`flex flex-col items-center gap-1 rounded-lg border-2 p-3 text-center transition-colors ${
                        businessType === t.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      <span className="text-xl">{t.emoji}</span>
                      <span className="text-xs font-medium">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>What do you sell?</Label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.label}
                      type="button"
                      onClick={() => setCategory(cat.label)}
                      className={`flex flex-col items-center gap-1 rounded-lg border-2 p-3 text-center transition-colors ${
                        category === cat.label
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      <span className="text-2xl">{cat.icon}</span>
                      <span className="text-xs font-medium leading-tight">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)} className="gap-1">
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <Button
                  className="flex-1 gap-2"
                  onClick={() => validateStep2() && setStep(3)}
                >
                  Next <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </>
        )}

        {/* STEP 3 — WhatsApp */}
        {step === 3 && (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-xl flex items-center justify-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                Connect WhatsApp
              </CardTitle>
              <CardDescription>
                This is where your orders will be sent. Make sure this number is correct.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-primary/5 border border-primary/10 p-3 text-sm text-muted-foreground">
                💡 This can be different from your login. For example, you might sign in with email but receive orders on your Ugandan WhatsApp number.
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="whatsapp">WhatsApp number</Label>
                <div className="flex gap-2">
                  <Select value={whatsappCountryCode} onValueChange={setWhatsappCountryCode}>
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
                    id="whatsapp"
                    type="tel"
                    placeholder="7XX XXX XXX"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)} className="gap-1">
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <Button
                  className="flex-1 gap-2"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? "Creating your store..." : "Create My Store 🎉"}
                </Button>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
};

export default Signup;
