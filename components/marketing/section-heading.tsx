import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  /** Utiliser h1 pour la page principale (SEO) ; défaut h2 pour les sections internes */
  titleLevel?: "h1" | "h2";
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  titleLevel = "h2"
}: SectionHeadingProps) {
  const TitleTag = titleLevel === "h1" ? "h1" : "h2";
  return (
    <div className={cn("space-y-4", align === "center" && "mx-auto max-w-2xl text-center")}>
      {eyebrow ? (
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary/70">{eyebrow}</p>
      ) : null}
      <TitleTag className="font-heading text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
        {title}
      </TitleTag>
      {description ? <p className="text-lg leading-8 text-muted-foreground">{description}</p> : null}
    </div>
  );
}
