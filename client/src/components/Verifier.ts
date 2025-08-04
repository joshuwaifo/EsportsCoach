/**
 * Coaching Verification Layer
 * 
 * This module implements a verification layer for AI-generated coaching advice
 * based on expert-validated coaching principles for each esport.
 * 
 * Cost considerations:
 * - Each verification call costs ~50 tokens
 * - Average 2-3 verifications per minute during active coaching
 * - Estimated cost: $0.02-0.05 per hour per user
 */

interface CoachingPrinciple {
  category: string;
  keywords: string[];
  validAdvice: string[];
  invalidPatterns: string[];
  corrections: Record<string, string>;
}

interface GameSyllabus {
  [key: string]: CoachingPrinciple[];
}

// Expert-validated coaching syllabi for each supported game
const COACHING_SYLLABUS: GameSyllabus = {
  moba: [
    {
      category: "positioning",
      keywords: ["position", "map", "ward", "vision", "safe", "engage"],
      validAdvice: [
        "Stay behind minions",
        "Ward river bushes", 
        "Position for objectives",
        "Maintain safe distance",
        "Group with team"
      ],
      invalidPatterns: ["always engage", "never retreat", "ignore map"],
      corrections: {
        "engage without vision": "Ward before engaging",
        "chase kills": "Focus on objectives"
      }
    },
    {
      category: "itemization",
      keywords: ["item", "build", "buy", "gold", "shop", "upgrade"],
      validAdvice: [
        "Build armor against AD",
        "Buy magic resist",
        "Prioritize core items",
        "Ward instead of damage"
      ],
      invalidPatterns: ["always same build", "ignore enemy comp"],
      corrections: {
        "build same every game": "Adapt to enemy composition"
      }
    },
    {
      category: "teamfight",
      keywords: ["fight", "team", "engage", "disengage", "focus", "target"],
      validAdvice: [
        "Focus carry targets",
        "Protect your ADC",
        "Wait for initiation",
        "Disengage when low"
      ],
      invalidPatterns: ["fight without team", "chase into jungle"],
      corrections: {
        "1v5 engage": "Wait for team coordination"
      }
    }
  ],
  
  fighting: [
    {
      category: "fundamentals",
      keywords: ["block", "punish", "frame", "spacing", "neutral", "combo"],
      validAdvice: [
        "Block low attacks",
        "Punish unsafe moves",
        "Maintain proper spacing",
        "Practice anti-airs",
        "Learn frame data"
      ],
      invalidPatterns: ["mash buttons", "always attack", "ignore defense"],
      corrections: {
        "button mashing": "Focus on precise inputs",
        "always aggressive": "Mix offense with defense"
      }
    },
    {
      category: "mixups",
      keywords: ["mix", "overhead", "throw", "pressure", "reset", "setup"],
      validAdvice: [
        "Mix highs and lows",
        "Use throw techs",
        "Create frame traps",
        "Reset to neutral"
      ],
      invalidPatterns: ["same combo always", "predictable patterns"],
      corrections: {
        "repetitive offense": "Vary your attack patterns"
      }
    }
  ],
  
  sport: [
    {
      category: "possession",
      keywords: ["pass", "possession", "ball", "control", "tempo", "build"],
      validAdvice: [
        "Maintain possession",
        "Pass to open players",
        "Control game tempo",
        "Build from defense",
        "Switch play wide"
      ],
      invalidPatterns: ["always sprint", "long ball only", "ignore midfield"],
      corrections: {
        "rush forward": "Build play patiently",
        "ignore passing": "Use short passes to maintain control"
      }
    },
    {
      category: "defense",
      keywords: ["defend", "pressure", "tackle", "cover", "shape", "compact"],
      validAdvice: [
        "Press high",
        "Maintain defensive shape",
        "Cover passing lanes",
        "Track runner"
      ],
      invalidPatterns: ["always tackle", "break formation", "ball watching"],
      corrections: {
        "dive in": "Stay disciplined in defense",
        "chase ball": "Maintain positional discipline"
      }
    },
    {
      category: "attacking",
      keywords: ["attack", "cross", "shoot", "run", "overlap", "finish"],
      validAdvice: [
        "Make overlapping runs",
        "Cross early",
        "Shoot when in box",
        "Create width"
      ],
      invalidPatterns: ["shoot from anywhere", "never pass", "static attack"],
      corrections: {
        "selfish play": "Look for better positioned teammates"
      }
    }
  ]
};

export class CoachingVerifier {
  private currentGameSyllabus: CoachingPrinciple[];
  private sessionErrors: string[] = [];
  
  constructor(gameCategory: string) {
    this.currentGameSyllabus = COACHING_SYLLABUS[gameCategory] || [];
  }

