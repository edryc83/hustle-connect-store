import { Store, PackagePlus, Share2 } from "lucide-react";

const steps = [
  {
    icon: Store,
    title: "Create your store",
    description: "Sign up, pick a name, and set up your storefront in under 2 minutes.",
  },
  {
    icon: PackagePlus,
    title: "Add your products",
    description: "Upload photos, set prices, and describe what you sell. Simple as that.",
  },
  {
    icon: Share2,
    title: "Share your link",
    description: "Send your store link to customers. Orders come straight to your WhatsApp.",
  },
];

const HowItWorks = () => (
  <section className="py-16 sm:py-24 bg-secondary/30">
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <h2 className="text-center text-2xl font-bold sm:text-3xl text-foreground">
        How it works
      </h2>
      <p className="mx-auto mt-3 max-w-lg text-center text-muted-foreground">
        Three steps to start selling online — no technical skills needed.
      </p>

      <div className="mt-12 grid gap-8 sm:grid-cols-3">
        {steps.map((step, i) => (
          <div key={i} className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-5">
              <step.icon className="h-8 w-8 text-primary" />
            </div>
            <div className="mb-1 text-sm font-bold text-primary">Step {i + 1}</div>
            <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
            <p className="mt-2 text-muted-foreground text-sm max-w-xs">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;
