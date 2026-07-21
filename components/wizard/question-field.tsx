import type { WizardQuestionWithMeta } from "@/lib/wizard";

type QuestionFieldProps = {
  question: WizardQuestionWithMeta;
  value?: string;
  error?: string;
  onChange: (value: string) => void;
};

export function QuestionField({
  question,
  value,
  error,
  onChange
}: QuestionFieldProps) {
  const helpId = question.helpText ? `${question.id}-help` : undefined;
  const errorId = error ? `${question.id}-error` : undefined;
  const describedBy = [helpId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <fieldset
      id={`question-${question.id}`}
      tabIndex={-1}
      aria-invalid={Boolean(error)}
      aria-describedby={describedBy}
      className="space-y-4 rounded-[28px] border border-border/70 bg-white/85 p-6 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <legend className="mb-4 block text-lg font-semibold text-foreground">
        {question.title}
      </legend>
      <div className="grid gap-3">
        {question.options?.map((option) => {
          const checked = value === option.value;

          return (
            <label
              key={option.value}
              className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-4 text-sm transition focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 ${
                checked
                  ? "bg-primary/8 border-primary text-foreground"
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
      {question.helpText ? (
        <p id={helpId} className="text-sm leading-6 text-muted-foreground">
          {question.helpText}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
