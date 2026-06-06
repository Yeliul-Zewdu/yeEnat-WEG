import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import {
  ApiError,
  auth as authApi,
  clearTokens,
  getTokens,
  ingredients as ingredientsApi,
  logs as logsApi,
  mealPlans as mealPlansApi,
  profile as profileApi,
  readings as readingsApi,
  setOnUnauthorized,
  setTokens,
  type DailyLog,
  type HealthProfile,
  type HealthProfileInput,
  type HealthReading,
  type Ingredient,
  type Me,
  type MealItem,
  type PlanDay,
  type PlanSlot,
  type WeeklyPlan,
} from "./api";
import { MVP_OTP } from "./api/config";

type Route = "splash" | "auth" | "home" | "mealPlan" | "tracker" | "profile";
type MainRoute = Exclude<Route, "splash" | "auth">;

/** Maps a JS Date to the YYYY-MM-DD the logs API expects. */
function toApiDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}

/** Generic data-loading hook used by the data-backed screens. */
function useAsync<T>(fn: () => Promise<T>, deps: ReadonlyArray<unknown>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(fn, deps);

  const load = useCallback(() => {
    let active = true;
    setLoading(true);
    setError(null);
    run()
      .then((result) => {
        if (active) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [run]);

  useEffect(() => load(), [load]);

  return { data, loading, error, reload: load };
}

const colors = {
  background: "#F7F4ED",
  card: "#FFFDF7",
  primary: "#2E5E4E",
  primarySoft: "#E6EFE8",
  secondary: "#D4A537",
  accent: "#C86B4A",
  text: "#1F2A24",
  muted: "#6E766E",
  border: "#E2DDD2",
  input: "#F2EFE7",
  white: "#FFFFFF",
  blue: "#3577BA",
  blueSoft: "#E6F0FA",
  red: "#C64A4A",
  green: "#3D8A57",
  greenSoft: "#E6F3EA",
};

const slides = [
  {
    title: "YeEnat Weg",
    subtitle: "የእናት ወግ",
    description: "The Way of the Mother. Ethiopian nutrition and wellness guidance for everyday life.",
    image:
      "https://images.unsplash.com/photo-1729962021385-659b53192b9e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxldGhpb3BpYW4lMjB3b21hbiUyMHNtaWxpbmd8ZW58MXx8fHwxNzgwNzM1NzgxfDA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    title: "Personalized Nutrition",
    subtitle: "የተመጣጠነ ምግብ",
    description: "Build weekly meal plans from real ingredients, portions, and health targets.",
    image:
      "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxldGhpb3BpYW4lMjBmb29kfGVufDF8fHx8MTc4MDczNTc4MXww&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    title: "Wellness Coaching",
    subtitle: "የጤና አማካሪ",
    description: "Track your health, manage chronic conditions, and live a healthier life.",
    image:
      "https://images.unsplash.com/photo-1572357176061-7c96fd2af22f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWxsbmVzcyUyMGdyZWVufGVufDF8fHx8MTc4MDczNTc4MXww&ixlib=rb-4.1.0&q=80&w=1080",
  },
];

const conditionOptions: Array<{ label: string; code: string }> = [
  { label: "Diabetes Type 2", code: "diabetes_t2" },
  { label: "Diabetes Type 1", code: "diabetes_t1" },
  { label: "Hypertension", code: "hypertension" },
];

const slotOrder: PlanSlot["slot_type"][] = ["breakfast", "lunch", "dinner", "snack"];
const slotLabels: Record<PlanSlot["slot_type"], string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};
const weekdayShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Placeholder image for meal cards (the API does not return images). */
const MEAL_IMAGE =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwZm9vZCUyMGJvd2x8ZW58MXx8fHwxNzgwNzM1Nzg1fDA&ixlib=rb-4.1.0&q=80&w=1080";

const navItems: Array<{ route: MainRoute; icon: keyof typeof Feather.glyphMap; label: string }> = [
  { route: "home", icon: "home", label: "Home" },
  { route: "mealPlan", icon: "calendar", label: "Meals" },
  { route: "tracker", icon: "activity", label: "Track" },
  { route: "profile", icon: "user", label: "Profile" },
];

export default function App() {
  const [route, setRoute] = useState<Route>("splash");
  const [me, setMe] = useState<Me | null>(null);
  const [booting, setBooting] = useState(true);

  const goTo = (nextRoute: Route) => setRoute(nextRoute);

  const handleLoggedOut = useCallback(() => {
    setMe(null);
    setRoute("auth");
  }, []);

  // Drop the session when the client can no longer refresh the token.
  useEffect(() => {
    setOnUnauthorized(handleLoggedOut);
    return () => setOnUnauthorized(null);
  }, [handleLoggedOut]);

  // Restore a persisted session on launch.
  useEffect(() => {
    let active = true;
    (async () => {
      const tokens = await getTokens();
      if (!tokens) {
        if (active) {
          setRoute("splash");
          setBooting(false);
        }
        return;
      }
      try {
        const profile = await profileApi.getMe();
        if (active) {
          setMe(profile);
          setRoute("home");
        }
      } catch {
        if (active) setRoute("splash");
      } finally {
        if (active) setBooting(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleAuthenticated = (profile: Me) => {
    setMe(profile);
    setRoute("home");
  };

  const handleLogout = async () => {
    const tokens = await getTokens();
    try {
      if (tokens) await authApi.logout(tokens.refresh);
    } catch {
      /* logout is best-effort */
    }
    await clearTokens();
    handleLoggedOut();
  };

  const showBottomNav = route !== "splash" && route !== "auth";

  if (booting) {
    return (
      <SafeAreaView style={styles.appShell}>
        <View style={styles.phoneFrame}>
          <View style={[styles.screen, styles.screenWithoutNav, styles.centerFill]}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.appShell}>
      <View style={styles.phoneFrame}>
        <View style={[styles.screen, !showBottomNav ? styles.screenWithoutNav : undefined]}>
          {route === "splash" && <SplashScreen goTo={goTo} />}
          {route === "auth" && <AuthScreen onAuthenticated={handleAuthenticated} goTo={goTo} />}
          {route === "home" && <HomeScreen goTo={goTo} me={me} />}
          {route === "mealPlan" && <MealPlanScreen />}
          {route === "tracker" && <TrackerScreen me={me} />}
          {route === "profile" && <ProfileScreen me={me} onMeChange={setMe} onLogout={handleLogout} />}
        </View>
        {showBottomNav && <BottomNav activeRoute={route as MainRoute} goTo={goTo} />}
      </View>
    </SafeAreaView>
  );
}

function SplashScreen({ goTo }: { goTo: (route: Route) => void }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slide = slides[currentSlide];
  const isLastSlide = currentSlide === slides.length - 1;

  const handleNext = () => {
    if (isLastSlide) {
      goTo("auth");
      return;
    }
    setCurrentSlide((current) => current + 1);
  };

  return (
    <View style={styles.splash}>
      <Image source={{ uri: slide.image }} style={styles.splashImage} />
      <View style={styles.splashOverlay} />
      <View style={styles.splashContent}>
        <Text style={styles.splashSubtitle}>{slide.subtitle}</Text>
        <Text style={styles.splashTitle}>{slide.title}</Text>
        <Text style={styles.splashText}>{slide.description}</Text>
      </View>
      <View style={styles.splashFooter}>
        <View style={styles.dots}>
          {slides.map((item, index) => (
            <View
              key={item.title}
              style={[styles.dot, currentSlide === index ? styles.dotActive : undefined]}
            />
          ))}
        </View>
        <PrimaryButton
          label={isLastSlide ? "Get Started" : "Next"}
          icon={isLastSlide ? "arrow-right" : "chevron-right"}
          onPress={handleNext}
        />
      </View>
    </View>
  );
}

type ProfileDraft = {
  sex: HealthProfileInput["sex"];
  birthYear: string;
  heightCm: string;
  weightKg: string;
  targetWeightKg: string;
  activity: HealthProfileInput["activity_level"];
  goal: HealthProfileInput["primary_goal"];
  fasting: HealthProfileInput["fasting_type"];
  wakeTime: string;
  sleepTime: string;
  conditions: string[];
  allergies: string;
};

const emptyDraft: ProfileDraft = {
  sex: "female",
  birthYear: "",
  heightCm: "",
  weightKg: "",
  targetWeightKg: "",
  activity: "light",
  goal: "manage_condition",
  fasting: "orthodox",
  wakeTime: "",
  sleepTime: "",
  conditions: [],
  allergies: "",
};

function draftToInput(draft: ProfileDraft): HealthProfileInput {
  return {
    sex: draft.sex,
    birth_year: Number(draft.birthYear),
    height_cm: Number(draft.heightCm),
    current_weight_kg: Number(draft.weightKg),
    target_weight_kg: draft.targetWeightKg ? Number(draft.targetWeightKg) : undefined,
    activity_level: draft.activity,
    primary_goal: draft.goal,
    fasting_type: draft.fasting,
    wake_time: draft.wakeTime || undefined,
    sleep_time: draft.sleepTime || undefined,
    is_vegetarian: false,
    is_vegan: false,
    allergies: draft.allergies.split(",").map((s) => s.trim()).filter(Boolean),
    conditions: draft.conditions,
  };
}

function AuthScreen({
  onAuthenticated,
  goTo,
}: {
  onAuthenticated: (me: Me) => void;
  goTo: (route: Route) => void;
}) {
  const [isLogin, setIsLogin] = useState(false);
  const [stage, setStage] = useState<"account" | "otp" | "profile">("account");
  const [profileStep, setProfileStep] = useState(0);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [draft, setDraft] = useState<ProfileDraft>(emptyDraft);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const profileSections = [
    { title: "Body Basics", subtitle: "Tell us the measurements used for your daily targets." },
    { title: "Goals & Routine", subtitle: "These shape your calories, macros, and lifestyle suggestions." },
    { title: "Health Needs", subtitle: "Conditions and allergies help adjust the weekly meal plan." },
  ];
  const isLastProfileStep = profileStep === profileSections.length - 1;

  const fullPhone = phone.startsWith("+") ? phone : `+251${phone.replace(/^0+/, "")}`;

  const finishAuth = async () => {
    const profile = await profileApi.getMe();
    onAuthenticated(profile);
  };

  const handleSendOtp = async () => {
    if (!isLogin && fullName.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }
    if (phone.replace(/\D/g, "").length < 9) {
      setError("Please enter a valid phone number.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await authApi.sendOtp(fullPhone);
      setStage("otp");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setError("Enter the 6-digit code.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const result = await authApi.verifyOtp({
        phone_number: fullPhone,
        otp,
        full_name: isLogin ? undefined : fullName.trim(),
        preferred_lang: "en",
      });
      await setTokens({ access: result.access_token, refresh: result.refresh_token });

      if (!isLogin && result.user?.is_new) {
        setStage("profile");
        setProfileStep(0);
      } else {
        await finishAuth();
      }
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  const handleProfileNext = async () => {
    if (!isLastProfileStep) {
      setProfileStep((current) => current + 1);
      return;
    }
    if (!draft.birthYear || !draft.heightCm || !draft.weightKg) {
      setError("Please fill in your birth year, height, and weight.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await profileApi.upsertHealthProfile(draftToInput(draft));
      if (res.plan_generation_status !== "generated") {
        Alert.alert(
          "Profile saved",
          "Your targets are ready. A meal plan could not be generated yet — you can retry from the Meals tab."
        );
      }
      await finishAuth();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrimary = () => {
    if (stage === "account") return handleSendOtp();
    if (stage === "otp") return handleVerifyOtp();
    return handleProfileNext();
  };

  const handleBack = () => {
    setError(null);
    if (stage === "profile" && profileStep > 0) {
      setProfileStep((current) => current - 1);
      return;
    }
    if (stage === "profile") {
      setStage("otp");
      return;
    }
    if (stage === "otp") {
      setStage("account");
      return;
    }
    goTo("splash");
  };

  let heading = isLogin ? "Welcome Back" : "Create Account";
  let subtitle = isLogin
    ? "Sign in to continue your wellness journey."
    : "Start your healthy lifestyle with YeEnat Weg.";
  if (stage === "otp") {
    heading = "Verify Phone";
    subtitle = `Enter the 6-digit code sent to ${fullPhone}.`;
  } else if (stage === "profile") {
    heading = profileSections[profileStep].title;
    subtitle = profileSections[profileStep].subtitle;
  }

  const primaryLabel =
    stage === "account"
      ? "Continue"
      : stage === "otp"
        ? "Verify"
        : isLastProfileStep
          ? "Create Plan"
          : "Continue";

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.authContent} keyboardShouldPersistTaps="handled">
        <IconButton icon="arrow-left" onPress={handleBack} />
        <Text style={styles.pageTitle}>{heading}</Text>
        <Text style={styles.pageDescription}>{subtitle}</Text>

        {stage === "account" && (
          <View style={styles.segmented}>
            <SegmentButton active={!isLogin} label="Sign Up" onPress={() => setIsLogin(false)} />
            <SegmentButton active={isLogin} label="Login" onPress={() => setIsLogin(true)} />
          </View>
        )}

        {stage === "profile" && (
          <View style={styles.progressRow}>
            {profileSections.map((section, index) => (
              <View key={section.title} style={styles.progressTrack}>
                <View style={[styles.progressFill, index <= profileStep ? styles.progressComplete : undefined]} />
              </View>
            ))}
          </View>
        )}

        {stage === "account" && (
          <View style={styles.formStack}>
            {!isLogin && (
              <LabeledInput label="Full Name" placeholder="Abebe Bikila" value={fullName} onChangeText={setFullName} />
            )}
            <View>
              <FieldLabel label="Phone Number" />
              <View style={styles.phoneRow}>
                <View style={styles.countryCode}>
                  <Text style={styles.countryCodeText}>+251</Text>
                </View>
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="911 234 567"
                  placeholderTextColor={colors.muted}
                  keyboardType="phone-pad"
                  style={[styles.input, styles.flex]}
                />
              </View>
            </View>
          </View>
        )}

        {stage === "otp" && (
          <View style={styles.formStack}>
            <TextInput
              value={otp}
              onChangeText={(t) => setOtp(t.replace(/\D/g, "").slice(0, 6))}
              placeholder="••••••"
              placeholderTextColor={colors.muted}
              keyboardType="number-pad"
              maxLength={6}
              style={[styles.input, styles.otpInput]}
            />
            <Text style={styles.hintText}>Demo code: {MVP_OTP}</Text>
          </View>
        )}

        {stage === "profile" && (
          <HealthProfileSection step={profileStep} draft={draft} setDraft={setDraft} />
        )}

        {error && <Text style={styles.errorText}>{error}</Text>}

        <View style={styles.submitWrap}>
          {submitting ? (
            <View style={[styles.primaryButton, styles.disabled]}>
              <ActivityIndicator color={colors.white} />
            </View>
          ) : (
            <PrimaryButton label={primaryLabel} icon="arrow-right" onPress={handlePrimary} />
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function HealthProfileSection({
  step,
  draft,
  setDraft,
}: {
  step: number;
  draft: ProfileDraft;
  setDraft: (updater: (prev: ProfileDraft) => ProfileDraft) => void;
}) {
  const update = <K extends keyof ProfileDraft>(key: K, value: ProfileDraft[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const toggleCondition = (code: string) =>
    setDraft((prev) => ({
      ...prev,
      conditions: prev.conditions.includes(code)
        ? prev.conditions.filter((c) => c !== code)
        : [...prev.conditions, code],
    }));

  if (step === 0) {
    return (
      <SectionCard eyebrow="Basic measurements">
        <OptionPicker
          label="Sex"
          value={draft.sex}
          options={[
            { label: "Female", value: "female" },
            { label: "Male", value: "male" },
            { label: "Other", value: "other" },
          ]}
          onChange={(v) => update("sex", v as ProfileDraft["sex"])}
        />
        <View style={styles.twoColumn}>
          <LabeledInput label="Birth Year" placeholder="1986" keyboardType="number-pad" value={draft.birthYear} onChangeText={(v) => update("birthYear", v)} />
          <LabeledInput label="Height (cm)" placeholder="162" keyboardType="number-pad" value={draft.heightCm} onChangeText={(v) => update("heightCm", v)} />
          <LabeledInput label="Weight (kg)" placeholder="72.5" keyboardType="decimal-pad" value={draft.weightKg} onChangeText={(v) => update("weightKg", v)} />
          <LabeledInput label="Target (kg)" placeholder="65" keyboardType="decimal-pad" value={draft.targetWeightKg} onChangeText={(v) => update("targetWeightKg", v)} />
        </View>
      </SectionCard>
    );
  }

  if (step === 1) {
    return (
      <SectionCard eyebrow="Planning preferences">
        <OptionPicker
          label="Primary Goal"
          value={draft.goal}
          options={[
            { label: "Lose weight", value: "lose_weight" },
            { label: "Gain weight", value: "gain_weight" },
            { label: "Maintain", value: "maintain" },
            { label: "Manage condition", value: "manage_condition" },
          ]}
          onChange={(v) => update("goal", v as ProfileDraft["goal"])}
        />
        <OptionPicker
          label="Activity"
          value={draft.activity}
          options={[
            { label: "Sedentary", value: "sedentary" },
            { label: "Light", value: "light" },
            { label: "Moderate", value: "moderate" },
            { label: "Active", value: "active" },
          ]}
          onChange={(v) => update("activity", v as ProfileDraft["activity"])}
        />
        <OptionPicker
          label="Fasting"
          value={draft.fasting}
          options={[
            { label: "None", value: "none" },
            { label: "Orthodox", value: "orthodox" },
            { label: "Ramadan", value: "ramadan" },
          ]}
          onChange={(v) => update("fasting", v as ProfileDraft["fasting"])}
        />
        <View style={styles.twoColumn}>
          <LabeledInput label="Wake Time" placeholder="06:30" value={draft.wakeTime} onChangeText={(v) => update("wakeTime", v)} />
          <LabeledInput label="Sleep Time" placeholder="22:30" value={draft.sleepTime} onChangeText={(v) => update("sleepTime", v)} />
        </View>
      </SectionCard>
    );
  }

  return (
    <SectionCard eyebrow="Health considerations">
      <FieldLabel label="Conditions" />
      <View style={styles.checkboxStack}>
        {conditionOptions.map((condition) => (
          <ControlledCheckRow
            key={condition.code}
            label={condition.label}
            checked={draft.conditions.includes(condition.code)}
            onToggle={() => toggleCondition(condition.code)}
          />
        ))}
      </View>
      <LabeledInput label="Allergies" placeholder="lactose, peanuts" value={draft.allergies} onChangeText={(v) => update("allergies", v)} />
    </SectionCard>
  );
}

function prettyCondition(code: string): string {
  return conditionOptions.find((c) => c.code === code)?.label ?? code;
}

function HomeScreen({ goTo, me }: { goTo: (route: Route) => void; me: Me | null }) {
  const today = useMemo(() => toApiDate(new Date()), []);
  const logState = useAsync(() => logsApi.getDailyLogs(today), [today]);
  const planState = useAsync(async () => {
    try {
      return await mealPlansApi.getWeeklyPlan();
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null;
      throw e;
    }
  }, []);

  const summary = me?.health_summary;
  const log = logState.data;
  const glasses = log ? Math.round(log.water_ml / 250) : 0;
  const targetGlasses = 8;

  const todayPlan = planState.data?.days.find((d) => d.date === today) ?? planState.data?.days[0] ?? null;
  const previewSlot = todayPlan?.slots.find((s) => s.meal) ?? null;

  const handleLogWater = async () => {
    try {
      await logsApi.logWater(today, 250);
      logState.reload();
      Alert.alert("Water logged", "Added 250 ml to today.");
    } catch (e) {
      Alert.alert("Could not log water", errorMessage(e));
    }
  };

  return (
    <ScreenScroll>
      <View style={styles.hero}>
        <View style={styles.heroTopRow}>
          <View>
            <Text style={styles.heroKicker}>Selam,</Text>
            <Text style={styles.heroTitle}>{me?.full_name ?? "Friend"}</Text>
          </View>
          <Pressable onPress={() => goTo("profile")} style={styles.avatarButton}>
            <View style={styles.avatarFallback}>
              <Feather name="user" size={24} color={colors.primary} />
            </View>
          </Pressable>
        </View>

        <View style={styles.scorePanel}>
          <Text style={styles.scoreLabel}>Calories today</Text>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreNumber}>{log ? log.consumed.kcal.toLocaleString() : "—"}</Text>
            <Text style={styles.scoreSuffix}>
              / {log ? log.targets.kcal.toLocaleString() : summary?.targets?.kcal ?? "—"}
            </Text>
          </View>
          <Text style={styles.scoreMessage}>
            {summary?.has_profile
              ? "Keep going — log your meals to stay on target."
              : "Set up your health profile to get personalized targets."}
          </Text>
        </View>
      </View>

      <View style={styles.overlapGrid}>
        <DashboardCard icon="zap" iconColor={colors.accent} title="Calories" value={log ? log.consumed.kcal.toLocaleString() : "—"} sub="kcal" />
        <DashboardCard icon="droplet" iconColor={colors.blue} title="Water" value={`${glasses}/${targetGlasses}`} sub="glasses" />
      </View>

      {summary?.has_profile ? (
        <InfoCard
          eyebrow="Health profile"
          title={summary.conditions.length ? summary.conditions.map(prettyCondition).join(" • ") : "No conditions"}
          description={
            summary.targets
              ? `${summary.targets.kcal.toLocaleString()} kcal • ${summary.targets.carb_g}g carbs`
              : "Targets pending"
          }
          icon="user"
          actionLabel="Edit"
          onPress={() => goTo("profile")}
        />
      ) : (
        <InfoCard
          eyebrow="Get started"
          title="Complete your health profile"
          description="Add your measurements to unlock targets and a meal plan."
          icon="user"
          actionLabel="Set up"
          onPress={() => goTo("profile")}
        />
      )}

      <SectionHeader title="Today's Meal Plan" actionLabel="See all" onPress={() => goTo("mealPlan")} />
      {planState.loading ? (
        <LoadingRow />
      ) : previewSlot?.meal ? (
        <View style={styles.mealPreviewCard}>
          <Image source={{ uri: MEAL_IMAGE }} style={styles.mealPreviewImage} />
          <View style={styles.flex}>
            <Text style={styles.cardEyebrow}>{slotLabels[previewSlot.slot_type]}</Text>
            <Text style={styles.cardTitle}>{previewSlot.meal.name_en ?? "Meal"}</Text>
            <Text style={styles.cardDescription}>
              {previewSlot.meal.total_kcal ? `${previewSlot.meal.total_kcal} kcal` : "Tap Meals for details"}
            </Text>
          </View>
          <Pressable style={styles.roundAction} onPress={() => goTo("mealPlan")}>
            <Feather name="arrow-right" size={20} color={colors.primary} />
          </Pressable>
        </View>
      ) : (
        <EmptyRow text="No meal plan yet. Open the Meals tab to generate one." />
      )}

      <SectionHeader title="Quick Actions" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickActions}>
        <QuickAction title="Drink Water" icon="droplet" onPress={handleLogWater} />
        <QuickAction title="Meals" icon="calendar" onPress={() => goTo("mealPlan")} />
        <QuickAction title="Track" icon="activity" onPress={() => goTo("tracker")} />
      </ScrollView>
    </ScreenScroll>
  );
}

function dayPillLabel(dateStr: string): { day: string; date: string } {
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return { day: "--", date: "--" };
  return { day: weekdayShort[d.getDay()], date: String(d.getDate()) };
}

function orderedSlots(day: PlanDay | null): PlanSlot[] {
  if (!day) return [];
  return [...day.slots].sort(
    (a, b) => slotOrder.indexOf(a.slot_type) - slotOrder.indexOf(b.slot_type)
  );
}

function MealPlanScreen() {
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<PlanSlot | null>(null);
  const [generating, setGenerating] = useState(false);
  const [markingSlot, setMarkingSlot] = useState<string | null>(null);

  const planState = useAsync(async () => {
    try {
      return await mealPlansApi.getWeeklyPlan();
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null;
      throw e;
    }
  }, []);

  const plan = planState.data;
  const days = plan?.days ?? [];
  const activeDay = days[selectedDay] ?? days[0] ?? null;

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await mealPlansApi.generatePlan("manual");
      planState.reload();
    } catch (e) {
      Alert.alert("Could not generate plan", errorMessage(e));
    } finally {
      setGenerating(false);
    }
  };

  const handleMarkEaten = async (slot: PlanSlot) => {
    if (!activeDay) return;
    setMarkingSlot(slot.slot_id);
    try {
      await logsApi.logMealFollowed(activeDay.date, slot.slot_id);
      planState.reload();
    } catch (e) {
      Alert.alert("Could not log meal", errorMessage(e));
    } finally {
      setMarkingSlot(null);
    }
  };

  if (planState.loading) {
    return (
      <View style={[styles.flex, styles.centerFill]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (planState.error) {
    return (
      <ScreenScroll>
        <View style={styles.weekHeader}>
          <Text style={styles.headerTitle}>Meal Plan</Text>
        </View>
        <ErrorState message={errorMessage(planState.error)} onRetry={planState.reload} />
      </ScreenScroll>
    );
  }

  if (!plan || days.length === 0) {
    return (
      <ScreenScroll>
        <View style={styles.weekHeader}>
          <Text style={styles.headerTitle}>Meal Plan</Text>
        </View>
        <View style={styles.targetCard}>
          <Text style={styles.sectionCardTitle}>No active plan</Text>
          <Text style={styles.cardDescription}>
            Generate a personalized weekly plan from your health profile and targets.
          </Text>
          <View style={styles.submitWrap}>
            {generating ? (
              <View style={styles.primaryButton}>
                <ActivityIndicator color={colors.white} />
              </View>
            ) : (
              <PrimaryButton label="Generate plan" icon="zap" onPress={handleGenerate} />
            )}
          </View>
        </View>
      </ScreenScroll>
    );
  }

  return (
    <>
      <ScreenScroll>
        <View style={styles.weekHeader}>
          <View style={styles.headerNavRow}>
            <View style={styles.iconButton} />
            <Text style={styles.headerTitle}>This Week</Text>
            <View style={styles.iconButton} />
          </View>
          <View style={styles.calendarRow}>
            {days.map((day, index) => {
              const isSelected = index === selectedDay;
              const label = dayPillLabel(day.date);
              return (
                <Pressable
                  key={day.day_id}
                  onPress={() => setSelectedDay(index)}
                  style={[styles.dayPill, isSelected ? styles.dayPillSelected : undefined]}
                >
                  <Text style={[styles.dayText, isSelected ? styles.dayTextSelected : undefined]}>{label.day}</Text>
                  <Text style={[styles.dateText, isSelected ? styles.dayTextSelected : undefined]}>{label.date}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.targetCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.sectionCardTitle}>Daily Target</Text>
            <Feather name="info" size={18} color={colors.muted} />
          </View>
          <View style={styles.targetStatsRow}>
            <TargetStat
              value={activeDay?.day_kcal_target ? activeDay.day_kcal_target.toLocaleString() : "—"}
              label="kcal"
              tone={colors.primary}
            />
            <DividerVertical />
            <TargetStat value={String(orderedSlots(activeDay).length)} label="Meals" tone={colors.secondary} />
            <DividerVertical />
            <TargetStat
              value={String(orderedSlots(activeDay).filter((s) => s.is_logged).length)}
              label="Logged"
              tone={colors.accent}
            />
          </View>
        </View>

        {orderedSlots(activeDay).map((slot) => (
          <MealCard
            key={slot.slot_id}
            slot={slot}
            marking={markingSlot === slot.slot_id}
            onDetails={() => setSelectedSlot(slot)}
            onMarkEaten={() => handleMarkEaten(slot)}
          />
        ))}
      </ScreenScroll>
      <MealDetailsModal slot={selectedSlot} onClose={() => setSelectedSlot(null)} />
    </>
  );
}

function pct(consumed: number, target: number): number {
  if (!target) return 0;
  return Math.min(100, Math.round((consumed / target) * 100));
}

function sugarStatus(value: number | null): string {
  if (value == null) return "—";
  if (value < 100) return "Normal";
  if (value < 126) return "Elevated";
  return "High";
}

function TrackerScreen({ me }: { me: Me | null }) {
  const [activeTab, setActiveTab] = useState<"nutrition" | "health">("nutrition");
  const today = useMemo(() => toApiDate(new Date()), []);

  const logState = useAsync(() => logsApi.getDailyLogs(today), [today]);
  const sugarState = useAsync(() => readingsApi.list("blood_sugar", 30), []);
  const bpState = useAsync(() => readingsApi.list("blood_pressure", 30), []);

  const [sugarValue, setSugarValue] = useState("");
  const [sugarContext, setSugarContext] = useState<HealthReading["context"]>("fasting");
  const [submitting, setSubmitting] = useState(false);

  const log = logState.data;
  const latestSugar = sugarState.data?.[0] ?? null;
  const latestBp = bpState.data?.[0] ?? null;
  const requiresSugar = me?.health_summary?.requires_blood_sugar_tracking ?? false;

  const handleRecordSugar = async () => {
    const value = Number(sugarValue);
    if (!value) {
      Alert.alert("Enter a value", "Please enter a blood sugar value in mg/dL.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await readingsApi.log({
        reading_type: "blood_sugar",
        value_mg_dl: value,
        context: sugarContext,
      });
      setSugarValue("");
      sugarState.reload();
      Alert.alert(res.plan_updated ? "Plan updated" : "Reading saved", res.message_en);
    } catch (e) {
      Alert.alert("Could not save reading", errorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenScroll>
      <View style={styles.trackerHeader}>
        <Text style={styles.headerTitleLeft}>Track Progress</Text>
        <View style={styles.headerSegmented}>
          <SegmentButton active={activeTab === "nutrition"} label="Nutrition" onPress={() => setActiveTab("nutrition")} />
          <SegmentButton active={activeTab === "health"} label="Health Vitals" onPress={() => setActiveTab("health")} />
        </View>
      </View>

      {logState.loading && <LoadingRow />}

      {activeTab === "nutrition" ? (
        <>
          <View style={styles.macrosCard}>
            <Text style={styles.sectionCardTitle}>Daily Macros</Text>
            <MacroDonut value={log ? log.consumed.kcal.toLocaleString() : "—"} />
            <View style={styles.macroBarRow}>
              <MacroBar
                label="Protein"
                value={`${log?.consumed.protein_g ?? 0}g`}
                percent={log ? pct(log.consumed.protein_g, log.targets.protein_g) : 0}
                color={colors.secondary}
              />
              <MacroBar
                label="Carbs"
                value={`${log?.consumed.carb_g ?? 0}g`}
                percent={log ? pct(log.consumed.carb_g, log.targets.carb_g) : 0}
                color={colors.primary}
              />
              <MacroBar
                label="Sugar"
                value={`${log?.consumed.sugar_g ?? 0}g`}
                percent={log ? pct(log.consumed.sugar_g, log.targets.sugar_g) : 0}
                color={colors.accent}
              />
            </View>
          </View>
          <View style={styles.targetCard}>
            <Text style={styles.sectionCardTitle}>Water Intake</Text>
            <View style={styles.waterRow}>
              <View style={styles.waterIcon}>
                <Feather name="droplet" size={24} color={colors.blue} />
              </View>
              <View style={styles.flex}>
                <View style={styles.betweenRow}>
                  <Text style={styles.metricStrong}>{Math.round((log?.water_ml ?? 0) / 250)} / 8 Glasses</Text>
                  <Text style={styles.mutedSmall}>{((log?.water_ml ?? 0) / 1000).toFixed(1)}L / 2.0L</Text>
                </View>
                <ProgressBar percent={pct(log?.water_ml ?? 0, 2000)} color={colors.blue} />
              </View>
            </View>
          </View>
        </>
      ) : (
        <>
          <View style={styles.twoColumn}>
            <VitalCard
              icon="activity"
              iconColor={colors.accent}
              title="Blood Sugar"
              value={latestSugar?.value_mg_dl != null ? String(latestSugar.value_mg_dl) : "—"}
              unit="mg/dL"
              status={sugarStatus(latestSugar?.value_mg_dl ?? null)}
            />
            <VitalCard
              icon="heart"
              iconColor={colors.red}
              title="Blood Pressure"
              value={
                latestBp?.systolic_mm_hg != null
                  ? `${latestBp.systolic_mm_hg}/${latestBp.diastolic_mm_hg}`
                  : "—"
              }
              unit="mmHg"
              status={latestBp ? "Recorded" : "No data"}
            />
            <VitalCard
              icon="target"
              iconColor={colors.secondary}
              title="Daily Carbs"
              value={String(log?.consumed.carb_g ?? 0)}
              unit={`/ ${log?.targets.carb_g ?? 0}g`}
              status="Today"
            />
            <VitalCard
              icon="droplet"
              iconColor={colors.blue}
              title="Sodium"
              value={((log?.consumed.sodium_mg ?? 0) / 1000).toFixed(1)}
              unit={`/ ${((log?.targets.sodium_mg ?? 0) / 1000).toFixed(1)}g`}
              status="Today"
            />
          </View>
          <View style={styles.targetCard}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.flex}>
                <Text style={styles.sectionCardTitle}>Record Blood Sugar</Text>
                <Text style={styles.cardDescription}>
                  {requiresSugar
                    ? "Out-of-range fasting readings can update your meal plan."
                    : "Track readings to monitor your trend."}
                </Text>
              </View>
            </View>
            <View style={styles.phoneRow}>
              <TextInput
                value={sugarValue}
                onChangeText={(t) => setSugarValue(t.replace(/[^\d.]/g, ""))}
                placeholder="mg/dL"
                placeholderTextColor={colors.muted}
                keyboardType="number-pad"
                style={[styles.input, styles.flex]}
              />
            </View>
            <OptionPicker
              label="Context"
              value={sugarContext}
              options={[
                { label: "Fasting", value: "fasting" },
                { label: "Pre-meal", value: "pre_meal" },
                { label: "Post-meal", value: "post_meal" },
                { label: "Random", value: "random" },
              ]}
              onChange={(v) => setSugarContext(v as HealthReading["context"])}
            />
            <View style={styles.submitWrap}>
              {submitting ? (
                <View style={styles.primaryButton}>
                  <ActivityIndicator color={colors.white} />
                </View>
              ) : (
                <PrimaryButton label="Save reading" icon="plus" onPress={handleRecordSugar} />
              )}
            </View>
          </View>
        </>
      )}
    </ScreenScroll>
  );
}

function ProfileScreen({
  me,
  onMeChange,
  onLogout,
}: {
  me: Me | null;
  onMeChange: (me: Me) => void;
  onLogout: () => void;
}) {
  const profileState = useAsync(async () => {
    try {
      return await profileApi.getHealthProfile();
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null;
      throw e;
    }
  }, []);

  const [fullName, setFullName] = useState(me?.full_name ?? "");
  const [draft, setDraft] = useState<ProfileDraft>(emptyDraft);
  const [hydrated, setHydrated] = useState(false);
  const [saving, setSaving] = useState(false);

  const update = <K extends keyof ProfileDraft>(key: K, value: ProfileDraft[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const toggleCondition = (code: string) =>
    setDraft((prev) => ({
      ...prev,
      conditions: prev.conditions.includes(code)
        ? prev.conditions.filter((c) => c !== code)
        : [...prev.conditions, code],
    }));

  // Hydrate the editable draft once from the fetched profile.
  useEffect(() => {
    const p = profileState.data;
    if (p && !hydrated) {
      setDraft({
        sex: p.sex,
        birthYear: p.birth_year != null ? String(p.birth_year) : "",
        heightCm: p.height_cm != null ? String(p.height_cm) : "",
        weightKg: p.current_weight_kg != null ? String(p.current_weight_kg) : "",
        targetWeightKg: p.target_weight_kg != null ? String(p.target_weight_kg) : "",
        activity: p.activity_level,
        goal: p.primary_goal,
        fasting: p.fasting_type,
        wakeTime: p.wake_time ?? "",
        sleepTime: p.sleep_time ?? "",
        conditions: p.conditions ?? [],
        allergies: (p.allergies ?? []).join(", "),
      });
      setHydrated(true);
    }
  }, [profileState.data, hydrated]);

  const handleSave = async () => {
    if (!draft.birthYear || !draft.heightCm || !draft.weightKg) {
      Alert.alert("Missing info", "Please fill in your birth year, height, and weight.");
      return;
    }
    setSaving(true);
    try {
      if (fullName.trim() && fullName.trim() !== me?.full_name) {
        await profileApi.updateMe({ full_name: fullName.trim() });
      }
      await profileApi.upsertHealthProfile(draftToInput(draft));
      const fresh = await profileApi.getMe();
      onMeChange(fresh);
      profileState.reload();
      Alert.alert("Profile saved", "Your profile has been updated.");
    } catch (e) {
      Alert.alert("Could not save", errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const p = profileState.data;
  const fmt = (v: number | null | undefined, suffix = "") => (v != null ? `${v.toLocaleString()}${suffix}` : "—");

  return (
    <ScreenScroll>
      <View style={styles.profileHero}>
        <View style={styles.profileAvatar}>
          <Feather name="user" size={28} color={colors.primary} />
        </View>
        <View>
          <Text style={styles.heroTitle}>Profile</Text>
          <Text style={styles.heroKicker}>{me?.phone_number ?? "Edit your health profile"}</Text>
        </View>
      </View>

      {profileState.loading ? (
        <LoadingRow />
      ) : (
        <>
          <SectionCard title="Personal Details">
            <LabeledInput label="Full Name" value={fullName} onChangeText={setFullName} placeholder="Abebe Bikila" />
            <OptionPicker
              label="Sex"
              value={draft.sex}
              options={[
                { label: "Female", value: "female" },
                { label: "Male", value: "male" },
                { label: "Other", value: "other" },
              ]}
              onChange={(v) => update("sex", v as ProfileDraft["sex"])}
            />
            <View style={styles.twoColumn}>
              <LabeledInput label="Birth Year" keyboardType="number-pad" value={draft.birthYear} onChangeText={(v) => update("birthYear", v)} />
              <LabeledInput label="Height (cm)" keyboardType="number-pad" value={draft.heightCm} onChangeText={(v) => update("heightCm", v)} />
              <LabeledInput label="Weight (kg)" keyboardType="decimal-pad" value={draft.weightKg} onChangeText={(v) => update("weightKg", v)} />
              <LabeledInput label="Target (kg)" keyboardType="decimal-pad" value={draft.targetWeightKg} onChangeText={(v) => update("targetWeightKg", v)} />
            </View>
          </SectionCard>

          <SectionCard title="Health Planning">
            <OptionPicker
              label="Primary Goal"
              value={draft.goal}
              options={[
                { label: "Lose weight", value: "lose_weight" },
                { label: "Gain weight", value: "gain_weight" },
                { label: "Maintain", value: "maintain" },
                { label: "Manage condition", value: "manage_condition" },
              ]}
              onChange={(v) => update("goal", v as ProfileDraft["goal"])}
            />
            <OptionPicker
              label="Activity"
              value={draft.activity}
              options={[
                { label: "Sedentary", value: "sedentary" },
                { label: "Light", value: "light" },
                { label: "Moderate", value: "moderate" },
                { label: "Active", value: "active" },
              ]}
              onChange={(v) => update("activity", v as ProfileDraft["activity"])}
            />
            <OptionPicker
              label="Fasting"
              value={draft.fasting}
              options={[
                { label: "None", value: "none" },
                { label: "Orthodox", value: "orthodox" },
                { label: "Ramadan", value: "ramadan" },
              ]}
              onChange={(v) => update("fasting", v as ProfileDraft["fasting"])}
            />
            <View style={styles.twoColumn}>
              <LabeledInput label="Wake Time" placeholder="06:30" value={draft.wakeTime} onChangeText={(v) => update("wakeTime", v)} />
              <LabeledInput label="Sleep Time" placeholder="22:30" value={draft.sleepTime} onChangeText={(v) => update("sleepTime", v)} />
            </View>
          </SectionCard>

          <SectionCard title="Conditions & Allergies">
            {conditionOptions.map((condition) => (
              <ControlledCheckRow
                key={condition.code}
                label={condition.label}
                checked={draft.conditions.includes(condition.code)}
                onToggle={() => toggleCondition(condition.code)}
              />
            ))}
            <LabeledInput label="Allergies" placeholder="lactose, peanuts" value={draft.allergies} onChangeText={(v) => update("allergies", v)} />
          </SectionCard>

          <SectionCard title="Computed Targets">
            <View style={styles.targetPillGrid}>
              <TargetPill label="kcal" value={fmt(p?.daily_kcal_target ?? me?.health_summary?.targets?.kcal)} />
              <TargetPill label="protein" value={fmt(p?.protein_g_target, "g")} />
              <TargetPill label="carbs" value={fmt(p?.carb_g_target, "g")} />
              <TargetPill label="sodium" value={fmt(p?.sodium_mg_target, "mg")} />
              <TargetPill label="sugar" value={fmt(p?.sugar_g_target, "g")} />
              <TargetPill label="BMI" value={fmt(p?.bmi ?? me?.health_summary?.bmi)} />
            </View>
          </SectionCard>

          <View style={styles.profileActions}>
            {saving ? (
              <View style={styles.primaryButton}>
                <ActivityIndicator color={colors.white} />
              </View>
            ) : (
              <PrimaryButton label="Save Profile" icon="save" onPress={handleSave} />
            )}
            <Pressable style={styles.logoutButton} onPress={onLogout}>
              <Feather name="log-out" size={18} color={colors.red} />
              <Text style={styles.logoutText}>Log out</Text>
            </Pressable>
          </View>
        </>
      )}
    </ScreenScroll>
  );
}

function BottomNav({ activeRoute, goTo }: { activeRoute: MainRoute; goTo: (route: Route) => void }) {
  return (
    <View style={styles.bottomNav}>
      {navItems.map((item) => {
        const isActive = item.route === activeRoute;
        return (
          <Pressable key={item.route} onPress={() => goTo(item.route)} style={styles.navItem}>
            <View style={[styles.navIconWrap, isActive ? styles.navIconActive : undefined]}>
              <Feather name={item.icon} size={22} color={isActive ? colors.primary : colors.muted} />
            </View>
            <Text style={[styles.navText, isActive ? styles.navTextActive : undefined]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function ScreenScroll({ children }: { children: ReactNode }) {
  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}

function PrimaryButton({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon?: keyof typeof Feather.glyphMap;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.primaryButton}>
      <Text style={styles.primaryButtonText}>{label}</Text>
      {icon ? <Feather name={icon} size={20} color={colors.white} /> : undefined}
    </Pressable>
  );
}

function SecondaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.secondaryButton}>
      <Text style={styles.secondaryButtonText}>{label}</Text>
    </Pressable>
  );
}

function SegmentButton({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.segmentButton, active ? styles.segmentActive : undefined]}>
      <Text style={[styles.segmentText, active ? styles.segmentTextActive : undefined]}>{label}</Text>
    </Pressable>
  );
}

function IconButton({
  icon,
  onPress,
  inverted = false,
}: {
  icon: keyof typeof Feather.glyphMap;
  onPress?: () => void;
  inverted?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.iconButton, inverted ? styles.iconButtonInverted : undefined]}>
      <Feather name={icon} size={20} color={inverted ? colors.white : colors.text} />
    </Pressable>
  );
}

function FieldLabel({ label }: { label: string }) {
  return <Text style={styles.fieldLabel}>{label}</Text>;
}

function SectionCard({
  title,
  eyebrow,
  children,
}: {
  title?: string;
  eyebrow?: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.sectionCard}>
      {eyebrow ? <Text style={styles.cardEyebrow}>{eyebrow}</Text> : undefined}
      {title ? <Text style={styles.sectionCardTitle}>{title}</Text> : undefined}
      <View style={styles.cardStack}>{children}</View>
    </View>
  );
}

function LabeledInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "number-pad" | "decimal-pad" | "phone-pad";
}) {
  return (
    <View style={styles.field}>
      <FieldLabel label={label} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        keyboardType={keyboardType ?? "default"}
        style={styles.input}
      />
    </View>
  );
}

function OptionPicker({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<{ label: string; value: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <View style={styles.field}>
      <FieldLabel label={label} />
      <View style={styles.pickerRow}>
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => onChange(opt.value)}
              style={[styles.pickerChip, active ? styles.pickerChipActive : undefined]}
            >
              <Text style={[styles.pickerChipText, active ? styles.pickerChipTextActive : undefined]}>{opt.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function ControlledCheckRow({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable onPress={onToggle} style={styles.checkRow}>
      <Text style={styles.checkLabel}>{label}</Text>
      <View style={[styles.checkbox, checked ? styles.checkboxActive : undefined]}>
        {checked ? <Feather name="check" size={14} color={colors.white} /> : undefined}
      </View>
    </Pressable>
  );
}

function LoadingRow() {
  return (
    <View style={styles.loadingRow}>
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}

function EmptyRow({ text }: { text: string }) {
  return (
    <View style={styles.emptyRow}>
      <Text style={styles.emptyRowText}>{text}</Text>
    </View>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View style={styles.targetCard}>
      <Text style={styles.sectionCardTitle}>Something went wrong</Text>
      <Text style={styles.cardDescription}>{message}</Text>
      <View style={styles.submitWrap}>
        <SecondaryButton label="Retry" onPress={onRetry} />
      </View>
    </View>
  );
}

function DashboardCard({
  icon,
  iconColor,
  title,
  value,
  sub,
}: {
  icon: keyof typeof Feather.glyphMap;
  iconColor: string;
  title: string;
  value: string;
  sub: string;
}) {
  return (
    <View style={styles.dashboardCard}>
      <View style={styles.dashboardHeader}>
        <Feather name={icon} size={20} color={iconColor} />
        <Text style={styles.dashboardTitle}>{title}</Text>
      </View>
      <View style={styles.baselineRow}>
        <Text style={styles.dashboardValue}>{value}</Text>
        <Text style={styles.cardDescription}>{sub}</Text>
      </View>
    </View>
  );
}

function InfoCard({
  eyebrow,
  title,
  description,
  icon,
  actionLabel,
  onPress,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: keyof typeof Feather.glyphMap;
  actionLabel: string;
  onPress: () => void;
}) {
  return (
    <View style={styles.infoCard}>
      <View style={styles.infoIcon}>
        <Feather name={icon} size={22} color={colors.primary} />
      </View>
      <View style={styles.flex}>
        <Text style={styles.cardEyebrow}>{eyebrow}</Text>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDescription}>{description}</Text>
      </View>
      <Pressable onPress={onPress}>
        <Text style={styles.linkText}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}

function SectionHeader({
  title,
  actionLabel,
  onPress,
}: {
  title: string;
  actionLabel?: string;
  onPress?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {actionLabel && onPress ? (
        <Pressable onPress={onPress}>
          <Text style={styles.linkText}>{actionLabel}</Text>
        </Pressable>
      ) : undefined}
    </View>
  );
}

function QuickAction({ title, icon, onPress }: { title: string; icon: keyof typeof Feather.glyphMap; onPress: () => void }) {
  return (
    <Pressable style={styles.quickAction} onPress={onPress}>
      <View style={styles.quickActionIcon}>
        <Feather name={icon} size={24} color={colors.primary} />
      </View>
      <Text style={styles.quickActionText}>{title}</Text>
    </Pressable>
  );
}

function TargetStat({ value, label, tone }: { value: string; label: string; tone: string }) {
  return (
    <View style={styles.targetStat}>
      <Text style={[styles.targetStatValue, { color: tone }]}>{value}</Text>
      <Text style={styles.cardDescription}>{label}</Text>
    </View>
  );
}

function DividerVertical() {
  return <View style={styles.dividerVertical} />;
}

function MealCard({
  slot,
  marking,
  onDetails,
  onMarkEaten,
}: {
  slot: PlanSlot;
  marking: boolean;
  onDetails: () => void;
  onMarkEaten: () => void;
}) {
  const meal = slot.meal;
  return (
    <View style={styles.fullMealCard}>
      <View>
        <Image source={{ uri: MEAL_IMAGE }} style={styles.mealImage} />
        <View style={[styles.imageBadge, styles.imageBadgeLeft]}>
          <Text style={styles.imageBadgeTextPrimary}>{slotLabels[slot.slot_type]}</Text>
        </View>
        {slot.is_logged && (
          <View style={[styles.imageBadge, styles.imageBadgeRight, styles.imageBadgeDark]}>
            <Text style={styles.imageBadgeTextLight}>Eaten</Text>
          </View>
        )}
      </View>
      <View style={styles.mealCardBody}>
        <Text style={styles.mealTitle}>{meal?.name_en ?? "No meal planned"}</Text>
        <View style={styles.mealStatsRow}>
          <MiniStat value={meal?.total_kcal != null ? String(meal.total_kcal) : "—"} label="Kcal" />
          <MiniStat value={meal ? String(meal.items.length) : "0"} label="Items" />
        </View>
        <View style={styles.mealActionsGrid}>
          <SecondaryButton label="Details" onPress={onDetails} />
          <Pressable style={styles.softActionButton} onPress={() => Alert.alert("Replace meal", "Meal substitution is coming soon.")}>
            <Text style={styles.softActionText}>Replace</Text>
          </Pressable>
        </View>
        {slot.is_logged ? (
          <View style={[styles.primaryButton, styles.disabled]}>
            <Text style={styles.primaryButtonText}>Logged</Text>
          </View>
        ) : marking ? (
          <View style={styles.primaryButton}>
            <ActivityIndicator color={colors.white} />
          </View>
        ) : (
          <PrimaryButton label="Mark Eaten" onPress={onMarkEaten} />
        )}
      </View>
    </View>
  );
}

function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.miniStat}>
      <Text style={styles.miniStatValue}>{value}</Text>
      <Text style={styles.miniStatLabel}>{label}</Text>
    </View>
  );
}

type Macro = {
  kcal: number | null;
  protein: number | null;
  carb: number | null;
  fat: number | null;
  fiber: number | null;
  sodium: number | null;
  sugar: number | null;
};

/** Scale an ingredient's per-100g macros to the logged quantity. */
function ingredientMacro(ing: Ingredient | undefined, qtyG: number | null): Macro | null {
  if (!ing || !qtyG) return null;
  const scale = qtyG / 100;
  const g = (v?: number) => (typeof v === "number" ? Math.round(v * scale) : null);
  return {
    kcal: g(ing.kcal_per_100g),
    protein: g(ing.protein_g_per_100g),
    carb: g(ing.carb_g_per_100g),
    fat: g(ing.fat_g_per_100g),
    fiber: g(ing.fiber_g_per_100g),
    sodium: g(ing.sodium_mg_per_100g),
    sugar: g(ing.sugar_g_per_100g),
  };
}

function fmtMacro(v: number | null, suffix: string): string {
  return v != null ? `${v}${suffix}` : "—";
}

function MealDetailsModal({ slot, onClose }: { slot: PlanSlot | null; onClose: () => void }) {
  const meal = slot?.meal ?? null;

  const ingState = useAsync(async () => {
    const map = new Map<string, Ingredient>();
    if (!meal) return map;
    const ids = Array.from(
      new Set(meal.items.map((i) => i.ingredient_id).filter((id): id is string => Boolean(id)))
    );
    const fetched = await Promise.all(ids.map((id) => ingredientsApi.get(id).catch(() => null)));
    for (const ing of fetched) if (ing) map.set(ing.id, ing);
    return map;
  }, [meal?.id]);

  const ingredientsMap = ingState.data ?? new Map<string, Ingredient>();

  let totalProtein = 0;
  let totalCarb = 0;
  let totalFat = 0;
  let hasMacros = false;
  if (meal) {
    for (const item of meal.items) {
      const m = ingredientMacro(
        item.ingredient_id ? ingredientsMap.get(item.ingredient_id) : undefined,
        item.quantity_g
      );
      if (m) {
        hasMacros = true;
        totalProtein += m.protein ?? 0;
        totalCarb += m.carb ?? 0;
        totalFat += m.fat ?? 0;
      }
    }
  }

  return (
    <Modal visible={Boolean(slot)} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      {slot && meal ? (
        <SafeAreaView style={styles.modalScreen}>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <View style={styles.modalHeaderRow}>
              <View>
                <Text style={styles.cardEyebrow}>{slotLabels[slot.slot_type]}</Text>
                <Text style={styles.modalTitle}>{meal.name_en ?? "Meal"}</Text>
              </View>
              <IconButton icon="x" onPress={onClose} />
            </View>
            <Image source={{ uri: MEAL_IMAGE }} style={styles.modalImage} />
            <View style={styles.summaryGrid}>
              <SummaryStat label="kcal" value={meal.total_kcal != null ? String(meal.total_kcal) : "—"} tone={colors.primary} />
              <SummaryStat label="protein" value={hasMacros ? `${totalProtein}g` : "—"} tone={colors.secondary} />
              <SummaryStat label="carbs" value={hasMacros ? `${totalCarb}g` : "—"} tone={colors.accent} />
              <SummaryStat label="fat" value={hasMacros ? `${totalFat}g` : "—"} tone={colors.text} />
            </View>
            <Text style={styles.sectionCardTitle}>Ingredients</Text>
            <Text style={styles.cardDescription}>
              {meal.items.length} ingredient{meal.items.length === 1 ? "" : "s"} in this meal
            </Text>
            {ingState.loading ? (
              <LoadingRow />
            ) : meal.items.length === 0 ? (
              <EmptyRow text="No ingredient details available." />
            ) : (
              <View style={styles.ingredientsCard}>
                {meal.items.map((item, index) => (
                  <NutritionRow
                    key={item.item_id}
                    item={item}
                    macro={ingredientMacro(
                      item.ingredient_id ? ingredientsMap.get(item.ingredient_id) : undefined,
                      item.quantity_g
                    )}
                    isLast={index === meal.items.length - 1}
                  />
                ))}
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      ) : null}
    </Modal>
  );
}

function NutritionRow({ item, macro, isLast }: { item: MealItem; macro: Macro | null; isLast: boolean }) {
  const name = item.ingredient_name_en ?? item.ingredient_name_am ?? "Ingredient";
  return (
    <View style={[styles.ingredientRow, !isLast ? styles.ingredientBorder : undefined]}>
      <View style={styles.betweenRow}>
        <View style={styles.flex}>
          <Text style={styles.ingredientName}>{name}</Text>
          <Text style={styles.cardDescription}>{item.quantity_g != null ? `${item.quantity_g} g` : "—"}</Text>
        </View>
        <View style={styles.ingredientCalories}>
          <Text style={styles.ingredientCaloriesValue}>{macro?.kcal != null ? macro.kcal : "—"}</Text>
          <Text style={styles.miniStatLabel}>kcal</Text>
        </View>
      </View>
      {macro && (
        <View style={styles.nutrientsGrid}>
          <Nutrient label="Protein" value={fmtMacro(macro.protein, "g")} tone={colors.secondary} />
          <Nutrient label="Carbs" value={fmtMacro(macro.carb, "g")} tone={colors.accent} />
          <Nutrient label="Fat" value={fmtMacro(macro.fat, "g")} tone={colors.text} />
          <Nutrient label="Fiber" value={fmtMacro(macro.fiber, "g")} tone={colors.primary} />
          <Nutrient label="Sodium" value={fmtMacro(macro.sodium, "mg")} tone={colors.muted} />
          <Nutrient label="Sugar" value={fmtMacro(macro.sugar, "g")} tone={colors.muted} />
        </View>
      )}
    </View>
  );
}

function SummaryStat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <View style={styles.summaryStat}>
      <Text style={[styles.summaryValue, { color: tone }]}>{value}</Text>
      <Text style={styles.miniStatLabel}>{label}</Text>
    </View>
  );
}

function Nutrient({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <View style={styles.nutrient}>
      <Text style={[styles.nutrientValue, { color: tone }]}>{value}</Text>
      <Text style={styles.cardDescription}>{label}</Text>
    </View>
  );
}

function MacroDonut({ value }: { value: string }) {
  return (
    <View style={styles.donutWrap}>
      <View style={styles.donutRing}>
        <View style={[styles.donutArc, styles.donutArcProtein]} />
        <View style={[styles.donutArc, styles.donutArcCarbs]} />
        <View style={[styles.donutArc, styles.donutArcFat]} />
        <View style={styles.donutInner}>
          <Text style={styles.donutValue}>{value}</Text>
          <Text style={styles.cardDescription}>kcal eaten</Text>
        </View>
      </View>
    </View>
  );
}

function MacroBar({
  label,
  value,
  percent,
  color,
}: {
  label: string;
  value: string;
  percent: number;
  color: string;
}) {
  return (
    <View style={styles.macroBarItem}>
      <View style={styles.verticalBarTrack}>
        <View style={[styles.verticalBarFill, { height: `${percent}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.miniStatLabel}>{label}</Text>
      <Text style={styles.metricStrong}>{value}</Text>
    </View>
  );
}

function ProgressBar({ percent, color }: { percent: number; color: string }) {
  return (
    <View style={styles.progressBarTrack}>
      <View style={[styles.progressBarFill, { width: `${percent}%`, backgroundColor: color }]} />
    </View>
  );
}

function VitalCard({
  icon,
  iconColor,
  title,
  value,
  unit,
  status,
}: {
  icon: keyof typeof Feather.glyphMap;
  iconColor: string;
  title: string;
  value: string;
  unit: string;
  status: string;
}) {
  return (
    <View style={styles.vitalCard}>
      <View style={styles.vitalIcon}>
        <Feather name={icon} size={20} color={iconColor} />
      </View>
      <Text style={styles.cardDescription}>{title}</Text>
      <View style={styles.baselineRow}>
        <Text style={styles.vitalValue}>{value}</Text>
        <Text style={styles.cardDescription}>{unit}</Text>
      </View>
      <View style={styles.statusPill}>
        <Text style={styles.statusText}>{status}</Text>
      </View>
    </View>
  );
}

function TargetPill({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.targetPill}>
      <Text style={styles.targetPillValue}>{value}</Text>
      <Text style={styles.miniStatLabel}>{label}</Text>
    </View>
  );
}

const shadow = {
  shadowColor: "#19251E",
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.08,
  shadowRadius: 20,
  elevation: 4,
};

const styles = StyleSheet.create({
  appShell: {
    flex: 1,
    backgroundColor: "#E8E6E0",
    alignItems: "center",
  },
  phoneFrame: {
    flex: 1,
    width: "100%",
    maxWidth: 430,
    backgroundColor: colors.background,
  },
  screen: {
    flex: 1,
    paddingBottom: 82,
    backgroundColor: colors.background,
  },
  screenWithoutNav: {
    paddingBottom: 0,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 28,
  },
  splash: {
    flex: 1,
    backgroundColor: colors.background,
  },
  splashImage: {
    height: "58%",
    width: "100%",
    borderBottomLeftRadius: 44,
    borderBottomRightRadius: 44,
  },
  splashOverlay: {
    ...StyleSheet.absoluteFillObject,
    height: "58%",
    backgroundColor: "rgba(46, 94, 78, 0.28)",
    borderBottomLeftRadius: 44,
    borderBottomRightRadius: 44,
  },
  splashContent: {
    marginTop: -34,
    paddingHorizontal: 32,
    paddingTop: 42,
    alignItems: "center",
    backgroundColor: colors.background,
    borderTopLeftRadius: 44,
    borderTopRightRadius: 44,
  },
  splashSubtitle: {
    color: colors.secondary,
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  splashTitle: {
    color: colors.text,
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 14,
  },
  splashText: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },
  splashFooter: {
    marginTop: "auto",
    paddingHorizontal: 32,
    paddingBottom: 34,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 28,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 99,
    backgroundColor: "#BEC4BA",
  },
  dotActive: {
    width: 32,
    backgroundColor: colors.primary,
  },
  authContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 34,
  },
  pageTitle: {
    marginTop: 18,
    color: colors.text,
    fontSize: 27,
    lineHeight: 32,
    fontWeight: "800",
  },
  pageDescription: {
    marginTop: 8,
    marginBottom: 22,
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.input,
    alignItems: "center",
    justifyContent: "center",
  },
  iconButtonInverted: {
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  segmented: {
    flexDirection: "row",
    padding: 4,
    borderRadius: 14,
    backgroundColor: colors.input,
    marginBottom: 22,
  },
  headerSegmented: {
    flexDirection: "row",
    padding: 4,
    borderRadius: 14,
    backgroundColor: colors.white,
  },
  segmentButton: {
    flex: 1,
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 11,
  },
  segmentActive: {
    backgroundColor: colors.card,
  },
  segmentText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "700",
  },
  segmentTextActive: {
    color: colors.primary,
  },
  progressRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 22,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 99,
    overflow: "hidden",
    backgroundColor: colors.input,
  },
  progressFill: {
    height: "100%",
    width: 0,
    borderRadius: 99,
    backgroundColor: colors.primary,
  },
  progressComplete: {
    width: "100%",
  },
  formStack: {
    gap: 16,
    marginBottom: 16,
  },
  field: {
    gap: 7,
    flexGrow: 1,
    flexBasis: "47%",
  },
  fieldLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.input,
    paddingHorizontal: 14,
    color: colors.text,
    fontSize: 15,
  },
  phoneRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  countryCode: {
    minHeight: 48,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.input,
    alignItems: "center",
    justifyContent: "center",
  },
  countryCodeText: {
    color: colors.muted,
    fontWeight: "700",
  },
  primaryButton: {
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 18,
    ...shadow,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "800",
  },
  secondaryButton: {
    minHeight: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  separatorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 18,
  },
  separator: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  separatorText: {
    color: colors.muted,
    fontSize: 12,
  },
  textButton: {
    marginTop: 16,
    alignItems: "center",
  },
  textButtonText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "700",
  },
  sectionCard: {
    marginHorizontal: 24,
    marginTop: 18,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    ...shadow,
  },
  cardStack: {
    gap: 14,
  },
  cardEyebrow: {
    color: colors.secondary,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    marginBottom: 5,
  },
  sectionCardTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 14,
  },
  twoColumn: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  selectLike: {
    minHeight: 48,
    minWidth: 0,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.input,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  selectText: {
    color: colors.text,
    fontSize: 15,
  },
  checkboxStack: {
    gap: 10,
  },
  checkRow: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.input,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  checkLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
  },
  checkboxActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  hero: {
    paddingHorizontal: 24,
    paddingTop: 38,
    paddingBottom: 34,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    backgroundColor: colors.primary,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  heroKicker: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 14,
    fontWeight: "700",
  },
  heroTitle: {
    color: colors.white,
    fontSize: 26,
    fontWeight: "900",
  },
  avatarButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: colors.secondary,
    overflow: "hidden",
    backgroundColor: colors.white,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  scorePanel: {
    position: "relative",
    paddingVertical: 6,
  },
  reactionBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  scoreLabel: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 4,
  },
  scoreNumber: {
    color: colors.secondary,
    fontSize: 86,
    lineHeight: 90,
    fontWeight: "900",
  },
  scoreSuffix: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 24,
    fontWeight: "800",
    paddingBottom: 12,
  },
  scoreMessage: {
    maxWidth: 270,
    color: colors.white,
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "700",
  },
  resultChip: {
    position: "absolute",
    right: 0,
    top: 44,
    width: 76,
    height: 76,
    borderRadius: 18,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  resultChipText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "900",
    marginTop: 4,
  },
  resultStatRow: {
    flexDirection: "row",
    marginTop: 24,
    gap: 18,
  },
  heroStat: {
    flex: 1,
  },
  heroStatValue: {
    fontSize: 22,
    fontWeight: "900",
  },
  heroStatLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  overlapGrid: {
    marginHorizontal: 24,
    marginTop: -18,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  dashboardCard: {
    width: "48%",
    minHeight: 104,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    ...shadow,
  },
  dashboardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  dashboardTitle: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700",
  },
  baselineRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 5,
  },
  dashboardValue: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "900",
  },
  infoCard: {
    marginHorizontal: 24,
    marginTop: 28,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    ...shadow,
  },
  infoIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  cardDescription: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  linkText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "900",
  },
  sectionHeader: {
    marginHorizontal: 24,
    marginTop: 30,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: "900",
  },
  mealPreviewCard: {
    marginHorizontal: 24,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    ...shadow,
  },
  mealPreviewImage: {
    width: 82,
    height: 82,
    borderRadius: 14,
  },
  roundAction: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  filledRoundAction: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  quickActions: {
    paddingHorizontal: 24,
    gap: 16,
  },
  quickAction: {
    width: 88,
    alignItems: "center",
    gap: 8,
  },
  quickActionIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
    ...shadow,
  },
  quickActionText: {
    color: colors.text,
    fontSize: 12,
    textAlign: "center",
    fontWeight: "700",
  },
  weekHeader: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingTop: 34,
    paddingBottom: 24,
  },
  headerNavRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  headerTitle: {
    color: colors.white,
    fontSize: 21,
    fontWeight: "900",
  },
  headerTitleLeft: {
    color: colors.white,
    fontSize: 23,
    fontWeight: "900",
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
  },
  calendarRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 6,
  },
  dayPill: {
    flex: 1,
    height: 62,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  dayPillSelected: {
    backgroundColor: colors.secondary,
  },
  dayText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 4,
  },
  dateText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 16,
    fontWeight: "800",
  },
  dayTextSelected: {
    color: colors.primary,
  },
  targetCard: {
    marginHorizontal: 24,
    marginTop: 20,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    ...shadow,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  targetStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  targetStat: {
    flex: 1,
    alignItems: "center",
  },
  targetStatValue: {
    fontSize: 20,
    fontWeight: "900",
  },
  dividerVertical: {
    width: 1,
    height: 42,
    backgroundColor: colors.border,
  },
  fullMealCard: {
    marginHorizontal: 24,
    marginTop: 18,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    ...shadow,
  },
  mealImage: {
    width: "100%",
    height: 140,
  },
  imageBadge: {
    position: "absolute",
    top: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99,
    backgroundColor: colors.card,
  },
  imageBadgeLeft: {
    left: 12,
  },
  imageBadgeRight: {
    right: 12,
  },
  imageBadgeDark: {
    backgroundColor: colors.primary,
  },
  imageBadgeTextPrimary: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
  },
  imageBadgeTextLight: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "800",
  },
  mealCardBody: {
    padding: 16,
  },
  mealTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: "900",
    marginBottom: 14,
  },
  mealStatsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
  },
  miniStat: {
    flex: 1,
    padding: 10,
    borderRadius: 12,
    backgroundColor: colors.input,
    alignItems: "center",
  },
  miniStatValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
  },
  miniStatLabel: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  mealActionsGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  softActionButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  softActionText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "900",
  },
  modalScreen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalContent: {
    padding: 24,
    paddingBottom: 40,
  },
  modalHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 14,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 25,
    lineHeight: 31,
    fontWeight: "900",
  },
  modalImage: {
    width: "100%",
    height: 160,
    borderRadius: 18,
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: "row",
    gap: 10,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    marginBottom: 20,
  },
  summaryStat: {
    flex: 1,
    alignItems: "center",
  },
  summaryValue: {
    fontSize: 17,
    fontWeight: "900",
  },
  ingredientsCard: {
    marginTop: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    overflow: "hidden",
  },
  ingredientRow: {
    padding: 16,
  },
  ingredientBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  betweenRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
  },
  ingredientName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
  },
  ingredientCalories: {
    alignItems: "flex-end",
  },
  ingredientCaloriesValue: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: "900",
  },
  nutrientsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 14,
  },
  nutrient: {
    width: "30%",
  },
  nutrientValue: {
    fontSize: 14,
    fontWeight: "900",
  },
  trackerHeader: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingTop: 38,
    paddingBottom: 24,
    gap: 22,
  },
  macrosCard: {
    marginHorizontal: 24,
    marginTop: 20,
    padding: 22,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: "center",
    ...shadow,
  },
  donutWrap: {
    width: 188,
    height: 188,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },
  donutRing: {
    width: 168,
    height: 168,
    borderRadius: 84,
    borderWidth: 18,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  donutArc: {
    position: "absolute",
    width: 168,
    height: 168,
    borderRadius: 84,
    borderWidth: 18,
    borderColor: "transparent",
  },
  donutArcProtein: {
    borderTopColor: colors.secondary,
    borderRightColor: colors.secondary,
    transform: [{ rotate: "20deg" }],
  },
  donutArcCarbs: {
    borderBottomColor: colors.primary,
    borderLeftColor: colors.primary,
    transform: [{ rotate: "20deg" }],
  },
  donutArcFat: {
    borderTopColor: colors.accent,
    transform: [{ rotate: "128deg" }],
  },
  donutInner: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  donutValue: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "900",
  },
  macroBarRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  macroBarItem: {
    flex: 1,
    alignItems: "center",
    gap: 5,
  },
  verticalBarTrack: {
    width: 10,
    height: 94,
    borderRadius: 99,
    backgroundColor: colors.input,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  verticalBarFill: {
    width: "100%",
    borderRadius: 99,
  },
  waterRow: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
  },
  waterIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.blueSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  metricStrong: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
  },
  mutedSmall: {
    color: colors.muted,
    fontSize: 13,
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 99,
    overflow: "hidden",
    backgroundColor: colors.input,
    marginTop: 8,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 99,
  },
  vitalCard: {
    width: "48%",
    minHeight: 156,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    ...shadow,
  },
  vitalIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.input,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  vitalValue: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "900",
  },
  statusPill: {
    alignSelf: "flex-start",
    marginTop: "auto",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: colors.greenSoft,
  },
  statusText: {
    color: colors.green,
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  readingType: {
    minWidth: 100,
  },
  coachHeader: {
    paddingHorizontal: 24,
    paddingTop: 38,
    paddingBottom: 22,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  coachIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  messagesContent: {
    padding: 18,
    gap: 14,
  },
  messageRow: {
    maxWidth: "88%",
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-end",
  },
  messageRowUser: {
    alignSelf: "flex-end",
    flexDirection: "row-reverse",
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  messageAvatarUser: {
    backgroundColor: colors.secondary,
  },
  messageBubble: {
    flex: 1,
    padding: 14,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  messageBubbleUser: {
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 4,
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  messageText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 21,
  },
  messageTextUser: {
    color: colors.white,
  },
  chatInputWrap: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: 14,
    backgroundColor: colors.background,
  },
  chatInput: {
    minHeight: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.input,
    paddingLeft: 16,
    paddingRight: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  chatTextInput: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: {
    opacity: 0.45,
  },
  profileHero: {
    paddingHorizontal: 24,
    paddingTop: 38,
    paddingBottom: 34,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  targetPillGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  targetPill: {
    width: "30%",
    minHeight: 64,
    borderRadius: 14,
    backgroundColor: colors.input,
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  targetPillValue: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "900",
    textAlign: "center",
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 82,
    paddingHorizontal: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...shadow,
  },
  navItem: {
    width: 68,
    height: 68,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  navIconWrap: {
    width: 38,
    height: 34,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  navIconActive: {
    backgroundColor: colors.primarySoft,
  },
  navText: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "800",
  },
  navTextActive: {
    color: colors.primary,
  },
  centerFill: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primarySoft,
  },
  submitWrap: {
    marginTop: 18,
  },
  otpInput: {
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 10,
    textAlign: "center",
  },
  hintText: {
    color: colors.muted,
    fontSize: 13,
    textAlign: "center",
  },
  errorText: {
    marginTop: 14,
    color: colors.red,
    fontSize: 14,
    fontWeight: "700",
  },
  pickerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pickerChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.input,
  },
  pickerChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  pickerChipText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "700",
  },
  pickerChipTextActive: {
    color: colors.primary,
  },
  loadingRow: {
    marginHorizontal: 24,
    marginTop: 20,
    paddingVertical: 24,
    alignItems: "center",
  },
  emptyRow: {
    marginHorizontal: 24,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  emptyRowText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  profileActions: {
    marginHorizontal: 24,
    marginTop: 24,
    gap: 14,
  },
  logoutButton: {
    minHeight: 50,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  logoutText: {
    color: colors.red,
    fontSize: 15,
    fontWeight: "800",
  },
});
