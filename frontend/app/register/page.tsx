"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Mail, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEmovertStore } from "@/hooks/useStore";
import { authAPI } from "@/lib/api";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const { setUser, setIsAuthenticated } = useEmovertStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const response = await authAPI.register(email, password, name);
      const { access_token } = response.data;
      Cookies.set("emovert_token", access_token, { expires: 7 });

      // Fetch user details
      const userRes = await authAPI.me();
      setUser(userRes.data);
      setIsAuthenticated(true);
      toast.success("Account created successfully!");
      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const response = await authAPI.googleLogin("dummy_google_token");
      const { access_token } = response.data;
      Cookies.set("emovert_token", access_token, { expires: 7 });

      // Fetch user details
      const userRes = await authAPI.me();
      setUser(userRes.data);
      setIsAuthenticated(true);
      toast.success("Signed in with Google!");
      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Google Login failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emovert-cyan to-emovert-purple flex items-center justify-center mx-auto mb-4">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold gradient-text">EMOVERT</h1>
          <p className="text-white/40 mt-1">Where Emotions Meet Intelligence</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Register</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-white/60">Name</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading || googleLoading}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-emovert-cyan/50 disabled:opacity-50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/60">Email</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading || googleLoading}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-emovert-cyan/50 disabled:opacity-50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/60">Password</label>
                <input
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading || googleLoading}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-emovert-cyan/50 disabled:opacity-50"
                />
              </div>
              <Button type="submit" disabled={loading || googleLoading} className="w-full glow-cyan">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
              <div className="relative flex justify-center text-xs"><span className="px-2 bg-[#0a0a0f] text-white/30">or continue with</span></div>
            </div>
            <Button
              variant="outline"
              disabled={loading || googleLoading}
              onClick={handleGoogleLogin}
              className="w-full gap-2"
            >
              {googleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Mail className="w-4 h-4" />
              )}
              Google
            </Button>
            <p className="text-center text-sm text-white/40">Already have an account? <Link href="/login" className="text-emovert-cyan hover:underline">Sign in</Link></p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
