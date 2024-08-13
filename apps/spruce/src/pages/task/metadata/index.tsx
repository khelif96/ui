import { useState, useRef } from "react";
import { ApolloError } from "@apollo/client";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { GuideCue } from "@leafygreen-ui/guide-cue";
import { palette } from "@leafygreen-ui/palette";
import { InlineCode } from "@leafygreen-ui/typography";
import Cookies from "js-cookie";
import { Link } from "react-router-dom";
import { useTaskAnalytics } from "analytics";
import ExpandedText from "components/ExpandedText";
import {
  MetadataCard,
  MetadataItem,
  MetadataTitle,
} from "components/MetadataCard";
import { StyledLink, StyledRouterLink } from "components/styles";
import { SEEN_HONEYCOMB_GUIDE_CUE } from "constants/cookies";
import {
  getHoneycombTraceUrl,
  getHoneycombSystemMetricsUrl,
} from "constants/externalResources";
import {
  getDistroSettingsRoute,
  getTaskQueueRoute,
  getTaskRoute,
  getHostRoute,
  getSpawnHostRoute,
  getVersionRoute,
  getProjectPatchesRoute,
  getPodRoute,
} from "constants/routes";
import { size, zIndex } from "constants/tokens";
import { TaskQuery } from "gql/generated/types";
import { useDateFormat } from "hooks";
import { TaskStatus } from "types/task";
import { string } from "utils";
import { isFailedTaskStatus } from "utils/statuses";
import { AbortMessage } from "./AbortMessage";
import { DependsOn } from "./DependsOn";
import ETATimer from "./ETATimer";
import RuntimeTimer from "./RuntimeTimer";
import { Stepback, isInStepback } from "./Stepback";

const { applyStrictRegex, msToDuration, shortenGithash } = string;
const { red } = palette;

interface Props {
  taskId: string;
  loading: boolean;
  task: TaskQuery["task"];
  error: ApolloError;
}

