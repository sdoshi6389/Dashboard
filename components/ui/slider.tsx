"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, value = 0, onChange, min = 0, max = 100, step = 1, ...props }, ref) => {
    const pct = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
    return (
      <div className={cn("relative flex w-full items-center", className)}>
        <input
          type="range"
          ref={ref}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange?.(Number(e.target.value))}
          className="h-2 w-full appearance-none rounded-full bg-muted accent-primary"
          style={{
            background: `linear-gradient(to right, hsl(172, 66%, 45%) 0%, hsl(172, 66%, 45%) ${pct}%, hsl(215, 16%, 22%) ${pct}%, hsl(215, 16%, 22%) 100%)`,
          }}
          {...props}
        />
      </div>
    );
  }
);
Slider.displayName = "Slider";

export { Slider };
