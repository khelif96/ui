import {
  renderWithRouterMatch as render,
  screen,
  userEvent,
  waitFor,
} from "@evg-ui/lib/test_utils";
import { trimStringFromMiddle } from "@evg-ui/lib/utils/string";
import Breadcrumbs from ".";

describe("breadcrumbs", () => {
  it("should render an individual breadcrumb", () => {
    render(<Breadcrumbs breadcrumbs={[{ "data-cy": "bc", text: "test" }]} />);
    expect(screen.getByText("test")).toBeInTheDocument();
    expect(screen.queryByDataCy("breadcrumb-chevron")).not.toBeInTheDocument();
  });

  it("should render many breadcrumbs separated by chevrons", () => {
    const breadcrumbs = [
      { "data-cy": "bc-1", text: "test 1" },
      { "data-cy": "bc-2", text: "test 2" },
    ];
    render(<Breadcrumbs breadcrumbs={breadcrumbs} />);
    expect(screen.getByText("test 1")).toBeInTheDocument();
    expect(screen.getByText("test 2")).toBeInTheDocument();
    expect(screen.queryAllByDataCy("breadcrumb-chevron")).toHaveLength(1);
  });

  it("breadcrumbs with long text should be collapsed to 30 characters by default and viewable with a tooltip", async () => {
    const user = userEvent.setup();
    const longMessage = "some really long string that could be a patch title";
    const breadcrumbs = [{ "data-cy": "bc", text: longMessage }];
    render(<Breadcrumbs breadcrumbs={breadcrumbs} />);
    expect(screen.queryByText(longMessage)).not.toBeInTheDocument();

    expect(
      screen.getByText(trimStringFromMiddle(longMessage, 30)),
    ).toBeInTheDocument();
    await user.hover(screen.getByText(trimStringFromMiddle(longMessage, 30)));
    await waitFor(() => {
      expect(screen.getByDataCy("breadcrumb-tooltip")).toBeInTheDocument();
    });
    expect(screen.getByText(longMessage)).toBeInTheDocument();
  });

  it("should be able to specify a custom trimLength", async () => {
    const user = userEvent.setup();
    const longMessage = "some really long string that could be a patch title";
    const breadcrumbs = [
      { "data-cy": "bc", text: longMessage, trimLength: 25 },
    ];
    render(<Breadcrumbs breadcrumbs={breadcrumbs} />);
    expect(screen.queryByText(longMessage)).not.toBeInTheDocument();

    expect(
      screen.getByText(trimStringFromMiddle(longMessage, 25)),
    ).toBeInTheDocument();
    await user.hover(screen.getByText(trimStringFromMiddle(longMessage, 25)));
    await waitFor(() => {
      expect(screen.getByDataCy("breadcrumb-tooltip")).toBeInTheDocument();
    });
    expect(screen.getByText(longMessage)).toBeInTheDocument();
  });

  it("should not display a tooltip if the text is short", async () => {
    const user = userEvent.setup();
    const shortMessage = "short";
    const breadcrumbs = [{ "data-cy": "bc", text: shortMessage }];
    render(<Breadcrumbs breadcrumbs={breadcrumbs} />);
    expect(screen.getByText(shortMessage)).toBeInTheDocument();
    await user.hover(screen.getByText(shortMessage));
    await waitFor(() => {
      expect(
        screen.queryByDataCy("breadcrumb-tooltip"),
      ).not.toBeInTheDocument();
    });
  });

  it("clicking on a tooltip with a link and event handler should call the event", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const breadcrumbs = [{ "data-cy": "bc", onClick, text: "test", to: "/" }];
    render(<Breadcrumbs breadcrumbs={breadcrumbs} />);
    expect(screen.getByText("test")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/");
    await user.click(screen.getByText("test"));
    await waitFor(() => {
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  it("uses tooltip text if specified", async () => {
    const user = userEvent.setup();
    const breadcrumbs = [
      {
        "data-cy": "bc",
        text: "My Breadcrumb",
        tooltipText: "My Tooltip Text",
      },
    ];
    render(<Breadcrumbs breadcrumbs={breadcrumbs} />);
    expect(screen.getByText("My Breadcrumb")).toBeInTheDocument();
    expect(screen.queryByText("My Tooltip Text")).not.toBeInTheDocument();
    await user.hover(screen.getByText("My Breadcrumb"));
    await waitFor(() => {
      expect(screen.getByText("My Tooltip Text")).toBeVisible();
    });
  });
});
