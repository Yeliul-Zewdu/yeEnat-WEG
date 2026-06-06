import { useState } from "react";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const dates = ["12", "13", "14", "15", "16", "17", "18"];

type Ingredient = {
  name: string;
  amount: string;
  calories: number;
  protein: string;
  carbs: string;
  fat: string;
  fiber: string;
  sodium: string;
  sugar: string;
};

type Meal = {
  type: string;
  time: string;
  title: string;
  cals: string;
  protein: string;
  image: string;
  ingredients: Ingredient[];
};

const meals: Meal[] = [
  {
    type: "Breakfast",
    time: "08:00 AM",
    title: "Chechebsa with Honey",
    cals: "320",
    protein: "8g",
    image:
      "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxldGhpb3BpYW4lMjBmb29kfGVufDF8fHx8MTc4MDczNTc4MXww&ixlib=rb-4.1.0&q=80&w=1080",
    ingredients: [
      { name: "Kita flatbread", amount: "1 cup", calories: 175, protein: "5g", carbs: "34g", fat: "2g", fiber: "3g", sodium: "180mg", sugar: "1g" },
      { name: "Spiced butter", amount: "1 tbsp", calories: 95, protein: "0g", carbs: "1g", fat: "10g", fiber: "0g", sodium: "25mg", sugar: "0g" },
      { name: "Honey", amount: "2 tsp", calories: 42, protein: "0g", carbs: "11g", fat: "0g", fiber: "0g", sodium: "0mg", sugar: "11g" },
      { name: "Plain yogurt", amount: "2 tbsp", calories: 8, protein: "3g", carbs: "1g", fat: "0g", fiber: "0g", sodium: "18mg", sugar: "1g" },
    ],
  },
  {
    type: "Lunch",
    time: "01:00 PM",
    title: "Shiro Tegabino & Injera",
    cals: "450",
    protein: "15g",
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwZm9vZCUyMGJvd2x8ZW58MXx8fHwxNzgwNzM1Nzg1fDA&ixlib=rb-4.1.0&q=80&w=1080",
    ingredients: [
      { name: "Shiro powder", amount: "1/3 cup", calories: 150, protein: "10g", carbs: "22g", fat: "3g", fiber: "7g", sodium: "110mg", sugar: "2g" },
      { name: "Teff injera", amount: "1 medium", calories: 160, protein: "5g", carbs: "32g", fat: "1g", fiber: "4g", sodium: "180mg", sugar: "1g" },
      { name: "Tomato and onion base", amount: "1/2 cup", calories: 65, protein: "1g", carbs: "11g", fat: "2g", fiber: "3g", sodium: "120mg", sugar: "4g" },
      { name: "Olive oil", amount: "2 tsp", calories: 75, protein: "0g", carbs: "0g", fat: "8g", fiber: "0g", sodium: "0mg", sugar: "0g" },
    ],
  },
  {
    type: "Dinner",
    time: "07:30 PM",
    title: "Fasolia (Green Beans & Carrots)",
    cals: "280",
    protein: "6g",
    image:
      "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxldGhpb3BpYW4lMjBmb29kfGVufDF8fHx8MTc4MDczNTc4MXww&ixlib=rb-4.1.0&q=80&w=1080",
    ingredients: [
      { name: "Green beans", amount: "1 cup", calories: 44, protein: "2g", carbs: "10g", fat: "0g", fiber: "4g", sodium: "8mg", sugar: "4g" },
      { name: "Carrots", amount: "1/2 cup", calories: 35, protein: "1g", carbs: "8g", fat: "0g", fiber: "3g", sodium: "45mg", sugar: "3g" },
      { name: "Potatoes", amount: "1/2 cup", calories: 75, protein: "2g", carbs: "17g", fat: "0g", fiber: "2g", sodium: "6mg", sugar: "1g" },
      { name: "Tomato sauce", amount: "1/3 cup", calories: 40, protein: "1g", carbs: "7g", fat: "1g", fiber: "2g", sodium: "110mg", sugar: "3g" },
      { name: "Olive oil", amount: "2 tsp", calories: 86, protein: "0g", carbs: "0g", fat: "10g", fiber: "0g", sodium: "0mg", sugar: "0g" },
    ],
  },
];

