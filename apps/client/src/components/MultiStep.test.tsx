import { render, screen } from "@testing-library/react";
import MultiStep, { StepType } from "./MultiStep";
import userEvent from "@testing-library/user-event";

describe("MultiStep.tsx (unit)", () => {
  const steps: StepType[] = [
    {
      name: "step 1",
      render: ({ next, previous, stepIndex }) => (
        <div>
          <button onClick={previous}>Previous</button>
          <p>Step {stepIndex + 1}</p>
          <button onClick={next}>Next</button>
        </div>
      ),
    },
    {
      name: "step 2",
      render: ({ previous, next, stepIndex }) => (
        <div>
          <button onClick={previous}>Previous</button>
          <p>Step {stepIndex + 1}</p>
          <button onClick={next}>Next</button>
        </div>
      ),
    },
  ];

  it("moves to next step", async () => {
    render(<MultiStep steps={steps} />);

    const nextBtn = screen.getByRole("button", { name: /next/i });

    await userEvent.click(nextBtn);

    expect(screen.getByText("Step 2")).toBeInTheDocument();
  });

  it("remains at last step if next button is clicked", async () => {
    render(<MultiStep steps={steps} />);

    await userEvent.click(screen.getByRole("button", { name: /next/i }));

    await userEvent.click(screen.getByRole("button", { name: /next/i }));

    expect(screen.getByText("Step 2")).toBeInTheDocument();
  });

  it("moves to previous step", async () => {
    render(<MultiStep steps={steps} />);

    await userEvent.click(screen.getByRole("button", { name: /next/i }));

    await userEvent.click(screen.getByRole("button", { name: /previous/i }));

    expect(screen.getByText("Step 1")).toBeInTheDocument();
  });

  it("remains at first step if previous button is clicked", async () => {
    render(<MultiStep steps={steps} />);

    await userEvent.click(screen.getByRole("button", { name: /previous/i }));

    expect(screen.getByText("Step 1")).toBeInTheDocument();
  });
});
