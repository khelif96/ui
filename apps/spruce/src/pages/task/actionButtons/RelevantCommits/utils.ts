import { reportError } from "@evg-ui/lib/utils/errorReporting";
import { getTaskRoute } from "constants/routes";
import { LastMainlineCommitQuery } from "gql/generated/types";
import { BaseTask, CommitTask, CommitType } from "./types";

// a link cannot be null, so it's common to use # as a substitute.
const nullLink = "#";

export const getLinks = ({
  breakingTask,
  lastExecutedTask,
  lastPassingTask,
  parentTask,
}: {
  breakingTask: BaseTask;
  lastExecutedTask: BaseTask;
  lastPassingTask: BaseTask;
  parentTask: BaseTask;
}) => {
  if (!parentTask) {
    return {
      [CommitType.Base]: nullLink,
      [CommitType.Breaking]: nullLink,
      [CommitType.LastPassing]: nullLink,
      [CommitType.LastExecuted]: nullLink,
    };
  }

  return {
    [CommitType.Base]: getTaskRoute(parentTask.id),
    [CommitType.Breaking]: breakingTask
      ? getTaskRoute(breakingTask.id)
      : nullLink,
    [CommitType.LastPassing]: getTaskRoute(
      lastPassingTask?.id || parentTask.id,
    ),
    [CommitType.LastExecuted]: getTaskRoute(
      lastExecutedTask?.id || parentTask.id,
    ),
  };
};

// The return value from GetLastMainlineCommitQuery has a lot of nested fields that may or may
// not exist. The logic to extract the task from it is written in this function.
export const getTaskFromMainlineCommitsQuery = (
  data: LastMainlineCommitQuery,
): CommitTask => {
  const buildVariants =
    // @ts-expect-error: FIXME. This comment was added by an automated script.
    data?.mainlineCommits.versions.find(({ version }) => version)?.version
      .buildVariants ?? [];
  if (buildVariants.length > 1) {
    reportError(
      new Error("Multiple build variants matched previous commit search."),
    ).warning();
  }
  // @ts-expect-error: FIXME. This comment was added by an automated script.
  if (buildVariants[0]?.tasks.length > 1) {
    reportError(
      new Error("Multiple tasks matched previous commit search."),
    ).warning();
  }
  // @ts-expect-error: FIXME. This comment was added by an automated script.
  return buildVariants[0]?.tasks[0];
};
