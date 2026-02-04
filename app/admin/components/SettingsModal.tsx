"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSiteSettings, updateSiteSettings, SiteSettingsData } from "@/app/actions/settings";
import { toast } from "sonner";

export function SettingsModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SiteSettingsData>({
    qpayUrl: null,
    qpayEmail: null,
    qpaySessionId: null,
    squarespaceApiKey: null,
    squarespaceApiUrl: null,
    squarespaceApiVersion: null,
    pubcrawlShirtKeyword: null,
  });

  useEffect(() => {
    if (open) {
      loadSettings();
    }
  }, [open]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await getSiteSettings();
      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await updateSiteSettings(settings);
      if (result.success) {
        toast.success("Settings saved successfully");
        setOpen(false);
      } else {
        toast.error(result.error || "Failed to save settings");
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof SiteSettingsData, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value || null,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Site Settings</DialogTitle>
          <DialogDescription>
            Configure API keys and settings. All sensitive data is encrypted at rest.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* QPay/Rubric Settings */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                QPay / Rubric API
              </h3>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="qpayUrl">QPay API URL</Label>
                  <Input
                    id="qpayUrl"
                    type="text"
                    value={settings.qpayUrl || ""}
                    onChange={(e) => handleChange("qpayUrl", e.target.value)}
                    placeholder="https://appserver.getqpay.com:9090/..."
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="qpayEmail">QPay Email</Label>
                  <Input
                    id="qpayEmail"
                    type="email"
                    value={settings.qpayEmail || ""}
                    onChange={(e) => handleChange("qpayEmail", e.target.value)}
                    placeholder="club@aues.com.au"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="qpaySessionId">QPay Session ID</Label>
                  <Input
                    id="qpaySessionId"
                    type="password"
                    value={settings.qpaySessionId || ""}
                    onChange={(e) => handleChange("qpaySessionId", e.target.value)}
                    placeholder="societyid_xxxx_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  />
                </div>
              </div>
            </div>

            {/* Squarespace Settings */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Squarespace API
              </h3>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="squarespaceApiKey">API Key</Label>
                  <Input
                    id="squarespaceApiKey"
                    type="password"
                    value={settings.squarespaceApiKey || ""}
                    onChange={(e) => handleChange("squarespaceApiKey", e.target.value)}
                    placeholder="Enter Squarespace API key"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="squarespaceApiUrl">API URL</Label>
                  <Input
                    id="squarespaceApiUrl"
                    type="text"
                    value={settings.squarespaceApiUrl || ""}
                    onChange={(e) => handleChange("squarespaceApiUrl", e.target.value)}
                    placeholder="https://api.squarespace.com/..."
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="squarespaceApiVersion">API Version</Label>
                  <Input
                    id="squarespaceApiVersion"
                    type="text"
                    value={settings.squarespaceApiVersion || ""}
                    onChange={(e) => handleChange("squarespaceApiVersion", e.target.value)}
                    placeholder="1.0"
                  />
                </div>
              </div>
            </div>

            {/* Pub Crawl Settings */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Pub Crawl
              </h3>
              <div className="grid gap-2">
                <Label htmlFor="pubcrawlShirtKeyword">Shirt Keyword</Label>
                <Input
                  id="pubcrawlShirtKeyword"
                  type="text"
                  value={settings.pubcrawlShirtKeyword || ""}
                  onChange={(e) => handleChange("pubcrawlShirtKeyword", e.target.value)}
                  placeholder="Enter pub crawl shirt keyword"
                />
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading || saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
