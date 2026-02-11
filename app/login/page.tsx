"use client";

import { LoginForm } from "@/components/loginForm";
import { Wrench, Zap, FlaskConical, Cpu, Hammer, CircuitBoard, Atom, Beer } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const ICONS = [Wrench, Zap, FlaskConical, Cpu, Hammer, CircuitBoard, Atom, Beer];

interface FloatIcon {
  id: number;
  Icon: (typeof ICONS)[number];
  x: number;
  y: number;
  size: number;
  dur: number;
  delay: number;
  rot: number;
}

function makeIcons(n: number): FloatIcon[] {
  return Array.from({ length: n }, (_, i) => ({
    id: i,
    Icon: ICONS[i % ICONS.length],
    x: Math.random() * 90 + 5,
    y: Math.random() * 90 + 5,
    size: 18 + Math.random() * 20,
    dur: 20 + Math.random() * 20,
    delay: -(Math.random() * 20),
    rot: Math.random() * 360,
  }));
}

export default function LoginPage() {
  const icons = useMemo(() => makeIcons(18), []);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setShow(true));
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-b from-background via-background to-muted/35 dark:to-background">
      {/* Background gradient mesh - all using theme CSS vars */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-1/4 -top-1/4 size-[38rem] rounded-full bg-primary/18 blur-[120px] dark:bg-primary/30" />
        <div className="absolute -bottom-1/4 -right-1/4 size-[32rem] rounded-full bg-primary/10 blur-[120px] dark:bg-primary/15" />
        <div className="absolute left-1/2 top-1/2 size-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-ring/10 blur-[100px] dark:bg-ring/20" />
        <div className="absolute left-[8%] top-[70%] size-[22rem] rounded-full bg-secondary/30 blur-[140px] dark:bg-secondary/10" />
      </div>

      {/* Noise texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
      />

      {/* Floating icons */}
      {icons.map(({ id, Icon, x, y, size, dur, delay, rot }) => (
        <div
          key={id}
          className={`pointer-events-none absolute text-primary/75 transition-opacity duration-[3000ms] dark:text-primary ${
            show ? "opacity-10 dark:opacity-[0.12]" : "opacity-0"
          }`}
          style={{
            left: `${x}%`,
            top: `${y}%`,
            transform: `rotate(${rot}deg)`,
          }}
        >
          <div style={{ animation: `loginFloat ${dur}s ease-in-out ${delay}s infinite` }}>
            <Icon size={size} strokeWidth={1.2} />
          </div>
        </div>
      ))}

      {/* Content */}
      <div
        className="relative z-10 w-full max-w-sm px-6"
        style={{
          opacity: show ? 1 : 0,
          transform: show ? "translateY(0)" : "translateY(12px)",
          transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s",
        }}
      >
        {/* Title */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">AUES Dashboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to continue</p>
          <div className="mx-auto mt-3 h-0.5 w-10 rounded-full bg-primary" />
        </div>

        {/* Form */}
        <LoginForm />
      </div>

      <style>{`
        @keyframes loginFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-18px); }
        }
      `}</style>
    </div>
  );
}