export const Metadata: React.FC<Props> = ({ error, loading, task, taskId }) => {
  const taskAnalytics = useTaskAnalytics();
  const getDateCopy = useDateFormat();
  const {
    abortInfo,
    activatedTime,
    ami,
    annotation,
    baseTask,
    buildVariant,
    buildVariantDisplayName,
    dependsOn,
    details,
    displayTask,
    distroId,
    estimatedStart,
    expectedDuration,
    finishTime,
    generatedBy,
    generatedByName,
    hostId,
    ingestTime,
    minQueuePosition: taskQueuePosition,
    pod,
    priority,
    project,
    resetWhenFinished,
    spawnHostLink,
    startTime,
    status,
    timeTaken,
    versionMetadata,
  } = task || {};

  const submittedTime = activatedTime ?? ingestTime;
  const {
    id: baseTaskId,
    timeTaken: baseTaskDuration,
    versionMetadata: baseTaskVersionMetadata,
  } = baseTask ?? {};
  // @ts-expect-error: FIXME. This comment was added by an automated script.
  const baseCommit = shortenGithash(baseTaskVersionMetadata?.revision);
  const projectIdentifier = project?.identifier;
  const { author, id: versionID } = versionMetadata ?? {};
  const oomTracker = details?.oomTracker;
  const taskTrace = details?.traceID;
  const diskDevices = details?.diskDevices;
  const { id: podId } = pod ?? {};
  const isContainerTask = !!podId;
  const { metadataLinks } = annotation ?? {};
  const [openGuideCue, setOpenGuideCue] = useState(
    Cookies.get(SEEN_HONEYCOMB_GUIDE_CUE) !== "true",
  );
  const triggerRef = useRef(null);
  const onHideCue = () => {
    Cookies.set(SEEN_HONEYCOMB_GUIDE_CUE, "true", { expires: 365 });
    setOpenGuideCue(false);
  };
  const stepback = isInStepback(task);

  return (
    <MetadataCard error={!task && error ? error : undefined} loading={loading}>
      <MetadataTitle>Task Metadata</MetadataTitle>
      <MetadataItem data-cy="task-metadata-build-variant">
        Build Variant:{" "}
        <StyledRouterLink
          data-cy="build-variant-link"
          // @ts-expect-error: FIXME. This comment was added by an automated script.
          to={getVersionRoute(versionID, {
            page: 0,
            // @ts-expect-error: FIXME. This comment was added by an automated script.
            variant: applyStrictRegex(buildVariant),
          })}
          onClick={() =>
            taskAnalytics.sendEvent({
              name: "Clicked metadata link",
              linkType: "build variant link",
            })
          }
        >
          {buildVariantDisplayName || buildVariant}
        </StyledRouterLink>
      </MetadataItem>
      <MetadataItem data-cy="task-metadata-project">
        Project:{" "}
        <StyledRouterLink
          data-cy="project-link"
          // @ts-expect-error: FIXME. This comment was added by an automated script.
          to={getProjectPatchesRoute(projectIdentifier)}
          onClick={() =>
            taskAnalytics.sendEvent({
              name: "Clicked metadata link",
              linkType: "project link",
            })
          }
        >
          {projectIdentifier}
        </StyledRouterLink>
      </MetadataItem>
      <MetadataItem>Submitted by: {author}</MetadataItem>
      {submittedTime && (
        <MetadataItem data-cy="task-metadata-submitted-at">
          Submitted at:{" "}
          <span title={getDateCopy(submittedTime)}>
            {getDateCopy(submittedTime, { omitSeconds: true })}
          </span>
        </MetadataItem>
      )}
      {generatedBy && (
        <MetadataItem>
          <span>Generated by: </span>
          <StyledRouterLink to={getTaskRoute(generatedBy)}>
            {generatedByName}
          </StyledRouterLink>
        </MetadataItem>
      )}
      {/* @ts-expect-error: FIXME. This comment was added by an automated script. */}
      {estimatedStart > 0 && (
        <MetadataItem>
          Estimated time to start:{" "}
          <span data-cy="task-metadata-estimated_start">
            {/* @ts-expect-error: FIXME. This comment was added by an automated script. */}
            {msToDuration(estimatedStart)}
          </span>
        </MetadataItem>
      )}
      {/* @ts-expect-error: FIXME. This comment was added by an automated script. */}
      {status === TaskStatus.Started && expectedDuration > 0 && (
        // @ts-expect-error: FIXME. This comment was added by an automated script.
        <ETATimer startTime={startTime} expectedDuration={expectedDuration} />
      )}
      {status === TaskStatus.Started && startTime && (
        <RuntimeTimer startTime={startTime} />
      )}
      {startTime && (
        <MetadataItem>
          Started:{" "}
          <span data-cy="task-metadata-started" title={getDateCopy(startTime)}>
            {getDateCopy(startTime, { omitSeconds: true })}
          </span>
        </MetadataItem>
      )}
      {finishTime && (
        <MetadataItem>
          Finished:{" "}
          <span
            data-cy="task-metadata-finished"
            title={getDateCopy(finishTime)}
          >
            {getDateCopy(finishTime, { omitSeconds: true })}
          </span>
        </MetadataItem>
      )}
      {/* @ts-expect-error: FIXME. This comment was added by an automated script. */}
      {timeTaken > 0 && finishTime && (
        <MetadataItem data-cy="task-metadata-duration">
          {/* @ts-expect-error: FIXME. This comment was added by an automated script. */}
          Duration: {msToDuration(timeTaken)}{" "}
        </MetadataItem>
      )}
      {baseTaskDuration !== undefined && (
        <MetadataItem data-cy="task-metadata-base-commit-duration">
          {/* @ts-expect-error: FIXME. This comment was added by an automated script. */}
          Base commit duration: {msToDuration(baseTaskDuration)}
        </MetadataItem>
      )}
      {baseTaskId && (
        <MetadataItem>
          Base commit:{" "}
          <InlineCode
            as={Link}
            data-cy="base-task-link"
            onClick={() =>
              taskAnalytics.sendEvent({
                name: "Clicked metadata link",
                linkType: "base commit",
              })
            }
            to={getTaskRoute(baseTaskId)}
          >
            {baseCommit}
          </InlineCode>
        </MetadataItem>
      )}
      {(details?.description || details?.failingCommand) && (
        <MetadataItem data-cy="task-metadata-description">
          <DetailsDescription
            description={details?.description ?? ""}
            failingCommand={details?.failingCommand ?? ""}
            isContainerTask={isContainerTask}
            status={details?.status}
          />
        </MetadataItem>
      )}
      {details?.timeoutType && details?.timeoutType !== "" && (
        <MetadataItem>Timeout type: {details?.timeoutType}</MetadataItem>
      )}
      {displayTask && (
        <MetadataItem>
          Display Task:{" "}
          <StyledRouterLink
            to={getTaskRoute(displayTask.id, {
              execution: displayTask.execution,
            })}
            onClick={() =>
              taskAnalytics.sendEvent({
                name: "Clicked metadata link",
                linkType: "display task link",
              })
            }
          >
            {displayTask.displayName}
          </StyledRouterLink>
        </MetadataItem>
      )}
      {!isContainerTask && distroId && (
        <MetadataItem>
          Distro:{" "}
          <StyledRouterLink
            data-cy="task-distro-link"
            onClick={() =>
              taskAnalytics.sendEvent({
                name: "Clicked metadata link",
                linkType: "distro link",
              })
            }
            to={getDistroSettingsRoute(distroId)}
          >
            {distroId}
          </StyledRouterLink>
        </MetadataItem>
      )}
      {ami && (
        <MetadataItem data-cy="task-metadata-ami">AMI: {ami}</MetadataItem>
      )}
      {!isContainerTask && hostId && (
        <MetadataItem>
          Host:{" "}
          <StyledLink
            data-cy="task-host-link"
            href={getHostRoute(hostId)}
            onClick={() =>
              taskAnalytics.sendEvent({
                name: "Clicked metadata link",
                linkType: "host link",
              })
            }
          >
            {hostId}
          </StyledLink>
        </MetadataItem>
      )}
      {isContainerTask && (
        <MetadataItem>
          Container:{" "}
          <StyledLink
            data-cy="task-pod-link"
            href={getPodRoute(podId)}
            onClick={() =>
              taskAnalytics.sendEvent({
                name: "Clicked metadata link",
                linkType: "pod link",
              })
            }
          >
            {podId}
          </StyledLink>
        </MetadataItem>
      )}
      {priority !== 0 && (
        <MetadataItem data-cy="task-metadata-priority">
          {/* @ts-expect-error: FIXME. This comment was added by an automated script. */}
          Priority: {priority} {priority < 0 && `(Disabled)`}
        </MetadataItem>
      )}
      {spawnHostLink && (
        <MetadataItem>
          <StyledRouterLink
            data-cy="task-spawn-host-link"
            to={getSpawnHostRoute({
              distroId,
              spawnHost: true,
              taskId,
            })}
            onClick={() =>
              taskAnalytics.sendEvent({
                name: "Clicked metadata link",
                linkType: "spawn host link",
              })
            }
          >
            Spawn host
          </StyledRouterLink>
        </MetadataItem>
      )}
      {metadataLinks &&
        metadataLinks.map((link) => (
          <MetadataItem key={link.text}>
            <StyledLink
              data-cy="task-metadata-link"
              href={link.url}
              onClick={() =>
                taskAnalytics.sendEvent({
                  name: "Clicked metadata link",
                  linkType: "annotation link",
                })
              }
            >
              {link.text}
            </StyledLink>
          </MetadataItem>
        ))}
      {/* @ts-expect-error: FIXME. This comment was added by an automated script. */}
      {taskQueuePosition > 0 && (
        <MetadataItem>
          Position in queue:{" "}
          <StyledRouterLink
            data-cy="task-queue-position"
            // @ts-expect-error: FIXME. This comment was added by an automated script.
            to={getTaskQueueRoute(distroId, taskId)}
          >
            {taskQueuePosition}
          </StyledRouterLink>
        </MetadataItem>
      )}
      {abortInfo && <AbortMessage {...abortInfo} />}
      {oomTracker && oomTracker.detected && (
        <OOMTrackerMessage>
          Out of Memory Kill detected
          {oomTracker.pids ? `(PIDs: ${oomTracker.pids.join(", ")}` : ""} )
        </OOMTrackerMessage>
      )}
      {resetWhenFinished && (
        <MetadataItem data-cy="reset-when-finished">
          This task will restart when all of the tasks in its task group have
          finished running.
        </MetadataItem>
      )}
      {dependsOn && dependsOn.length ? (
        <DependsOnContainer data-cy="depends-on-container">
          <MetadataTitle>Depends On</MetadataTitle>
          {dependsOn.map((dep) => (
            <DependsOn
              key={`dependOnPill_${dep.taskId}`}
              name={dep.name}
              buildVariant={dep.buildVariant}
              metStatus={dep.metStatus}
              requiredStatus={dep.requiredStatus}
              taskId={dep.taskId}
            />
          ))}
        </DependsOnContainer>
      ) : null}
      {taskTrace && startTime && finishTime && (
        <MetadataItem>
          <GuideCue
            data-cy="migrate-cue"
            open={openGuideCue}
            setOpen={setOpenGuideCue}
            title="Honeycomb!"
            refEl={triggerRef}
            numberOfSteps={1}
            currentStep={1}
            onPrimaryButtonClick={onHideCue}
          >
            Finished tasks link to Honeycomb.
          </GuideCue>
          <HoneycombLinkContainer>
            <StyledLink
              ref={triggerRef}
              data-cy="task-trace-link"
              href={getHoneycombTraceUrl(taskTrace, startTime, finishTime)}
              onClick={() => {
                onHideCue();
                taskAnalytics.sendEvent({
                  name: "Clicked metadata link",
                  linkType: "honeycomb trace link",
                });
              }}
              hideExternalIcon={false}
            >
              Honeycomb Trace
            </StyledLink>
            <StyledLink
              data-cy="task-metrics-link"
              href={getHoneycombSystemMetricsUrl(
                taskId,
                // @ts-expect-error: FIXME. This comment was added by an automated script.
                diskDevices,
                startTime,
                finishTime,
              )}
              onClick={() => {
                onHideCue();
                taskAnalytics.sendEvent({
                  name: "Clicked metadata link",
                  linkType: "honeycomb metrics link",
                });
              }}
              hideExternalIcon={false}
            >
              Honeycomb System Metrics
            </StyledLink>
          </HoneycombLinkContainer>
        </MetadataItem>
      )}
      {stepback && <Stepback taskId={taskId} />}
    </MetadataCard>
  );
};

