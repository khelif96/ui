import { MockedProvider } from "@apollo/client/testing";
import { MemoryRouter } from "react-router-dom";
import { RenderFakeToastContext as InitializeFakeToastContext } from "@evg-ui/lib/context/toast/__mocks__";
import { renderHook, waitFor } from "@evg-ui/lib/test_utils";
import { LogTypes } from "constants/enums";
import { LogContextProvider } from "context/LogContext";
import { Task } from "gql/generated/types";
import { parsleySettingsMock } from "test_data/parsleySettings";
import { evergreenTaskMock, logkeeperMetadataMock } from "test_data/task";
import { useTaskQuery } from ".";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MockedProvider
    mocks={[parsleySettingsMock, evergreenTaskMock, logkeeperMetadataMock]}
  >
    <MemoryRouter initialEntries={["/"]}>
      <LogContextProvider initialLogLines={[]}>{children}</LogContextProvider>
    </MemoryRouter>
  </MockedProvider>
);

describe("useTaskQuery", () => {
  beforeEach(() => {
    InitializeFakeToastContext();
  });
  it("should be able to fetch task corresponding to evergreen task logs", async () => {
    const { result } = renderHook(
      () =>
        useTaskQuery({
          execution: 0,
          logType: LogTypes.EVERGREEN_TASK_LOGS,
          taskID:
            "spruce_ubuntu1604_check_codegen_d54e2c6ede60e004c48d3c4d996c59579c7bbd1f_22_03_02_15_41_35",
        }),
      {
        wrapper,
      },
    );
    await waitFor(() => {
      expect(result.current.task).toMatchObject(
        evergreenTaskMock?.result?.data?.task as Task,
      );
    });
  });

  it("should be able to fetch task corresponding to resmoke logs", async () => {
    const { result } = renderHook(
      () =>
        useTaskQuery({
          buildID: "7e208050e166b1a9025c817b67eee48d",
          logType: LogTypes.LOGKEEPER_LOGS,
        }),
      {
        wrapper,
      },
    );
    await waitFor(() => {
      expect(result.current.task).toMatchObject(
        logkeeperMetadataMock?.result?.data?.logkeeperBuildMetadata
          ?.task as Task,
      );
    });
  });
});
