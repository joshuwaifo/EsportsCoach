# Esports World Cup Booth Operations Guide

## Overview
This Live Esports Coach application is designed for demonstration at esports events with netcafe-style stations where visitors can experience AI-powered real-time coaching.

## Station Setup
- **Hardware**: Gaming PC with webcam, microphone, and headset
- **Software**: Pre-installed Live Esports Coach application
- **Games**: League of Legends, Street Fighter 6, EA FC (pre-configured)
- **Network**: Stable internet for Gemini Live API connectivity

## Staff Workflow

### 1. Player Sign-In (30 seconds)
1. Open application (automatically loads SignupPage)
2. Help player create profile:
   - Enter gamer tag
   - Select game category (MOBA/Fighting/Sport)
   - Choose skill level (Bronze-Master)
   - Set coaching preferences
3. Click "Start Coaching" to proceed

### 2. Live Coaching Session (15 minutes)
1. Application automatically launches LiveCoachPage
2. Player starts their match in selected game
3. AI coach provides real-time feedback via:
   - On-screen overlay messages
   - Voice coaching (if enabled)
   - Chat interface for questions
4. Staff can monitor:
   - AI response quality
   - Session metrics and costs
   - Error alerts in debugging panel

### 3. Post-Game Analysis (5 minutes)
1. Player ends match, application shows RecapPage
2. Staff reviews results with player:
   - Performance metrics and scores
   - Key moments from the match
   - AI-generated improvement recommendations
   - Training drill suggestions
3. Optional: Upload match video for enhanced analysis

### 4. Reset for Next Player (30 seconds)
1. Click "Next User (Booth)" button
2. Application resets all state and returns to SignupPage
3. Ready for next visitor

## Cost Monitoring
- **Live Sessions**: ~$1.00-1.20 per 15-minute session
- **Daily Booth Budget**: $50-60 for 50 sessions
- **Token Usage**: Displayed in real-time during sessions
- **Error Tracking**: Automatic logging for booth staff

## Troubleshooting

### Common Issues
1. **No AI responses**: Check Gemini API key configuration
2. **Microphone not working**: Verify browser permissions
3. **Overlay not visible**: Toggle overlay visibility button
4. **Upload failures**: Check file size (1GB limit)

### Emergency Fallback
- Application automatically switches to simulated responses if API fails
- All features remain functional with pre-programmed coaching advice
- Staff should inform visitors about demo mode

## Performance Targets
- **Player Improvement**: Target 1% skill improvement per session
- **Session Completion**: 95% of sessions should complete successfully
- **Response Time**: AI advice within 2-3 seconds
- **System Uptime**: 99% availability during event hours

## Quality Assurance
- AI advice verified against expert coaching principles
- Real-time fact-checking via Verifier.ts syllabus
- Session errors logged for post-event analysis
- Continuous monitoring of coaching quality

## Technical Specifications
- **Supported Games**: League of Legends, Street Fighter 6, EA FC
- **Video Input**: 1920x1080 @ 15fps (cost optimized)
- **Audio**: 16kHz WAV format for Live API
- **Session Duration**: 15 minutes maximum
- **File Uploads**: Video files up to 1GB (MP4, MOV, AVI)