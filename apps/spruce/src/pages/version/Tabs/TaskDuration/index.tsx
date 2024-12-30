import { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import styled from "@emotion/styled";
import { useLocation } from "react-router-dom";
import { size } from "@evg-ui/lib/constants/tokens";
import { useToastContext } from "@evg-ui/lib/context/toast";
import { useVersionAnalytics } from "analytics";
import TableControl from "components/Table/TableControl";
import { DEFAULT_POLL_INTERVAL } from "constants/index";
import { PaginationQueryParams, TableQueryParams } from "constants/queryParams";
import {
  SortDirection,
  TaskSortCategory,
  VersionTaskDurationsQuery,
  VersionTaskDurationsQueryVariables,
} from "gql/generated/types";
import { VERSION_TASK_DURATIONS } from "gql/queries";
import { usePolling } from "hooks";
import { useQueryParams } from "hooks/useQueryParam";
import { PatchTasksQueryParams } from "types/task";
import { parseQueryString } from "utils/queryString";
import { useQueryVariables } from "../useQueryVariables";
import TaskDurationTable from "./TaskDurationTable";

interface Props {
  taskCount: number;
  versionId: string;
}
const TaskDuration: React.FC<Props> = ({ taskCount, versionId }) => {
  const dispatchToast = useToastContext();
  const { search } = useLocation();

  const [queryParams, setQueryParams] = useQueryParams();
  const versionAnalytics = useVersionAnalytics(versionId);
  const queryVariables = useQueryVariables(search, versionId);
  const hasQueryVariables = Object.keys(parseQueryString(search)).length > 0;
  const { limit, page } = queryVariables.taskFilterOptions;
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    setQueryParams({
      ...queryParams,
      [TableQueryParams.Sorts]: defaultSort,
    });
    setHasInitialized(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const clearQueryParams = () => {
    setQueryParams({
      ...queryParams,
      [PatchTasksQueryParams.TaskName]: undefined,
      [PatchTasksQueryParams.Variant]: undefined,
      [PatchTasksQueryParams.Statuses]: undefined,
      [PatchTasksQueryParams.BaseStatuses]: undefined,
      [PaginationQueryParams.Page]: undefined,
      [TableQueryParams.Sorts]: defaultSort,
    });
  };

  const { data, loading, refetch, startPolling, stopPolling } = useQuery<
    VersionTaskDurationsQuery,
    VersionTaskDurationsQueryVariables
  >(VERSION_TASK_DURATIONS, {
    variables: queryVariables,
    skip: !hasQueryVariables,
    pollInterval: DEFAULT_POLL_INTERVAL,
    onError: (err) => {
      dispatchToast.error(`Error fetching patch tasks ${err}`);
    },
  });
  usePolling({ startPolling, stopPolling, refetch });
  const { version } = data || {};
  const { tasks } = version || {};
  const { count = 0, data: tasksData = [] } = tasks || {};
  const shouldShowBottomTableControl = tasksData.length > 10;

  return (
    <>
      <TableControl
        filteredCount={count}
        label="tasks"
        // @ts-expect-error: FIXME. This comment was added by an automated script.
        limit={limit}
        onClear={clearQueryParams}
        onPageSizeChange={(l) => {
          versionAnalytics.sendEvent({
            name: "Changed page size",
            "page.size": l,
          });
        }}
        // @ts-expect-error: FIXME. This comment was added by an automated script.
        page={page}
        totalCount={taskCount}
      />
      {
        // Ensures that the TaskDurationTable initial sort
        // button states intialize with the correct default values.
        hasInitialized && (
          <TaskDurationTable
            loading={loading}
            // @ts-expect-error: FIXME. This comment was added by an automated script.
            numLoadingRows={limit}
            tasks={tasksData}
          />
        )
      }
      {shouldShowBottomTableControl && (
        <TableControlWrapper>
          <TableControl
            filteredCount={count}
            label="tasks"
            // @ts-expect-error: FIXME. This comment was added by an automated script.
            limit={limit}
            onClear={clearQueryParams}
            onPageSizeChange={(l) => {
              versionAnalytics.sendEvent({
                name: "Changed page size",
                "page.size": l,
              });
            }}
            // @ts-expect-error: FIXME. This comment was added by an automated script.
            page={page}
            totalCount={taskCount}
          />
        </TableControlWrapper>
      )}
    </>
  );
};
const TableControlWrapper = styled.div`
  padding-top: ${size.xs};
  margin-bottom: ${size.l};
`;

export default TaskDuration;

const defaultSort = `${TaskSortCategory.Duration}:${SortDirection.Desc}`;