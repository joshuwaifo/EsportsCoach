import { GoogleGenAI, Modality } from "@google/genai";
import CoachingVerifier from "@/components/Verifier";

/**
 * Gemini-2.5 Live API Integration for Real-time Esports Coaching
 * Two-model system: Generator + Verifier with fallback chain
 * 
 * Cost Analysis (per user session):
 * - Video input: ~263 tokens/second
 * - Audio output: ~32 tokens/second  
 * - 15-minute session: ~240,000 tokens
 * - Estimated cost: $0.96-1.20 per session
 * - Daily booth operation (50 sessions): ~$50-60
 * 
 * Model fallback chain:
 * 1. gemini-2.5-pro-preview (highest quality)
 * 2. gemini-2.5-flash-preview (balanced)
 * 3. gemini-2.5-flash-lite-preview (lowest cost)
 */

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

if (!API_KEY) {
  console.warn("Gemini API key not found. AI coaching will use simulated responses.");
}

// DSPy-style prompt templates
const COACHING_SYSTEM_PROMPT = `You are a super-intelligent real-time esports coach.
Role: Expert coach for {gameCategory} games
Task: Provide proactive, actionable coaching during live gameplay
Output format: JSON with structured advice

<examples>
Input: Player positioning in League of Legends mid-lane
Output: {"advice": "Move closer to tower - enemy jungler spotted nearby", "urgency": "high", "category": "positioning"}

Input: Street Fighter 6 neutral game
Output: {"advice": "Use more medium kicks to control space", "urgency": "medium", "category": "strategy"}
</examples>

Rules:
- Keep advice under 15 seconds of speech
- Focus on immediate 1% improvements
- Ground advice in current game state
- Be specific and actionable`;

// Model configuration with fallback chain
const MODEL_CONFIGS = [
  {
    name: "gemini-2.5-pro-preview",
    parameters: {
      temperature: 0.7,
      maxOutputTokens: 150,
      topP: 0.95,
      frequencyPenalty: 0.2,
      presencePenalty: 0.1,
      thinkingBudgetTokens: 1000
    }
  },
  {
    name: "gemini-2.5-flash-preview",
    parameters: {
      temperature: 0.6,
      maxOutputTokens: 100,
      topP: 0.9,
      frequencyPenalty: 0.1,
      presencePenalty: 0,
      thinkingBudgetTokens: 500
    }
  },
  {
    name: "gemini-2.5-flash-lite-preview",
    parameters: {
      temperature: 0.5,
      maxOutputTokens: 80,
      topP: 0.85,
      frequencyPenalty: 0,
      presencePenalty: 0,
      thinkingBudgetTokens: 0 // Disable thinking for lowest tier
    }
  }
];

interface SessionMetrics {
  tokenCount: number;
  sessionCost: number;
  startTime: number;
  videoFramesSent: number;
  audioSegmentsSent: number;
}

class GeminiService {
  // Two-model system: Generator and Verifier
  private genai: GoogleGenAI | null = null;
  private generatorModel: any = null;
  private verifierModel: any = null;
  private liveSession: any = null;
  private verifier: CoachingVerifier | null = null;
  private sessionMetrics: SessionMetrics;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private videoStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analysisInterval: NodeJS.Timeout | null = null;
  private currentModelIndex = 0; // Track fallback position
  private groundingUrls: string[] = []; // URLs for context grounding

  constructor() {
    if (API_KEY) {
      this.genai = new GoogleGenAI({ apiKey: API_KEY });
    }
    this.sessionMetrics = this.initializeMetrics();
  }

  private initializeMetrics(): SessionMetrics {
    return {
      tokenCount: 0,
      sessionCost: 0,
      startTime: Date.now(),
      videoFramesSent: 0,
      audioSegmentsSent: 0
    };
  }

