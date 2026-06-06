import { useEffect, useMemo, useState } from "react";
import {
  Droplet,
  Moon,
  Activity,
  Flame,
  Plus,
  User,
  PartyPopper,
  Trophy,
  ShieldCheck,
  SmilePlus,
  HeartPulse,
  type LucideIcon,
} from "lucide-react";
import { motion } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useNavigate } from "react-router";

const resultStats = [
  { label: "Sugar", value: "Stable", tone: "text-secondary" },
  { label: "Plan fit", value: "92%", tone: "text-accent" },
  { label: "Target", value: "1,800", tone: "text-primary-foreground" },
];

const todayScore = 67;

type ResultReaction = {
  label: string;
  status: string;
  message: string;
  Icon: LucideIcon;
  labelTone: string;
  badgeIconTone: string;
  badgeTextTone: string;
  scoreTone: string;
  suffixTone: string;
  dotClasses: string[];
  dotAnimation: {
    y: number[];
    x?: number[];
    scale: number[];
    opacity: number[];
    rotate?: number[];
  };
  badgeAnimation: {
    scale: number[];
    rotate: number[];
    y?: number[];
  };
};

function getResultReaction(score: number): ResultReaction {
  if (score >= 90) {
    return {
      label: "Huge win today",
      status: "Elite",
      message: "Your meals, movement, and hydration are all landing beautifully today.",
      Icon: Trophy,
      labelTone: "text-secondary",
      badgeIconTone: "text-secondary",
      badgeTextTone: "text-secondary",
      scoreTone: "text-primary-foreground",
      suffixTone: "text-secondary",
      dotClasses: [
        "left-[54%] top-4 bg-secondary",
        "left-[70%] top-9 bg-accent",
        "left-[86%] top-2 bg-primary-foreground",
        "left-[63%] top-20 bg-secondary",
        "left-[91%] top-16 bg-accent",
      ],
      dotAnimation: {
        opacity: [0, 1, 1, 0],
        y: [22, -18, -34, -54],
        x: [0, -8, 8, 2],
        scale: [0, 1.2, 1, 0.7],
        rotate: [0, 18, -18, 0],
      },
      badgeAnimation: { scale: [1, 1.2, 0.98, 1], rotate: [0, -10, 10, 0], y: [0, -4, 0] },
    };
  }

  if (score >= 75) {
    return {
      label: "Hooray, great result",
      status: "Good",
      message: "Great balance today. Your meal plan is matching your blood-sugar target.",
      Icon: PartyPopper,
      labelTone: "text-secondary",
      badgeIconTone: "text-accent",
      badgeTextTone: "text-primary",
      scoreTone: "text-primary-foreground",
      suffixTone: "text-secondary",
      dotClasses: [
        "left-[58%] top-3 bg-secondary",
        "left-[74%] top-7 bg-accent",
        "left-[88%] top-1 bg-primary-foreground",
        "left-[67%] top-16 bg-secondary",
      ],
      dotAnimation: {
        opacity: [0, 1, 1, 0],
        y: [18, -8, -18, -30],
        scale: [0, 1, 1, 0.75],
        rotate: [0, -12, 12, 0],
      },
      badgeAnimation: { scale: [1, 1.12, 1], rotate: [0, -6, 6, 0] },
    };
  }

  if (score >= 55) {
    return {
      label: "Steady progress",
      status: "Okay",
      message: "You are close. A little more water and a steadier carb split can lift this score.",
      Icon: SmilePlus,
      labelTone: "text-primary-foreground",
      badgeIconTone: "text-secondary",
      badgeTextTone: "text-primary",
      scoreTone: "text-secondary",
      suffixTone: "text-primary-foreground/75",
      dotClasses: [
        "left-[60%] top-8 bg-secondary",
        "left-[82%] top-10 bg-primary-foreground",
        "left-[70%] top-20 bg-accent",
      ],
      dotAnimation: {
        opacity: [0, 0.85, 0.85, 0],
        y: [8, -6, -10, -16],
        scale: [0.6, 1, 0.95, 0.7],
      },
      badgeAnimation: { scale: [1, 1.06, 1], rotate: [0, 0, 0] },
    };
  }

  return {
    label: "Needs attention",
    status: "Care",
    message: "Your plan needs a calmer reset today. Start with hydration and a lower-sugar meal.",
    Icon: HeartPulse,
    labelTone: "text-secondary",
    badgeIconTone: "text-accent",
    badgeTextTone: "text-accent",
    scoreTone: "text-accent",
    suffixTone: "text-primary-foreground/75",
    dotClasses: [
      "left-[60%] top-8 bg-accent",
      "left-[78%] top-16 bg-secondary",
    ],
    dotAnimation: {
      opacity: [0, 0.8, 0.6, 0],
      y: [6, -4, -6, -10],
      scale: [0.7, 1, 0.9, 0.75],
    },
    badgeAnimation: { scale: [1, 1.08, 1], rotate: [0, 0, 0] },
  };
}

