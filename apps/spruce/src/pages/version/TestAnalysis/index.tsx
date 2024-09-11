import { useQuery } from "@apollo/client";
import styled from "@emotion/styled";
import { ListSkeleton } from "@leafygreen-ui/skeleton-loader";
import pluralize from "pluralize";
import { Unpacked } from "@evg-ui/lib/types/utils";
import { Accordion } from "components/Accordion";
import { StyledRouterLink } from "components/styles";
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

  const testsThatFailedAcrossMoreThanOneTask = Array.from(
    groupedTestsMap.entries(),
  ).filter(([_, tasks]) => tasks.length > 1);

  return (
    <div>
      <h1>Test Analysis</h1>
      {loading ? (
        <ListSkeleton />
      ) : (
        <pre>
          <h2>
            {testsThatFailedAcrossMoreThanOneTask.length} tests failed across
            more than one task
          </h2>
          {/* Iterate through groupedTestsMap and print the test name followed by the length of value */}
          {Array.from(groupedTestsMap.entries()).map(([test, tasks]) => (
            <SpacedDiv key={test}>
              <Accordion
                title={
                  <span>
                    <b>{test}</b> failed on{" "}
                    <b>
                      {tasks.length} {pluralize("task", tasks.length)}
                    </b>
                  </span>
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
                    </li>
                  ))}
                </ul>
              </Accordion>
            </SpacedDiv>
          ))}
        </pre>
      )}
    </div>
  );
};
type TestAnalysisQueryTasks = TestAnalysisQuery["version"]["tasks"]["data"];
type TaskBuildVariantField = {
  taskName: string;
  buildVariant: string;
  id: string;
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
        });
      } else {
        testMap.set(test, [
          {
            taskName: task.displayName,
            buildVariant: task.buildVariant,
            id: task.id,
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
