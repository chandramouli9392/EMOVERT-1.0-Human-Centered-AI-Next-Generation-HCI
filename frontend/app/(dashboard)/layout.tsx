"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useEmovertStore } from "@/hooks/useStore";
import {
  Brain,
  LayoutDashboard,
  Play,
  BarChart3,
  Music,
  MessageSquare,
  User,
  Trophy,
  FileText,
  Settings,
  Shield,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authAPI } from "@/lib/api";
import Cookies from "js-cookie";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Play, label: "Start Session", href: "/session" },
  { icon: BarChart3, label: "Analytics", href: "/analytics" },
  { icon: Music, label: "Music", href: "/music" },
  { icon: MessageSquare, label: "AI Coach", href: "/coach" },
  { icon: Brain, label: "Get Rid Of", href: "/get-rid" },
  { icon: Trophy, label: "Achievements", href: "/achievements" },
  { icon: FileText, label: "Reports", href: "/reports" },
  { icon: User, label: "Profile", href: "/profile" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, setUser, setIsAuthenticated, privacyMode, setPrivacyMode } = useEmovertStore();

  useEffect(() => {
    authAPI.me()
      .then((res) => {
        setUser(res.data);
        setIsAuthenticated(true);
      })
      .catch((err) => {
        console.error("Failed to fetch current user details:", err);
        setIsAuthenticated(false);
        setUser(null);
        Cookies.remove("emovert_token");
        router.push("/login");
      });
  }, [setUser, setIsAuthenticated, router]);

  return (
    <div className="min-h-screen flex">
      {/* Desktop Sidebar */}
      <motion.aside
        className="hidden lg:flex flex-col fixed left-0 top-0 h-screen z-40 glass border-r border-white/5"
        initial={false}
        animate={{ width: sidebarOpen ? 260 : 80 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 h-16">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emovert-cyan to-emovert-purple flex items-center justify-center shrink-0">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="text-lg font-bold gradient-text whitespace-nowrap overflow-hidden"
                >
                  EMOVERT
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="shrink-0"
          >
            {sidebarOpen ? (
              <ChevronLeft className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </Button>
        </div>

        <Separator className="bg-white/5" />

        {/* Privacy Mode Toggle */}
        <div className="px-4 py-3">
          <button
            onClick={() => setPrivacyMode(!privacyMode)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 ${
              privacyMode
                ? "bg-red-500/20 border border-red-500/30"
                : "hover:bg-white/5"
            }`}
          >
            <Shield
              className={`w-5 h-5 shrink-0 ${
                privacyMode ? "text-red-400" : "text-white/50"
              }`}
            />
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 overflow-hidden"
                >
                  <span
                    className={`text-sm ${
                      privacyMode ? "text-red-400" : "text-white/50"
                    }`}
                  >
                    {privacyMode ? "Privacy On" : "Privacy Off"}
                  </span>
                  {privacyMode && (
                    <Badge variant="destructive" className="text-[10px] h-5">
                      Active
                    </Badge>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>

        <Separator className="bg-white/5" />

        {/* Navigation */}
        <ScrollArea className="flex-1 px-2 py-2">
          <nav className="space-y-1">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                      isActive
                        ? "bg-emovert-cyan/10 border border-emovert-cyan/20 text-emovert-cyan"
                        : "text-white/50 hover:text-white hover:bg-white/5"
                    }`}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    <AnimatePresence>
                      {sidebarOpen && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          className="text-sm font-medium whitespace-nowrap overflow-hidden"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {isActive && sidebarOpen && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="ml-auto w-1.5 h-1.5 rounded-full bg-emovert-cyan"
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        <Separator className="bg-white/5" />

        {/* User Profile */}
        <div className="p-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-9 h-9 shrink-0">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="text-xs">
                {user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 min-w-0 overflow-hidden"
                >
                  <p className="text-sm font-medium text-white truncate">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs text-white/40 truncate">
                    {user?.email || "user@emovert.ai"}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={() => {
                Cookies.remove("emovert_token");
                setUser(null);
                setIsAuthenticated(false);
                router.push("/login");
              }}
            >
              <LogOut className="w-4 h-4 text-white/40" />
            </Button>
          </div>
        </div>
      </motion.aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="flex items-center justify-between h-16 px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emovert-cyan to-emovert-purple flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold gradient-text">EMOVERT</span>
          </Link>
          <div className="flex items-center gap-2">
            {privacyMode && (
              <Badge variant="destructive" className="text-[10px]">
                Privacy
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute left-0 top-16 bottom-0 w-72 glass border-r border-white/5"
              onClick={(e) => e.stopPropagation()}
            >
              <ScrollArea className="h-full p-4">
                <nav className="space-y-1">
                  {sidebarItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <div
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                            isActive
                              ? "bg-emovert-cyan/10 text-emovert-cyan"
                              : "text-white/50 hover:text-white hover:bg-white/5"
                          }`}
                        >
                          <item.icon className="w-5 h-5" />
                          <span className="text-sm font-medium">
                            {item.label}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </nav>
                <Separator className="my-4 bg-white/5" />
                <button
                  onClick={() => setPrivacyMode(!privacyMode)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    privacyMode
                      ? "bg-red-500/20 text-red-400"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Shield className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    {privacyMode ? "Privacy On" : "Privacy Off"}
                  </span>
                </button>
              </ScrollArea>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main
        className={`flex-1 min-h-screen transition-all duration-300 ${
          sidebarOpen ? "lg:ml-[260px]" : "lg:ml-[80px]"
        }`}
      >
        <div className="lg:pt-0 pt-16">
          {children}
        </div>
      </main>
    </div>
  );
}
