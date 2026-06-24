"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEmovertStore } from "@/hooks/useStore";
import {
  Settings,
  Shield,
  Bell,
  Database,
  Eye,
  Trash2,
  Download,
  LogOut,
  User,
  Mail,
  Key,
} from "lucide-react";

export default function SettingsPage() {
  const { privacyMode, setPrivacyMode, setPrivacySettings } = useEmovertStore();
  const [notifications, setNotifications] = useState(true);
  const [storeAnalytics, setStoreAnalytics] = useState(true);
  const [shareData, setShareData] = useState(false);

  const toggleSetting = (setter: (v: boolean) => void, value: boolean, key: string) => {
    setter(!value);
    if (key === "privacy") setPrivacyMode(!value);
    if (key === "analytics") setPrivacySettings({ storeAnalytics: !value });
    if (key === "notifications") setPrivacySettings({ allowNotifications: !value });
    if (key === "share") setPrivacySettings({ shareData: !value });
  };

  const SettingItem = ({
    icon: Icon,
    title,
    description,
    enabled,
    onToggle,
    danger,
  }: {
    icon: React.ElementType;
    title: string;
    description: string;
    enabled: boolean;
    onToggle: () => void;
    danger?: boolean;
  }) => (
    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/[0.07] transition-colors">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${danger ? "bg-red-500/10" : "bg-white/5"}`}>
          <Icon className={`w-5 h-5 ${danger ? "text-red-400" : "text-white/50"}`} />
        </div>
        <div>
          <p className={`text-sm font-medium ${danger ? "text-red-400" : "text-white"}`}>{title}</p>
          <p className="text-xs text-white/40">{description}</p>
        </div>
      </div>
      <button
        onClick={onToggle}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          enabled ? "bg-emovert-cyan" : "bg-white/10"
        }`}
      >
        <div
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-lg transition-transform ${
            enabled ? "translate-x-6" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          <span className="gradient-text">Settings</span>
        </h1>
        <p className="text-white/50 mt-1">Manage your preferences and privacy</p>
      </motion.div>

      {/* Privacy Settings */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-emovert-cyan" />
              Privacy & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <SettingItem
              icon={Eye}
              title="Privacy Mode"
              description="Stop webcam and detection when enabled"
              enabled={privacyMode}
              onToggle={() => toggleSetting(setPrivacyMode, privacyMode, "privacy")}
            />
            <SettingItem
              icon={Database}
              title="Store Analytics"
              description="Save emotion and focus analytics"
              enabled={storeAnalytics}
              onToggle={() => toggleSetting(setStoreAnalytics, storeAnalytics, "analytics")}
            />
            <SettingItem
              icon={Bell}
              title="Notifications"
              description="Receive focus and wellness alerts"
              enabled={notifications}
              onToggle={() => toggleSetting(setNotifications, notifications, "notifications")}
            />
            <SettingItem
              icon={Shield}
              title="Share Data"
              description="Share anonymized data for research"
              enabled={shareData}
              onToggle={() => toggleSetting(setShareData, shareData, "share")}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Account Settings */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-emovert-purple" />
              Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5">
              <div className="w-10 h-10 rounded-full bg-emovert-cyan/20 flex items-center justify-center">
                <Mail className="w-5 h-5 text-emovert-cyan" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Email</p>
                <p className="text-xs text-white/40">chandramouli@emovert.ai</p>
              </div>
              <Button variant="outline" size="sm">Change</Button>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5">
              <div className="w-10 h-10 rounded-full bg-emovert-purple/20 flex items-center justify-center">
                <Key className="w-5 h-5 text-emovert-purple" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Password</p>
                <p className="text-xs text-white/40">Last changed 30 days ago</p>
              </div>
              <Button variant="outline" size="sm">Update</Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Data Management */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-emovert-green" />
              Data Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start gap-3">
              <Download className="w-4 h-4" />
              Export My Data
            </Button>
            <Button variant="outline" className="w-full justify-start gap-3 text-red-400 hover:text-red-400 hover:bg-red-500/10">
              <Trash2 className="w-4 h-4" />
              Delete All Data
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Danger Zone */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="border-red-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-400">
              <LogOut className="w-5 h-5" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" className="w-full gap-2">
              <LogOut className="w-4 h-4" />
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
