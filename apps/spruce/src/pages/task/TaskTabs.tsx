import { useState, useEffect } from "react";
import { Tab } from "@leafygreen-ui/tabs";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { usePrevious } from "@evg-ui/lib/hooks";
import { useTaskAnalytics } from "analytics";
import { TrendChartsPlugin } from "components/PerfPlugin";
import { StyledTabs } from "components/styles/StyledTabs";
import { TabLabelWithBadge } from "components/TabLabelWithBadge";
import { isMainlineRequester, Requester } from "constants/requesters";
import { getTaskRoute, GetTaskRouteOptions, slugs } from "constants/routes";
import { TaskQuery } from "gql/generated/types";
import { useTabShortcut } from "hooks/useTabShortcut";
import { TaskTab } from "types/task";
import { queryString } from "utils";
import { BuildBaron } from "./taskTabs/buildBaron";
import { useBuildBaronVariables } from "./taskTabs/buildBaronAndAnnotations";
import { ExecutionTasksTable } from "./taskTabs/ExecutionTasksTable";
import FileTable from "./taskTabs/FileTable";
import { Logs } from "./taskTabs/Logs";
import TaskHistory from "./taskTabs/TaskHistory";
import { TestsTable } from "./taskTabs/TestsTable";

const { parseQueryString } = queryString;
interface TaskTabProps {
  isDisplayTask: boolean;
  task: NonNullable<TaskQuery["task"]>;
}
export const TaskTabs: React.FC<TaskTabProps> = ({ isDisplayTask, task }) => {
  const { [slugs.tab]: urlTab } = useParams<{ [slugs.tab]: TaskTab }>();

  const navigate = useNavigate();
  const location = useLocation();
  const taskAnalytics = useTaskAnalytics();
  const {
    annotation,
    canModifyAnnotation,
    displayStatus,
    execution,
    executionTasksFull,
    failedTestCount,
    files,
    id,
    isPerfPluginEnabled,
    logs: logLinks,
    requester,
    totalTestCount,
    versionMetadata,
  } = task ?? {};
  const { fileCount } = files ?? {};

  const { showBuildBaron } = useBuildBaronVariables({
    task: {
      id,
      execution,
      status: displayStatus,
      canModifyAnnotation,
      hasAnnotation: !!annotation,
    },
  });

  const tabMap = {
    [TaskTab.Logs]: (
      <Tab key="task-logs-tab" data-cy="task-logs-tab" name="Logs">
        <Logs execution={execution} logLinks={logLinks} taskId={id} />
      </Tab>
    ),
    [TaskTab.Tests]: (
      <Tab
        key="task-tests-tab"
        data-cy="task-tests-tab"
        name={
          <span>
            {failedTestCount ? (
              <TabLabelWithBadge
                badgeText={failedTestCount}
                badgeVariant="red"
                dataCyBadge="tests-tab-badge"
                tabLabel="Tests"
              />
            ) : (
              "Tests"
            )}
          </span>
        }
      >
        <TestsTable task={task} />
      </Tab>
    ),
    [TaskTab.ExecutionTasks]: (
      <Tab
        key="execution-tasks-tab"
        data-cy="task-execution-tab"
        name="Execution Tasks"
      >
        <ExecutionTasksTable
          execution={execution}
          executionTasksFull={executionTasksFull}
          isPatch={versionMetadata?.isPatch}
        />
      </Tab>
    ),
    [TaskTab.Files]: (
      <Tab
        key="task-files-tab"
        data-cy="task-files-tab"
        name={
          <span>
            {fileCount !== undefined ? (
              <TabLabelWithBadge
                badgeText={fileCount}
                badgeVariant="lightgray"
                dataCyBadge="files-tab-badge"
                tabLabel="Files"
              />
            ) : (
              "Files"
            )}
          </span>
        }
      >
        <FileTable execution={execution} taskId={id} />
      </Tab>
    ),
    [TaskTab.Annotations]: (
      <Tab
        key="task-build-baron-tab"
        data-cy="task-build-baron-tab"
        name="Failure Details"
      >
        <BuildBaron
          // @ts-expect-error: FIXME. This comment was added by an automated script.
          annotation={annotation}
          execution={execution}
          taskId={id}
          userCanModify={canModifyAnnotation}
        />
      </Tab>
    ),
    [TaskTab.TrendCharts]: (
      <Tab
        key="trend-charts-tab"
        data-cy="trend-charts-tab"
        name="Trend Charts"
      >
        <TrendChartsPlugin taskId={id} />
      </Tab>
    ),
    [TaskTab.History]: (
      <Tab
        key="task-history-tab"
        data-cy="task-history-tab"
        name={
          <TabLabelWithBadge
            badgeText="Beta"
            badgeVariant="blue"
            tabLabel="Task History"
          />
        }
      >
        <TaskHistory task={task} />
      </Tab>
    ),
  };

  const tabIsActive = {
    [TaskTab.Logs]: !isDisplayTask,
    [TaskTab.ExecutionTasks]: isDisplayTask,
    [TaskTab.Tests]: true,
    [TaskTab.Files]: true,
    [TaskTab.Annotations]: showBuildBaron,
    [TaskTab.TrendCharts]: isPerfPluginEnabled,
    [TaskTab.History]: isMainlineRequester(requester as Requester),
  };

  const activeTabs = Object.keys(tabMap).filter(
    // @ts-expect-error: FIXME. This comment was added by an automated script.
    (tab) => tabIsActive[tab],
  ) as TaskTab[];

  let defaultTab = 0;
  if (urlTab && activeTabs.indexOf(urlTab) > -1) {
    defaultTab = activeTabs.indexOf(urlTab);
  } else if (isDisplayTask) {
    defaultTab = activeTabs.indexOf(TaskTab.ExecutionTasks);
  } else if (totalTestCount > 0) {
    defaultTab = activeTabs.indexOf(TaskTab.Tests);
  }
  const [selectedTab, setSelectedTab] = useState(defaultTab);
  // This is used to keep track of the first tab transition so we dont accidently trigger an analytics event for it
  const previousTab = usePrevious(selectedTab);

  useTabShortcut({
    currentTab: selectedTab,
    numTabs: activeTabs.length,
    setSelectedTab,
  });
  useEffect(() => {
    if (previousTab !== selectedTab) {
      const query = parseQueryString(location.search);
      const params: GetTaskRouteOptions = {
        ...query,
        tab: activeTabs[selectedTab],
      };

      // Introduce execution query parameter if none is set.
      if (
        id === task?.id &&
        query.execution === undefined &&
        task.latestExecution !== undefined
      ) {
        params.execution = task.latestExecution;
      }

      const newRoute = getTaskRoute(id, params);
      navigate(newRoute, { replace: true });

      if (previousTab !== undefined) {
        taskAnalytics.sendEvent({
          name: "Changed tab",
          tab: activeTabs[selectedTab],
        });
      }
    }
  }, [selectedTab]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <StyledTabs
      aria-label="Task Page Tabs"
      selected={selectedTab}
      setSelected={setSelectedTab}
    >
      {/* @ts-expect-error: FIXME. This comment was added by an automated script. */}
      {activeTabs.map((tab: string) => tabMap[tab])}
    </StyledTabs>
  );
};
