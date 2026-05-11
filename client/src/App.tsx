/*
 * Design philosophy: Premium Bunsik Package Collage for Samcheop franchise counseling.
 * The root keeps a warm light theme so red/yellow package colors, receipt panels, and Korean franchise counseling UI remain legible.
 */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Router as WouterRouter, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";

// GitHub Pages 같은 서브패스 호스팅을 위한 base. Vite의 base 설정(`/samcheop-v1-simulator/`)에서
// 끝의 슬래시를 제거해 wouter base 규약("/sub-path", trailing slash 없음)을 맞춘다.
const ROUTER_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <WouterRouter base={ROUTER_BASE}>
            <Router />
          </WouterRouter>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
