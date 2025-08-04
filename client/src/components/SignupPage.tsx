import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userProfileSchema, UserProfile } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useGame } from '@/contexts/GameContext';
import { Gamepad2, Zap, Trophy, Users } from 'lucide-react';
import { GameCategoryIcons } from './GameLogos';

interface SignupPageProps {
  onComplete: (trainingMode: string) => void;
}

export default function SignupPage({ onComplete }: SignupPageProps) {
  const { setUser } = useGame();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedMode, setSelectedMode] = useState<string>('');

  const form = useForm<UserProfile>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      name: '',
      age: 18,
      gender: 'Prefer not to say',
      location: '',
      email: '',
      inGameName: '',
      currentRank: '',
      gameCategory: 'moba',
      trainingMode: 'live',
      voicePreference: 'Professional Coach',
    },
  });

  const onSubmit = (data: UserProfile) => {
    setUser(data);
    onComplete(data.trainingMode);
  };

  const gameCategories = [
    {
      id: 'moba',
      name: 'MOBA',
      description: 'League of Legends (2025)',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      borderColor: 'border-blue-500/50',
      hoverColor: 'hover:border-green-500 hover:bg-green-500/10',
      gameTitle: 'League of Legends',
      developer: 'Riot Games'
    },
    {
      id: 'fighting',
      name: 'Fighting',
      description: 'Street Fighter 6 (Year 3)',
      icon: Zap,
      color: 'from-orange-500 to-orange-600',
      borderColor: 'border-orange-500/50',
      hoverColor: 'hover:border-green-500 hover:bg-green-500/10',
      gameTitle: 'Street Fighter 6',
      developer: 'Capcom'
    },
    {
      id: 'sport',
      name: 'Sport',
      description: 'EA Sports FC 25',
      icon: Trophy,
      color: 'from-purple-500 to-purple-600',
      borderColor: 'border-purple-500/50',
      hoverColor: 'hover:border-green-500 hover:bg-green-500/10',
      gameTitle: 'EA Sports FC 25',
      developer: 'EA Sports'
    },
  ];

  const trainingModes = [
    {
      id: 'live',
      name: 'Live Analysis',
      description: 'Real-time coaching during gameplay',
      icon: Zap,
      color: 'from-green-500/20 to-green-600/20',
      borderColor: 'border-green-500/50',
    },
    {
      id: 'post',
      name: 'Post Game Analysis',
      description: 'Detailed breakdown after matches',
      icon: Trophy,
      color: 'from-blue-500/20 to-blue-600/20',
      borderColor: 'border-blue-500/50',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gaming-dark via-gaming-surface to-gaming-blue relative">
      <div className="absolute inset-0 bg-black/20"></div>
      
      {/* Navigation Header */}
      <nav className="relative z-10 p-6">
        <div className="flex items-center max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gaming-green rounded-lg flex items-center justify-center">
              <Gamepad2 className="text-gaming-dark text-xl" />
            </div>
            <span className="text-2xl font-gaming font-bold">Live Esports Coach</span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 px-6 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-gaming font-bold mb-6 bg-gradient-to-r from-gaming-green to-gaming-orange bg-clip-text text-transparent">
            Elevate Your Game
          </h1>
          <p className="text-xl text-gaming-muted mb-12 max-w-2xl mx-auto">
            AI-powered live coaching for esports. Get real-time feedback, post-game analysis, and personalized training to dominate the competition.
          </p>
        </div>

        {/* Signup Form */}
        <Card className="max-w-2xl mx-auto bg-gaming-surface/80 backdrop-blur-sm border-gaming-green/20">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-gaming font-bold mb-2">Start Your Journey</h2>
              <p className="text-gaming-muted">Set up your profile and begin training</p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    {...form.register('name')}
                    placeholder="Enter your name"
                    className="bg-gaming-dark border-gaming-muted/30 focus:border-gaming-green"
                  />
                  {form.formState.errors.name && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.name.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    {...form.register('age', { valueAsNumber: true })}
                    placeholder="18"
                    className="bg-gaming-dark border-gaming-muted/30 focus:border-gaming-green"
                  />
                  {form.formState.errors.age && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.age.message}</p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select onValueChange={(value) => form.setValue('gender', value as any)}>
                    <SelectTrigger className="bg-gaming-dark border-gaming-muted/30 focus:border-gaming-green">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Non-binary">Non-binary</SelectItem>
                      <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    {...form.register('location')}
                    placeholder="City, Country"
                    className="bg-gaming-dark border-gaming-muted/30 focus:border-gaming-green"
                  />
                  {form.formState.errors.location && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.location.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="email">Contact Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register('email')}
                  placeholder="your.email@example.com"
                  className="bg-gaming-dark border-gaming-muted/30 focus:border-gaming-green"
                />
                {form.formState.errors.email && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
                )}
              </div>

              {/* Game Selection */}
              <div>
                <Label className="text-base font-medium mb-4 block">Choose Your Game Category</Label>
                <div className="grid md:grid-cols-3 gap-4">
                  {gameCategories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <div
                        key={category.id}
                        className={`cursor-pointer relative p-6 rounded-xl border-2 transition-all ${
                          selectedCategory === category.id
                            ? 'border-gaming-green bg-gaming-green/10'
                            : `${category.borderColor} ${category.hoverColor}`
                        }`}
                        onClick={() => {
                          setSelectedCategory(category.id);
                          form.setValue('gameCategory', category.id as any);
                        }}
                      >
                        <div className="text-center">
                          {/* Use authentic game logo */}
                          {category.id === 'moba' && <GameCategoryIcons.moba className="w-16 h-16 mx-auto mb-4" />}
                          {category.id === 'fighting' && <GameCategoryIcons.fighting className="w-16 h-16 mx-auto mb-4" />}
                          {category.id === 'sport' && <GameCategoryIcons.sport className="w-16 h-16 mx-auto mb-4" />}
                          
                          <h3 className="font-gaming font-bold text-xl mb-2">{category.name}</h3>
                          <p className="text-sm text-gaming-muted">{category.description}</p>
                          {category.developer && (
                            <p className="text-xs text-gaming-muted/70 mt-1">{category.developer}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Gaming Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="inGameName">In-Game Name</Label>
                  <Input
                    id="inGameName"
                    {...form.register('inGameName')}
                    placeholder="YourGameTag"
                    className="bg-gaming-dark border-gaming-muted/30 focus:border-gaming-green"
                  />
                  {form.formState.errors.inGameName && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.inGameName.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="currentRank">Current Rank/Stats</Label>
                  <Input
                    id="currentRank"
                    {...form.register('currentRank')}
                    placeholder="Gold III, 1200 MMR"
                    className="bg-gaming-dark border-gaming-muted/30 focus:border-gaming-green"
                  />
                  {form.formState.errors.currentRank && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.currentRank.message}</p>
                  )}
                </div>
              </div>

              {/* Training Mode Selection */}
              <div>
                <Label className="text-base font-medium mb-4 block">Training Mode</Label>
                <div className="grid md:grid-cols-2 gap-4">
                  {trainingModes.map((mode) => {
                    const Icon = mode.icon;
                    return (
                      <div
                        key={mode.id}
                        className={`cursor-pointer relative p-6 rounded-xl border-2 transition-all ${
                          selectedMode === mode.id
                            ? 'border-gaming-green bg-gaming-green/20'
                            : `${mode.borderColor} hover:border-gaming-green hover:bg-gaming-green/10`
                        }`}
                        onClick={() => {
                          setSelectedMode(mode.id);
                          form.setValue('trainingMode', mode.id as any);
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="w-8 h-8 text-gaming-green" />
                          <div>
                            <h3 className="font-gaming font-bold text-lg">{mode.name}</h3>
                            <p className="text-sm text-gaming-muted">{mode.description}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Voice Settings */}
              <div>
                <Label htmlFor="voicePreference">AI Voice Preference</Label>
                <Select onValueChange={(value) => form.setValue('voicePreference', value as any)}>
                  <SelectTrigger className="bg-gaming-dark border-gaming-muted/30 focus:border-gaming-green">
                    <SelectValue placeholder="Select voice preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Professional Coach">Professional Coach</SelectItem>
                    <SelectItem value="Friendly Mentor">Friendly Mentor</SelectItem>
                    <SelectItem value="Competitive Analyst">Competitive Analyst</SelectItem>
                    <SelectItem value="Text Only">Text Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-gaming-green to-gaming-orange hover:from-gaming-green/90 hover:to-gaming-orange/90 text-gaming-dark font-gaming font-bold py-4 px-8 text-lg"
              >
                Start Gaming Session
                <Gamepad2 className="ml-2 h-5 w-5" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
