import { RenderFakeToastContext } from "@evg-ui/lib/context/toast/__mocks__";
import {
  renderWithRouterMatch as render,
  screen,
  userEvent,
  waitFor,
} from "@evg-ui/lib/test_utils";
import { ApolloMock } from "@evg-ui/lib/test_utils/types";
import { trimStringFromMiddle } from "@evg-ui/lib/utils/string";
import { ProviderWrapper } from "components/HistoryTable/hooks/test-utils";
import { taskHistoryMaxLength as maxLength } from "constants/history";
import {
  BuildVariantsForTaskNameQuery,
  BuildVariantsForTaskNameQueryVariables,
  BuildVariantTuple,
} from "gql/generated/types";
import { BUILD_VARIANTS_FOR_TASK_NAME } from "gql/queries";
import ColumnHeaders from ".";

const longVariantName =
  "really_really_really_really_really_really_long_variant_name";
const trimmedVariantName = trimStringFromMiddle(longVariantName, maxLength);

describe("columnHeaders (Task History)", () => {
  it("renders an initial skeleton for the 7 column headers when loading", async () => {
    const { Component } = RenderFakeToastContext(
      <ColumnHeaders projectIdentifier="evergreen" taskName="some_task" />,
    );
    render(<Component />, {
      route: "/task-history/evergreen/some_task",
      path: "/task-history/:projectId/:taskName",
      wrapper: ProviderWrapper,
    });
    await waitFor(() => {
      expect(screen.queryAllByDataCy("loading-header-cell")).toHaveLength(7);
    });
  });

  it("renders the column headers properly when not loading", async () => {
    const { Component } = RenderFakeToastContext(
      <ColumnHeaders projectIdentifier="evergreen" taskName="some_task" />,
    );

    render(<Component />, {
      route: "/task-history/evergreen/some_task",
      path: "/task-history/:projectId/:taskName",
      wrapper: ({ children }) =>
        ProviderWrapper({
          children,
          state: {
            visibleColumns: ["variant1", "variant2", "variant3"],
          },
          mocks: [
            mock([
              { displayName: "variant1", buildVariant: "variant1" },
              { displayName: "variant2", buildVariant: "variant2" },
              { displayName: "variant3", buildVariant: "variant3" },
            ]),
          ],
        }),
    });
    await waitFor(() => {
      expect(screen.queryAllByDataCy("loading-header-cell")).toHaveLength(0);
    });
    await waitFor(() => {
      expect(screen.queryAllByDataCy("header-cell")).toHaveLength(3);
    });
  });

  it("should not show more columns then the columnLimit", async () => {
    const { Component } = RenderFakeToastContext(
      <ColumnHeaders projectIdentifier="evergreen" taskName="some_task" />,
    );
    render(<Component />, {
      route: "/task-history/evergreen/some_task",
      path: "/task-history/:projectId/:taskName",
      wrapper: ({ children }) =>
        ProviderWrapper({
          children,
          state: {
            visibleColumns: ["variant1", "variant2", "variant3", "variant4"],
            columnLimit: 3,
          },
          mocks: [
            mock([
              { displayName: "variant1", buildVariant: "variant1" },
              { displayName: "variant2", buildVariant: "variant2" },
              { displayName: "variant3", buildVariant: "variant3" },
              { displayName: "variant4", buildVariant: "variant4" },
            ]),
          ],
        }),
    });
    await waitFor(() => {
      expect(screen.queryAllByDataCy("loading-header-cell")).toHaveLength(0);
    });
    await waitFor(() => {
      expect(screen.queryAllByDataCy("header-cell")).toHaveLength(3);
    });
  });

  it("should link to corresponding /variant-history/:projectId/:variantName page", async () => {
    const { Component } = RenderFakeToastContext(
      <ColumnHeaders projectIdentifier="evergreen" taskName="some_task" />,
    );
    render(<Component />, {
      route: "/task-history/evergreen/some_task",
      path: "/task-history/:projectId/:taskName",
      wrapper: ({ children }) =>
        ProviderWrapper({
          children,
          state: {
            visibleColumns: ["real-variant-name"],
          },
          mocks: [
            mock([
              {
                displayName: "variant1",
                buildVariant: "real-variant-name",
              },
            ]),
          ],
        }),
    });
    await waitFor(() => {
      expect(screen.queryAllByDataCy("loading-header-cell")).toHaveLength(0);
    });
    await waitFor(() => {
      expect(screen.queryAllByDataCy("header-cell")).toHaveLength(1);
    });
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/variant-history/evergreen/real-variant-name",
    );
  });

  it("should truncate the variant name only if it is too long", async () => {
    const { Component } = RenderFakeToastContext(
      <ColumnHeaders projectIdentifier="evergreen" taskName="some_task" />,
    );
    render(<Component />, {
      route: "/task-history/evergreen/some_task",
      path: "/task-history/:projectId/:taskName",
      wrapper: ({ children }) =>
        ProviderWrapper({
          children,
          state: {
            visibleColumns: [longVariantName, "variant2"],
          },
          mocks: [
            mock([
              {
                displayName: longVariantName,
                buildVariant: longVariantName,
              },
              { displayName: "variant2", buildVariant: "variant2" },
            ]),
          ],
        }),
    });
    await waitFor(() => {
      expect(screen.queryAllByDataCy("loading-header-cell")).toHaveLength(0);
    });
    await waitFor(() => {
      expect(screen.queryAllByDataCy("header-cell")).toHaveLength(2);
    });
    expect(screen.queryByText(longVariantName)).toBeNull();
    expect(screen.queryByText("variant2")).toBeVisible();
  });

  it("should show a tooltip with the full name when hovering over a truncated variant name", async () => {
    const user = userEvent.setup();
    const { Component } = RenderFakeToastContext(
      <ColumnHeaders projectIdentifier="evergreen" taskName="some_task" />,
    );
    render(<Component />, {
      route: "/task-history/evergreen/some_task",
      path: "/task-history/:projectId/:taskName",
      wrapper: ({ children }) =>
        ProviderWrapper({
          children,
          state: {
            visibleColumns: [longVariantName],
          },
          mocks: [
            mock([
              {
                displayName: longVariantName,
                buildVariant: longVariantName,
              },
            ]),
          ],
        }),
    });
    await waitFor(() => {
      expect(screen.queryAllByDataCy("loading-header-cell")).toHaveLength(0);
    });
    await waitFor(() => {
      expect(screen.queryAllByDataCy("header-cell")).toHaveLength(1);
    });

    expect(screen.queryByText(trimmedVariantName)).toBeVisible();
    await user.hover(screen.getByText(trimmedVariantName));
    await screen.findByText(longVariantName);
  });
});

const mock = (
  buildVariants: BuildVariantTuple[],
): ApolloMock<
  BuildVariantsForTaskNameQuery,
  BuildVariantsForTaskNameQueryVariables
> => ({
  request: {
    query: BUILD_VARIANTS_FOR_TASK_NAME,
    variables: {
      projectIdentifier: "evergreen",
      taskName: "some_task",
    },
  },
  result: {
    data: {
      buildVariantsForTaskName: buildVariants.map((bv) => ({
        __typename: "BuildVariantTuple",
        buildVariant: bv.buildVariant,
        displayName: bv.displayName,
      })),
    },
  },
});