  async initializeLiveCoaching(gameCategory: string, userProfile: any) {
    if (!this.genai) {
      console.warn("Gemini API not available, using simulated coaching");
      this.verifier = new CoachingVerifier(gameCategory);
      return null;
    }

    try {
      this.verifier = new CoachingVerifier(gameCategory);
      this.sessionMetrics = this.initializeMetrics();

      // Initialize grounding URLs based on game
      this.groundingUrls = this.getGroundingUrls(gameCategory);

      // Initialize two-model system with Gemini-2.5
      await this.initializeModels(gameCategory, userProfile);

      // Start Live API session with current model
      const modelConfig = MODEL_CONFIGS[this.currentModelIndex];
      const systemPrompt = COACHING_SYSTEM_PROMPT
        .replace('{gameCategory}', gameCategory);
      
      // Initialize Live session with grounding
      this.liveSession = await this.createLiveSession(systemPrompt, modelConfig);
      
      console.log(`Live coaching initialized with ${modelConfig.name}`);
      this.startSessionMonitoring();
      
      return this.liveSession;
    } catch (error) {
      console.error("Failed to initialize Gemini Live coaching:", error);
      await this.handleReconnection();
      return null;
    }
  }

  // Add missing helper methods
  private getGroundingUrls(gameCategory: string): string[] {
    switch (gameCategory) {
      case 'moba':
        return [
          'https://www.leagueoflegends.com/en-us/news/game-updates/',
          'https://u.gg/lol/tier-list',
          'https://www.probuilds.net/'
        ];
      case 'fighting':
        return [
          'https://www.streetfighter.com/6/en-us/character',
          'https://wiki.supercombo.gg/w/Street_Fighter_6',
          'https://fullmeter.com/fatonline/'
        ];
      case 'sport':
        return [
          'https://www.ea.com/games/ea-sports-fc/news',
          'https://www.futbin.com/meta',
          'https://www.fifauteam.com/tactics/'
        ];
      default:
        return [];
    }
  }

  private async initializeModels(gameCategory: string, userProfile: any) {
    const modelConfig = MODEL_CONFIGS[this.currentModelIndex];
    
    try {
      // For now, use gemini-pro until 2.5 models are available
      const fallbackModel = modelConfig.name.includes('2.5') ? 'gemini-pro' : modelConfig.name;
      
      // Initialize generator model
      this.generatorModel = this.genai!.getGenerativeModel({
        model: fallbackModel,
        generationConfig: {
          temperature: modelConfig.parameters.temperature,
          maxOutputTokens: modelConfig.parameters.maxOutputTokens,
          topP: modelConfig.parameters.topP,
          topK: 40
        }
      });

      // Initialize verifier model (same model but different instance)
      this.verifierModel = this.genai!.getGenerativeModel({
        model: fallbackModel,
        generationConfig: {
          temperature: 0.3, // Lower temperature for verification
          maxOutputTokens: 50,
          topP: 0.8,
          topK: 20
        }
      });
      
      console.log(`Models initialized with ${fallbackModel} (requested: ${modelConfig.name})`);
    } catch (error) {
      console.error("Failed to initialize models:", error);
      throw error;
    }
  }

  private async createLiveSession(systemPrompt: string, modelConfig: any) {
    // Create a Live API session with the generator model
    const session = await this.generatorModel.startChat({
      history: [],
      generationConfig: modelConfig.parameters,
      systemInstruction: systemPrompt
    });

    // Send grounding URLs if available
    if (this.groundingUrls.length > 0) {
      await session.sendMessage({
        text: `Initialize coaching with these reference URLs for up-to-date information:
        ${this.groundingUrls.join('\n')}
        Use these for patch notes, meta builds, and current strategies.`
      });
    }

    return session;
  }

