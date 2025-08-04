import { GoogleGenAI } from "@google/genai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

if (!API_KEY) {
  console.warn("Gemini API key not found. AI coaching will use simulated responses.");
}

class GeminiService {
  private genai: GoogleGenAI | null = null;
  private model: any = null;

  constructor() {
    if (API_KEY) {
      this.genai = new GoogleGenAI({ apiKey: API_KEY });
    }
  }

  async initializeLiveCoaching(gameCategory: string, userProfile: any) {
    if (!this.genai) {
      console.warn("Gemini API not available, using simulated coaching");
      return;
    }

    try {
      this.model = this.genai.models;

      const contextPrompt = `You are an AI esports coach for ${gameCategory} games. 
      The player is ${userProfile.name}, ranked ${userProfile.currentRank}. 
      Provide concise, actionable coaching advice in real-time. 
      Keep responses under 10 words when possible for overlay display.
      Focus on immediate tactical improvements.`;

      // For this implementation, just return the model
      return this.model;
    } catch (error) {
      console.error("Failed to initialize Gemini coaching:", error);
      return null;
    }
  }

  async getCoachingAdvice(situation: string, gameContext: any) {
    if (!this.model) {
      // Return simulated coaching messages
      const simulatedAdvice = [
        "Focus on positioning",
        "Watch your spacing",
        "Good pressure!",
        "Consider passing",
        "Defensive positioning needed",
        "Nice tactical decision",
        "Try a through ball",
        "Maintain formation",
      ];
      return simulatedAdvice[Math.floor(Math.random() * simulatedAdvice.length)];
    }

    try {
      const prompt = `Game situation: ${situation}. Current context: ${JSON.stringify(gameContext)}. Provide brief coaching advice:`;
      
      const result = await this.model.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      return result.text || "Keep focusing on your fundamentals";
    } catch (error) {
      console.error("Failed to get coaching advice:", error);
      return "Keep focusing on your fundamentals";
    }
  }

  async respondToChat(message: string, gameContext: any) {
    if (!this.model) {
      // Simulated chat responses
      const responses = [
        "Focus on your positioning and timing",
        "Try to maintain better map awareness",
        "Your decision making is improving",
        "Consider adjusting your strategy",
        "Good question - work on that fundamentals",
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    try {
      const prompt = `Player asks: "${message}". Game context: ${JSON.stringify(gameContext)}. Respond as their coach:`;
      
      const result = await this.model.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      return result.text || "I'm here to help - keep practicing!";
    } catch (error) {
      console.error("Failed to respond to chat:", error);
      return "I'm here to help - keep practicing!";
    }
  }

  async generatePostGameAnalysis(session: any, keyMoments: any[]) {
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
      const prompt = `Analyze this gaming session: ${JSON.stringify(session)}. 
      Key moments: ${JSON.stringify(keyMoments)}. 
      Provide detailed analysis with strengths, improvements needed, and recommended drills.
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
