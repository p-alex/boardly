import { render, screen } from "@testing-library/react";
import App from "./App";

it("should find app", () => {
  render(<App />);

  const app = screen.getByText("app");

  expect(app).toBeInTheDocument();
});
