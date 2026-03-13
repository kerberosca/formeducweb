import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
};

export function SectionHeading({ eyebrow, title, description, align = "left" }: SectionHeadingProps) {
  return (
    <div className={cn("space-y-4", align === "center" && "mx-auto max-w-2xl text-center")}>
      {eyebrow ? (
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary/70">{eyebrow}</p>
      ) : null}
      <h2 className="font-heading text-3xl font-semibold tracking-tight text-foreground md:text-4xl">{title}</h2>
      {description ? <p className="text-lg leading-8 text-muted-foreground">{description}</p> : null}
    </div>
  );
}
