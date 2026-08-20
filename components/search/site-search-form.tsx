import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SiteSearchFormProps = {
  initialQuery?: string;
  compact?: boolean;
};

export function SiteSearchForm({
  initialQuery = "",
  compact = false
}: SiteSearchFormProps) {
  return (
    <form
      action="/recherche"
      method="get"
      role="search"
      className="flex w-full gap-2"
    >
      <label
        htmlFor={compact ? "site-search-compact" : "site-search"}
        className="sr-only"
      >
        Rechercher des formations, services et ressources
      </label>
      <Input
        id={compact ? "site-search-compact" : "site-search"}
        name="q"
        type="search"
        defaultValue={initialQuery}
        maxLength={160}
        autoComplete="off"
        placeholder="Ex. Excel, boutique en ligne, cybersécurité…"
        className={compact ? "h-10" : "h-12"}
      />
      <Button type="submit" size={compact ? "sm" : "lg"}>
        <Search aria-hidden="true" className="h-4 w-4" />
        <span className={compact ? "sr-only" : "ml-2"}>Rechercher</span>
      </Button>
    </form>
  );
}
