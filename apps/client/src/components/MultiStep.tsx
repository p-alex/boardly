import { useState } from "react";

export type StepType = {
  name: string;
  render: (provided: {
    stepIndex: number;
    next: () => void;
    previous: () => void;
  }) => React.ReactNode;
};

interface Props {
  steps: StepType[];
}

function MultiStep(props: Props) {
  const [stepIndex, setStepIndex] = useState(0);

  const next = () => {
    if (stepIndex + 1 > props.steps.length - 1) return;
    setStepIndex((prev) => prev + 1);
  };

  const previous = () => {
    if (stepIndex - 1 < 0) return;
    setStepIndex((prev) => prev - 1);
  };

  return props.steps[stepIndex].render({ stepIndex, next, previous });
}

export default MultiStep;
