import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, TrendingUp, Users, Link2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { DashboardStats, Activity as ActivityType, DiscordUser } from "@shared/schema";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/stats"],
  });

  const { data: recentActivity, isLoading: activityLoading } = useQuery<ActivityType[]>({
    queryKey: ["/api/activities/recent"],
  });

  const { data: topUsers, isLoading: usersLoading } = useQuery<DiscordUser[]>({
    queryKey: ["/api/users/top"],
  });

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2" data-testid="text-page-title">Dashboard</h1>
          <p className="text-muted-foreground">Monitor your Discord bot's performance and user activity</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card data-testid="card-stat-users">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="h-8 w-20 bg-muted animate-pulse rounded" />
              ) : (
                <div className="text-3xl font-bold" data-testid="text-total-users">
                  {stats?.totalUsers || 0}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">Registered participants</p>
            </CardContent>
          </Card>

          <Card data-testid="card-stat-points">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Points</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="h-8 w-20 bg-muted animate-pulse rounded" />
              ) : (
                <div className="text-3xl font-bold" data-testid="text-total-points">
                  {stats?.totalPoints || 0}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">Points distributed</p>
            </CardContent>
          </Card>

          <Card data-testid="card-stat-active">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Today</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="h-8 w-20 bg-muted animate-pulse rounded" />
              ) : (
                <div className="text-3xl font-bold" data-testid="text-active-today">
                  {stats?.activeToday || 0}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">Users earned points</p>
            </CardContent>
          </Card>

          <Card data-testid="card-stat-links">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Links Posted</CardTitle>
              <Link2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="h-8 w-20 bg-muted animate-pulse rounded" />
              ) : (
                <div className="text-3xl font-bold" data-testid="text-links-posted">
                  {stats?.linksPosted || 0}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">All time activity</p>
            </CardContent>
          </Card>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card data-testid="card-recent-activity">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {activityLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-muted animate-pulse rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                        <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : !recentActivity || recentActivity.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No activity yet</p>
                  <p className="text-sm text-muted-foreground">Points will appear here when users post links</p>
                </div>
              ) : (
                <div className="space-y-4" data-testid="list-recent-activity">
                  {recentActivity.slice(0, 5).map((activity) => {
                    const user = topUsers?.find(u => u.id === activity.userId);
                    const displayName = user?.username || activity.userId;
                    return (
                      <div key={activity.id} className="flex items-start gap-4" data-testid={`activity-item-${activity.id}`}>
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Link2 className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium truncate">{displayName}</p>
                            <Badge variant="secondary" className="text-xs">
                              {activity.type === 'paste' ? 'Paste Link' : 'Server Invite'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            +{activity.pointsEarned} point{activity.pointsEarned !== 1 ? 's' : ''} • {formatTimeAgo(activity.timestamp)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Contributors */}
          <Card data-testid="card-top-contributors">
            <CardHeader>
              <CardTitle>Top Contributors</CardTitle>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="h-8 w-8 bg-muted animate-pulse rounded" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                        <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : !topUsers || topUsers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No users yet</p>
                  <p className="text-sm text-muted-foreground">Start earning points to appear here</p>
                </div>
              ) : (
                <div className="space-y-4" data-testid="list-top-users">
                  {topUsers.slice(0, 5).map((user, index) => (
                    <div key={user.id} className="flex items-center gap-4" data-testid={`top-user-${index}`}>
                      <div className="flex items-center justify-center w-8 h-8 rounded-md bg-muted text-sm font-semibold">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{user.username}</p>
                        <p className="text-sm text-muted-foreground">{user.points} points</p>
                      </div>
                      {user.points >= 10 && (
                        <Badge variant="secondary" className="text-xs">MAX</Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bot Status */}
        <Card data-testid="card-bot-status">
          <CardHeader>
            <CardTitle>Bot Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`h-3 w-3 rounded-full ${stats?.botStatus === 'online' ? 'bg-status-online' : 'bg-status-offline'} animate-pulse`} />
                <div>
                  <p className="font-medium" data-testid="text-bot-status">
                    {stats?.botStatus === 'online' ? 'Online' : 'Offline'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {stats?.lastSync ? `Last sync: ${formatTimeAgo(stats.lastSync)}` : 'Never synced'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Cooldown Period</p>
                <p className="font-semibold">14 hours</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Max Points</p>
                <p className="font-semibold">10 points</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
