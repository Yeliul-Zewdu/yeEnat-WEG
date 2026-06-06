import { Save, User } from "lucide-react";

const conditionOptions = ["Diabetes Type 2", "Diabetes Type 1", "Hypertension"];

export function Profile() {
  return (
    <div className="flex flex-col min-h-full bg-background pb-8">
      <div className="bg-primary px-6 pt-12 pb-8 rounded-b-[2.5rem] text-primary-foreground shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-secondary text-primary flex items-center justify-center">
            <User size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Profile</h1>
            <p className="text-primary-foreground/75 text-sm">Edit your health profile</p>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-4 space-y-6">
        <section className="bg-card rounded-2xl p-5 border border-border shadow-sm">
          <h2 className="text-lg font-bold text-foreground mb-4">Personal Details</h2>
          <div className="space-y-4">
            <ProfileField label="Full Name" value="Abebe Bikila" />
            <div className="grid grid-cols-2 gap-3">
              <ProfileSelect label="Sex" options={["Female", "Male", "Other"]} />
              <ProfileField label="Birth Year" value="1986" type="number" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <ProfileField label="Height (cm)" value="162" type="number" />
              <ProfileField label="Weight (kg)" value="72.5" type="number" />
            </div>
          </div>
        </section>

        <section className="bg-card rounded-2xl p-5 border border-border shadow-sm">
          <h2 className="text-lg font-bold text-foreground mb-4">Health Planning</h2>
          <div className="space-y-4">
            <ProfileSelect label="Primary Goal" options={["Manage condition", "Lose weight", "Maintain", "Gain weight"]} />
            <div className="grid grid-cols-2 gap-3">
              <ProfileSelect label="Activity" options={["Light", "Sedentary", "Moderate", "Active"]} />
              <ProfileSelect label="Fasting" options={["Orthodox", "None", "Ramadan"]} />
            </div>
            <ProfileField label="Target Weight (kg)" value="65" type="number" />
          </div>
        </section>

        <section className="bg-card rounded-2xl p-5 border border-border shadow-sm">
          <h2 className="text-lg font-bold text-foreground mb-4">Conditions & Allergies</h2>
          <div className="space-y-3">
            {conditionOptions.map((condition, index) => (
              <label key={condition} className="flex items-center justify-between rounded-xl bg-muted px-4 py-3 text-sm text-foreground">
                <span>{condition}</span>
                <input type="checkbox" defaultChecked={index === 0} className="accent-primary" />
              </label>
            ))}
            <ProfileField label="Allergies" value="lactose" />
          </div>
        </section>

        <section className="bg-card rounded-2xl p-5 border border-border shadow-sm">
          <h2 className="text-lg font-bold text-foreground mb-4">Computed Targets</h2>
          <div className="grid grid-cols-3 gap-3">
            <TargetPill label="kcal" value="1,800" />
            <TargetPill label="protein" value="95g" />
            <TargetPill label="carbs" value="190g" />
            <TargetPill label="sodium" value="2,000mg" />
            <TargetPill label="sugar" value="30g" />
            <TargetPill label="BMI" value="27.6" />
          </div>
        </section>

        <button className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform">
          <Save size={20} />
          Save Profile
        </button>
      </div>
    </div>
  );
}

function ProfileField({ label, value, type = "text" }: { label: string; value: string; type?: string }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <input
        type={type}
        defaultValue={value}
        className="bg-input-background border border-border rounded-xl px-4 py-3 text-base outline-none focus:border-primary focus:ring-1 focus:ring-primary"
      />
    </label>
  );
}

function ProfileSelect({ label, options }: { label: string; options: string[] }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <select className="bg-input-background border border-border rounded-xl px-4 py-3 text-base outline-none focus:border-primary focus:ring-1 focus:ring-primary">
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function TargetPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted rounded-xl p-3 text-center">
      <span className="block text-sm font-bold text-primary">{value}</span>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
    </div>
  );
}
