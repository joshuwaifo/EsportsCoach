import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useGame } from '@/contexts/GameContext';
import { geminiService } from '@/services/geminiService';
import { 
  BarChart3, 
  Trophy, 
  Target, 
  Shield, 
  Zap, 
  Play, 
  Download, 
  Maximize, 
  TrendingUp, 
  CheckCircle,
  XCircle,
  AlertTriangle,
  Star,
  Upload,
  FileVideo,
  Pause,
  SkipForward
} from 'lucide-react';

interface RecapPageProps {
  onPlayAgain: () => void;
  onContinue: () => void;
}

interface PostGameAnalysis {
  summary: string;
  strengths: string[];
  improvements: string[];
  drills: Array<{
    name: string;
    description: string;
  }>;
}

export default function RecapPage({ onPlayAgain, onContinue }: RecapPageProps) {
  const { user, currentSession, keyMoments, endSession } = useGame();
  const [analysis, setAnalysis] = useState<PostGameAnalysis | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedVideo, setUploadedVideo] = useState<string | null>(null);
  const [sessionErrors, setSessionErrors] = useState<string[]>([]);

  useEffect(() => {
    if (currentSession && !currentSession.endTime) {
      endSession();
    }
  }, [currentSession, endSession]);

  useEffect(() => {
    const generateAnalysis = async () => {
      setIsLoadingAnalysis(true);
      
      // If no session exists (direct to post-game analysis), create a simulated one
      if (!currentSession && user) {
        const simulatedSession = {
          id: 'post-analysis-' + Date.now(),
          userId: user.inGameName,
          gameCategory: user.gameCategory,
          startTime: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
          endTime: new Date(),
          duration: 15 * 60 * 1000, // 15 minutes
          aiMessages: [],
          chatHistory: [],
          liveStats: { accuracy: 85, apm: 120, score: 2450 },
          finalStats: {
            overallScore: 82,
            attacking: 78,
            defending: 85,
            decisionMaking: 80,
            coachFollowing: 88
          }
        };
        
        // Create simulated key moments
        const simulatedMoments = [
          { id: '1', sessionId: simulatedSession.id, type: 'goal' as const, title: 'Great Opening', description: 'Strong start to the match', timestamp: '3:20', xpGained: 1200 },
          { id: '2', sessionId: simulatedSession.id, type: 'defense' as const, title: 'Solid Defense', description: 'Prevented opponent scoring opportunity', timestamp: '8:45' },
          { id: '3', sessionId: simulatedSession.id, type: 'achievement' as const, title: 'Skill Showcase', description: 'Executed advanced technique perfectly', timestamp: '12:15', xpGained: 1500 }
        ];
        
        try {
          const result = await geminiService.generatePostGameAnalysis(simulatedSession, simulatedMoments, user);
          setAnalysis(result);
        } catch (error) {
          console.error('Failed to generate analysis:', error);
          setAnalysis({
            summary: `${user?.inGameName}, excellent ${user?.gameCategory.toUpperCase()} analysis session! As a ${user?.currentRank} player, your strategic understanding shows real potential for advancement.`,
            strengths: [
              `${user?.gameCategory === 'moba' ? 'Lane control and map awareness' : user?.gameCategory === 'fighting' ? 'Combo execution and frame timing' : 'Ball control and positioning'}`,
              "Strong tactical decision-making",
              `Excellent ${user?.gameCategory === 'moba' ? 'teamfight positioning' : user?.gameCategory === 'fighting' ? 'neutral game control' : 'offensive transitions'}`
            ],
            improvements: [
              `${user?.gameCategory === 'moba' ? 'Ward placement optimization' : user?.gameCategory === 'fighting' ? 'Defense and punishment' : 'Defensive shape maintenance'}`,
              `Better timing for ${user?.gameCategory === 'moba' ? 'objective control' : user?.gameCategory === 'fighting' ? 'counter-attacks' : 'set piece execution'}`,
              "More consistent execution under pressure"
            ],
            drills: [
              { name: `${user?.gameCategory.toUpperCase()} Fundamentals`, description: `Master the core mechanics of ${user?.gameCategory === 'moba' ? 'lane management' : user?.gameCategory === 'fighting' ? 'frame data' : 'ball control'}` },
              { name: "Decision Speed Training", description: "Improve reaction time and decision-making under pressure" },
              { name: "Advanced Tactics", description: `Practice ${user?.gameCategory === 'moba' ? 'team coordination' : user?.gameCategory === 'fighting' ? 'combo optimization' : 'formation play'} scenarios` }
            ]
          });
        }
      } else if (currentSession) {
        // Normal analysis for completed game session
        try {
          const result = await geminiService.generatePostGameAnalysis(currentSession, keyMoments, user);
          setAnalysis(result);
        } catch (error) {
          console.error('Failed to generate analysis:', error);
          // Fallback with user data
          setAnalysis({
            summary: `${user?.inGameName}, your ${user?.gameCategory.toUpperCase()} session showed strong performance at the ${user?.currentRank} level.`,
            strengths: ["Tactical awareness", "Decision making under pressure", "Adaptation to coaching advice"],
            improvements: ["Defensive positioning", "Communication timing", "Resource management"],
            drills: [
              { name: "Positioning Practice", description: "Work on maintaining optimal positioning" },
              { name: "Reaction Training", description: "Improve response time to threats" }
            ]
          });
        }
      }
      
      setIsLoadingAnalysis(false);
    };

    generateAnalysis();
  }, [currentSession, keyMoments, user]);

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('video/')) {
      alert('Please select a video file');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      const videoUrl = await geminiService.uploadMatchVideo(file, (progress) => {
        setUploadProgress(progress);
      });
      
      setUploadedVideo(videoUrl);
      
      // Trigger new analysis with uploaded video
      if (videoUrl) {
        setIsLoadingAnalysis(true);
        const result = await geminiService.generatePostGameAnalysis(
          { ...currentSession, uploadedVideo: videoUrl }, 
          keyMoments
        );
        setAnalysis(result);
        setIsLoadingAnalysis(false);
      }
    } catch (error: any) {
      alert(error.message || 'Upload failed. Please try again.');
      console.error('Video upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const resetForNextUser = () => {
    // Reset all state for Esports World Cup booth usage
    geminiService.resetForNextUser();
    onContinue();
  };

  if (!user) {
    return <div className="min-h-screen bg-gaming-dark flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gaming-green mx-auto mb-4"></div>
        <p className="text-gaming-muted">Loading user profile...</p>
      </div>
    </div>;
  }

  const getGameDisplayName = (category: string) => {
    switch (category) {
      case 'moba': return 'League of Legends';
      case 'fighting': return 'Street Fighter 6';
      case 'sport': return 'EA FC';
      default: return category;
    }
  };

  const getKeyMomentIcon = (type: string) => {
    switch (type) {
      case 'goal': return Trophy;
      case 'defense': return Shield;
      case 'missed_opportunity': return AlertTriangle;
      case 'achievement': return Star;
      default: return Target;
    }
  };

  const getKeyMomentColor = (type: string) => {
    switch (type) {
      case 'goal': return 'text-gaming-green bg-gaming-green/20';
      case 'defense': return 'text-gaming-blue bg-gaming-blue/20';
      case 'missed_opportunity': return 'text-gaming-orange bg-gaming-orange/20';
      case 'achievement': return 'text-yellow-500 bg-yellow-500/20';
      default: return 'text-gaming-muted bg-gaming-muted/20';
    }
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gaming-dark">
      {/* Header */}
      <header className="bg-gaming-surface border-b border-gaming-muted/20 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gaming-green rounded-xl flex items-center justify-center">
              <BarChart3 className="text-gaming-dark text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-gaming font-bold">Great session, {user?.inGameName}!</h1>
              <p className="text-gaming-muted text-sm">
                {getGameDisplayName(user.gameCategory)} • {user?.currentRank} • {user?.trainingMode === 'post' ? 'Post-Game Analysis' : 'Live Coaching'} •
                {currentSession?.duration ? ` ${formatDuration(currentSession.duration)}` : 'Analysis Complete'} 
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button 
              onClick={onPlayAgain}
              className="bg-gaming-blue hover:bg-gaming-blue/80 text-white px-6 py-2"
            >
              Play Again
            </Button>
            <Button 
              onClick={onContinue}
              className="bg-gaming-green hover:bg-gaming-green/80 text-gaming-dark px-6 py-2 font-medium"
            >
              Continue Training
            </Button>
            <Button 
              onClick={resetForNextUser}
              variant="outline"
              className="border-gaming-orange text-gaming-orange hover:bg-gaming-orange/10 px-6 py-2"
            >
              Next User (Booth)
            </Button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="max-w-7xl mx-auto p-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Video and Key Moments */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Replay Section */}
            <Card className="bg-gaming-surface border-gaming-green/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-gaming">Match Replay</CardTitle>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm">
                      <Maximize className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Video Player Mockup */}
                <div 
                  className="relative bg-black rounded-xl overflow-hidden aspect-video mb-4"
                  style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Button className="w-16 h-16 bg-gaming-green/90 hover:bg-gaming-green rounded-full p-0">
                      <Play className="text-gaming-dark text-xl ml-1" />
                    </Button>
                  </div>
                  {/* Video Progress Bar */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-black/50 rounded-lg p-2">
                      <div className="flex items-center space-x-3">
                        <span className="text-white text-sm">2:34</span>
                        <div className="flex-1 bg-gaming-muted/30 h-2 rounded-full">
                          <div className="bg-gaming-green h-2 rounded-full w-1/3"></div>
                        </div>
                        <span className="text-white text-sm">7:22</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Video Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex space-x-3">
                    <Button variant="outline" size="sm">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8.445 14.832A1 1 0 0010 14v-4a1 1 0 00-1.555-.832l-3 2a1 1 0 000 1.664l3 2z" />
                        <path fillRule="evenodd" d="M15 3a1 1 0 00-1.445.832L11 6v8l2.555 2.168A1 1 0 0015 16V3z" clipRule="evenodd" />
                      </svg>
                    </Button>
                    <Button className="bg-gaming-green hover:bg-gaming-green/80 text-gaming-dark" size="sm">
                      <Play className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L7 13v1a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2A1 1 0 007 9V6l-2.445-1.832z" />
                      </svg>
                    </Button>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gaming-muted">Speed:</span>
                    <select className="bg-gaming-dark border border-gaming-muted/30 rounded px-2 py-1 text-sm">
                      <option>1x</option>
                      <option>0.5x</option>
                      <option>2x</option>
                    </select>
                  </div>
                </div>
                
                {/* Video Upload Section */}
                <div className="mt-4 p-4 border border-gaming-muted/20 rounded-xl bg-gaming-dark/30">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-gaming font-bold text-sm">Upload Match Recording</h4>
                    <FileVideo className="h-4 w-4 text-gaming-muted" />
                  </div>
                  <p className="text-xs text-gaming-muted mb-3">
                    Upload your match video for enhanced AI analysis (Max: 1GB, supports MP4/MOV/AVI)
                  </p>
                  
                  {isUploading ? (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gaming-green"></div>
                        <span className="text-sm">Uploading... {uploadProgress.toFixed(0)}%</span>
                      </div>
                      <Progress value={uploadProgress} className="w-full" />
                    </div>
                  ) : uploadedVideo ? (
                    <div className="flex items-center space-x-2 text-gaming-green">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">Video uploaded successfully! Analysis updated.</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoUpload}
                        className="hidden"
                        id="video-upload"
                      />
                      <label
                        htmlFor="video-upload"
                        className="cursor-pointer flex items-center space-x-2 px-3 py-2 bg-gaming-blue hover:bg-gaming-blue/80 rounded-lg text-sm font-medium transition-colors"
                      >
                        <Upload className="h-4 w-4" />
                        <span>Choose Video File</span>
                      </label>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Key Moments */}
            <Card className="bg-gaming-surface border-gaming-orange/20">
              <CardHeader>
                <CardTitle className="font-gaming">Key Moments & Highlights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {keyMoments.length > 0 ? keyMoments.map((moment) => {
                    const Icon = getKeyMomentIcon(moment.type);
                    const colorClass = getKeyMomentColor(moment.type);
                    
                    return (
                      <div key={moment.id} className="flex items-center space-x-4 p-3 bg-gaming-dark/50 rounded-xl hover:bg-gaming-dark/70 transition-colors cursor-pointer">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClass}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{moment.title}</span>
                            {moment.xpGained && (
                              <span className={`text-sm px-2 py-1 rounded ${colorClass.split(' ')[1]} ${colorClass.split(' ')[0]}`}>
                                +{moment.xpGained} XP
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gaming-muted">{moment.description}</p>
                        </div>
                        <span className="text-sm text-gaming-muted">{moment.timestamp}</span>
                      </div>
                    );
                  }) : (
                    <div className="text-center py-8 text-gaming-muted">
                      <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No key moments recorded during this session</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Stats and Analysis */}
          <div className="space-y-6">
            {/* AI Analysis Panel */}
            <Card className="bg-gaming-surface border-gaming-green/20">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-gaming-green" />
                  <CardTitle className="font-gaming">AI Coach Analysis</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingAnalysis ? (
                  <div className="text-center py-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gaming-green mx-auto mb-3"></div>
                    <p className="text-sm text-gaming-muted">Analyzing your performance...</p>
                  </div>
                ) : analysis ? (
                  <div className="space-y-4">
                    <div className="bg-gaming-dark/50 rounded-lg p-3">
                      <h4 className="font-medium mb-2">Session Summary</h4>
                      <p className="text-sm text-gaming-muted">{analysis.summary}</p>
                    </div>
                    
                    <div className="space-y-3 max-h-48 overflow-y-auto">
                      {currentSession.aiMessages.slice(-6).map((message, index) => (
                        <div key={index} className="bg-gaming-dark/50 rounded-lg p-3">
                          <div className="flex items-start space-x-2">
                            <span className="text-xs text-gaming-green font-medium">[{message.timestamp}]</span>
                            <div className="flex-1">
                              <p className="text-sm">{message.message}</p>
                              {message.followed !== undefined && (
                                <div className="flex items-center space-x-2 mt-1">
                                  {message.followed ? (
                                    <span className="text-xs bg-gaming-green/20 text-gaming-green px-2 py-1 rounded flex items-center">
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Followed
                                    </span>
                                  ) : (
                                    <span className="text-xs bg-gaming-orange/20 text-gaming-orange px-2 py-1 rounded flex items-center">
                                      <XCircle className="h-3 w-3 mr-1" />
                                      Ignored
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-gaming-muted">
                    <p>Unable to generate analysis at this time</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card className="bg-gaming-surface border-gaming-blue/20">
              <CardHeader>
                <CardTitle className="font-gaming">Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                {currentSession?.finalStats ? (
                  <>
                    {/* Overall Score */}
                    <div className="text-center mb-6">
                      <div className="text-4xl font-gaming font-bold text-gaming-green mb-2">
                        {currentSession?.finalStats?.overallScore || 85}/100
                      </div>
                      <p className="text-gaming-muted">Overall Performance</p>
                      <div className="text-sm text-gaming-green">
                        <TrendingUp className="inline h-3 w-3 mr-1" />
                        +12% vs Last Game
                      </div>
                    </div>

                    {/* Detailed Stats */}
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Attacking</span>
                          <span className="font-medium">{currentSession?.finalStats?.attacking || 78}%</span>
                        </div>
                        <Progress value={currentSession?.finalStats?.attacking || 78} className="h-2" />
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Defending</span>
                          <span className="font-medium">{currentSession?.finalStats?.defending || 82}%</span>
                        </div>
                        <Progress value={currentSession?.finalStats?.defending || 82} className="h-2" />
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Decision Making</span>
                          <span className="font-medium">{currentSession?.finalStats?.decisionMaking || 80}%</span>
                        </div>
                        <Progress value={currentSession?.finalStats?.decisionMaking || 80} className="h-2" />
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Coach Following</span>
                          <span className="font-medium">{currentSession?.finalStats?.coachFollowing || 88}%</span>
                        </div>
                        <Progress value={currentSession?.finalStats?.coachFollowing || 88} className="h-2" />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-6 text-gaming-muted">
                    <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Performance metrics will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Ranking Comparison */}
            <Card className="bg-gaming-surface border-gaming-purple/20">
              <CardHeader>
                <CardTitle className="font-gaming">Player Ranking</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-2xl font-gaming font-bold text-gaming-purple mb-1">#2,847</div>
                  <p className="text-gaming-muted text-sm">Global Rank</p>
                  <div className="text-sm text-gaming-green">
                    <TrendingUp className="inline h-3 w-3 mr-1" />
                    ↑ 156 positions
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gaming-muted">Goals per Game</span>
                    <span className="font-medium">2.1 (Top 15%)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gaming-muted">Pass Accuracy</span>
                    <span className="font-medium">84.5% (Top 22%)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gaming-muted">Win Rate</span>
                    <span className="font-medium">67% (Top 18%)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips & Drills */}
            <Card className="bg-gaming-surface border-gaming-orange/20">
              <CardHeader>
                <CardTitle className="font-gaming">Recommended Training</CardTitle>
              </CardHeader>
              <CardContent>
                {analysis?.drills ? (
                  <div className="space-y-3">
                    {analysis.drills.map((drill, index) => (
                      <div key={index} className="bg-gaming-dark/50 rounded-lg p-3">
                        <h3 className="font-medium mb-1">{drill.name}</h3>
                        <p className="text-sm text-gaming-muted mb-2">{drill.description}</p>
                        <button className="text-xs text-gaming-orange hover:text-gaming-orange/80 transition-colors">
                          Start Drill →
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gaming-muted">
                    <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Training recommendations will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Session Debugging (only visible if errors exist) */}
            {sessionErrors.length > 0 && (
              <Card className="bg-gaming-surface border-red-500/20">
                <CardHeader>
                  <CardTitle className="font-gaming text-red-400">AI System Debugging</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-gaming-muted mb-3">
                      Session errors detected (for Esports World Cup booth monitoring):
                    </p>
                    {sessionErrors.map((error, index) => (
                      <div key={index} className="bg-red-900/30 border border-red-500/50 rounded p-2">
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="h-4 w-4 text-red-400" />
                          <span className="text-sm text-red-300">{error}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
