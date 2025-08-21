import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface Step {
  id: string;
  name: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: string;
}

export function Stepper({ steps, currentStep }: StepperProps) {
  const currentStepIndex = steps.findIndex((step) => step.id === currentStep);

  return (
    <nav aria-label="Progress">
      <ol role="list" className="space-y-4">
        {steps.map((step, stepIdx) => (
          <li key={step.name} className="relative">
            {stepIdx < currentStepIndex ? (
              // Completed step
              <div className="group flex items-center w-full">
                <span className="flex items-center px-4 py-2 text-sm font-medium">
                  <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-primary rounded-full group-hover:bg-primary/90">
                    <Check className="w-5 h-5 text-primary-foreground" />
                  </span>
                  <span className="ml-4 text-sm font-medium text-foreground">
                    {step.name}
                  </span>
                </span>
              </div>
            ) : stepIdx === currentStepIndex ? (
              // Current step
              <div
                className="flex items-center px-4 py-2 text-sm font-medium bg-primary/20 border border-primary/50 rounded-lg"
                aria-current="step"
              >
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center border-2 border-primary rounded-full">
                  <span className="text-primary">{`0${stepIdx + 1}`}</span>
                </span>
                <span className="ml-4 text-sm font-medium text-primary-foreground">
                  {step.name}
                </span>
              </div>
            ) : (
              // Upcoming step
              <div className="group flex items-center w-full">
                <span className="flex items-center px-4 py-2 text-sm font-medium">
                  <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center border-2 border-muted-foreground/50 rounded-full group-hover:border-muted-foreground">
                    <span className="text-muted-foreground group-hover:text-foreground">
                      {`0${stepIdx + 1}`}
                    </span>
                  </span>
                  <span className="ml-4 text-sm font-medium text-muted-foreground group-hover:text-foreground">
                    {step.name}
                  </span>
                </span>
              </div>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