const DetailsDescription = ({
  description,
  failingCommand,
  isContainerTask,
  status,
}: {
  description: string;
  failingCommand: string;
  isContainerTask: boolean;
  status: string;
}) => {
  const MAX_CHAR = 100;
  const isFailingTask = isFailedTaskStatus(status);
  const baseCopy = description || failingCommand;
  const fullText = isFailingTask
    ? `${processFailingCommand(baseCopy, isContainerTask)}`
    : `${baseCopy}`;

  const shouldTruncate = fullText.length > MAX_CHAR;
  const truncatedText = fullText.substring(0, MAX_CHAR).concat("...");

  return (
    <MetadataItem>
      {isFailingTask ? (
        <b
          css={css`
            color: ${red.base};
          `}
        >
          Failing Command:{" "}
        </b>
      ) : (
        <span>Command: </span>
      )}
      {shouldTruncate ? (
        <>
          {truncatedText}{" "}
          <ExpandedText
            align="right"
            justify="end"
            popoverZIndex={zIndex.tooltip}
            message={description}
            data-cy="task-metadata-description-tooltip"
          />
        </>
      ) : (
        fullText
      )}
    </MetadataItem>
  );
};

const processFailingCommand = (
  description: string,
  isContainerTask: boolean,
): string => {
  if (description === "stranded") {
    return isContainerTask
      ? containerTaskStrandedMessage
      : hostTaskStrandedMessage;
  }
  return description;
};

const containerTaskStrandedMessage =
  "Task failed because the container was stranded by the ECS agent.";
const hostTaskStrandedMessage =
  "Task failed because spot host was unexpectedly terminated by AWS.";

const DependsOnContainer = styled.div`
  margin-top: ${size.s};
`;

const HoneycombLinkContainer = styled.span`
  display: flex;
  flex-direction: column;
`;

const OOMTrackerMessage = styled(MetadataItem)`
  color: ${red.dark2};
  font-weight: 500;
`;
