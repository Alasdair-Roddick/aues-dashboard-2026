"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useTransition } from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun, Sparkles, Check, Palette as PaletteIcon } from "lucide-react";
import { getUserCustomizations, updateUserCustomizations } from "@/app/actions/customizations";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { generateColorPalette } from "@/lib/color-utils";

const PRESET_COLORS = [
  { name: "Blue", color: "#2563eb" },
  { name: "Purple", color: "#7c3aed" },
  { name: "Pink", color: "#db2777" },
  { name: "Green", color: "#059669" },
  { name: "Orange", color: "#ea580c" },
  { name: "Red", color: "#dc2626" },
  { name: "Teal", color: "#0d9488" },
  { name: "Indigo", color: "#4f46e5" },
];

export function AppearanceSection() {
  const { data: session } = useSession();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [localTheme, setLocalTheme] = useState<"light" | "dark" | "system">("system");
  const [lightColor, setLightColor] = useState("#2563eb");
  const [darkColor, setDarkColor] = useState("#3b82f6");

  useEffect(() => {
    setMounted(true);
    if (session?.user?.id) {
      getUserCustomizations(session.user.id).then((data) => {
        if (data) {
          setLightColor(data.lightPrimaryColor);
          setDarkColor(data.darkPrimaryColor);
          if (data.theme) {
            setLocalTheme(data.theme);
          }
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (mounted && theme) {
      setLocalTheme(theme as "light" | "dark" | "system");
    }
  }, [theme, mounted]);

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setLocalTheme(newTheme);
    setTheme(newTheme);
  };

  const handleSave = () => {
    if (!session?.user?.id) return;
    startTransition(async () => {
      const result = await updateUserCustomizations(
        session.user.id,
        lightColor,
        lightColor,
        darkColor,
        darkColor,
        localTheme
      );
      if (result.success) {
        toast.success("Theme saved! Refreshing...");
        setTimeout(() => window.location.reload(), 800);
      } else {
        toast.error("Failed to save theme.");
      }
    });
  };

  const handleReset = () => {
    setLightColor("#2563eb");
    setDarkColor("#3b82f6");
    toast.info("Colors reset");
  };

  const applyPreset = (color: string) => {
    setLightColor(color);
    setDarkColor(color);
    toast.success("Preset applied!");
  };

  if (!mounted || loading) {
    return (
      <div className="space-y-6">
        <Card><CardHeader><Skeleton className="h-6 w-32" /><Skeleton className="h-4 w-64 mt-2" /></CardHeader><CardContent className="space-y-6"><Skeleton className="h-24 w-full" /><Skeleton className="h-48 w-full" /></CardContent></Card>
      </div>
    );
  }

  const isCurrentMode = (mode: string) => localTheme === mode;
  const activeColor = resolvedTheme === "dark" ? darkColor : lightColor;
  const activePalette = generateColorPalette(activeColor);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5" />Theme Mode</CardTitle>
          <CardDescription>Choose how the dashboard appears</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {[
              { mode: "light", Icon: Sun, label: "Light", desc: "Bright & clear" },
              { mode: "dark", Icon: Moon, label: "Dark", desc: "Easy on eyes" },
              { mode: "system", Icon: Monitor, label: "System", desc: "Auto switch" }
            ].map(({ mode, Icon, label, desc }) => (
              <button key={mode} onClick={() => handleThemeChange(mode as any)} className={`group relative flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all hover:shadow-md ${isCurrentMode(mode) ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/30"}`}>
                {isCurrentMode(mode) && <div className="absolute top-2 right-2"><div className="bg-primary rounded-full p-1"><Check className="h-3 w-3 text-primary-foreground" /></div></div>}
                <Icon className={`h-8 w-8 ${isCurrentMode(mode) ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
                <div className="text-center"><p className="font-semibold text-sm">{label}</p><p className="text-xs text-muted-foreground mt-0.5">{desc}</p></div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><PaletteIcon className="h-5 w-5" />Brand Color</CardTitle>
          <CardDescription>Pick one color - we generate a complete Tailwind-style palette</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {[
              { label: "Light Mode", value: lightColor, onChange: setLightColor, placeholder: "#2563eb", icon: Sun },
              { label: "Dark Mode", value: darkColor, onChange: setDarkColor, placeholder: "#3b82f6", icon: Moon }
            ].map((item) => (
              <div key={item.label} className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                  {item.label}
                </Label>
                <div className="space-y-2">
                  <div className="relative">
                    <input
                      type="color"
                      value={item.value}
                      onChange={(e) => item.onChange(e.target.value)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-md border-2 border-border cursor-pointer"
                    />
                    <input
                      type="text"
                      value={item.value}
                      onChange={(e) => item.onChange(e.target.value)}
                      className="w-full pl-14 pr-3 py-3 rounded-lg border-2 border-input bg-background text-sm font-mono focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder={item.placeholder}
                    />
                  </div>
                  <div
                    className="h-12 rounded-lg shadow-sm ring-1 ring-black/5"
                    style={{ backgroundColor: item.value }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Quick Presets</Label>
            <div className="grid grid-cols-4 gap-3">
              {PRESET_COLORS.map((preset) => {
                const isSelected = lightColor === preset.color && darkColor === preset.color;
                return (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset.color)}
                    className={`group relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all hover:shadow-md ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <div className="bg-primary rounded-full p-0.5">
                          <Check className="h-3 w-3 text-primary-foreground" />
                        </div>
                      </div>
                    )}
                    <div
                      className="h-16 w-full rounded-lg shadow-sm ring-1 ring-black/5 transition-transform group-hover:scale-105"
                      style={{ backgroundColor: preset.color }}
                    />
                    <p className="text-xs font-medium text-center">{preset.name}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Generated Palette</Label>
              <p className="text-xs text-muted-foreground mt-1">Tailwind-style shades (50-950) auto-generated from your color</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
              <div className="grid grid-cols-11 gap-2">
                {Object.entries(activePalette).map(([shade, color]) => (
                  <div key={shade} className="group space-y-2">
                    <div
                      className="h-14 rounded-lg border border-border/50 shadow-sm transition-transform group-hover:scale-110 group-hover:shadow-md cursor-pointer"
                      style={{ backgroundColor: color }}
                      title={`${shade}: ${color}`}
                    />
                    <p className="text-[10px] text-center text-muted-foreground font-mono font-medium">{shade}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Live Preview</Label>
              <p className="text-xs text-muted-foreground mt-1">See how your theme colors look in action</p>
            </div>
            <div className="p-6 bg-muted/30 rounded-xl border border-border/50 space-y-4">
              <div className="flex gap-3 flex-wrap items-center">
                <button
                  className="px-5 py-2.5 rounded-lg font-medium text-sm shadow-sm transition-all hover:opacity-90 hover:shadow-md"
                  style={{ backgroundColor: activePalette[500], color: "white" }}
                >
                  Primary Button
                </button>
                <button
                  className="px-5 py-2.5 rounded-lg font-medium text-sm border-2 transition-all hover:bg-opacity-5"
                  style={{ borderColor: activePalette[500], color: activePalette[700] }}
                >
                  Outline Button
                </button>
                <div
                  className="px-3 py-1.5 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: activePalette[100], color: activePalette[700] }}
                >
                  Badge
                </div>
                <div
                  className="px-3 py-1.5 rounded-md text-xs font-medium border"
                  style={{ borderColor: activePalette[200], color: activePalette[600] }}
                >
                  Chip
                </div>
              </div>
              <div
                className="p-4 rounded-lg border-l-4 shadow-sm"
                style={{ borderLeftColor: activePalette[500], backgroundColor: activePalette[50] }}
              >
                <p className="text-sm font-semibold" style={{ color: activePalette[900] }}>
                  Your custom theme in action
                </p>
                <p className="text-xs mt-1.5" style={{ color: activePalette[600] }}>
                  This alert box demonstrates how your color palette creates a cohesive design system
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleSave}
              disabled={isPending}
              size="lg"
              className="flex-1 sm:flex-none"
            >
              {isPending ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Save Theme
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={isPending}
              size="lg"
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
