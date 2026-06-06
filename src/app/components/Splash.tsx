import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, ArrowRight } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const slides = [
  {
    title: "YeEnat Weg",
    subtitle: "የእናት ወግ",
    description: "The Way of the Mother. Ethiopian nutrition and wellness guidance for everyday life.",
    image: "https://images.unsplash.com/photo-1729962021385-659b53192b9e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxldGhpb3BpYW4lMjB3b21hbiUyMHNtaWxpbmd8ZW58MXx8fHwxNzgwNzM1NzgxfDA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    title: "Personalized Nutrition",
    subtitle: "የተመጣጠነ ምግብ",
    description: "Build weekly meal plans from real ingredients, portions, and health targets.",
    image: "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxldGhpb3BpYW4lMjBmb29kfGVufDF8fHx8MTc4MDczNTc4MXww&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    title: "Wellness Coaching",
    subtitle: "የጤና አማካሪ",
    description: "Track your health, manage chronic conditions, and live a healthier life.",
    image: "https://images.unsplash.com/photo-1572357176061-7c96fd2af22f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWxsbmVzcyUyMGdyZWVufGVufDF8fHx8MTc4MDczNTc4MXww&ixlib=rb-4.1.0&q=80&w=1080",
  },
];

export function Splash() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentSlide === slides.length - 1) {
      navigate("/auth");
    } else {
      setCurrentSlide((prev) => prev + 1);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background relative">
      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex flex-col"
          >
            <div className="h-[60%] w-full relative">
              <div className="absolute inset-0 bg-primary/20 rounded-b-[3rem] overflow-hidden">
                <ImageWithFallback
                  src={slides[currentSlide].image}
                  alt={slides[currentSlide].title}
                  className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-primary/35" />
              </div>
            </div>
            
            <div className="px-8 pt-12 text-center flex-1 bg-background z-10 -mt-10 rounded-t-[3rem]">
              <h2 className="text-sm font-semibold text-secondary mb-2 tracking-wider uppercase">
                {slides[currentSlide].subtitle}
              </h2>
              <h1 className="text-3xl font-bold text-foreground mb-4 leading-tight">
                {slides[currentSlide].title}
              </h1>
              <p className="text-muted-foreground text-base leading-relaxed">
                {slides[currentSlide].description}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="px-8 pb-12 flex flex-col items-center">
        <div className="flex gap-2 mb-8">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-14 rounded-2xl flex items-center justify-center font-semibold text-lg gap-2 shadow-lg shadow-primary/25 transition-transform active:scale-95"
        >
          {currentSlide === slides.length - 1 ? (
            <>
              Get Started <ArrowRight size={20} />
            </>
          ) : (
            <>
              Next <ChevronRight size={20} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
