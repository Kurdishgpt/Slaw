import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Trophy } from "lucide-react";
import type { DiscordUser } from "@shared/schema";

export default function Leaderboard() {
  const { data: users, isLoading } = useQuery<DiscordUser[]>({
    queryKey: ["/api/users"],
  });

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

  const getCooldownStatus = (lastPointEarned: number | null) => {
    if (!lastPointEarned) return { active: true, remainingHours: 0 };
    const hoursSince = (Date.now() - lastPointEarned) / (1000 * 60 * 60);
    const active = hoursSince >= 14;
    const remainingHours = active ? 0 : Math.ceil(14 - hoursSince);
    return { active, remainingHours };
  };

  return (
    <div className="h-full">
      <div className="max-w-7xl mx-auto p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2" data-testid="text-page-title">Leaderboard</h1>
          <p className="text-muted-foreground">Top contributors ranked by points earned</p>
        </div>

        {/* Leaderboard Card */}
        <Card data-testid="card-leaderboard">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Trophy className="h-6 w-6 text-primary" />
              <CardTitle>Rankings</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-lg border">
                    <div className="h-12 w-12 bg-muted animate-pulse rounded" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                      <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !users || users.length === 0 ? (
              <div className="text-center py-16">
                <Users className="h-16 w-16 mx-auto text-muted-foreground mb-6" />
                <p className="text-lg font-medium mb-2">No users yet</p>
                <p className="text-muted-foreground">The leaderboard will populate when users start earning points</p>
              </div>
            ) : (
              <div className="space-y-2" data-testid="list-leaderboard">
                {users.map((user, index) => {
                  const cooldown = getCooldownStatus(user.lastPointEarned);
                  return (
                    <div
                      key={user.id}
                      className="flex items-center gap-4 p-4 rounded-lg border hover-elevate transition-all"
                      data-testid={`leaderboard-row-${index}`}
                    >
                      {/* Rank */}
                      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-muted font-bold text-lg flex-shrink-0">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="font-semibold text-base truncate" data-testid={`text-username-${index}`}>
                            {user.username}
                          </p>
                          {user.discriminator && (
                            <span className="text-sm text-muted-foreground">#{user.discriminator}</span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Last activity: {formatTimeAgo(user.lastPointEarned)}
                        </p>
                      </div>

                      {/* Points */}
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-2 justify-end mb-1">
                          <span className="text-2xl font-bold" data-testid={`text-points-${index}`}>
                            {user.points}
                          </span>
                          <span className="text-sm text-muted-foreground">pts</span>
                        </div>
                        {user.points >= 999 && (
                          <Badge variant="secondary" className="text-xs" data-testid={`badge-max-${index}`}>
                            MAX REACHED
                          </Badge>
                        )}
                      </div>

                      {/* Status */}
                      <div className="flex-shrink-0 w-24">
                        {cooldown.active ? (
                          <Badge variant="default" className="w-full justify-center" data-testid={`badge-status-${index}`}>
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="w-full justify-center" data-testid={`badge-status-${index}`}>
                            {cooldown.remainingHours}h cooldown
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
