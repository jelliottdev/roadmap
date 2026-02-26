import { createBrowserRouter } from "react-router";
import { Register } from "./components/Register";
import { Login } from "./components/Login";
import { JoinOrCreateTeam } from "./components/JoinOrCreateTeam";
import { Dashboard } from "./components/Dashboard";

export const router = createBrowserRouter([
  { path: "/", Component: Register },
  { path: "/register", Component: Register },
  { path: "/login", Component: Login },
  { path: "/team", Component: JoinOrCreateTeam },
  { path: "/dashboard", Component: Dashboard },
]);