export function Home() {
  const navigate = useNavigate();
  const resultReaction = useMemo(() => getResultReaction(todayScore), []);
  const ReactionIcon = resultReaction.Icon;

  return (
    <div className="flex flex-col min-h-full bg-background pb-8">
      {/* Header / Hero */}
      <div className="bg-primary px-6 pt-12 pb-8 rounded-b-[2.5rem] text-primary-foreground shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-primary-foreground/80 text-sm font-medium mb-1">Selam,</h2>
            <h1 className="text-2xl font-bold">Abebe B.</h1>
          </div>
          <button
            onClick={() => navigate("/profile")}
            className="w-12 h-12 rounded-full border-2 border-secondary overflow-hidden bg-white"
          >
            <ImageWithFallback 
              src="https://images.unsplash.com/photo-1593351799227-75df2026356b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwd29tYW4lMjBwb3J0cmFpdHxlbnwxfHx8fDE3ODA3MzU3ODV8MA&ixlib=rb-4.1.0&q=80&w=1080" 
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 22, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.65, type: "spring", bounce: 0.36 }}
          className="relative overflow-hidden py-3 text-primary-foreground"
        >
          {resultReaction.dotClasses.map((dot, index) => (
            <motion.span
              key={dot}
              className={`absolute h-2 w-2 rounded-full ${dot}`}
              initial={{ opacity: 0, y: 18, scale: 0 }}
              animate={resultReaction.dotAnimation}
              transition={{ delay: 0.18 + index * 0.08, duration: 1.3, repeat: Infinity, repeatDelay: 2.2 }}
            />
          ))}
          <div className="relative flex justify-between items-start gap-5">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-3">
                <motion.span
                  initial={{ scale: 0, rotate: -18 }}
                  animate={{ scale: 1, rotate: [0, -8, 8, 0] }}
                  transition={{ delay: 0.25, duration: 0.7, type: "spring", bounce: 0.55 }}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground text-primary"
                >
                  <ReactionIcon size={17} className={resultReaction.badgeIconTone} />
                </motion.span>
                <p className={`${resultReaction.labelTone} text-sm font-bold uppercase tracking-[0.18em]`}>
                  {resultReaction.label}
                </p>
              </div>
              <div className="flex items-end gap-2">
                <motion.span
                  initial={{ opacity: 0, y: 24, scale: 0.82 }}
                  animate={{ opacity: 1, y: 0, scale: [1, 1.08, 1] }}
                  transition={{ delay: 0.3, duration: 0.75, type: "spring", bounce: 0.48 }}
                  className={`text-[6.25rem] font-bold leading-[0.85] ${resultReaction.scoreTone}`}
                >
                  <CountUpNumber value={todayScore} />
                </motion.span>
                <span className={`pb-3 text-2xl font-bold ${resultReaction.suffixTone}`}>/ 100</span>
              </div>
              <p className="mt-4 max-w-[260px] text-lg font-semibold text-primary-foreground leading-snug">
                {resultReaction.message}
              </p>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.4, rotate: -20 }}
              animate={{ opacity: 1, ...resultReaction.badgeAnimation }}
              transition={{ delay: 0.45, duration: 0.9, type: "spring", bounce: 0.5 }}
              className="mt-8 flex h-20 w-20 flex-shrink-0 flex-col items-center justify-center rounded-2xl bg-primary-foreground text-primary"
            >
              <motion.div
                animate={{ rotate: resultReaction.badgeAnimation.rotate }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1.8 }}
              >
                <ReactionIcon size={22} className={resultReaction.badgeIconTone} />
              </motion.div>
              <span className={`mt-1 text-base font-bold ${resultReaction.badgeTextTone}`}>{resultReaction.status}</span>
            </motion.div>
          </div>
          <div className="relative grid grid-cols-3 gap-3 mt-7">
            {resultStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.55 + index * 0.1, duration: 0.38, type: "spring", bounce: 0.35 }}
              >
                <span className={`block text-2xl font-bold leading-tight ${stat.tone}`}>{stat.value}</span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary-foreground/70">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="px-6 -mt-4 z-10">
        <div className="grid grid-cols-2 gap-4">
          <DashboardCard icon={<Flame size={20} className="text-accent" />} title="Calories" value="1,420" sub="kcal" bg="bg-card" />
          <DashboardCard icon={<Droplet size={20} className="text-blue-500" />} title="Water" value="4/8" sub="glasses" bg="bg-card" />
          <DashboardCard icon={<Moon size={20} className="text-purple-500" />} title="Sleep" value="7h 20m" sub="last night" bg="bg-card" />
          <DashboardCard icon={<Activity size={20} className="text-green-500" />} title="Exercise" value="45" sub="mins" bg="bg-card" />
        </div>
      </div>

      <div className="px-6 mt-8">
        <div className="bg-card rounded-2xl p-4 shadow-sm border border-border flex gap-4 items-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
            <User size={22} />
          </div>
          <div className="flex-1">
            <p className="text-xs text-secondary font-bold uppercase tracking-wider mb-1">Health profile</p>
            <h4 className="text-base font-bold text-foreground">Diabetes Type 2 • Orthodox fasting</h4>
            <p className="text-sm text-muted-foreground">1,800 kcal target • 190g carbs</p>
          </div>
          <button
            onClick={() => navigate("/profile")}
            className="text-primary text-sm font-semibold hover:underline"
          >
            Edit
          </button>
        </div>
      </div>

      <div className="px-6 mt-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-foreground">Today's Meal Plan</h3>
          <button 
            onClick={() => navigate("/meal-plan")}
            className="text-primary text-sm font-semibold hover:underline"
          >
            See all
          </button>
        </div>

        <div className="bg-card rounded-2xl p-4 shadow-sm border border-border flex gap-4 items-center">
          <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted flex-shrink-0">
            <ImageWithFallback 
              src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwZm9vZCUyMGJvd2x8ZW58MXx8fHwxNzgwNzM1Nzg1fDA&ixlib=rb-4.1.0&q=80&w=1080" 
              alt="Lunch"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <p className="text-xs text-secondary font-bold uppercase tracking-wider mb-1">Lunch • 1:00 PM</p>
            <h4 className="text-base font-bold text-foreground mb-1">Shiro Tegabino & Injera</h4>
            <p className="text-sm text-muted-foreground">450 kcal • 15g protein</p>
          </div>
          <button className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <Plus size={20} />
          </button>
        </div>
      </div>

      <div className="px-6 mt-8 mb-4">
        <h3 className="text-lg font-bold text-foreground mb-4">Quick Actions</h3>
        <div className="flex gap-4 overflow-x-auto pb-4" style={{ scrollbarWidth: "none" }}>
          <QuickAction title="Log Meal" icon={<Flame size={24} />} onClick={() => {}} />
          <QuickAction title="Drink Water" icon={<Droplet size={24} />} onClick={() => {}} />
          <QuickAction title="Workout" icon={<Activity size={24} />} onClick={() => {}} />
        </div>
      </div>
    </div>
  );
}

function CountUpNumber({ value, duration = 1400 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let frameId = 0;
    let startTime: number | null = null;

    const tick = (time: number) => {
      if (startTime === null) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      setDisplayValue(Math.round(value * easedProgress));

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frameId);
  }, [duration, value]);

  return <>{displayValue}</>;
}

function DashboardCard({ icon, title, value, sub, bg }: any) {
  return (
    <div className={`${bg} rounded-2xl p-4 shadow-sm border border-border flex flex-col`}>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-foreground">{value}</span>
        <span className="text-xs text-muted-foreground">{sub}</span>
      </div>
    </div>
  );
}

function QuickAction({ title, icon, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center gap-2 min-w-[80px]"
    >
      <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center text-primary shadow-sm hover:bg-primary hover:text-white transition-colors">
        {icon}
      </div>
      <span className="text-xs font-medium text-foreground text-center">{title}</span>
    </button>
  );
}