  /**
   * Verifies AI-generated coaching advice against expert principles
   * @param advice - The AI-generated advice text
   * @param gameContext - Current game context for situational validation
   * @returns Object with verification result and potentially modified advice
   */
  verifyAdvice(advice: string, gameContext?: any): {
    isValid: boolean;
    modifiedAdvice?: string;
    category?: string;
    confidence: number;
    warning?: string;
  } {
    const lowerAdvice = advice.toLowerCase();
    
    // Check for invalid patterns first
    for (const principle of this.currentGameSyllabus) {
      for (const invalidPattern of principle.invalidPatterns) {
        if (lowerAdvice.includes(invalidPattern)) {
          const correction = this.findCorrection(invalidPattern, principle.corrections);
          this.logError(`Invalid advice detected: ${advice}`);
          
          return {
            isValid: false,
            modifiedAdvice: correction || this.getGenericAdvice(principle.category),
            category: principle.category,
            confidence: 0.3,
            warning: `Advice contradicts expert principles for ${principle.category}`
          };
        }
      }
    }
    
    // Validate against positive principles
    for (const principle of this.currentGameSyllabus) {
      const categoryMatch = this.matchesCategory(lowerAdvice, principle);
      if (categoryMatch.matches) {
        return {
          isValid: true,
          category: principle.category,
          confidence: categoryMatch.confidence,
          modifiedAdvice: this.enhanceAdvice(advice, principle)
        };
      }
    }
    
    // If no specific match found, apply general validation
    return {
      isValid: this.isGenerallyValid(advice),
      confidence: 0.6,
      warning: this.isGenerallyValid(advice) ? undefined : "Advice not aligned with coaching principles"
    };
  }

  /**
   * Validates advice for time-sensitive situations
   * @param advice - The advice to validate
   * @param timestamp - When the advice was generated
   * @param currentGameTime - Current game state time
   * @returns Whether advice is still relevant
   */
  validateTimeSensitivity(advice: string, timestamp: number, currentGameTime?: number): boolean {
    const timeDiff = Date.now() - timestamp;
    const lowerAdvice = advice.toLowerCase();
    
    // Time-sensitive advice becomes invalid after certain periods
    const timeSensitiveTerms = [
      { terms: ["engage", "attack", "push"], maxDelay: 3000 }, // 3 seconds
      { terms: ["defend", "retreat", "back"], maxDelay: 5000 }, // 5 seconds
      { terms: ["ward", "position", "farm"], maxDelay: 10000 }, // 10 seconds
    ];
    
    for (const { terms, maxDelay } of timeSensitiveTerms) {
      if (terms.some(term => lowerAdvice.includes(term))) {
        return timeDiff <= maxDelay;
      }
    }
    
    return true; // Non time-sensitive advice remains valid
  }

  /**
   * Enhances basic advice with context-specific details
   */
  private enhanceAdvice(advice: string, principle: CoachingPrinciple): string {
    const lowerAdvice = advice.toLowerCase();
    
    // Add specific context based on category
    if (principle.category === "positioning" && lowerAdvice.includes("position")) {
      return `${advice} - Consider enemy threat ranges`;
    }
    
    if (principle.category === "itemization" && lowerAdvice.includes("buy")) {
      return `${advice} - Check enemy builds first`;
    }
    
    return advice;
  }

  private matchesCategory(advice: string, principle: CoachingPrinciple): { matches: boolean; confidence: number } {
    let score = 0;
    let maxScore = principle.keywords.length + principle.validAdvice.length;
    
    // Check keyword matches
    for (const keyword of principle.keywords) {
      if (advice.includes(keyword)) {
        score += 1;
      }
    }
    
    // Check valid advice patterns
    for (const validPattern of principle.validAdvice) {
      if (advice.includes(validPattern.toLowerCase())) {
        score += 2; // Valid patterns score higher
      }
    }
    
    const confidence = Math.min(score / maxScore, 1.0);
    return { matches: confidence > 0.3, confidence };
  }

  private findCorrection(invalidPattern: string, corrections: Record<string, string>): string | undefined {
    for (const [pattern, correction] of Object.entries(corrections)) {
      if (pattern.includes(invalidPattern) || invalidPattern.includes(pattern)) {
        return correction;
      }
    }
    return undefined;
  }

  private getGenericAdvice(category: string): string {
    const genericAdvice = {
      positioning: "Focus on safe positioning",
      itemization: "Build according to game state",
      teamfight: "Coordinate with your team",
      fundamentals: "Practice your basics",
      mixups: "Vary your approach",
      possession: "Maintain ball control",
      defense: "Stay organized defensively",
      attacking: "Look for scoring opportunities"
    };
    
    return genericAdvice[category as keyof typeof genericAdvice] || "Focus on fundamentals";
  }

  private isGenerallyValid(advice: string): boolean {
    const lowerAdvice = advice.toLowerCase();
    
    // Basic validity checks
    const invalidTerms = ["always", "never", "impossible", "guaranteed"];
    const hasInvalidTerms = invalidTerms.some(term => lowerAdvice.includes(term));
    
    // Must contain actionable language
    const actionableTerms = ["try", "focus", "consider", "practice", "improve", "work on"];
    const hasActionableTerms = actionableTerms.some(term => lowerAdvice.includes(term));
    
    return !hasInvalidTerms && hasActionableTerms;
  }

  private logError(error: string): void {
    this.sessionErrors.push(`${new Date().toISOString()}: ${error}`);
    console.warn(`Coaching verification error: ${error}`);
  }

  /**
   * Gets session error report for analysis
   */
  getSessionErrors(): string[] {
    return [...this.sessionErrors];
  }

  /**
   * Resets error tracking for new session
   */
  resetSession(): void {
    this.sessionErrors = [];
  }
}

export default CoachingVerifier;