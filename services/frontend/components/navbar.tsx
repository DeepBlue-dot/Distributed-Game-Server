"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { History, LogOut, Swords, UserPlus } from "lucide-react";
import { cn, getAvatarUrl } from "@/lib/utils";
import { Button } from "./ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useGameSocket } from "@/hooks/useGameSocket";
import Image from "next/image";
import { useState } from "react";

export function Navbar() {
    const pathname = usePathname();
    const { isAuthenticated, logout, user } = useAuth();
    const { connectionState, liveStatus } = useGameSocket(isAuthenticated);
    const [avatarError, setAvatarError] = useState(false);

    const navItems = [
        { href: "/dashboard", label: "Hub" },
        { href: "/history", label: "History" },
        { href: "/users", label: "Players" },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="mx-auto flex h-14 w-full max-w-6xl items-center px-4 sm:px-6 lg:px-8">
                <div className="mr-4 flex min-w-0 items-center">
                    <Link href="/" className="mr-4 flex items-center gap-2 font-bold">
                        <Swords className="h-5 w-5 text-primary" aria-hidden="true" />
                        <span className="truncate">TurnBased</span>
                    </Link>
                    {isAuthenticated && (
                        <nav className="hidden items-center gap-4 text-sm font-medium md:flex">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "transition-colors hover:text-foreground/80",
                                        pathname === item.href || (item.href === "/history" && pathname.startsWith("/history"))
                                            ? "text-foreground"
                                            : "text-muted-foreground",
                                    )}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    )}
                </div>
                <div className="flex flex-1 items-center justify-end gap-2">
                    {isAuthenticated ? (
                        <>
                            <Link href="/history" className="hidden sm:block">
                                <Button variant="ghost" size="sm" title="History">
                                    <History className="h-4 w-4" aria-hidden="true" />
                                    <span className="sr-only">History</span>
                                </Button>
                            </Link>
                            <span
                                className={cn(
                                    "hidden rounded-md border px-2 py-1 text-xs font-semibold uppercase sm:inline-flex",
                                    liveStatus === "IN_GAME" && "border-green-400/30 bg-green-400/10 text-green-300",
                                    liveStatus === "QUEUED" && "border-amber-400/30 bg-amber-400/10 text-amber-300",
                                    liveStatus === "IDLE" && "border-primary/30 bg-primary/10 text-primary",
                                    liveStatus === "OFFLINE" && "border-muted bg-muted/40 text-muted-foreground",
                                )}
                                title={`Gateway ${connectionState}`}
                            >
                                {liveStatus === "IDLE" ? "online" : liveStatus.replace("_", " ")}
                            </span>
                            <div className="hidden sm:flex items-center gap-2">
                                <Link href="/settings">
                                    <div className="relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-accent font-black text-[10px] text-white shadow-sm select-none uppercase">
                                        {getAvatarUrl(user?.avatarUrl) && !avatarError && (
                                            <>
                                            <Image
                                                src={getAvatarUrl(user!.avatarUrl)!}
                                                alt={`${user?.username}'s avatar`}
                                                fill
                                                sizes="28px"
                                                className="object-cover animate-in fade-in duration-200"
                                                onError={() => setAvatarError(true)}
                                            />
                                            <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-primary/80 to-accent/80">
                                                {user?.username?.charAt(0).toUpperCase() ?? "?"}
                                            </div>
                                            </>
                                        )}

                                        {(avatarError || !getAvatarUrl(user?.avatarUrl)) && (
                                            <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-primary/80 to-accent/80">
                                                {user?.username?.charAt(0).toUpperCase() ?? "?"}
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => void logout()} title="Log out">
                                <LogOut className="h-4 w-4" aria-hidden="true" />
                                <span className="sr-only">Log out</span>
                            </Button>
                        </>
                    ) : (
                        <>
                            <Link href="/login">
                                <Button variant="ghost" size="sm">
                                    Login
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button size="sm">
                                    <UserPlus className="h-4 w-4" aria-hidden="true" />
                                    Register
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
