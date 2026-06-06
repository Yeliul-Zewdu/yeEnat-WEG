import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Activity, Heart, Droplets, Target, Plus } from "lucide-react";

export function Tracker() {
  const [activeTab, setActiveTab] = useState("nutrition");

  const pieData = [
    { name: "Protein", value: 30, color: "#D4A537" },
    { name: "Carbs", value: 50, color: "#2E5E4E" },
    { name: "Fat", value: 20, color: "#C86B4A" },
  ];

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="bg-primary px-6 pt-12 pb-6 text-primary-foreground">
        <h1 className="text-2xl font-bold mb-6">Track Progress</h1>
        
        <div className="flex bg-primary-foreground p-1 rounded-xl">
          <button
            type="button"
            aria-pressed={activeTab === "nutrition"}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
              activeTab === "nutrition" ? "bg-primary text-primary-foreground" : "text-primary hover:bg-muted"
            }`}
            onClick={() => setActiveTab("nutrition")}
          >
            Nutrition
          </button>
          <button
            type="button"
            aria-pressed={activeTab === "health"}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
              activeTab === "health" ? "bg-primary text-primary-foreground" : "text-primary hover:bg-muted"
            }`}
            onClick={() => setActiveTab("health")}
          >
            Health Vitals
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {activeTab === "nutrition" ? (
          <>
            {/* Calories Ring */}
            <div className="bg-card rounded-3xl p-6 border border-border shadow-sm flex flex-col items-center">
              <h3 className="font-bold text-foreground mb-6 self-start">Daily Macros</h3>
              
              <div className="relative w-48 h-48 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-foreground">1,420</span>
                  <span className="text-xs text-muted-foreground">kcal eaten</span>
                </div>
              </div>

              <div className="w-full flex justify-between gap-4">
                <MacroBar label="Protein" value="45g" percent={60} color="bg-secondary" />
                <MacroBar label="Carbs" value="120g" percent={85} color="bg-primary" />
                <MacroBar label="Fat" value="32g" percent={40} color="bg-accent" />
              </div>
            </div>

            <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
              <h3 className="font-bold text-foreground mb-4">Water Intake</h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                  <Droplets size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-bold">4 / 8 Glasses</span>
                    <span className="text-sm text-muted-foreground">1.0L / 2.0L</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: "50%" }} />
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Health Vitals (Diabetes/Hypertension perspective) */}
            <div className="grid grid-cols-2 gap-4">
              <VitalCard 
                icon={<Activity className="text-accent" />}
                title="Blood Sugar"
                value="95"
                unit="mg/dL"
                status="Normal"
                statusColor="text-green-500 bg-green-50"
              />
              <VitalCard 
                icon={<Heart className="text-red-500" />}
                title="Blood Pressure"
                value="118/75"
                unit="mmHg"
                status="Optimal"
                statusColor="text-green-500 bg-green-50"
              />
              <VitalCard 
                icon={<Target className="text-secondary" />}
                title="Daily Carbs"
                value="120"
                unit="/ 150g"
                status="On Track"
                statusColor="text-secondary bg-secondary/10"
              />
              <VitalCard 
                icon={<Droplets className="text-blue-500" />}
                title="Sodium"
                value="1.2"
                unit="/ 2.3g"
                status="Good"
                statusColor="text-blue-500 bg-blue-50"
              />
            </div>

            <div className="bg-card rounded-2xl p-5 border border-border shadow-sm mt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-foreground">Record Blood Sugar</h3>
                  <p className="text-sm text-muted-foreground">Out-of-range readings can update the meal plan.</p>
                </div>
                <button className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <Plus size={18} />
                </button>
              </div>
              <div className="flex gap-3">
                <input
                  type="number"
                  placeholder="mg/dL"
                  className="flex-1 bg-input-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary"
                />
                <select className="bg-input-background border border-border rounded-xl px-3 py-3 text-sm outline-none focus:border-primary">
                  <option>Fasting</option>
                  <option>Pre meal</option>
                  <option>Post meal</option>
                </select>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-5 border border-border shadow-sm mt-6">
              <h3 className="font-bold text-foreground mb-2">Health Insight</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your fasting blood sugar has been stable this week. Teff-based meals are giving you a slower-release carbohydrate source.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function MacroBar({ label, value, percent, color }: any) {
  return (
    <div className="flex-1 flex flex-col items-center">
      <div className="w-2 h-24 bg-muted rounded-full relative overflow-hidden mb-2">
        <div 
          className={`absolute bottom-0 w-full rounded-full ${color}`} 
          style={{ height: `${percent}%` }}
        />
      </div>
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span>
      <span className="text-sm font-bold text-foreground">{value}</span>
    </div>
  );
}

function VitalCard({ icon, title, value, unit, status, statusColor }: any) {
  return (
    <div className="bg-card rounded-2xl p-4 border border-border shadow-sm flex flex-col">
      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mb-3">
        {icon}
      </div>
      <span className="text-xs text-muted-foreground mb-1">{title}</span>
      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-xl font-bold text-foreground">{value}</span>
        <span className="text-xs text-muted-foreground">{unit}</span>
      </div>
      <div className={`mt-auto text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md self-start ${statusColor}`}>
        {status}
      </div>
    </div>
  );
}
