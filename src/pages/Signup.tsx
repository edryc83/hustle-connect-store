import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Eye, EyeOff, ArrowRight, ArrowLeft, Upload, Check, MapPin, MessageCircle, ExternalLink, Camera, Sparkles, Loader2, Rocket } from "lucide-react";
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

const TOTAL_STEPS = 4;

const Signup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [createdUserId, setCreatedUserId] = useState<string | null>(null);

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
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);
  const [coverPhotoPreview, setCoverPhotoPreview] = useState("");

  // Step 3
  const [whatsappCountryCode, setWhatsappCountryCode] = useState("+256");
  const [whatsappNumber, setWhatsappNumber] = useState("");

  // Step 4 — Profile completion
  const [bioText, setBioText] = useState("");
  const [generatingBio, setGeneratingBio] = useState(false);

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

  const handleProfilePicture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image must be under 2MB");
        return;
      }
      const { compressImage } = await import("@/lib/imageCompression");
      file = await compressImage(file);
      setProfilePicture(file);
      setProfilePicturePreview(URL.createObjectURL(file));
    }
  };

  const handleCoverPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be under 5MB");
        return;
      }
      const { compressImage } = await import("@/lib/imageCompression");
      file = await compressImage(file);
      setCoverPhoto(file);
      setCoverPhotoPreview(URL.createObjectURL(file));
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

  const handleCreateAccount = async () => {
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

      let coverPhotoUrl = null;
      if (coverPhoto) {
        const fileExt = coverPhoto.name.split(".").pop();
        const filePath = `${authData.user.id}/cover.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("store-images")
          .upload(filePath, coverPhoto, { upsert: true });
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from("store-images").getPublicUrl(filePath);
          coverPhotoUrl = urlData.publicUrl;
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
          cover_photo_url: coverPhotoUrl,
        } as any)
        .eq("id", authData.user.id);

      if (profileError) throw profileError;

      setCreatedUserId(authData.user.id);

      // Auto-generate bio
      const catString = serializeCategories(categorySelection);
      try {
        const { data } = await supabase.functions.invoke("generate-bio", {
          body: { storeName: storeName.trim(), category: catString, city: city || "" },
        });
        if (data?.bio) {
          setBioText(data.bio);
          await supabase.from("profiles").update({ store_bio: data.bio, welcome_message: data.bio } as any).eq("id", authData.user.id);
        }
      } catch {}

      toast.success("Account created! 🎉 Let's finish setting up.");
      setStep(4);
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBio = async () => {
    setGeneratingBio(true);
    try {
      const catString = serializeCategories(categorySelection);
      const { data } = await supabase.functions.invoke("generate-bio", {
        body: { storeName: storeName.trim(), category: catString, city: city || "" },
      });
      if (data?.bio) {
        setBioText(data.bio);
        toast.success("Bio generated!");
      }
    } catch { toast.error("Failed to generate"); }
    setGeneratingBio(false);
  };

  const handleFinish = async () => {
    if (createdUserId && bioText.trim()) {
      await supabase.from("profiles").update({
        store_bio: bioText.trim(),
        welcome_message: bioText.trim(),
      } as any).eq("id", createdUserId);
    }
    toast.success("Welcome to Afristall! 🚀");
    navigate("/dashboard");
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
        {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${
              step >= s ? "bg-primary text-primary-foreground" : "bg-muted/60 backdrop-blur-sm text-muted-foreground"
            }`}>
              {step > s ? <Check className="h-4 w-4" /> : s}
            </div>
            {s < TOTAL_STEPS && <div className={`h-0.5 w-6 sm:w-10 ${step > s ? "bg-primary" : "bg-muted/60"}`} />}
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

              {/* Profile Picture & Cover Photo */}
              <div className="space-y-1.5">
                <Label>Profile picture & Cover photo</Label>
                <div className="flex items-start gap-4">
                  <div className="text-center">
                    <label className="cursor-pointer block">
                      {profilePicturePreview ? (
                        <img src={profilePicturePreview} alt="Profile" className="h-16 w-16 rounded-full object-cover border-2 border-border mx-auto" />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted border-2 border-dashed border-border mx-auto">
                          <Camera className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <span className="text-[10px] text-muted-foreground mt-1 block">Profile pic</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleProfilePicture} />
                    </label>
                  </div>
                  <div className="flex-1 text-center">
                    <label className="cursor-pointer block">
                      {coverPhotoPreview ? (
                        <img src={coverPhotoPreview} alt="Cover" className="h-16 w-full rounded-lg object-cover border-2 border-border" />
                      ) : (
                        <div className="flex h-16 w-full items-center justify-center rounded-lg bg-muted border-2 border-dashed border-border">
                          <Camera className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <span className="text-[10px] text-muted-foreground mt-1 block">Cover photo</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleCoverPhoto} />
                    </label>
                  </div>
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
                <Button className="flex-1 gap-2" onClick={handleCreateAccount} disabled={loading}>
                  {loading ? "Creating your store..." : "Create My Store 🎉"}
                </Button>
              </div>
            </div>
          </>
        )}

        {/* STEP 4 — Complete Profile & How It Works */}
        {step === 4 && (
          <>
            <div className="text-center mb-5">
              <div className="text-4xl mb-2">🎉</div>
              <h2 className="text-xl font-bold text-foreground">Your store is live!</h2>
              <p className="text-sm text-muted-foreground mt-1">Add a bio so buyers know what you're about</p>
            </div>
            <div className="space-y-4">
              {/* Bio */}
              <div className="space-y-1.5">
                <Label>Store bio</Label>
                <Textarea
                  value={bioText}
                  onChange={(e) => setBioText(e.target.value)}
                  rows={3}
                  maxLength={300}
                  placeholder="Tell buyers what makes your store special..."
                  className="text-sm"
                />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">{bioText.length}/300</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleGenerateBio}
                    disabled={generatingBio}
                    className="gap-1 text-xs text-primary h-7"
                  >
                    {generatingBio ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                    AI Generate
                  </Button>
                </div>
              </div>

              {/* How It Works */}
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
                <h3 className="text-sm font-bold flex items-center gap-1.5">
                  <Rocket className="h-4 w-4 text-primary" /> How Afristall works for you
                </h3>
                <ul className="space-y-2 text-xs text-muted-foreground leading-relaxed">
                  <li className="flex gap-2">
                    <span className="text-base">📸</span>
                    <span>Add your first 2 products now — photos + price. Takes 30 seconds each.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-base">📲</span>
                    <span><strong className="text-foreground">Every day we give you 3 ready-made statuses</strong> that link directly to your shop. Copy and post straight to your WhatsApp status, TikTok comments, Instagram stories — anywhere!</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-base">💰</span>
                    <span>When someone taps your link, they land on your store and order via WhatsApp. Simple.</span>
                  </li>
                </ul>
              </div>

              <Button className="w-full gap-2" onClick={handleFinish}>
                Go to Dashboard <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Signup;
