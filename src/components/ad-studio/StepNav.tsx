import { LayoutGrid, ImagePlus, Type } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { num: 1, label: "Template", icon: LayoutGrid },
  { num: 2, label: "Images", icon: ImagePlus },
  { num: 3, label: "Text", icon: Type },
] as const;

interface StepNavProps {
  current: number;
  completed: number[];
  onStep: (step: number) => void;
}

export default function StepNav({ current, completed, onStep }: StepNavProps) {
  return (
    <div className="flex items-center justify-center gap-6 py-1">
      {STEPS.map((s) => {
        const isActive = current === s.num;
        const isDone = completed.includes(s.num);
        const canTap = isDone || s.num <= Math.max(...completed, current);

        return (
          <button
            key={s.num}
            disabled={!canTap}
            onClick={() => canTap && onStep(s.num)}
            className={cn(
              "flex items-center gap-1.5 text-[11px] font-medium transition-colors",
              isActive ? "text-primary" : isDone ? "text-foreground" : "text-muted-foreground",
              !canTap && "opacity-40"
            )}
          >
            <div
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center transition-all",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : isDone
                  ? "bg-primary/15 text-primary"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <s.icon className="h-3 w-3" />
            </div>
            <span className="hidden sm:inline">{s.label}</span>
          </button>
        );
      })}
    </div>
  );
}
