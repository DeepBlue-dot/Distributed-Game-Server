"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  Trash2,
  User,
  Lock,
  Mail,
  Camera,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  ShieldAlert,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { playerApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { getAvatarUrl } from "@/lib/utils";

export default function SettingsPage() {
  const router = useRouter();
  const { loading, logout, player, refreshUser, user } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "danger">("profile");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [profile, setProfile] = useState({
    username: "",
    avatarUrl: "",
    bio: "",
  });
  const [email, setEmail] = useState("");
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
  });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Image file must be under 5MB.");
      return;
    }

    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const data = await playerApi.uploadAvatar(file);
      setProfile((prev) => ({ ...prev, avatarUrl: data.avatarUrl }));
      await refreshUser();
      setMessage("Avatar uploaded successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload avatar.");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      await playerApi.updateProfile({
        avatarUrl: "",
      });
      setProfile((prev) => ({ ...prev, avatarUrl: "" }));
      await refreshUser();
      setMessage("Avatar removed successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove avatar.");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, router, user]);

  useEffect(() => {
    if (!player) return;

    setProfile({
      username: player.profile?.username || "",
      avatarUrl: player.profile?.avatarUrl || "",
      bio: player.profile?.bio || "",
    });
    setEmail(player.email || "");
  }, [player]);

  async function runSave(action: () => Promise<unknown>, success: string) {
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      await action();
      await refreshUser();
      setMessage(success);
      // Auto-clear success message after 5 seconds
      setTimeout(() => setMessage(null), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Settings update failed.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccount() {
    setIsDeleteModalOpen(false);
    await runSave(async () => {
      await playerApi.deleteMe();
      await logout();
      router.push("/");
    }, "Account deleted.");
  }

  if (loading || !user) {
    return (
      <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="animate-pulse text-muted-foreground text-sm font-medium">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in-50 duration-300">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
          Account Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Customize your player profile, manage notifications, and secure your account.
        </p>
      </div>

      {/* Alert Feedbacks */}
      <div className="space-y-3">
        {message && (
          <div className="flex items-center gap-3 rounded-lg border border-green-500/25 bg-green-500/10 px-4 py-3 text-sm text-green-400 animate-in slide-in-from-top-2 duration-200">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span>{message}</span>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-3 rounded-lg border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive animate-in slide-in-from-top-2 duration-200">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-[240px_1fr]">
        {/* Navigation Sidebar */}
        <aside className="flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-1 overflow-x-auto pb-2 md:pb-0 border-b md:border-b-0 md:border-r border-border/40">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === "profile"
                ? "bg-primary/10 text-primary shadow-sm"
                : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
            }`}
          >
            <User className="h-4 w-4" />
            Profile settings
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === "security"
                ? "bg-primary/10 text-primary shadow-sm"
                : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
            }`}
          >
            <Lock className="h-4 w-4" />
            Account security
          </button>
          <button
            onClick={() => setActiveTab("danger")}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === "danger"
                ? "bg-destructive/10 text-destructive shadow-sm"
                : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
            }`}
          >
            <ShieldAlert className="h-4 w-4" />
            Danger Zone
          </button>
        </aside>

        {/* Tab Panels */}
        <main className="space-y-6">
          {activeTab === "profile" && (
            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
              {/* Profile Fields Card */}
              <Card className="bg-card/30 backdrop-blur-md border-border/60">
                <CardHeader>
                  <CardTitle>Profile Details</CardTitle>
                  <CardDescription>
                    This information will be visible to other players inside matches and profile lists.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form
                    className="space-y-5"
                    onSubmit={(event) => {
                      event.preventDefault();
                      void runSave(
                        () =>
                          playerApi.updateProfile({
                            username: profile.username || undefined,
                            avatarUrl: profile.avatarUrl,
                            bio: profile.bio || undefined,
                          }),
                        "Profile updated successfully.",
                      );
                    }}
                  >
                    <div className="space-y-2">
                      <Label htmlFor="username" className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        Username
                      </Label>
                      <Input
                        id="username"
                        value={profile.username}
                        onChange={(event) =>
                          setProfile({ ...profile, username: event.target.value })
                        }
                        minLength={3}
                        maxLength={20}
                        placeholder="PlayerOne"
                        className="bg-muted/30 focus-visible:ring-primary/50"
                        required
                      />
                      <p className="text-xs text-muted-foreground">3 to 20 characters. Letters, numbers and underscores only.</p>
                    </div>

                    <div className="space-y-3">
                      <Label className="flex items-center gap-2">
                        <Camera className="h-4 w-4 text-muted-foreground" />
                        Avatar Image
                      </Label>
                      
                      <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl border border-dashed border-border/80 bg-muted/10">
                        {/* Current avatar preview */}
                        <div className="relative group shrink-0">
                          {getAvatarUrl(profile.avatarUrl) ? (
                            <Image
                              src={getAvatarUrl(profile.avatarUrl) || ""}
                              alt="Avatar Preview"
                              width={64}
                              height={64}
                              className="h-16 w-16 rounded-full object-cover border border-border shadow-sm animate-in fade-in duration-200"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                                const sibling = (e.target as HTMLElement).nextElementSibling;
                                if (sibling) sibling.classList.remove("hidden");
                              }}
                            />
                          ) : null}
                          <div
                            className={`h-16 w-16 rounded-full bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-xl font-black text-white shadow-sm uppercase select-none ${
                              getAvatarUrl(profile.avatarUrl) ? "hidden" : ""
                            }`}
                          >
                            {profile.username ? profile.username[0] : "?"}
                          </div>
                        </div>

                        {/* File Selector */}
                        <div className="flex-1 text-center sm:text-left space-y-1.5">
                          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                            <input
                              type="file"
                              id="avatarFile"
                              accept="image/*"
                              onChange={handleAvatarChange}
                              className="hidden"
                              disabled={saving}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={saving}
                              onClick={() => document.getElementById("avatarFile")?.click()}
                              className="min-h-9 rounded-lg border-border/80 hover:bg-muted/50 transition-colors"
                            >
                              Choose New Image
                            </Button>
                            {profile.avatarUrl && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                disabled={saving}
                                onClick={handleRemoveAvatar}
                                className="min-h-9 text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Supports PNG, JPG, JPEG or WEBP (Max 5MB).
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio" className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        Bio
                      </Label>
                      <textarea
                        id="bio"
                        value={profile.bio}
                        onChange={(event) =>
                          setProfile({ ...profile, bio: event.target.value })
                        }
                        maxLength={200}
                        rows={4}
                        placeholder="Tell players a bit about yourself..."
                        className="w-full flex rounded-md border border-input bg-muted/30 px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                      <div className="flex justify-end text-xs text-muted-foreground">
                        {profile.bio.length}/200 characters
                      </div>
                    </div>

                    <Button type="submit" disabled={saving} className="w-full sm:w-auto">
                      <Save className="h-4 w-4" />
                      {saving ? "Saving..." : "Save Profile"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Profile Card Live Preview */}
              <div className="space-y-4">
                <div className="text-sm font-semibold tracking-wide text-muted-foreground uppercase px-1">
                  Live Preview
                </div>
                <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-card/60 to-muted/20 backdrop-blur-xl shadow-lg relative group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-violet-500/5 pointer-events-none rounded-lg" />
                  
                  {/* Banner Decoration */}
                  <div className="h-24 w-full bg-gradient-to-r from-primary/20 via-violet-500/10 to-indigo-500/30 relative" />

                  <CardContent className="pt-0 relative px-6 pb-6">
                    {/* Avatar placement */}
                    <div className="-mt-12 mb-4 flex justify-center">
                      {getAvatarUrl(profile.avatarUrl) ? (
                        <Image
                          src={getAvatarUrl(profile.avatarUrl) || ""}
                          alt="Avatar preview"
                          width={96}
                          height={96}
                          className="h-24 w-24 rounded-full border-4 border-background object-cover bg-card shadow-md animate-fade-in"
                          onError={(e) => {
                            // Fallback on image error
                            (e.target as HTMLElement).style.display = "none";
                            const sibling = (e.target as HTMLElement).nextElementSibling;
                            if (sibling) sibling.classList.remove("hidden");
                          }}
                        />
                      ) : null}
                      <div
                        className={`h-24 w-24 rounded-full border-4 border-background bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-3xl font-black text-white shadow-md uppercase select-none ${
                          getAvatarUrl(profile.avatarUrl) ? "hidden" : ""
                        }`}
                      >
                        {profile.username ? profile.username[0] : "?"}
                      </div>
                    </div>

                    <div className="text-center space-y-2">
                      <h3 className="text-xl font-bold tracking-tight text-foreground truncate max-w-full">
                        {profile.username || "Anonymous Player"}
                      </h3>
                      
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
                        <Trophy className="h-3.5 w-3.5" />
                        Rating: {player?.stats?.rating || 1200}
                      </div>

                      <div className="border-t border-border/40 my-3 pt-3">
                        <p className="text-sm text-muted-foreground italic break-words min-h-12 leading-relaxed">
                          {profile.bio || "No bio written yet."}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Email Form */}
              <Card className="bg-card/30 backdrop-blur-md border-border/60">
                <CardHeader>
                  <CardTitle>Email Address</CardTitle>
                  <CardDescription>
                    Keep your contact email up to date to receive notifications.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form
                    className="space-y-4"
                    onSubmit={(event) => {
                      event.preventDefault();
                      void runSave(
                        () => playerApi.updateEmail({ email }),
                        "Email address updated successfully.",
                      );
                    }}
                  >
                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        Email address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="bg-muted/30 focus-visible:ring-primary/50"
                        required
                      />
                    </div>
                    <Button type="submit" disabled={saving}>
                      <Save className="h-4 w-4" />
                      {saving ? "Saving..." : "Save Email"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Password Form */}
              <Card className="bg-card/30 backdrop-blur-md border-border/60">
                <CardHeader>
                  <CardTitle>Update Password</CardTitle>
                  <CardDescription>
                    Change your password regularly to keep your account secure.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form
                    className="space-y-4"
                    onSubmit={(event) => {
                      event.preventDefault();
                      void runSave(
                        () => playerApi.updatePassword(passwords),
                        "Password updated successfully.",
                      );
                    }}
                  >
                    <div className="space-y-2">
                      <Label htmlFor="oldPassword">Current Password</Label>
                      <Input
                        id="oldPassword"
                        type="password"
                        value={passwords.oldPassword}
                        onChange={(event) =>
                          setPasswords({
                            ...passwords,
                            oldPassword: event.target.value,
                          })
                        }
                        placeholder="••••••••"
                        className="bg-muted/30 focus-visible:ring-primary/50"
                        minLength={6}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwords.newPassword}
                        onChange={(event) =>
                          setPasswords({
                            ...passwords,
                            newPassword: event.target.value,
                          })
                        }
                        placeholder="••••••••"
                        className="bg-muted/30 focus-visible:ring-primary/50"
                        minLength={6}
                        required
                      />
                    </div>
                    <Button type="submit" disabled={saving}>
                      <Save className="h-4 w-4" />
                      {saving ? "Saving..." : "Save Password"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "danger" && (
            <Card className="border-destructive/30 bg-destructive/5 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
                <CardDescription>
                  Actions here are irreversible. Be cautious.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground leading-relaxed">
                  Deleting your account will permanently purge all matches, statistics, ratings, and profile information. 
                  This action cannot be undone, and you will lose access immediately.
                </div>
                <Button 
                  variant="destructive" 
                  onClick={() => setIsDeleteModalOpen(true)} 
                  disabled={saving}
                  className="w-full sm:w-auto"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Account permanently
                </Button>
              </CardContent>
            </Card>
          )}
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="max-w-md w-full bg-card border border-destructive/20 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-destructive/10 px-6 py-4 flex items-center justify-between border-b border-destructive/20">
              <div className="flex items-center gap-2 text-destructive font-bold text-lg">
                <ShieldAlert className="h-5 w-5" />
                Confirm Deletion
              </div>
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-muted-foreground hover:text-foreground rounded-full p-1 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Are you absolutely sure you want to delete your account? 
                This will delete your ELO rating, match history, and profile data from our databases permanently. 
                <strong className="text-foreground block mt-2">This action is non-reversible.</strong>
              </p>
            </div>
            
            <div className="px-6 py-4 bg-muted/20 border-t border-border flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsDeleteModalOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteAccount}
                className="w-full sm:w-auto"
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
