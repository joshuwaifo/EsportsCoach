import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GameProvider } from "./contexts/GameContext";
import { useState } from "react";
import SignupPage from "./components/SignupPage";
import LiveCoachPage from "./components/LiveCoachPage";
import RecapPage from "./components/RecapPage";
import NotFound from "@/pages/not-found";


function App() {
  const [currentView, setCurrentView] = useState<'signup' | 'live' | 'recap'>('signup');

  const handleSignupComplete = (trainingMode: string) => {
    // Route based on training mode selection
    if (trainingMode === 'post') {
      setCurrentView('recap');
    } else {
      setCurrentView('live');
    }
  };

  const handleEndGame = () => {
    setCurrentView('recap');
  };

  const handlePlayAgain = () => {
    setCurrentView('live');
  };

  const handleContinue = () => {
    setCurrentView('signup');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'signup':
        return <SignupPage onComplete={handleSignupComplete} />;
      case 'live':
        return <LiveCoachPage onEndGame={handleEndGame} />;
      case 'recap':
        return <RecapPage onPlayAgain={handlePlayAgain} onContinue={handleContinue} />;
      default:
        return <SignupPage onComplete={handleSignupComplete} />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <GameProvider>
          <div className="min-h-screen">
            <Switch>
              <Route path="/">
                {renderCurrentView()}
              </Route>
              <Route component={NotFound} />
            </Switch>
          </div>
          <Toaster />
        </GameProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
