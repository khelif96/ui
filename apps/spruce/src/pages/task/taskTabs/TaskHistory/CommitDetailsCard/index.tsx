import { useMutation } from "@apollo/client";
import styled from "@emotion/styled";
import Badge, { Variant as BadgeVariant } from "@leafygreen-ui/badge";
import Button, { Size as ButtonSize } from "@leafygreen-ui/button";
import IconButton from "@leafygreen-ui/icon-button";
import { palette } from "@leafygreen-ui/palette";
import { InlineCode } from "@leafygreen-ui/typography";
import { Link } from "react-router-dom";
import Accordion, {
  AccordionCaretAlign,
} from "@evg-ui/lib/components/Accordion";
import Icon from "@evg-ui/lib/components/Icon";
import { size } from "@evg-ui/lib/constants/tokens";
import { useToastContext } from "@evg-ui/lib/context/toast";
import { TaskStatus } from "@evg-ui/lib/types/task";
import { shortenGithash } from "@evg-ui/lib/utils/string";
import { useTaskHistoryAnalytics } from "analytics";
import { inactiveElementStyle } from "components/styles";
import { statusColorMap } from "components/TaskBox";
import { getGithubCommitUrl } from "constants/externalResources";
import { getTaskRoute } from "constants/routes";
import {
  RestartTaskMutation,
  RestartTaskMutationVariables,
  ScheduleTasksMutation,
  ScheduleTasksMutationVariables,
} from "gql/generated/types";
import { RESTART_TASK, SCHEDULE_TASKS } from "gql/mutations";
import { useDateFormat } from "hooks";
import { useQueryParam } from "hooks/useQueryParam";
import { isProduction } from "utils/environmentVariables";
import { TaskHistoryTask } from "../types";
import CommitDescription from "./CommitDescription";
import FailedTestsTable from "./FailedTestsTable";

const { gray } = palette;

interface CommitDetailsCardProps {
  isCurrentTask: boolean;
  owner: string | undefined;
  repo: string | undefined;
  isMatching: boolean;
  task: TaskHistoryTask;
}

const CommitDetailsCard: React.FC<CommitDetailsCardProps> = ({
  isCurrentTask,
  isMatching,
  owner,
  repo,
  task,
}) => {
  const {
    activated,
    canRestart,
    canSchedule,
    createTime,
    displayStatus,
    id: taskId,
    order,
    revision,
    tests,
    versionMetadata,
  } = task;
  const { author, id: versionId, message } = versionMetadata;

  const { sendEvent } = useTaskHistoryAnalytics();

  const getDateCopy = useDateFormat();
  const createDate = new Date(createTime ?? "");
  const dateCopy = getDateCopy(createDate, {
    omitSeconds: true,
    omitTimezone: true,
  });

  const githubCommitUrl =
    owner && repo && revision ? getGithubCommitUrl(owner, repo, revision) : "";

  const [, setExecution] = useQueryParam("execution", 0);

  const dispatchToast = useToastContext();

  const [scheduleTask] = useMutation<
    ScheduleTasksMutation,
    ScheduleTasksMutationVariables
  >(SCHEDULE_TASKS, {
    variables: { taskIds: [task.id], versionId },
    onCompleted: () => {
      dispatchToast.success("Task scheduled to run");
    },
    onError: (err) => {
      dispatchToast.error(`Error scheduling task: ${err.message}`);
    },
    update: (cache) => {
      cache.modify({
        id: cache.identify(task),
        fields: {
          canSchedule: () => false,
          displayStatus: () => TaskStatus.WillRun,
          activated: () => true,
        },
        broadcast: true,
      });
    },
  });

  const [restartTask] = useMutation<
    RestartTaskMutation,
    RestartTaskMutationVariables
  >(RESTART_TASK, {
    variables: { taskId, failedOnly: false },
    onCompleted: (data) => {
      dispatchToast.success("Task scheduled to restart");
      if (isCurrentTask) {
        const latestExecution = data?.restartTask.latestExecution ?? 0;
        setExecution(latestExecution);
      }
    },
    onError: (err) =>
      dispatchToast.error(`Error restarting task: ${err.message}`),
    update: (cache) => {
      if (!isCurrentTask) {
        cache.modify({
          id: cache.identify(task),
          fields: {
            canRestart: () => false,
            displayStatus: () => TaskStatus.WillRun,
            execution: (cachedExecution: number) => cachedExecution + 1,
          },
          broadcast: false,
        });
      }
    },
    // Only re-request if the current task is restarted. This should be relatively
    // uncommon.
    refetchQueries: [isCurrentTask ? "TaskHistory" : ""],
  });

  return (
    <CommitCard
      key={taskId}
      data-cy="commit-details-card"
      isMatching={isMatching}
      status={displayStatus as TaskStatus}
    >
      <TopLabel>
        <InlineCode as={Link} data-cy="task-link" to={getTaskRoute(taskId)}>
          {shortenGithash(revision ?? "")}
        </InlineCode>
        <IconButton
          aria-label="GitHub Commit Link"
          data-cy="github-link"
          href={githubCommitUrl}
          target="__blank"
        >
          <Icon glyph="GitHub" />
        </IconButton>
        {activated ? (
          <Button
            data-cy="restart-button"
            disabled={!canRestart}
            onClick={() => {
              restartTask();
              sendEvent({
                name: "Clicked restart task button",
                "task.id": task.id,
              });
            }}
            size={ButtonSize.XSmall}
          >
            Restart Task
          </Button>
        ) : (
          <Button
            data-cy="schedule-button"
            disabled={!canSchedule}
            onClick={() => {
              scheduleTask();
              sendEvent({
                name: "Clicked schedule task button",
                "task.id": task.id,
              });
            }}
            size={ButtonSize.XSmall}
          >
            Schedule Task
          </Button>
        )}
        {isCurrentTask && (
          <Badge data-cy="this-task-badge" variant={BadgeVariant.Blue}>
            This Task
          </Badge>
        )}
        <span>{dateCopy}</span>
        {/* Use this to debug issues with pagination. */}
        {!isProduction() && <OrderLabel>Order: {order}</OrderLabel>}
      </TopLabel>
      {tests.testResults.length > 0 ? (
        <Accordion
          caretAlign={AccordionCaretAlign.Start}
          onToggle={({ isVisible }) =>
            sendEvent({ name: "Toggled failed tests table", open: isVisible })
          }
          title={<CommitDescription author={author} message={message} />}
        >
          <FailedTestsTable tests={tests} />
        </Accordion>
      ) : (
        <CommitDescription author={author} message={message} />
      )}
    </CommitCard>
  );
};

export default CommitDetailsCard;

const CommitCard = styled.div<{
  status: TaskStatus;
  isMatching: boolean;
}>`
  display: flex;
  flex-direction: column;
  gap: ${size.xs};

  padding: ${size.xs};
  border-radius: ${size.xs};
  border: 1px solid ${gray.light2};

  ${({ status }) => `border-left: ${size.xs} solid ${statusColorMap[status]};`}

  ${({ isMatching }) => !isMatching && inactiveElementStyle}
`;

const TopLabel = styled.div`
  display: flex;
  align-items: center;
  gap: ${size.xxs};
`;

const OrderLabel = styled.div`
  margin-left: auto;
`;
