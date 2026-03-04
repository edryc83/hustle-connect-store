import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ArrowRight, ArrowLeft, Upload, Check, MapPin, MessageCircle, ExternalLink } from "lucide-react";
import EmojiGrid from "@/components/landing/EmojiGrid";
import AfristallLogo from "@/components/AfristallLogo";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CategoryPicker, type CategorySelection, serializeCategories } from "@/components/CategoryPicker";

const CITIES = ["Kampala", "Nairobi", "Lagos", "Accra", "Dar es Salaam", "Kigali", "Other"];

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Step 2
  const [firstName, setFirstName] = useState("");
  const [storeName, setStoreName] = useState("");
  const [storeSlug, setStoreSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);
  const slugCheckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [city, setCity] = useState("");
  const [categorySelection, setCategorySelection] = useState<CategorySelection>({});
  const [businessType, setBusinessType] = useState<"product" | "service" | "both">("product");
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState("");

  // Step 3
  const [whatsappCountryCode, setWhatsappCountryCode] = useState("+256");
  const [whatsappNumber, setWhatsappNumber] = useState("");

  const checkSlugAvailability = (slug: string) => {
    if (slugCheckTimer.current) clearTimeout(slugCheckTimer.current);
    if (!slug || slug.length < 2) { setSlugAvailable(null); return; }
    setCheckingSlug(true);
    slugCheckTimer.current = setTimeout(async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id")
        .eq("store_slug", slug)
        .maybeSingle();
      setSlugAvailable(data === null);
      setCheckingSlug(false);
    }, 500);
  };

  const handleFirstNameChange = (value: string) => {
    setFirstName(value);
    if (!slugEdited) {
      const newSlug = slugify(value);
      setStoreSlug(newSlug);
      checkSlugAvailability(newSlug);
    }
  };

  const handleStoreNameChange = (value: string) => {
    setStoreName(value);
  };

  const handleSlugChange = (value: string) => {
    setSlugEdited(true);
    const newSlug = slugify(value);
    setStoreSlug(newSlug);
    checkSlugAvailability(newSlug);
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

  const handleBusinessTypeChange = (type: "product" | "service" | "both") => {
    setBusinessType(type);
    setCategorySelection({});
  };

  const validateStep1 = () => {
    if (!email.trim()) { toast.error("Email is required"); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast.error("Enter a valid email"); return false; }
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return false; }
    if (password !== confirmPassword) { toast.error("Passwords don't match"); return false; }
    return true;
  };

  const validateStep2 = () => {
    if (!firstName.trim()) { toast.error("First name is required"); return false; }
    if (!storeName.trim()) { toast.error("Store name is required"); return false; }
    if (!storeSlug.trim()) { toast.error("Store slug is required"); return false; }
    if (!/^[a-z0-9-]+$/.test(storeSlug)) { toast.error("Slug can only contain lowercase letters, numbers, and hyphens"); return false; }
    if (slugAvailable === false) { toast.error("This URL is already taken — try another"); return false; }
    if (Object.keys(categorySelection).length === 0) { toast.error("Please select at least one category"); return false; }
    return true;
  };

  const validateStep3 = () => {
    if (!whatsappNumber.trim()) {
      toast.error("WhatsApp number is required — buyers will contact you here");
      return false;
    }
    if (whatsappNumber.replace(/\D/g, "").length < 6) {
      toast.error("Enter a valid phone number");
      return false;
    }
    return true;
  };

  const getFullWhatsApp = () => {
    return whatsappCountryCode + whatsappNumber.replace(/^0+/, "").replace(/\D/g, "");
  };

  const testWhatsApp = () => {
    if (!whatsappNumber.trim()) {
      toast.error("Enter your WhatsApp number first");
      return;
    }
    const cleanNumber = getFullWhatsApp().replace(/^\+/, "");
    const testMessage = encodeURIComponent(
      `Hi! I'm interested in ordering from ${storeName || "your store"} on Afristall 🛒`
    );
    window.open(`https://wa.me/${cleanNumber}?text=${testMessage}`, "_blank");
  };

  const handleSubmit = async () => {
    if (!validateStep3()) return;
    setLoading(true);
    try {
      const fullWhatsapp = getFullWhatsApp();

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: window.location.origin },
      });

      if (authError) {
        const msg = authError.message?.toLowerCase() || "";
        if (msg.includes("already registered") || msg.includes("already been registered") || msg.includes("duplicate")) {
          toast.error("This email already has a store. Try signing in instead.");
          setStep(1);
        } else {
          toast.error(authError.message);
        }
        return;
      }
      if (!authData.user) throw new Error("Signup failed");

      // Check for fake signup (email exists but identities empty = already registered)
      if (authData.user.identities && authData.user.identities.length === 0) {
        toast.error("This email already has a store. Try signing in instead.");
        setStep(1);
        return;
      }

      let profilePictureUrl = null;
      if (profilePicture) {
        const fileExt = profilePicture.name.split(".").pop();
        const filePath = `${authData.user.id}/avatar.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("store-images")
          .upload(filePath, profilePicture, { upsert: true });
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from("store-images").getPublicUrl(filePath);
          profilePictureUrl = urlData.publicUrl;
        }
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          first_name: firstName.trim(),
          store_name: storeName.trim(),
          store_slug: storeSlug.trim(),
          city: city || null,
          category: serializeCategories(categorySelection),
          business_type: businessType,
          whatsapp_number: fullWhatsapp,
          profile_picture_url: profilePictureUrl,
        } as any)
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

  const categoryFilter = businessType === "service" ? "services"
    : businessType === "product" ? "products"
    : "all";

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-8 overflow-hidden">
      <EmojiGrid />
      <div className="pointer-events-none absolute -top-32 -left-20 h-[400px] w-[400px] rounded-full bg-primary/8 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-32 right-0 h-[350px] w-[350px] rounded-full bg-primary/6 blur-[80px]" />

      <Link to="/" className="relative z-10 mb-8 flex items-center gap-2">
        <AfristallLogo />
        <span className="text-xl font-extrabold tracking-tight">
          Afri<span className="text-primary">stall</span>
        </span>
      </Link>

      {/* Progress indicator */}
      <div className="relative z-10 mb-6 flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${
              step >= s ? "bg-primary text-primary-foreground" : "bg-muted/60 backdrop-blur-sm text-muted-foreground"
            }`}>
              {step > s ? <Check className="h-4 w-4" /> : s}
            </div>
            {s < 3 && <div className={`h-0.5 w-8 sm:w-12 ${step > s ? "bg-primary" : "bg-muted/60"}`} />}
          </div>
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-6 shadow-sm">
        {/* STEP 1 — Email */}
        {step === 1 && (
          <>
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-foreground">Create your account</h2>
              <p className="text-sm text-muted-foreground mt-1">Sign up with your email</p>
            </div>
            <div className="space-y-4">
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

              <Button className="w-full gap-2" onClick={() => validateStep1() && setStep(2)}>
                Next <ArrowRight className="h-4 w-4" />
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
              </p>
            </div>
          </>
        )}

        {/* STEP 2 — Store Setup */}
        {step === 2 && (
          <>
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-foreground">Set up your store</h2>
              <p className="text-sm text-muted-foreground mt-1">Tell us about what you sell</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  placeholder="e.g. Aisha"
                  value={firstName}
                  onChange={(e) => handleFirstNameChange(e.target.value)}
                  maxLength={30}
                />
                <p className="text-xs text-muted-foreground">Used for your store URL</p>
              </div>

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
                    onChange={(e) => handleSlugChange(e.target.value)}
                    maxLength={40}
                    className={slugAvailable === false ? "border-destructive" : slugAvailable === true ? "border-primary" : ""}
                  />
                </div>
                {checkingSlug && (
                  <p className="text-xs text-muted-foreground">Checking availability...</p>
                )}
                {!checkingSlug && slugAvailable === false && (
                  <p className="text-xs text-destructive font-medium">❌ Username unavailable — try another</p>
                )}
                {!checkingSlug && slugAvailable === true && (
                  <p className="text-xs text-primary font-medium">✅ Available!</p>
                )}
                {slugAvailable === null && !checkingSlug && (
                  <p className="text-xs text-muted-foreground">
                    ✏️ You can edit this — use your name or shop name
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>City <span className="text-muted-foreground font-normal">(optional)</span></Label>
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
                    <img src={profilePicturePreview} alt="Store profile" className="h-14 w-14 rounded-full object-cover border" />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                      <Upload className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <label className="cursor-pointer">
                    <span className="text-sm font-medium text-primary hover:underline">
                      {profilePicture ? "Change photo" : "Upload photo"}
                    </span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleProfilePicture} />
                  </label>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>What type of business?</Label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { value: "product" as const, label: "Products", emoji: "📦" },
                    { value: "service" as const, label: "Services", emoji: "🔧" },
                    { value: "both" as const, label: "Both", emoji: "📦🔧" },
                  ]).map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => handleBusinessTypeChange(t.value)}
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
                <Label>
                  {businessType === "service" ? "What services do you offer?" 
                    : businessType === "both" ? "What do you sell or offer?" 
                    : "What do you sell?"}
                </Label>
                <p className="text-xs text-muted-foreground mb-1">
                  Select one or more categories. Expand to pick subcategories.
                </p>
                <CategoryPicker
                  value={categorySelection}
                  onChange={setCategorySelection}
                  filter={categoryFilter}
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)} className="gap-1">
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <Button className="flex-1 gap-2" onClick={() => validateStep2() && setStep(3)}>
                  Next <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}

        {/* STEP 3 — WhatsApp */}
        {step === 3 && (
          <>
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-foreground flex items-center justify-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                Connect WhatsApp
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                This is where your orders will be sent
              </p>
            </div>
            <div className="space-y-4">
              <div className="rounded-lg bg-primary/5 border border-primary/10 p-3 text-sm text-muted-foreground">
                💡 Buyers will message you on this number when they order.
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

              {whatsappNumber.trim() && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-xl gap-2 border-primary/30 hover:bg-primary/5"
                  onClick={testWhatsApp}
                >
                  <ExternalLink className="h-4 w-4" />
                  Test WhatsApp — see what buyers see
                </Button>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)} className="gap-1">
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <Button className="flex-1 gap-2" onClick={handleSubmit} disabled={loading}>
                  {loading ? "Creating your store..." : "Create My Store 🎉"}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Signup;
