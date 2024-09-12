import { useState } from "react";
import { useQuery } from "@apollo/client";
import styled from "@emotion/styled";
import Banner from "@leafygreen-ui/banner";
import Checkbox from "@leafygreen-ui/checkbox";
import { ListSkeleton } from "@leafygreen-ui/skeleton-loader";
import { Body, H2 } from "@leafygreen-ui/typography";
import pluralize from "pluralize";
import { Unpacked } from "@evg-ui/lib/types/utils";
import { Accordion } from "components/Accordion";
import { StyledRouterLink } from "components/styles";
import TaskStatusBadge from "components/TaskStatusBadge";
import { getTaskRoute } from "constants/routes";
import { failedTaskStatuses } from "constants/task";
import { size } from "constants/tokens";
import {
  TestAnalysisQuery,
  TestAnalysisQueryVariables,
} from "gql/generated/types";
import { TEST_ANALYSIS } from "gql/queries";
import { TaskTab } from "types/task";

interface TestAnalysisProps {
  versionId: string;
}
export const TestAnalysis: React.FC<TestAnalysisProps> = ({ versionId }) => {
  const [onlyShowFailedOnMoreThanOneTask, setOnlyShowFailedOnMoreThanOneTask] =
    useState(false);
  const { data, loading } = useQuery<
    TestAnalysisQuery,
    TestAnalysisQueryVariables
  >(TEST_ANALYSIS, {
    variables: {
      versionId,
      options: {
        statuses: failedTaskStatuses,
      },
      opts: {
        statuses: ["fail"],
      },
    },
  });

  const groupedTestsMap = data
    ? groupTestsByName(data?.version?.tasks?.data)
    : new Map<string, TaskBuildVariantField[]>();

  const groupedTestsMapEntries = Array.from(groupedTestsMap.entries());
  const testsThatFailedAcrossMoreThanOneTask = groupedTestsMapEntries.filter(
    ([_, tasks]) => tasks.length > 1,
  );

  return (
    <div>
      {loading ? (
        <ListSkeleton />
      ) : (
        <div>
          <H2>
            {testsThatFailedAcrossMoreThanOneTask.length} tests failed across
            more than one task
          </H2>
          <Banner variant="info">
            This page shows tests that failed across more than one task. If a
            test failed on multiple tasks, it may indicate a flaky test or a
            larger issue. Click on the test name to see more details.
          </Banner>
          <Checkbox
            checked={onlyShowFailedOnMoreThanOneTask}
            data-cy="only-show-multi-task-failure-checkbox"
            label="Only show tests that failed on more than one task"
            onChange={(e) =>
              setOnlyShowFailedOnMoreThanOneTask(e.target.checked)
            }
          />
          {/* Iterate through groupedTestsMap and print the test name followed by the length of value */}
          {(onlyShowFailedOnMoreThanOneTask
            ? testsThatFailedAcrossMoreThanOneTask
            : groupedTestsMapEntries
          ).map(([test, tasks]) => (
            <SpacedDiv key={test}>
              <Accordion
                title={
                  <Body>
                    <b>{test}</b> failed on{" "}
                    <b>
                      {tasks.length} {pluralize("task", tasks.length)}
                    </b>
                  </Body>
                }
              >
                <ul>
                  {tasks.map((task) => (
                    <li key={task.id}>
                      <StyledRouterLink
                        to={getTaskRoute(task.id, { tab: TaskTab.Tests })}
                      >
                        {task.taskName} - {task.buildVariant}
                      </StyledRouterLink>
                      <TaskStatusBadge status={task.status} />
                    </li>
                  ))}
                </ul>
              </Accordion>
            </SpacedDiv>
          ))}
        </div>
      )}
    </div>
  );
};
type TestAnalysisQueryTasks = TestAnalysisQuery["version"]["tasks"]["data"];
type TaskBuildVariantField = {
  taskName: string;
  buildVariant: string;
  id: string;
  status: string;
};
const groupTestsByName = (tasks: TestAnalysisQueryTasks) => {
  const testMap = new Map<string, TaskBuildVariantField[]>();
  tasks.forEach((task) => {
    const tests = getTestsInTask(task.tests);
    tests.forEach((test) => {
      if (testMap.has(test)) {
        testMap.get(test)?.push({
          taskName: task.displayName,
          buildVariant: task.buildVariant,
          id: task.id,
          status: task.status,
        });
      } else {
        testMap.set(test, [
          {
            taskName: task.displayName,
            buildVariant: task.buildVariant,
            id: task.id,
            status: task.status,
          },
        ]);
      }
    });
  });
  console.log({ testMap, tasks });
  return testMap;
};

const getTestsInTask = (tests: Unpacked<TestAnalysisQueryTasks>["tests"]) =>
  tests.testResults.map((test) => test.testFile);

const SpacedDiv = styled.div`
  margin-top: ${size.s};
`;
