"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { History, LogOut, Swords, UserPlus } from "lucide-react";
import { cn, getAvatarUrl } from "@/lib/utils";
import { Button } from "./ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useGameSocket } from "@/hooks/useGameSocket";

export function Navbar() {
    const pathname = usePathname();
    const { isAuthenticated, logout, user } = useAuth();
    const { connectionState, liveStatus } = useGameSocket(isAuthenticated);

    const navItems = [
        { href: "/dashboard", label: "Hub" },
        { href: "/history", label: "History" },
        { href: "/users", label: "Players" },
        { href: "/settings", label: "Settings" },
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
                                <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent font-black text-white text-[10px] select-none shadow-sm uppercase overflow-hidden">
                                    {getAvatarUrl(user?.avatarUrl) ? (
                                        <img
                                            src={getAvatarUrl(user?.avatarUrl) || undefined}
                                            alt={`${user?.username}'s avatar`}
                                            className="h-full w-full object-cover animate-in fade-in duration-200"
                                            onError={(e) => {
                                                (e.target as HTMLElement).style.display = "none";
                                                const sibling = (e.target as HTMLElement).nextElementSibling;
                                                if (sibling) sibling.classList.remove("hidden");
                                            }}
                                        />
                                    ) : null}
                                    <div
                                        className={cn(
                                            "flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/80 to-accent/80 text-white select-none uppercase font-black w-full h-full text-[10px]",
                                            getAvatarUrl(user?.avatarUrl) ? "hidden" : ""
                                        )}
                                    >
                                        {user?.username ? user.username.charAt(0).toUpperCase() : "?"}
                                    </div>
                                </div>
                                <span className="max-w-36 truncate text-sm text-muted-foreground">
                                    {user?.username}
                                </span>
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
