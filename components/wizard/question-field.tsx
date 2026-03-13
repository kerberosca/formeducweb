import type { WizardQuestionWithMeta } from "@/lib/wizard";

type QuestionFieldProps = {
  question: WizardQuestionWithMeta;
  value?: string;
  error?: string;
  onChange: (value: string) => void;
};

export function QuestionField({ question, value, error, onChange }: QuestionFieldProps) {
  return (
    <fieldset className="space-y-4 rounded-[28px] border border-border/70 bg-white/85 p-6">
      <legend className="mb-4 block text-lg font-semibold text-foreground">{question.title}</legend>
      <div className="grid gap-3">
        {question.options?.map((option) => {
          const checked = value === option.value;

          return (
            <label
              key={option.value}
              className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-4 text-sm transition ${
                checked
                  ? "border-primary bg-primary/8 text-foreground"
                  : "border-border/80 bg-background hover:border-primary/30 hover:bg-primary/5"
              }`}
            >
              <input
                type="radio"
                name={question.id}
                value={option.value}
                checked={checked}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              <span
                aria-hidden="true"
                className={`mt-1 h-4 w-4 rounded-full border ${checked ? "border-primary bg-primary" : "border-border"}`}
              />
              <span className="leading-6">{option.label}</span>
            </label>
          );
        })}
      </div>
      {question.helpText ? <p className="text-sm leading-6 text-muted-foreground">{question.helpText}</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </fieldset>
  );
}
