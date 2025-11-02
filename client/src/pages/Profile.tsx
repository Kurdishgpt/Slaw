import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Mic, MicOff, Trophy, Key, LogOut } from "lucide-react";
import type { DiscordUser } from "@shared/schema";

export default function Profile() {
  const [apiKey, setApiKey] = useState("");

  // Load API key from localStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem("discord_api_key");
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  // Save API key to localStorage when it changes
  useEffect(() => {
    if (apiKey && apiKey.length > 10) {
      localStorage.setItem("discord_api_key", apiKey);
    }
  }, [apiKey]);

  const { data: profile, isLoading, error } = useQuery<DiscordUser>({
    queryKey: ["/api/profile", apiKey],
    queryFn: async () => {
      const response = await fetch(`/api/profile/${apiKey}`);
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      return response.json();
    },
    enabled: apiKey.length > 10,
    refetchInterval: 5000, // Refetch every 5 seconds to update voice status
  });

  const handleLogout = () => {
    setApiKey("");
    localStorage.removeItem("discord_api_key");
  };

  const formatTimeAgo = (timestamp: number | null) => {
    if (!timestamp) return 'Never';
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getAvatarUrl = (userId: string, avatarHash: string | null) => {
    if (!avatarHash) return null;
    return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.png`;
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-4xl mx-auto p-8 space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2" data-testid="text-page-title">Profile</h1>
          <p className="text-muted-foreground">View your Discord profile and voice channel status</p>
        </div>

        <Card data-testid="card-api-key-input">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Key className="h-6 w-6 text-primary" />
                <CardTitle>API Key Login</CardTitle>
              </div>
              {profile && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  data-testid="button-logout"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              )}
            </div>
            <CardDescription>
              Enter your API key to login. Generate one from the API Keys page and link it using /login in Discord.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              type="text"
              placeholder="Enter your API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              data-testid="input-api-key"
            />
            {apiKey.length > 0 && apiKey.length <= 10 && (
              <p className="text-sm text-muted-foreground mt-2">API key is too short</p>
            )}
          </CardContent>
        </Card>

        {apiKey.length > 10 && (
          <>
            {isLoading ? (
              <Card data-testid="card-loading">
                <CardContent className="p-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="h-20 w-20 bg-muted animate-pulse rounded-full" />
                      <div className="space-y-2 flex-1">
                        <div className="h-6 w-48 bg-muted animate-pulse rounded" />
                        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : error || !profile ? (
              <Card data-testid="card-error">
                <CardHeader>
                  <CardTitle>Profile Not Found</CardTitle>
                  <CardDescription>
                    {error ? "Invalid API key or no user linked to this key." : "Please link your Discord account using /login command in Discord."}
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : (
              <div className="space-y-6">
                <Card data-testid="card-profile">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <User className="h-6 w-6 text-primary" />
                      <CardTitle>Discord Profile</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start gap-6">
                      <Avatar className="h-20 w-20" data-testid="avatar-profile">
                        <AvatarImage src={getAvatarUrl(profile.id, profile.avatar) || undefined} />
                        <AvatarFallback className="text-2xl">
                          {profile.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-3">
                        <div>
                          <h3 className="text-2xl font-bold" data-testid="text-username">
                            {profile.username}
                            {profile.discriminator && (
                              <span className="text-muted-foreground">#{profile.discriminator}</span>
                            )}
                          </h3>
                          <p className="text-sm text-muted-foreground">Discord ID: {profile.id}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-primary" />
                          <span className="font-semibold" data-testid="text-points">
                            {profile.points} points
                          </span>
                        </div>
                        {profile.lastPointEarned && (
                          <p className="text-sm text-muted-foreground">
                            Last earned: {formatTimeAgo(profile.lastPointEarned)}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card data-testid="card-voice-status">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      {profile.inVoiceChannel ? (
                        <Mic className="h-6 w-6 text-primary" />
                      ) : (
                        <MicOff className="h-6 w-6 text-muted-foreground" />
                      )}
                      <CardTitle>Voice Channel Status</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {profile.inVoiceChannel && profile.voiceChannelName ? (
                      <div className="space-y-3" data-testid="voice-active">
                        <div className="flex items-center gap-2">
                          <Badge variant="default" className="text-sm">
                            Connected
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Channel</p>
                          <p className="text-lg font-semibold" data-testid="text-channel-name">
                            {profile.voiceChannelName}
                          </p>
                        </div>
                        {profile.voiceChannelJoinedAt && (
                          <div>
                            <p className="text-sm text-muted-foreground">Joined</p>
                            <p className="text-sm">{formatTimeAgo(profile.voiceChannelJoinedAt)}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8" data-testid="voice-inactive">
                        <MicOff className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                        <p className="text-muted-foreground">Not in any voice channel</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
