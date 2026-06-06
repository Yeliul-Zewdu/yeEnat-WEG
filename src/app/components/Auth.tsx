import { useState } from "react";
import { useNavigate } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";

const conditions = ["Diabetes Type 2", "Diabetes Type 1", "Hypertension"];
const fieldClass = "bg-input-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary";
const profileSections = [
  { title: "Body Basics", subtitle: "Tell us the measurements used for your daily targets." },
  { title: "Goals & Routine", subtitle: "These shape your calories, macros, and lifestyle suggestions." },
  { title: "Health Needs", subtitle: "Conditions and allergies help adjust the weekly meal plan." },
];

export function Auth() {
  const [isLogin, setIsLogin] = useState(false);
  const [step, setStep] = useState<"account" | "profile">("account");
  const [profileStep, setProfileStep] = useState(0);
  const navigate = useNavigate();

  const isLastProfileStep = profileStep === profileSections.length - 1;

  const handlePrimary = () => {
    if (isLogin) {
      navigate("/home");
      return;
    }
    if (step === "account") {
      setStep("profile");
      setProfileStep(0);
      return;
    }
    if (!isLastProfileStep) {
      setProfileStep((current) => current + 1);
      return;
    }
    navigate("/home");
  };

  const handleBack = () => {
    if (step === "profile" && profileStep > 0) {
      setProfileStep((current) => current - 1);
      return;
    }
    if (step === "profile") {
      setStep("account");
      return;
    }
    navigate("/");
  };

  const handleModeChange = (login: boolean) => {
    setIsLogin(login);
    setStep("account");
    setProfileStep(0);
  };

  return (
    <div className="flex flex-col h-full bg-background px-6 pt-8 pb-5">
      <button 
        onClick={handleBack}
        className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-foreground mb-5"
      >
        <ArrowLeft size={18} />
      </button>

      <div className="mb-5">
        <h1 className="text-2xl font-bold mb-1 text-foreground leading-tight">
          {isLogin ? "Welcome Back" : step === "profile" ? profileSections[profileStep].title : "Create Account"}
        </h1>
        <p className="text-sm text-muted-foreground leading-snug">
          {isLogin
            ? "Sign in to continue your wellness journey."
            : step === "profile"
              ? profileSections[profileStep].subtitle
              : "Start your healthy lifestyle with YeEnat Weg."}
        </p>
      </div>

      {step === "account" ? (
        <div className="flex bg-muted p-1 rounded-xl mb-5">
          <button
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${!isLogin ? "bg-card text-primary" : "text-muted-foreground"}`}
            onClick={() => handleModeChange(false)}
          >
            Sign Up
          </button>
          <button
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${isLogin ? "bg-card text-primary" : "text-muted-foreground"}`}
            onClick={() => handleModeChange(true)}
          >
            Login
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 mb-5">
          {profileSections.map((section, index) => (
            <div key={section.title} className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={false}
                animate={{ width: index <= profileStep ? "100%" : "0%" }}
                transition={{ duration: 0.28 }}
              />
            </div>
          ))}
        </div>
      )}

      <form className="flex-1 min-h-0 flex flex-col gap-4 overflow-y-auto pr-1" style={{ scrollbarWidth: "none" }}>
        {step === "account" ? (
          <AccountFields isLogin={isLogin} />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={profileStep}
              initial={{ opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -28 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
            >
              <HealthProfileSection step={profileStep} />
            </motion.div>
          </AnimatePresence>
        )}

        <button 
          type="button"
          onClick={handlePrimary}
          className="mt-1 w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 rounded-xl flex items-center justify-center font-semibold text-base gap-2 transition-transform active:scale-95"
        >
          {isLogin ? "Login" : step === "profile" && isLastProfileStep ? "Create Plan" : "Continue"}
          {!isLogin && (step === "profile" && isLastProfileStep ? <CheckCircle size={20} /> : <ArrowRight size={20} />)}
        </button>

        {step === "account" && (
          <>
            <div className="relative flex items-center py-1">
              <div className="flex-grow border-t border-border"></div>
              <span className="flex-shrink-0 mx-4 text-muted-foreground text-xs">or continue with</span>
              <div className="flex-grow border-t border-border"></div>
            </div>
            <button type="button" className="w-full bg-card border border-border hover:bg-muted text-foreground h-12 rounded-xl flex items-center justify-center font-medium text-sm transition-colors">
              Google
            </button>
            <button type="button" onClick={() => navigate("/home")} className="w-full text-center text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
              Continue as Guest
            </button>
          </>
        )}
      </form>
    </div>
  );
}

function AccountFields({ isLogin }: { isLogin: boolean }) {
  return (
    <>
      {!isLogin && (
        <Field label="Full Name">
          <input type="text" placeholder="Abebe Bikila" className="bg-input-background border border-border rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
        </Field>
      )}
      <Field label="Phone Number">
        <div className="flex gap-2">
          <div className="bg-input-background border border-border rounded-xl px-4 py-3 text-sm text-muted-foreground flex items-center justify-center font-medium">+251</div>
          <input type="tel" placeholder="911 234 567" className="flex-1 bg-input-background border border-border rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
        </div>
      </Field>
      {isLogin && (
        <Field label="Password">
          <input type="password" placeholder="••••••••" className="bg-input-background border border-border rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
        </Field>
      )}
    </>
  );
}

function HealthProfileSection({ step }: { step: number }) {
  if (step === 0) {
    return (
      <div className="space-y-5">
        <SectionCard label="Basic measurements">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Sex"><select className={fieldClass}><option>Female</option><option>Male</option><option>Other</option></select></Field>
            <Field label="Birth Year"><input type="number" placeholder="1986" className={fieldClass} /></Field>
            <Field label="Height (cm)"><input type="number" placeholder="162" className={fieldClass} /></Field>
            <Field label="Weight (kg)"><input type="number" placeholder="72.5" className={fieldClass} /></Field>
          </div>
        </SectionCard>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="space-y-5">
        <SectionCard label="Planning preferences">
          <Field label="Primary Goal"><select className={fieldClass}><option>Manage condition</option><option>Lose weight</option><option>Maintain weight</option><option>Gain weight</option></select></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Activity"><select className={fieldClass}><option>Light</option><option>Sedentary</option><option>Moderate</option><option>Active</option></select></Field>
            <Field label="Fasting"><select className={fieldClass}><option>Orthodox</option><option>None</option><option>Ramadan</option></select></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Wake Time"><input type="time" className={fieldClass} /></Field>
            <Field label="Sleep Time"><input type="time" className={fieldClass} /></Field>
          </div>
        </SectionCard>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <SectionCard label="Health considerations">
        <Field label="Conditions">
          <div className="grid grid-cols-1 gap-2">
            {conditions.map((condition, index) => (
              <label key={condition} className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground">
                <span>{condition}</span>
                <input type="checkbox" defaultChecked={index === 0} className="accent-primary" />
              </label>
            ))}
          </div>
        </Field>
        <Field label="Allergies"><input type="text" placeholder="lactose, peanuts" className={fieldClass} /></Field>
      </SectionCard>
    </div>
  );
}

function SectionCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-2xl p-4 border border-border shadow-sm space-y-4">
      <p className="text-xs text-secondary font-bold uppercase tracking-wider">{label}</p>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}
