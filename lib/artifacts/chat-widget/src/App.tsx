import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { ChatWidgetPage } from "@/pages/chat-widget-page";
import { EmbedPage } from "@/pages/embed-page";
import { AdminPage } from "@/pages/admin-page";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={ChatWidgetPage} />
      <Route path="/embed" component={EmbedPage} />
      <Route path="/admin" component={AdminPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
