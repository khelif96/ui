import { forwardRef } from "react";
import { render, screen, fireEvent } from "test_utils";
import AnimatedIcon from ".";

// Mock an SVG component to be passed as the icon prop
const MockIcon = forwardRef<SVGSVGElement>((props, ref) => (
  <svg ref={ref} data-cy="test-svg" {...props} />
));
MockIcon.displayName = "MockIcon";

describe("AnimatedIcon", () => {
  it("renders the icon correctly", () => {
    render(<AnimatedIcon icon={MockIcon} />);
    const svgElement = screen.getByDataCy("test-svg");
    expect(svgElement).toBeInTheDocument();
  });

  it("pauses animations by default on page load", () => {
    const pauseAnimationsMock = vi.fn();
    const unpauseAnimationsMock = vi.fn();

    // Mock the SVG's pauseAnimations and unpauseAnimations methods
    const MockIconWithAnimations = forwardRef<SVGSVGElement>((props, ref) => (
      <svg
        ref={(el) => {
          if (el) {
            el.pauseAnimations = pauseAnimationsMock;
            el.unpauseAnimations = unpauseAnimationsMock;
            if (typeof ref === "function") ref(el);
            else if (ref) ref.current = el;
          }
        }}
        {...props}
      >
        <animate />
      </svg>
    ));
    MockIconWithAnimations.displayName = "MockIconWithAnimations";

    render(<AnimatedIcon icon={MockIconWithAnimations} />);
    expect(pauseAnimationsMock).toHaveBeenCalled();
    expect(unpauseAnimationsMock).not.toHaveBeenCalled();
  });

  it("unpauses animations on mouse enter and pauses them again on mouse leave", () => {
    const pauseAnimationsMock = vi.fn();
    const unpauseAnimationsMock = vi.fn();

    const MockIconWithAnimations = forwardRef<SVGSVGElement>((props, ref) => (
      <svg
        ref={(el) => {
          if (el) {
            el.pauseAnimations = pauseAnimationsMock;
            el.unpauseAnimations = unpauseAnimationsMock;
            if (typeof ref === "function") ref(el);
            else if (ref) ref.current = el;
          }
        }}
        data-cy="test-svg"
        {...props}
      >
        <animate />
      </svg>
    ));
    MockIconWithAnimations.displayName = "MockIconWithAnimations";

    render(<AnimatedIcon icon={MockIconWithAnimations} />);

    const svgElement = screen.getByDataCy("test-svg");

    // Mouse enter triggers unpauseAnimations
    fireEvent.mouseEnter(svgElement);
    expect(unpauseAnimationsMock).toHaveBeenCalled();

    // Mouse leave triggers pauseAnimations
    fireEvent.mouseLeave(svgElement);
    expect(pauseAnimationsMock).toHaveBeenCalled();
  });
});