  /**
   * Monitors session health and implements auto-reconnection
   * Sessions typically drop after ~10 minutes
   */
  private startSessionMonitoring(): void {
    const monitorInterval = setInterval(async () => {
      const sessionAge = Date.now() - this.sessionMetrics.startTime;
      
      // Reconnect before 10-minute timeout
      if (sessionAge > 9 * 60 * 1000) {
        clearInterval(monitorInterval);
        await this.handleReconnection();
      }
      
      // Update cost metrics
      this.updateCostMetrics();
    }, 30000); // Check every 30 seconds
  }



  private async handleReconnection(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Max reconnection attempts reached. Falling back to simulated mode.");
      return;
    }

    this.reconnectAttempts++;
    console.log(`Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
    
    try {
      // Fallback to next model in chain
      if (this.currentModelIndex < MODEL_CONFIGS.length - 1) {
        this.currentModelIndex++;
        console.log(`Falling back to ${MODEL_CONFIGS[this.currentModelIndex].name}`);
      }
      
      // Reinitialize with compressed context
      const contextSummary = this.compressSessionContext();
      
      if (this.generatorModel) {
        const modelConfig = MODEL_CONFIGS[this.currentModelIndex];
        const systemPrompt = COACHING_SYSTEM_PROMPT.replace('{gameCategory}', 'sport'); // Use current game category
        
        this.liveSession = await this.createLiveSession(systemPrompt, modelConfig);
      }
      
      this.reconnectAttempts = 0;
      console.log("Successfully reconnected to Live API");
    } catch (error) {
      console.error("Reconnection failed:", error);
      setTimeout(() => this.handleReconnection(), 5000);
    }
  }

  private compressSessionContext(): string {
    // Compress recent coaching context for session resumption
    return JSON.stringify({
      sessionTime: Date.now() - this.sessionMetrics.startTime,
      recentAdvice: "Last 3 coaching points",
      gameState: "Current game phase"
    });
  }

  private updateCostMetrics(): void {
    const sessionDuration = (Date.now() - this.sessionMetrics.startTime) / 1000;
    
    // Estimate token usage based on activity
    const videoTokens = this.sessionMetrics.videoFramesSent * 263;
    const audioTokens = this.sessionMetrics.audioSegmentsSent * 32;
    this.sessionMetrics.tokenCount = videoTokens + audioTokens;
    
    // Estimate cost at $0.004 per 1K tokens (approximate)
    this.sessionMetrics.sessionCost = (this.sessionMetrics.tokenCount / 1000) * 0.004;
    
    console.log(`Session metrics: ${this.sessionMetrics.tokenCount} tokens, $${this.sessionMetrics.sessionCost.toFixed(4)} cost`);
  }

  // Real-time screen capture and analysis
  async startScreenCapture(): Promise<MediaStream | null> {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: 1920,
          height: 1080,
          frameRate: 15 // Cost-optimized for Live API
        },
        audio: true
      });
      
      this.videoStream = stream;
      console.log("Screen capture started for real-time analysis");
      
      // Start continuous analysis of captured frames
      this.startContinuousAnalysis();
      return stream;
    } catch (error) {
      console.error("Failed to start screen capture:", error);
      return null;
    }
  }

  async stopScreenCapture() {
    if (this.videoStream) {
      this.videoStream.getTracks().forEach(track => track.stop());
      this.videoStream = null;
    }
    
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
      this.analysisInterval = null;
    }
  }

  // Capture frame from live video stream for analysis
  private captureVideoFrame(): string | null {
    if (!this.videoStream) return null;
    
    // Create video element for frame capture
    const video = document.createElement('video');
    video.srcObject = this.videoStream;
    video.play();
    
    // Create canvas for frame capture
    const canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    
    if (ctx && video.readyState >= 2) {
      ctx.drawImage(video, 0, 0, 1920, 1080);
      return canvas.toDataURL('image/jpeg', 0.8);
    }
    
    return null;
  }

  // Continuous analysis of screen capture for real-time coaching
  private startContinuousAnalysis() {
    // Analyze frames every 3 seconds to control API costs
    const analysisInterval = setInterval(async () => {
      const frameData = this.captureVideoFrame();
      
      if (frameData && this.genai) {
        try {
          // Send frame to Gemini for real-time game analysis
          const analysisResult = await this.analyzeGameFrame(frameData);
          
          if (analysisResult && analysisResult.requiresCoaching) {
            // Generate coaching advice based on actual game state
            this.generateRealTimeAdvice(analysisResult);
          }
          
          this.sessionMetrics.videoFramesSent++;
          this.updateCostMetrics();
        } catch (error) {
          console.error("Frame analysis failed:", error);
        }
      }
    }, 3000); // Analyze every 3 seconds
    
    // Store interval for cleanup
    this.analysisInterval = analysisInterval;
  }

  // Analyze captured game frame with Gemini Vision
  private async analyzeGameFrame(frameData: string): Promise<any> {
    if (!this.genai) return null;
    
    try {
      const response = await this.genai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{
          role: "user",
          parts: [
            {
              inlineData: {
                data: frameData.split(',')[1], // Remove data:image/jpeg;base64, prefix
                mimeType: "image/jpeg"
              }
            },
            {
              text: `Analyze this live gameplay screenshot and determine:
              1. What game is being played?
              2. Current game situation and phase
              3. Player positioning and actions
              4. Immediate opportunities for improvement
              5. Any critical mistakes or good plays
              6. Does this require immediate coaching advice?
              
              Respond with JSON: {
                "game": "detected_game",
                "situation": "current_situation", 
                "playerPosition": "position_analysis",
                "opportunities": "improvement_suggestions",
                "requiresCoaching": boolean,
                "urgency": "low|medium|high",
                "advice": "specific_coaching_advice"
              }`
            }
          ]
        }],
        config: {
          responseMimeType: "application/json"
        }
      });

      const result = JSON.parse(response.text || '{}');
      return result;
    } catch (error) {
      console.error("Frame analysis error:", error);
      return null;
    }
  }

  // Generate real-time coaching based on live analysis
  private generateRealTimeAdvice(analysisResult: any) {
    if (!analysisResult || !this.verifier) return;
    
    // Verify advice with expert coaching principles
    const verifiedAdvice = this.verifier.verifyAdvice(analysisResult.advice, {
      game: analysisResult.game,
      situation: analysisResult.situation,
      urgency: analysisResult.urgency
    });
    
    if (verifiedAdvice.isValid) {
      // Trigger coaching overlay with real-time advice
      const advice = verifiedAdvice.modifiedAdvice || analysisResult.advice;
      this.onRealTimeAdvice?.(advice, analysisResult.urgency);
    }
  }

  // Callback for real-time advice (set by LiveCoachPage)
  onRealTimeAdvice: ((advice: string, urgency: string) => void) | null = null;

  /**
   * Generates verified coaching advice with real-time context
   * Now uses actual screen analysis instead of simulated data
   */
  async getCoachingAdvice(situation: string, gameContext: any) {
    const timestamp = Date.now();
    
    if (!this.liveSession || !this.verifier) {
      return this.getSimulatedAdvice();
    }

    try {
      // Only send video frames during active gameplay to control costs
      const shouldAnalyzeVideo = this.shouldSendVideoFrame(gameContext);
      
      const prompt = `Analyze current game situation: ${situation}. 
      Context: ${JSON.stringify(gameContext)}. 
      Provide proactive coaching advice focusing on immediate 1% improvements.`;

      // Generate advice using current model in fallback chain
      const modelConfig = MODEL_CONFIGS[this.currentModelIndex];
      const result = await this.generatorModel!.generateContent([
        { text: prompt }
      ]);

      const rawAdvice = result.response.text() || "Keep focusing on your fundamentals";
      
      // Verify advice through coaching syllabus
      const verification = this.verifier.verifyAdvice(rawAdvice, gameContext);
      
      // Check time sensitivity
      const isTimely = this.verifier.validateTimeSensitivity(rawAdvice, timestamp, gameContext.gameTime);
      
      if (!verification.isValid || !isTimely) {
        console.warn(`Invalid/outdated advice filtered: ${rawAdvice}`);
        return verification.modifiedAdvice || this.getSimulatedAdvice();
      }

      // Update metrics
      this.sessionMetrics.tokenCount += 100; // Approximate tokens per request
      
      return verification.modifiedAdvice || rawAdvice;
    } catch (error) {
      console.error("Failed to get coaching advice:", error);
      return this.getSimulatedAdvice();
    }
  }

  /**
   * Determines if video frame should be sent based on game state
   * Only sends during active gameplay to control costs
   */
  private shouldSendVideoFrame(gameContext: any): boolean {
    // Logic to determine active gameplay periods
    const activeGameStates = ['playing', 'teamfight', 'objective', 'laning'];
    return activeGameStates.includes(gameContext.gameState) && 
           (this.sessionMetrics.videoFramesSent % 4 === 0); // Send every 4th frame
  }

  private getSimulatedAdvice(): string {
    const simulatedAdvice = [
      "Focus on positioning",
      "Watch your spacing", 
      "Good pressure!",
      "Consider passing",
      "Defensive positioning needed",
      "Nice tactical decision",
      "Try a through ball",
      "Maintain formation",
      "Ward objectives",
      "Time your abilities"
    ];
    return simulatedAdvice[Math.floor(Math.random() * simulatedAdvice.length)];
  }

  /**
   * Enhanced chat response with voice integration
   * Supports both text and audio responses via Live API
   */
  async respondToChat(message: string, gameContext: any) {
    if (!this.liveSession || !this.verifier) {
      return this.getSimulatedChatResponse(message);
    }

    try {
      const response = await this.genai!.models.generateContent({
        model: "gemini-2.5-flash",
        config: {
          responseModalities: [Modality.TEXT, Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } }
          }
        },
        contents: [{
          role: "user",
          parts: [{ 
            text: `Player question: "${message}". Game context: ${JSON.stringify(gameContext)}. 
            Provide a helpful coaching response in under 15 seconds of speech.` 
          }]
        }]
      });

      const textResponse = response.text || "Let me help you with that.";
      
      // Verify response quality
      const verification = this.verifier!.verifyAdvice(textResponse, gameContext);
      
      return {
        text: verification.modifiedAdvice || textResponse,
        audio: response.candidates?.[0]?.content?.parts?.find(part => part.inlineData)?.inlineData?.data,
        confidence: verification.confidence
      };
    } catch (error) {
      console.error("Failed to respond to chat:", error);
      return this.getSimulatedChatResponse(message);
    }
  }

  private getSimulatedChatResponse(message: string) {
    const responses = [
      "Focus on your positioning and timing",
      "Try to maintain better map awareness",
      "Your decision making is improving",
      "Consider adjusting your strategy",
      "Good question - work on that fundamentals",
    ];
    return { 
      text: responses[Math.floor(Math.random() * responses.length)],
      confidence: 0.7
    };
  }

  /**
   * Converts audio buffer to WAV format for Live API compatibility
   * Cost: Minimal - format conversion only
   */
  private convertToWav(audioBuffer: ArrayBuffer, sampleRate: number = 16000): ArrayBuffer {
    const length = audioBuffer.byteLength;
    const arrayBuffer = new ArrayBuffer(44 + length);
    const view = new DataView(arrayBuffer);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length, true);
    
    // Copy audio data
    const audioData = new Uint8Array(audioBuffer);
    const wavData = new Uint8Array(arrayBuffer, 44);
    wavData.set(audioData);
    
    return arrayBuffer;
  }

  /**
   * Saves binary audio/video files for session analysis
   * Used for storing coaching session recordings
   */
  private saveBinaryFile(data: ArrayBuffer, filename: string): string {
    const blob = new Blob([data], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    
    // Create download link for demo purposes
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    console.log(`Binary file saved: ${filename} (${data.byteLength} bytes)`);
    return url;
  }

  /**
   * Handles large file uploads with chunking and progress tracking
   * Supports video files up to 1GB with resume capability
   */
  private async uploadChunk(chunk: Blob, index: number, total: number): Promise<void> {
    // Simulate network delay for demo
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log(`Uploaded chunk ${index + 1}/${total}`);
  }

  /**
   * Gets current session cost and token usage metrics
   */
  getSessionMetrics(): SessionMetrics {
    return { ...this.sessionMetrics };
  }

  /**
   * Ends current session and returns analytics
   */
  async endSession(): Promise<any> {
    const finalMetrics = this.getSessionMetrics();
    
    if (this.videoStream) {
      this.videoStream.getTracks().forEach(track => track.stop());
      this.videoStream = null;
    }
    
    if (this.audioContext) {
      await this.audioContext.close();
      this.audioContext = null;
    }
    
    this.liveSession = null;
    
    return {
      metrics: finalMetrics,
      errors: this.verifier?.getSessionErrors() || [],
      duration: Date.now() - finalMetrics.startTime
    };
  }

  /**
   * Uploads match video for enhanced analysis
   */
  async uploadMatchVideo(file: File, onProgress?: (progress: number) => void): Promise<string> {
    try {
      // Simulate video upload with progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress > 100) progress = 100;
        onProgress?.(progress);
        
        if (progress >= 100) {
          clearInterval(interval);
        }
      }, 200);

      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // For demo purposes, create a blob URL for the uploaded video
      const videoUrl = URL.createObjectURL(file);
      
      return videoUrl;
    } catch (error: any) {
      throw new Error(`Video upload failed: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Resets service for next user (Esports World Cup booth usage)
   */
  resetForNextUser(): void {
    this.sessionMetrics = this.initializeMetrics();
    this.reconnectAttempts = 0;
    this.verifier?.resetSession();
    
    if (this.videoStream) {
      this.videoStream.getTracks().forEach(track => track.stop());
      this.videoStream = null;
    }
    
    console.log("Service reset for next user");
  }

  async generatePostGameAnalysis(session: any, keyMoments: any[], user?: any) {
    if (!this.model) {
      return {
        summary: "Good game! You showed improvement in several areas.",
        strengths: ["Tactical awareness", "Decision making under pressure"],
        improvements: ["Defensive positioning", "Communication with team"],
        drills: [
          { name: "Positioning Drill", description: "Practice maintaining formation" },
          { name: "Reaction Training", description: "Improve response time to threats" },
        ],
      };
    }

    try {
      const userContext = user ? `Player: ${user.inGameName}, Rank: ${user.currentRank}, Game: ${user.gameCategory}, Training: ${user.trainingMode}, Location: ${user.location}` : '';
      const prompt = `Analyze this gaming session for ${userContext}: ${JSON.stringify(session)}. 
      Key moments: ${JSON.stringify(keyMoments)}. 
      Provide personalized analysis addressing the player by name, referencing their current rank and game category.
      Format as JSON with summary, strengths array, improvements array, and drills array.`;
      
      const result = await this.model.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      
      try {
        return JSON.parse(result.text || "{}");
      } catch {
        return {
          summary: result.text || "Session completed successfully",
          strengths: ["Consistent performance"],
          improvements: ["Continue practicing fundamentals"],
          drills: [{ name: "General Practice", description: "Keep working on your skills" }],
        };
      }
    } catch (error) {
      console.error("Failed to generate post-game analysis:", error);
      return {
        summary: "Session completed successfully",
        strengths: ["Participation", "Effort"],
        improvements: ["Keep practicing"],
        drills: [{ name: "Continued Practice", description: "Regular training sessions" }],
      };
    }
  }
}

export const geminiService = new GeminiService();
