"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

type CopySnippetButtonProps = {
  value: string;
};

export function CopySnippetButton({ value }: CopySnippetButtonProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setIsCopied(true);
      toast.success("Le texte a été copié.");
      window.setTimeout(() => setIsCopied(false), 1800);
    } catch (error) {
      console.error("Copy snippet error", error);
      toast.error("Impossible de copier le texte pour le moment.");
    }
  };

  return (
    <Button type="button" variant="secondary" onClick={handleCopy}>
      <Copy className="mr-2 h-4 w-4" />
      {isCopied ? "Copié" : "Copier le texte"}
    </Button>
  );
}
