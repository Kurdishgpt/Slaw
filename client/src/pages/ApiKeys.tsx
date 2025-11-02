import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Key, Copy, Plus, Trash2, Eye, EyeOff, Code } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ApiKey } from "@shared/schema";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ApiKeys() {
  const { toast } = useToast();
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());
  const [keyToDelete, setKeyToDelete] = useState<string | null>(null);

  const { data: apiKeys, isLoading } = useQuery<ApiKey[]>({
    queryKey: ["/api/keys"],
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/keys/generate", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/keys"] });
      toast({
        title: "API Key Generated",
        description: "Your new API key has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate API key. Please try again.",
        variant: "destructive",
      });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: async (keyId: string) => {
      return await apiRequest("DELETE", `/api/keys/${keyId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/keys"] });
      toast({
        title: "API Key Revoked",
        description: "The API key has been deleted successfully.",
      });
      setKeyToDelete(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to revoke API key. Please try again.",
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({
      title: "Copied!",
      description: "API key copied to clipboard.",
    });
  };

  const toggleKeyVisibility = (keyId: string) => {
    const newRevealed = new Set(revealedKeys);
    if (newRevealed.has(keyId)) {
      newRevealed.delete(keyId);
    } else {
      newRevealed.add(keyId);
    }
    setRevealedKeys(newRevealed);
  };

  const maskKey = (key: string) => {
    return key.slice(0, 8) + '•'.repeat(32) + key.slice(-8);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="h-full">
      <div className="max-w-7xl mx-auto p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2" data-testid="text-page-title">API Keys</h1>
          <p className="text-muted-foreground">Manage API keys for exporting user points data</p>
        </div>

        {/* API Documentation */}
        <Card data-testid="card-api-docs">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Code className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>API Documentation</CardTitle>
                <CardDescription>Use these endpoints to export points data</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-semibold">Export All Users</p>
              <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                <div className="text-muted-foreground mb-2">GET /api/export/users</div>
                <div className="text-muted-foreground">Headers: Authorization: Bearer YOUR_API_KEY</div>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold">Export User Points</p>
              <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                <div className="text-muted-foreground mb-2">GET /api/export/points</div>
                <div className="text-muted-foreground">Headers: Authorization: Bearer YOUR_API_KEY</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Generate Key Section */}
        <Card data-testid="card-generate-key">
          <CardHeader>
            <CardTitle>Generate New API Key</CardTitle>
            <CardDescription>Create a new key to access the export API endpoints</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => generateMutation.mutate()} 
              disabled={generateMutation.isPending}
              data-testid="button-generate-key"
            >
              <Plus className="h-4 w-4 mr-2" />
              {generateMutation.isPending ? "Generating..." : "Generate API Key"}
            </Button>
          </CardContent>
        </Card>

        {/* Active Keys */}
        <Card data-testid="card-active-keys">
          <CardHeader>
            <CardTitle>Active API Keys</CardTitle>
            <CardDescription>Manage your existing API keys</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="p-4 border rounded-lg">
                    <div className="h-6 w-64 bg-muted animate-pulse rounded mb-2" />
                    <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                  </div>
                ))}
              </div>
            ) : !apiKeys || apiKeys.length === 0 ? (
              <div className="text-center py-12">
                <Key className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">No API keys generated yet</p>
                <p className="text-sm text-muted-foreground">Click the button above to create your first API key</p>
              </div>
            ) : (
              <div className="space-y-4" data-testid="list-api-keys">
                {apiKeys.map((apiKey) => (
                  <div
                    key={apiKey.id}
                    className="p-4 border rounded-lg space-y-3"
                    data-testid={`api-key-${apiKey.id}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <code className="font-mono text-sm bg-muted px-3 py-1 rounded break-all">
                            {revealedKeys.has(apiKey.id) ? apiKey.key : maskKey(apiKey.key)}
                          </code>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => toggleKeyVisibility(apiKey.id)}
                            data-testid={`button-toggle-visibility-${apiKey.id}`}
                          >
                            {revealedKeys.has(apiKey.id) ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => copyToClipboard(apiKey.key)}
                            data-testid={`button-copy-${apiKey.id}`}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                          <span>Created: {formatDate(apiKey.createdAt)}</span>
                          {apiKey.lastUsed && (
                            <span>Last used: {formatDate(apiKey.lastUsed)}</span>
                          )}
                          {!apiKey.lastUsed && (
                            <Badge variant="outline" className="text-xs">Never used</Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setKeyToDelete(apiKey.id)}
                        data-testid={`button-revoke-${apiKey.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!keyToDelete} onOpenChange={() => setKeyToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke API Key</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revoke this API key? This action cannot be undone and any applications using this key will lose access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-revoke">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => keyToDelete && revokeMutation.mutate(keyToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-revoke"
            >
              Revoke Key
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