function parseNutritionValue(value: string) {
  return Number.parseFloat(value.replace(/[^\d.]/g, "")) || 0;
}

function formatGramTotal(value: number) {
  return `${Math.round(value)}g`;
}

function getMealSummary(meal: Meal) {
  return {
    calories: meal.ingredients.reduce((total, ingredient) => total + ingredient.calories, 0),
    protein: formatGramTotal(meal.ingredients.reduce((total, ingredient) => total + parseNutritionValue(ingredient.protein), 0)),
    carbs: formatGramTotal(meal.ingredients.reduce((total, ingredient) => total + parseNutritionValue(ingredient.carbs), 0)),
    fat: formatGramTotal(meal.ingredients.reduce((total, ingredient) => total + parseNutritionValue(ingredient.fat), 0)),
  };
}

export function MealPlan() {
  const [selectedDay, setSelectedDay] = useState(2);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="bg-primary px-6 pt-12 pb-6 text-primary-foreground">
        <div className="flex items-center justify-between mb-6">
          <button className="p-2 hover:bg-primary-foreground hover:text-primary rounded-full transition-colors">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">This Week</h1>
          <button className="p-2 hover:bg-primary-foreground hover:text-primary rounded-full transition-colors">
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Calendar Strip */}
        <div className="flex justify-between items-center">
          {days.map((day, idx) => {
            const isSelected = idx === selectedDay;
            return (
              <div 
                key={day} 
                onClick={() => setSelectedDay(idx)}
                className={`flex flex-col items-center justify-center w-11 h-16 rounded-xl cursor-pointer transition-all ${
                  isSelected ? "bg-secondary text-primary font-bold shadow-md scale-110" : "text-primary-foreground/70 hover:bg-primary-foreground hover:text-primary"
                }`}
              >
                <span className="text-xs mb-1">{day}</span>
                <span className={`text-base ${isSelected ? "font-bold" : "font-medium"}`}>{dates[idx]}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {/* Nutritional Summary */}
        <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-foreground">Daily Target</h3>
            <button className="text-muted-foreground hover:text-primary">
              <Info size={18} />
            </button>
          </div>
          
          <div className="flex items-center justify-between gap-4">
            <TargetStat value="1,850" label="kcal" tone="text-primary" />
            <div className="w-px h-10 bg-border"></div>
            <TargetStat value="65g" label="Protein" tone="text-secondary" />
            <div className="w-px h-10 bg-border"></div>
            <TargetStat value="220g" label="Carbs" tone="text-accent" />
          </div>
        </div>

        {/* Meals */}
        <div className="space-y-4">
          {meals.map((meal) => (
            <MealCard key={`${meal.type}-${meal.time}`} meal={meal} />
          ))}
        </div>
      </div>
    </div>
  );
}

function TargetStat({ value, label, tone }: { value: string; label: string; tone: string }) {
  return (
    <div className="flex-1 flex flex-col items-center">
      <span className={`text-xl font-bold ${tone}`}>{value}</span>
      <span className="text-xs text-muted-foreground mt-1">{label}</span>
    </div>
  );
}

function MealCard({ meal }: { meal: Meal }) {
  return (
    <div className="bg-card rounded-2xl overflow-hidden border border-border shadow-sm">
      <div className="h-32 w-full relative">
        <ImageWithFallback src={meal.image} alt={meal.title} className="w-full h-full object-cover" />
        <div className="absolute top-3 left-3 bg-card px-3 py-1 rounded-full text-xs font-bold text-primary shadow-sm">
          {meal.type}
        </div>
        <div className="absolute top-3 right-3 bg-primary px-3 py-1 rounded-full text-xs font-medium text-primary-foreground">
          {meal.time}
        </div>
      </div>
      
      <div className="p-4">
        <h4 className="text-lg font-bold text-foreground mb-3">{meal.title}</h4>
        
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 bg-muted rounded-lg p-2 flex flex-col items-center">
            <span className="text-sm font-bold text-foreground">{meal.cals}</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Kcal</span>
          </div>
          <div className="flex-1 bg-muted rounded-lg p-2 flex flex-col items-center">
            <span className="text-sm font-bold text-foreground">{meal.protein}</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Protein</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <MealDetailsDialog meal={meal} />
          <button className="py-2 rounded-xl bg-primary/10 text-primary font-semibold text-sm hover:bg-primary hover:text-white transition-colors">
            Replace
          </button>
          <button className="col-span-2 py-2 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors">
            Mark Eaten
          </button>
        </div>
      </div>
    </div>
  );
}

function MealDetailsDialog({ meal }: { meal: Meal }) {
  const summary = getMealSummary(meal);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="py-2 rounded-xl bg-muted text-foreground font-semibold text-sm hover:bg-secondary hover:text-white transition-colors">
          Details
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[88vh] overflow-hidden rounded-3xl p-0 sm:max-w-xl">
        <div className="flex max-h-[88vh] flex-col bg-background">
          <div className="h-36 w-full overflow-hidden">
            <ImageWithFallback src={meal.image} alt={meal.title} className="h-full w-full object-cover" />
          </div>

          <div className="flex-1 overflow-y-auto px-5 pb-5 pt-4" style={{ scrollbarWidth: "none" }}>
            <DialogHeader className="mb-4 text-left">
              <DialogDescription className="font-bold uppercase tracking-wider text-secondary">
                {meal.type} • {meal.time}
              </DialogDescription>
              <DialogTitle className="text-2xl font-bold leading-tight text-foreground">{meal.title}</DialogTitle>
            </DialogHeader>

            <div className="mb-5 grid grid-cols-4 gap-3 rounded-2xl border border-border bg-card p-4">
              <SummaryStat label="kcal" value={summary.calories.toString()} tone="text-primary" />
              <SummaryStat label="protein" value={summary.protein} tone="text-secondary" />
              <SummaryStat label="carbs" value={summary.carbs} tone="text-accent" />
              <SummaryStat label="fat" value={summary.fat} tone="text-foreground" />
            </div>

            <div className="mb-3 flex items-end justify-between">
              <div>
                <h5 className="text-base font-bold text-foreground">Ingredient nutrition</h5>
                <p className="text-xs text-muted-foreground">{meal.ingredients.length} ingredients with per-item macros</p>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card">
              {meal.ingredients.map((ingredient, index) => (
                <IngredientNutritionRow
                  key={ingredient.name}
                  ingredient={ingredient}
                  isLast={index === meal.ingredients.length - 1}
                />
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SummaryStat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="text-center">
      <span className={`block text-lg font-bold leading-tight ${tone}`}>{value}</span>
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
    </div>
  );
}

function IngredientNutritionRow({ ingredient, isLast }: { ingredient: Ingredient; isLast: boolean }) {
  return (
    <div className={`px-4 py-4 ${isLast ? "" : "border-b border-border"}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-base font-bold leading-snug text-foreground">{ingredient.name}</p>
          <p className="mt-0.5 text-xs font-medium text-muted-foreground">{ingredient.amount}</p>
        </div>
        <div className="text-right">
          <span className="block text-xl font-bold leading-none text-primary">{ingredient.calories}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">kcal</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-x-4 gap-y-3">
        <NutrientText label="Protein" value={ingredient.protein} tone="text-secondary" />
        <NutrientText label="Carbs" value={ingredient.carbs} tone="text-accent" />
        <NutrientText label="Fat" value={ingredient.fat} tone="text-foreground" />
        <NutrientText label="Fiber" value={ingredient.fiber} tone="text-primary" />
        <NutrientText label="Sodium" value={ingredient.sodium} tone="text-muted-foreground" />
        <NutrientText label="Sugar" value={ingredient.sugar} tone="text-muted-foreground" />
      </div>
    </div>
  );
}

function NutrientText({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div>
      <span className={`block text-sm font-bold leading-tight ${tone}`}>{value}</span>
      <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
    </div>
  );
}
