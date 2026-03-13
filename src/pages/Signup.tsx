import { useState, useRef, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Eye, EyeOff, ArrowRight, ArrowLeft, Check, MapPin, MessageCircle,
  ExternalLink, Camera, Sparkles, Loader2, Rocket,
} from "lucide-react";
import EmojiGrid from "@/components/landing/EmojiGrid";
import AfristallLogo from "@/components/AfristallLogo";
import { toast } from "sonner";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  CategoryPicker, type CategorySelection, serializeCategories,
} from "@/components/CategoryPicker";
import { COUNTRIES } from "@/lib/countries";

const slugify = (text: string) =>
  text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const TOTAL_STEPS = 4;

const Signup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const isOAuthUser = !!user && !searchParams.get("step") ? false : !!user;
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [createdUserId, setCreatedUserId] = useState<string | null>(null);

  // If arriving as an OAuth user (e.g. ?step=2), skip to step 2
  useEffect(() => {
    const stepParam = searchParams.get("step");
    if (stepParam === "2" && user) {
      setStep(2);
      setCreatedUserId(user.id);
    }
  }, [searchParams, user]);

  // Step 1 — Account
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Step 2 — Store info
  const [firstName, setFirstName] = useState("");
  const [storeName, setStoreName] = useState("");
  const [storeSlug, setStoreSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);
  const slugCheckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [selectedCountry, setSelectedCountry] = useState("UG");
  const [city, setCity] = useState("");
  const [categorySelection, setCategorySelection] = useState<CategorySelection>({});
  const [businessTypes, setBusinessTypes] = useState<string[]>(["product"]);

  // Step 3 — WhatsApp
  const [whatsappNumber, setWhatsappNumber] = useState("");

  // Step 4 — Profile pics & bio
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState("");
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);
  const [coverPhotoPreview, setCoverPhotoPreview] = useState("");
  const [bioText, setBioText] = useState("");
  const [generatingBio, setGeneratingBio] = useState(false);

  // Derived
  const country = COUNTRIES.find((c) => c.code === selectedCountry);
  const phoneCodes = country ? [country.phone] : ["+256"];
  const whatsappCountryCode = country?.phone || "+256";
  const cityOptions = country?.cities || [];

  // Slug helpers
  const checkSlugAvailability = (slug: string) => {
    if (slugCheckTimer.current) clearTimeout(slugCheckTimer.current);
    if (!slug || slug.length < 2) { setSlugAvailable(null); return; }
    setCheckingSlug(true);
    slugCheckTimer.current = setTimeout(async () => {
      const { data } = await supabase.from("profiles").select("id").eq("store_slug", slug).maybeSingle();
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

  const handleSlugChange = (value: string) => {
    setSlugEdited(true);
    const newSlug = slugify(value);
    setStoreSlug(newSlug);
    checkSlugAvailability(newSlug);
  };

  const handleProfilePicture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
    const { compressImage } = await import("@/lib/imageCompression");
    file = await compressImage(file);
    setProfilePicture(file);
    setProfilePicturePreview(URL.createObjectURL(file));
  };

  const handleCoverPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
    const { compressImage } = await import("@/lib/imageCompression");
    file = await compressImage(file);
    setCoverPhoto(file);
    setCoverPhotoPreview(URL.createObjectURL(file));
  };

  // Validation
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
    if (!storeSlug.trim()) { toast.error("Store URL is required"); return false; }
    if (!/^[a-z0-9-]+$/.test(storeSlug)) { toast.error("URL can only contain lowercase letters, numbers, and hyphens"); return false; }
    if (slugAvailable === false) { toast.error("This URL is already taken"); return false; }
    if (Object.keys(categorySelection).length === 0) { toast.error("Please select at least one category"); return false; }
    return true;
  };

  const validateStep3 = () => {
    if (!whatsappNumber.trim()) { toast.error("WhatsApp number is required"); return false; }
    if (whatsappNumber.replace(/\D/g, "").length < 6) { toast.error("Enter a valid phone number"); return false; }
    return true;
  };

  const getFullWhatsApp = () =>
    whatsappCountryCode + whatsappNumber.replace(/^0+/, "").replace(/\D/g, "");

  const testWhatsApp = () => {
    if (!whatsappNumber.trim()) { toast.error("Enter your number first"); return; }
    const cleanNumber = getFullWhatsApp().replace(/^\+/, "");
    window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(`Hi! I'm interested in ordering from ${storeName || "your store"} on Afristall 🛒`)}`, "_blank");
  };

  // Create account (after step 3) — or just save profile for OAuth users
  const handleCreateAccount = async () => {
    if (!validateStep3()) return;
    setLoading(true);
    try {
      const fullWhatsapp = getFullWhatsApp();
      let userId = createdUserId;

      // If user is already authenticated (OAuth), skip signup
      if (!user) {
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
          } else { toast.error(authError.message); }
          return;
        }
        if (!authData.user) throw new Error("Signup failed");
        if (authData.user.identities && authData.user.identities.length === 0) {
          toast.error("This email already has a store. Try signing in instead.");
          setStep(1);
          return;
        }
        userId = authData.user.id;
      } else {
        userId = user.id;
      }

      const { error: profileError } = await supabase.from("profiles").update({
        first_name: firstName.trim(),
        store_name: storeName.trim(),
        store_slug: storeSlug.trim(),
        country: country?.name || null,
        city: city || null,
        category: serializeCategories(categorySelection),
        business_type: businessTypes.length === 1 ? businessTypes[0] : businessTypes.join(","),
        whatsapp_number: fullWhatsapp,
      } as any).eq("id", userId);

      if (profileError) throw profileError;
      setCreatedUserId(userId);

      // Auto-generate bio
      const catString = serializeCategories(categorySelection);
      try {
        const { data } = await supabase.functions.invoke("generate-bio", {
          body: { storeName: storeName.trim(), category: catString, city: city || "" },
        });
        if (data?.bio) {
          setBioText(data.bio);
          await supabase.from("profiles").update({ store_bio: data.bio, welcome_message: data.bio } as any).eq("id", userId);
        }
      } catch {}

      toast.success("Account created! 🎉");
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
      const { data } = await supabase.functions.invoke("generate-bio", {
        body: { storeName: storeName.trim(), category: serializeCategories(categorySelection), city: city || "" },
      });
      if (data?.bio) { setBioText(data.bio); toast.success("Bio generated!"); }
    } catch { toast.error("Failed to generate"); }
    setGeneratingBio(false);
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      const userId = createdUserId || user?.id;
      if (!userId) { navigate("/dashboard"); return; }

      // Upload profile pic
      if (profilePicture) {
        const ext = profilePicture.name.split(".").pop();
        const path = `${userId}/avatar.${ext}`;
        const { error } = await supabase.storage.from("store-images").upload(path, profilePicture, { upsert: true });
        if (!error) {
          const { data: urlData } = supabase.storage.from("store-images").getPublicUrl(path);
          await supabase.from("profiles").update({ profile_picture_url: urlData.publicUrl } as any).eq("id", userId);
        }
      }

      // Upload cover photo
      if (coverPhoto) {
        const ext = coverPhoto.name.split(".").pop();
        const path = `${userId}/cover.${ext}`;
        const { error } = await supabase.storage.from("store-images").upload(path, coverPhoto, { upsert: true });
        if (!error) {
          const { data: urlData } = supabase.storage.from("store-images").getPublicUrl(path);
          await supabase.from("profiles").update({ cover_photo_url: urlData.publicUrl } as any).eq("id", userId);
        }
      }

      // Save bio
      if (bioText.trim()) {
        await supabase.from("profiles").update({
          store_bio: bioText.trim(),
          welcome_message: bioText.trim(),
        } as any).eq("id", userId);
      }

      toast.success("Welcome to Afristall! 🚀");
      navigate("/dashboard");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const categoryFilter = businessTypes.length > 1 ? "all" : businessTypes[0] === "service" ? "services" : businessTypes[0] === "experience" ? "all" : "products";

  const stepLabels = ["Account", "Store", "WhatsApp", "Profile"];

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-8 overflow-hidden">
      <EmojiGrid />
      <div className="pointer-events-none absolute -top-32 -left-20 h-[400px] w-[400px] rounded-full bg-primary/8 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-32 right-0 h-[350px] w-[350px] rounded-full bg-primary/6 blur-[80px]" />

      <Link to="/" className="relative z-10 mb-6 flex items-center gap-2">
        <AfristallLogo />
        <span className="text-xl font-extrabold tracking-tight">
          Afri<span className="text-primary">stall</span>
        </span>
      </Link>

      {/* Progress */}
      <div className="relative z-10 mb-5 flex items-center gap-1.5">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((s) => (
          <div key={s} className="flex items-center gap-1.5">
            <div className="flex flex-col items-center gap-1">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                step >= s ? "bg-primary text-primary-foreground shadow-md shadow-primary/30" : "bg-muted/60 backdrop-blur-sm text-muted-foreground"
              }`}>
                {step > s ? <Check className="h-3.5 w-3.5" /> : s}
              </div>
              <span className={`text-[10px] font-medium ${step >= s ? "text-primary" : "text-muted-foreground/60"}`}>
                {stepLabels[s - 1]}
              </span>
            </div>
            {s < TOTAL_STEPS && (
              <div className={`h-0.5 w-6 sm:w-8 mb-4 rounded-full transition-colors ${step > s ? "bg-primary" : "bg-muted/40"}`} />
            )}
          </div>
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl p-6 shadow-lg">
        {/* STEP 1 — Account */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in-50 duration-300">
            <div className="text-center">
              <h2 className="text-xl font-bold">Create your account</h2>
              <p className="text-sm text-muted-foreground mt-1">Start selling in minutes</p>
            </div>
            <div className="space-y-3">
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
              <Button className="w-full h-11 gap-2 text-sm font-semibold" onClick={() => validateStep1() && setStep(2)}>
                Continue <ArrowRight className="h-4 w-4" />
              </Button>

              <div className="relative my-1">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/50" /></div>
                <div className="relative flex justify-center text-xs"><span className="bg-card/80 px-2 text-muted-foreground">or</span></div>
              </div>

              <Button
                variant="outline"
                className="w-full h-11 gap-2 text-sm font-medium"
                onClick={async () => {
                  const { error } = await lovable.auth.signInWithOAuth("google", {
                    redirect_uri: window.location.origin,
                  });
                  if (error) toast.error(error.message || "Google sign-in failed");
                }}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
              </p>
            </div>
          </div>
        )}

        {/* STEP 2 — Store Setup */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in-50 slide-in-from-right-4 duration-300">
            <div className="text-center">
              <h2 className="text-xl font-bold">Set up your store</h2>
              <p className="text-sm text-muted-foreground mt-1">Tell us about your business</p>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName">First name</Label>
                  <Input id="firstName" placeholder="e.g. Aisha" value={firstName} onChange={(e) => handleFirstNameChange(e.target.value)} maxLength={30} className="h-10" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="storeName">Store name</Label>
                  <Input id="storeName" placeholder="e.g. Aisha's Shop" value={storeName} onChange={(e) => setStoreName(e.target.value)} maxLength={60} className="h-10" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="storeSlug">Store URL</Label>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">afristall.com/</span>
                  <Input id="storeSlug" placeholder="my-store" value={storeSlug} onChange={(e) => handleSlugChange(e.target.value)} maxLength={40} className={`h-10 ${slugAvailable === false ? "border-destructive" : slugAvailable === true ? "border-primary" : ""}`} />
                </div>
                {checkingSlug && <p className="text-[10px] text-muted-foreground">Checking…</p>}
                {!checkingSlug && slugAvailable === false && <p className="text-[10px] text-destructive font-medium">❌ Taken — try another</p>}
                {!checkingSlug && slugAvailable === true && <p className="text-[10px] text-primary font-medium">✅ Available!</p>}
              </div>

              {/* Country & City */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Country</Label>
                  <Select value={selectedCountry} onValueChange={(v) => { setSelectedCountry(v); setCity(""); }}>
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          <span className="flex items-center gap-1.5">
                            <span>{c.flag}</span> {c.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>City</Label>
                  {cityOptions.length > 0 ? (
                    <Select value={city} onValueChange={setCity}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent className="max-h-64">
                        {cityOptions.map((c) => (
                          <SelectItem key={c} value={c}>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-muted-foreground" /> {c}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input placeholder="Your city" value={city} onChange={(e) => setCity(e.target.value)} className="h-10" />
                  )}
                </div>
              </div>

              {/* Business type */}
              <div className="space-y-1.5">
                <Label>Type <span className="text-xs text-muted-foreground font-normal">(select all that apply)</span></Label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { value: "product", label: "Products", emoji: "📦" },
                    { value: "service", label: "Services", emoji: "🔧" },
                    { value: "experience", label: "Experiences", emoji: "✨" },
                  ]).map((t) => {
                    const selected = businessTypes.includes(t.value);
                    return (
                      <button key={t.value} type="button" onClick={() => {
                        setBusinessTypes(prev => {
                          const next = prev.includes(t.value) ? prev.filter(v => v !== t.value) : [...prev, t.value];
                          return next.length === 0 ? [t.value] : next;
                        });
                        setCategorySelection({});
                      }}
                        className={`flex flex-col items-center gap-0.5 rounded-xl border-2 p-2.5 text-center transition-all ${
                          selected ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/30"
                        }`}>
                        <span className="text-lg">{t.emoji}</span>
                        <span className="text-[11px] font-medium">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-1.5">
                <Label>{businessTypes.length === 1 && businessTypes[0] === "service" ? "Services" : businessTypes.length > 1 ? "What do you sell/offer?" : "What do you sell?"}</Label>
                <CategoryPicker value={categorySelection} onChange={setCategorySelection} filter={categoryFilter} />
              </div>

              <div className="flex gap-2 pt-1">
                {!user && (
                  <Button variant="outline" size="sm" onClick={() => setStep(1)} className="gap-1">
                    <ArrowLeft className="h-3.5 w-3.5" /> Back
                  </Button>
                )}
                <Button className="flex-1 h-10 gap-2 text-sm font-semibold" onClick={() => validateStep2() && setStep(3)}>
                  Continue <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3 — WhatsApp */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in-50 slide-in-from-right-4 duration-300">
            <div className="text-center">
              <h2 className="text-xl font-bold flex items-center justify-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                Connect WhatsApp
              </h2>
              <p className="text-sm text-muted-foreground mt-1">Buyers will message you here</p>
            </div>
            <div className="space-y-3">
              <div className="rounded-xl bg-primary/5 border border-primary/10 p-3 text-xs text-muted-foreground">
                💡 Orders arrive as WhatsApp messages — no app to manage.
              </div>
              <div className="space-y-1.5">
                <Label>WhatsApp number</Label>
                <div className="flex gap-2">
                  <div className="h-10 px-3 rounded-md border border-input bg-muted/50 flex items-center text-sm text-muted-foreground font-medium min-w-[80px]">
                    {country?.flag} {whatsappCountryCode}
                  </div>
                  <Input type="tel" placeholder="7XX XXX XXX" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} className="flex-1 h-10" />
                </div>
              </div>
              {whatsappNumber.trim() && (
                <Button type="button" variant="outline" className="w-full rounded-xl gap-2 h-10 border-primary/30" onClick={testWhatsApp}>
                  <ExternalLink className="h-4 w-4" /> Test — see what buyers see
                </Button>
              )}
              <div className="flex gap-2 pt-1">
                <Button variant="outline" size="sm" onClick={() => setStep(2)} className="gap-1">
                  <ArrowLeft className="h-3.5 w-3.5" /> Back
                </Button>
                <Button className="flex-1 h-10 gap-2 text-sm font-semibold" onClick={handleCreateAccount} disabled={loading}>
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating…</> : <>Create Store 🎉</>}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4 — Profile & How It Works */}
        {step === 4 && (
          <div className="space-y-5 animate-in fade-in-50 slide-in-from-right-4 duration-300">
            <div className="text-center">
              <div className="text-3xl mb-1">🎉</div>
              <h2 className="text-xl font-bold">Your store is live!</h2>
              <p className="text-sm text-muted-foreground mt-1">Make it yours — add your photos</p>
            </div>
            <div className="space-y-4">
              {/* Instagram-style stacked cover + profile */}
              <div className="relative rounded-2xl overflow-hidden border border-border/60 shadow-sm">
                {/* Cover photo */}
                <label className="cursor-pointer block group">
                  {coverPhotoPreview ? (
                    <img src={coverPhotoPreview} alt="Cover" className="w-full h-28 object-cover" />
                  ) : (
                    <div className="w-full h-28 bg-gradient-to-br from-primary/20 via-muted/40 to-accent/20 flex items-center justify-center group-hover:from-primary/30 transition-all">
                      <div className="flex flex-col items-center gap-1 text-muted-foreground/60 group-hover:text-primary/60 transition-colors">
                        <Camera className="h-5 w-5" />
                        <span className="text-[10px] font-medium">Add cover photo</span>
                      </div>
                    </div>
                  )}
                  {coverPhotoPreview && (
                    <div className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="h-3.5 w-3.5" />
                    </div>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleCoverPhoto} />
                </label>

                {/* Profile picture — overlapping */}
                <div className="px-4 -mt-8 relative z-10 pb-3">
                  <label className="cursor-pointer block w-fit group/pic">
                    {profilePicturePreview ? (
                      <div className="relative">
                        <img src={profilePicturePreview} alt="Profile" className="h-16 w-16 rounded-full object-cover border-[3px] border-background shadow-lg" />
                        <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover/pic:opacity-100 transition-opacity">
                          <Camera className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="h-16 w-16 rounded-full border-[3px] border-background bg-muted/80 shadow-lg flex items-center justify-center group-hover/pic:bg-primary/10 transition-colors">
                        <Camera className="h-5 w-5 text-muted-foreground/60 group-hover/pic:text-primary/60 transition-colors" />
                      </div>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={handleProfilePicture} />
                  </label>
                  <p className="text-xs font-semibold mt-1.5">{storeName || "Your Store"}</p>
                  <p className="text-[10px] text-muted-foreground">@{storeSlug || "your-store"}</p>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-1.5">
                <Label>Store bio</Label>
                <Textarea value={bioText} onChange={(e) => setBioText(e.target.value)} rows={2} maxLength={300} placeholder="What makes your store special?" className="text-sm resize-none" />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">{bioText.length}/300</span>
                  <Button size="sm" variant="ghost" onClick={handleGenerateBio} disabled={generatingBio} className="gap-1 text-xs text-primary h-6 px-2">
                    {generatingBio ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                    AI Write
                  </Button>
                </div>
              </div>

              {/* How It Works */}
              <div className="rounded-xl border border-primary/15 bg-primary/5 p-3.5 space-y-2.5">
                <h3 className="text-xs font-bold flex items-center gap-1.5">
                  <Rocket className="h-3.5 w-3.5 text-primary" /> How Afristall works for you
                </h3>
                <ul className="space-y-2 text-[11px] text-muted-foreground leading-relaxed">
                  <li className="flex gap-2">
                    <span className="text-sm">📸</span>
                    <span>Add your first 2 products — photo + price. Takes 30 seconds each.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-sm">📲</span>
                    <span><strong className="text-foreground">Every day we give you 3 ready-made statuses</strong> that link to your shop. Copy & post straight to your WhatsApp status, TikTok comments, Instagram stories — anywhere!</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-sm">💰</span>
                    <span>When someone taps your link, they see your store and order via WhatsApp. That simple.</span>
                  </li>
                </ul>
              </div>

              <Button className="w-full h-11 gap-2 text-sm font-semibold" onClick={handleFinish} disabled={loading}>
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : <>Go to Dashboard <ArrowRight className="h-4 w-4" /></>}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Signup;
