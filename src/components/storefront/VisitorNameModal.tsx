import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface VisitorNameModalProps {
  open: boolean;
  storeName: string;
  onSubmit: (name: string) => void;
}

export function VisitorNameModal({ open, storeName, onSubmit }: VisitorNameModalProps) {
  const [name, setName] = useState("");

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-sm text-center gap-6 [&>button]:hidden">
        <DialogTitle className="sr-only">Welcome</DialogTitle>
        <div className="space-y-2">
          <span className="text-4xl">👋</span>
          <h2 className="text-xl font-bold">Welcome to {storeName}!</h2>
          <p className="text-sm text-muted-foreground">
            What's your name? We'd love to greet you properly.
          </p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim()) onSubmit(name.trim());
          }}
          className="space-y-3"
        >
          <Input
            placeholder="Enter your first name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            className="text-center text-base"
          />
          <Button type="submit" className="w-full" disabled={!name.trim()}>
            Continue Shopping
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
