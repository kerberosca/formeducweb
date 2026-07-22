"use client";

export function PrintButton() {
  return <button className="button print-button" type="button" onClick={() => window.print()}>Imprimer ou enregistrer en PDF</button>;
}

