import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Splash } from "./components/Splash";
import { Auth } from "./components/Auth";
import { Home } from "./components/Home";
import { MealPlan } from "./components/MealPlan";
import { Tracker } from "./components/Tracker";
import { Coach } from "./components/Coach";
import { Profile } from "./components/Profile";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Splash },
      { path: "auth", Component: Auth },
      { path: "home", Component: Home },
      { path: "meal-plan", Component: MealPlan },
      { path: "tracker", Component: Tracker },
      { path: "coach", Component: Coach },
      { path: "profile", Component: Profile },
    ],
  },
]);
