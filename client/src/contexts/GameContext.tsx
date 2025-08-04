import { createContext, useContext, useState, ReactNode } from 'react';
import { UserProfile, GameSession, KeyMoment } from '@shared/schema';

interface GameContextType {
  user: UserProfile | null;
  currentSession: GameSession | null;
  keyMoments: KeyMoment[];
  sessionHistory: GameSession[];
  setUser: (user: UserProfile) => void;
  startSession: (gameCategory: string) => void;
  endSession: () => void;
  addAIMessage: (message: string, followed?: boolean) => void;
  addChatMessage: (message: string, sender: 'user' | 'ai') => void;
  updateLiveStats: (stats: Partial<GameSession['liveStats']>) => void;
  addKeyMoment: (moment: Omit<KeyMoment, 'id' | 'sessionId'>) => void;
  resetToSignup: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [currentSession, setCurrentSession] = useState<GameSession | null>(null);
  const [keyMoments, setKeyMoments] = useState<KeyMoment[]>([]);
  const [sessionHistory, setSessionHistory] = useState<GameSession[]>([]);

  const startSession = (gameCategory: string) => {
    if (!user) return;
    
    const session: GameSession = {
      id: crypto.randomUUID(),
      userId: user.inGameName,
      gameCategory: gameCategory as any,
      startTime: new Date(),
      aiMessages: [],
      chatHistory: [],
      liveStats: {
        accuracy: 0,
        apm: 0,
        score: 0,
      },
    };
    
    setCurrentSession(session);
    setKeyMoments([]);
  };

  const endSession = () => {
    if (!currentSession) return;
    
    const endedSession = {
      ...currentSession,
      endTime: new Date(),
      duration: Date.now() - currentSession.startTime.getTime(),
      finalStats: {
        overallScore: Math.floor(Math.random() * 30) + 70, // 70-100 range
        attacking: Math.floor(Math.random() * 40) + 60,
        defending: Math.floor(Math.random() * 40) + 60,
        decisionMaking: Math.floor(Math.random() * 40) + 60,
        coachFollowing: Math.floor(Math.random() * 40) + 60,
      },
    };
    
    setSessionHistory(prev => [...prev, endedSession]);
    setCurrentSession(endedSession);
  };

  const addAIMessage = (message: string, followed?: boolean) => {
    if (!currentSession) return;
    
    const aiMessage = {
      timestamp: new Date().toLocaleTimeString('en-US', { 
        minute: '2-digit', 
        second: '2-digit' 
      }),
      message,
      followed,
    };
    
    setCurrentSession(prev => prev ? {
      ...prev,
      aiMessages: [...prev.aiMessages, aiMessage],
    } : null);
  };

  const addChatMessage = (message: string, sender: 'user' | 'ai') => {
    if (!currentSession) return;
    
    const chatMessage = {
      timestamp: new Date().toLocaleTimeString(),
      sender,
      message,
    };
    
    setCurrentSession(prev => prev ? {
      ...prev,
      chatHistory: [...prev.chatHistory, chatMessage],
    } : null);
  };

  const updateLiveStats = (stats: Partial<GameSession['liveStats']>) => {
    if (!currentSession) return;
    
    setCurrentSession(prev => prev ? {
      ...prev,
      liveStats: { ...prev.liveStats, ...stats },
    } : null);
  };

  const addKeyMoment = (moment: Omit<KeyMoment, 'id' | 'sessionId'>) => {
    if (!currentSession) return;
    
    const keyMoment: KeyMoment = {
      ...moment,
      id: crypto.randomUUID(),
      sessionId: currentSession.id,
    };
    
    setKeyMoments(prev => [...prev, keyMoment]);
  };

  const resetToSignup = () => {
    setCurrentSession(null);
    setKeyMoments([]);
  };

  return (
    <GameContext.Provider value={{
      user,
      currentSession,
      keyMoments,
      sessionHistory,
      setUser,
      startSession,
      endSession,
      addAIMessage,
      addChatMessage,
      updateLiveStats,
      addKeyMoment,
      resetToSignup,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
