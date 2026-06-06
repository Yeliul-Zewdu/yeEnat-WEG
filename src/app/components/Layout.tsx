import { Outlet, useLocation, useNavigate } from "react-router";
import { Home, Calendar, Activity, MessageCircle, User } from "lucide-react";

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  const isAuthOrSplash = location.pathname === "/" || location.pathname === "/auth";

  const navItems = [
    { path: "/home", icon: Home, label: "Home" },
    { path: "/meal-plan", icon: Calendar, label: "Meals" },
    { path: "/tracker", icon: Activity, label: "Track" },
    { path: "/coach", icon: MessageCircle, label: "Coach" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="flex h-screen w-full justify-center bg-gray-100 overflow-hidden font-sans">
      <div className="relative w-full max-w-[430px] h-full bg-background flex flex-col shadow-2xl sm:rounded-[2rem] sm:my-4 sm:h-[calc(100vh-2rem)] overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto pb-20" style={{ scrollbarWidth: "none" }}>
          <Outlet />
        </div>

        {/* Bottom Navigation */}
        {!isAuthOrSplash && (
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-card border-t border-border flex items-center justify-around px-3 rounded-b-[2rem] z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex flex-col items-center justify-center w-14 h-16 gap-1 rounded-2xl transition-all ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl transition-all ${
                      isActive ? "bg-primary/10" : "bg-transparent"
                    }`}
                  >
                    <Icon
                      size={22}
                      strokeWidth={isActive ? 2.5 : 2}
                      className={isActive ? "text-primary" : "text-muted-foreground"}
                    />
                  </div>
                  <span className="text-[10px] font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
