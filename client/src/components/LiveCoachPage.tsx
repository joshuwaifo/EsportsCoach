import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useGame } from '@/contexts/GameContext';
import { geminiService } from '@/services/geminiService';
import { 
  Activity, 
  MessageSquare, 
  Mic, 
  Pause, 
  Play, 
  Eye, 
  Settings, 
  BarChart3,
  Clock,
  Users,
  Trophy
} from 'lucide-react';

interface LiveCoachPageProps {
  onEndGame: () => void;
}

export default function LiveCoachPage({ onEndGame }: LiveCoachPageProps) {
  const { user, currentSession, addAIMessage, addChatMessage, updateLiveStats, addKeyMoment, startSession } = useGame();
  const [chatInput, setChatInput] = useState('');
  const [isAIActive, setIsAIActive] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [gameTime, setGameTime] = useState(0);
  const [isMicActive, setIsMicActive] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const aiMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && !currentSession) {
      startSession(user.gameCategory);
    }
  }, [user, currentSession, startSession]);

  // Game timer
  useEffect(() => {
    if (!isPaused) {
      const timer = setInterval(() => {
        setGameTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isPaused]);

  // AI coaching simulation
  useEffect(() => {
    if (!isAIActive || isPaused || !currentSession) return;

    const interval = setInterval(async () => {
      const advice = await geminiService.getCoachingAdvice("gameplay_situation", {
        gameTime,
        gameCategory: user?.gameCategory,
        stats: currentSession.liveStats,
      });
      addAIMessage(advice);
    }, 8000 + Math.random() * 7000); // 8-15 second intervals

    return () => clearInterval(interval);
  }, [isAIActive, isPaused, gameTime, currentSession, addAIMessage, user]);

  // Live stats simulation
  useEffect(() => {
    if (isPaused || !currentSession) return;

    const interval = setInterval(() => {
      const newStats = {
        accuracy: Math.max(0, Math.min(100, currentSession.liveStats.accuracy + (Math.random() - 0.5) * 10)),
        apm: Math.max(0, currentSession.liveStats.apm + (Math.random() - 0.5) * 20),
        score: currentSession.liveStats.score + Math.floor(Math.random() * 100),
      };
      updateLiveStats(newStats);
    }, 3000);

    return () => clearInterval(interval);
  }, [isPaused, currentSession, updateLiveStats]);

  // Key moments simulation
  useEffect(() => {
    if (isPaused || !currentSession) return;

    const interval = setInterval(() => {
      const moments = [
        { type: 'goal' as const, title: 'Goal Scored', description: 'Perfect timing on the through ball as coached', xpGained: 1500 },
        { type: 'defense' as const, title: 'Successful Defense', description: 'Great positioning prevented opponent\'s attack', xpGained: 800 },
        { type: 'missed_opportunity' as const, title: 'Missed Opportunity', description: 'Could have passed instead of shooting from distance' },
        { type: 'achievement' as const, title: 'Streak Bonus', description: 'Three successful plays in a row', xpGained: 1200 },
      ];

      if (Math.random() < 0.3) { // 30% chance every interval
        const moment = moments[Math.floor(Math.random() * moments.length)];
        addKeyMoment({
          ...moment,
          timestamp: formatTime(gameTime),
        });
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [isPaused, gameTime, addKeyMoment, currentSession]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !currentSession) return;

    addChatMessage(chatInput, 'user');
    setChatInput('');

    // Get AI response
    const response = await geminiService.respondToChat(chatInput, {
      gameTime,
      gameCategory: user?.gameCategory,
      stats: currentSession.liveStats,
    });
    
    setTimeout(() => {
      addChatMessage(response, 'ai');
    }, 1000);
  };

  const toggleMicrophone = () => {
    setIsMicActive(!isMicActive);
    // In a real implementation, this would handle microphone input
    if (!isMicActive) {
      // Simulate voice input
      setTimeout(() => {
        addChatMessage("Voice input: How should I approach this situation?", 'user');
        setIsMicActive(false);
      }, 2000);
    }
  };

  const handleEndGame = () => {
    onEndGame();
  };

  if (!user || !currentSession) {
    return <div className="min-h-screen bg-gaming-dark flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gaming-green mx-auto mb-4"></div>
        <p className="text-gaming-muted">Loading game session...</p>
      </div>
    </div>;
  }

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (aiMessagesRef.current) {
      aiMessagesRef.current.scrollTop = aiMessagesRef.current.scrollHeight;
    }
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [currentSession.aiMessages, currentSession.chatHistory]);

  return (
    <div className="min-h-screen relative">
      {/* Simulated Game Background - EA FC Soccer Field */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080')"
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Gaming Overlay Interface */}
      <div className="relative z-10 h-screen flex">
        {/* Left Panel - AI Coach Status */}
        <div className="w-80 p-4 space-y-4">
          {/* AI Status Indicator */}
          <Card className="bg-gaming-surface/90 backdrop-blur-sm border-gaming-green/30">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className={`w-3 h-3 rounded-full ${isAIActive ? 'bg-gaming-green animate-pulse' : 'bg-gaming-muted'}`}></div>
                <span className="font-gaming font-bold text-sm">
                  {isAIActive ? 'AI COACH ACTIVE' : 'AI COACH PAUSED'}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto p-1"
                  onClick={() => setIsAIActive(!isAIActive)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
              <div ref={aiMessagesRef} className="space-y-2 max-h-32 overflow-y-auto">
                {currentSession.aiMessages.slice(-5).map((message, index) => (
                  <div key={index} className="text-sm bg-gaming-dark/50 rounded-lg p-2">
                    <span className="text-gaming-green font-medium">[{message.timestamp}]</span> {message.message}
                  </div>
                ))}
                {currentSession.aiMessages.length === 0 && (
                  <div className="text-sm text-gaming-muted text-center py-4">
                    AI coach will provide live feedback during gameplay
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Chat Interface */}
          <Card className="bg-gaming-surface/90 backdrop-blur-sm border-gaming-blue/30">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-3">
                <MessageSquare className="h-4 w-4 text-gaming-blue" />
                <span className="font-gaming font-bold text-sm">ASK COACH</span>
              </div>
              <div ref={chatRef} className="space-y-2 mb-3 max-h-24 overflow-y-auto">
                {currentSession.chatHistory.slice(-4).map((chat, index) => (
                  <div key={index} className={`text-xs ${chat.sender === 'user' ? 'text-gaming-muted' : 'text-gaming-green'}`}>
                    <span className="font-medium">{chat.sender === 'user' ? 'You' : 'Coach'}:</span> {chat.message}
                  </div>
                ))}
              </div>
              <div className="flex space-x-2">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask your coach..."
                  className="flex-1 bg-gaming-dark/50 border-gaming-muted/30 text-sm focus:border-gaming-blue"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim()}
                  className="bg-gaming-blue hover:bg-gaming-blue/80"
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={toggleMicrophone}
                  className={`${isMicActive ? 'bg-red-500 hover:bg-red-600' : 'bg-gaming-green hover:bg-gaming-green/80'}`}
                >
                  <Mic className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card className="bg-gaming-surface/90 backdrop-blur-sm border-gaming-orange/30">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-3">
                <BarChart3 className="h-4 w-4 text-gaming-orange" />
                <span className="font-gaming font-bold text-sm">LIVE STATS</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gaming-muted">Accuracy</span>
                  <span className="text-gaming-orange font-medium">
                    {Math.round(currentSession.liveStats.accuracy)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gaming-muted">Actions/min</span>
                  <span className="text-gaming-orange font-medium">
                    {Math.round(currentSession.liveStats.apm)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gaming-muted">Score</span>
                  <span className="text-gaming-orange font-medium">
                    {Math.round(currentSession.liveStats.score).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Center Area - Minimal Game Info */}
        <div className="flex-1 flex items-start justify-center pt-8">
          <Card className="bg-gaming-surface/80 backdrop-blur-sm border-gaming-green/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-6 text-gaming-green font-gaming font-bold">
                <div className="text-center">
                  <div className="text-2xl">2</div>
                  <div className="text-xs text-gaming-muted">HOME</div>
                </div>
                <div className="text-4xl">-</div>
                <div className="text-center">
                  <div className="text-2xl">1</div>
                  <div className="text-xs text-gaming-muted">AWAY</div>
                </div>
                <div className="text-center ml-8">
                  <div className="text-xl">{formatTime(gameTime)}</div>
                  <div className="text-xs text-gaming-muted">TIME</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Controls */}
        <div className="w-64 p-4 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Game Controls */}
            <Card className="bg-gaming-surface/90 backdrop-blur-sm border-gaming-purple/30">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Activity className="h-4 w-4 text-gaming-purple" />
                  <span className="font-gaming font-bold text-sm">CONTROLS</span>
                </div>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full bg-gaming-purple/20 hover:bg-gaming-purple/30 border-gaming-purple/50"
                    onClick={() => setIsPaused(!isPaused)}
                  >
                    {isPaused ? <Play className="mr-2 h-4 w-4" /> : <Pause className="mr-2 h-4 w-4" />}
                    {isPaused ? 'Resume Game' : 'Pause Game'}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full bg-gaming-dark/50 hover:bg-gaming-dark/70 border-gaming-muted/30"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Toggle Overlay
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Session Info */}
            <Card className="bg-gaming-surface/90 backdrop-blur-sm border-gaming-muted/30">
              <CardContent className="p-4">
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gaming-muted">Session Time</span>
                    <span className="font-medium">{formatTime(gameTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gaming-muted">Game Mode</span>
                    <span className="font-medium capitalize">{user.gameCategory === 'moba' ? 'League of Legends' : user.gameCategory === 'fighting' ? 'Street Fighter 6' : 'EA FC'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gaming-muted">Coach Active</span>
                    <span className={`font-medium ${isAIActive ? 'text-gaming-green' : 'text-gaming-muted'}`}>
                      {isAIActive ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* End Game Button */}
          <Button
            onClick={handleEndGame}
            className="w-full bg-gradient-to-r from-gaming-orange to-red-600 hover:from-gaming-orange/90 hover:to-red-600/90 text-white font-gaming font-bold py-3 px-6"
          >
            End Game & Review
            <Trophy className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
