import { Camera, Palette, Type } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { num: 1, label: "Product", icon: Camera },
  { num: 2, label: "Template", icon: Palette },
  { num: 3, label: "Text", icon: Type },
] as const;

interface StepNavProps {
  current: number;
  completed: number[];
  onStep: (step: number) => void;
}

export default function StepNav({ current, completed, onStep }: StepNavProps) {
  return (
    <div className="flex items-center justify-around py-2 px-4 border-t border-border bg-background">
      {STEPS.map((s, i) => {
        const isActive = current === s.num;
        const isDone = completed.includes(s.num);
        const canTap = isDone || s.num <= Math.max(...completed, current);

        return (
          <button
            key={s.num}
            disabled={!canTap}
            onClick={() => canTap && onStep(s.num)}
            className={cn(
              "flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors min-w-[60px]",
              isActive ? "text-primary" : isDone ? "text-foreground" : "text-muted-foreground",
              !canTap && "opacity-40"
            )}
          >
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : isDone
                  ? "bg-primary/15 text-primary"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <s.icon className="h-4 w-4" />
            </div>
            {s.label}
          </button>
        );
      })}
    </div>
  );
}
