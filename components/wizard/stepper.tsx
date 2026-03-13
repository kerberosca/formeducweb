type StepperStep = {
  id: string;
  title: string;
};

type WizardStepperProps = {
  steps: StepperStep[];
  currentStepIndex: number;
};

export function WizardStepper({ steps, currentStepIndex }: WizardStepperProps) {
  return (
    <nav aria-label="Progression du questionnaire" className="rounded-[28px] border border-border/70 bg-white/80 p-6">
      <ol className="space-y-4">
        {steps.map((step, index) => {
          const isActive = index === currentStepIndex;
          const isCompleted = index < currentStepIndex;

          return (
            <li key={step.id} className="flex items-center gap-4" aria-current={isActive ? "step" : undefined}>
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : isCompleted
                      ? "bg-primary/15 text-primary"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {index + 1}
              </span>
              <div>
                <p className={`text-sm font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}>{step.title}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
