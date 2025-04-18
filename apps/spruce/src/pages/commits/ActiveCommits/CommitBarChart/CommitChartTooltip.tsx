import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { palette } from "@leafygreen-ui/palette";
import Tooltip from "@leafygreen-ui/tooltip";
import { Disclaimer } from "@leafygreen-ui/typography";
import { taskStatusToCopy } from "@evg-ui/lib/constants/task";
import { size, zIndex } from "@evg-ui/lib/constants/tokens";
import { TaskStatus, TaskStatusUmbrella } from "@evg-ui/lib/types/task";
import { inactiveElementStyle } from "components/styles";
import { mapTaskToBarchartColor } from "constants/task";
import { getStatusesWithZeroCount } from "pages/commits/ActiveCommits/utils";
import { ColorCount } from "pages/commits/types";
import { msToDuration } from "utils/string";

const { gray } = palette;
interface Props {
  groupedTaskStats: ColorCount[];
  trigger: React.ReactElement;
  eta?: Date;
}

export const CommitChartTooltip: React.FC<Props> = ({
  eta,
  groupedTaskStats,
  trigger,
}) => {
  const zeroCountStatus = getStatusesWithZeroCount(groupedTaskStats);
  return (
    <Tooltip
      align="right"
      justify="middle"
      popoverZIndex={zIndex.popover}
      trigger={trigger}
      triggerEvent="hover"
      usePortal={false}
    >
      <TooltipContainer css={sharedCss} data-cy="commit-chart-tooltip">
        {groupedTaskStats.map(({ color, count, statuses, umbrellaStatus }) => (
          <FlexColumnContainer key={color} data-cy="current-status-count">
            <TotalCount
              active
              color={color}
              count={count}
              // @ts-expect-error: FIXME. This comment was added by an automated script.
              eta={
                umbrellaStatus === TaskStatusUmbrella.Running && eta
                  ? eta
                  : null
              }
              status={umbrellaStatus}
            />
            {umbrellaStatus === TaskStatus.Failed && (
              <SubStatusText css={sharedCss}>{`(${statuses.join(
                ", ",
              )})`}</SubStatusText>
            )}
          </FlexColumnContainer>
        ))}
        {zeroCountStatus.map((umbrellaStatus) => (
          <TotalCount
            key={umbrellaStatus}
            active={false}
            // @ts-expect-error: FIXME. This comment was added by an automated script.
            color={mapTaskToBarchartColor[umbrellaStatus]}
            count={0}
            status={umbrellaStatus}
          />
        ))}
      </TooltipContainer>
    </Tooltip>
  );
};

interface TotalCountProps {
  color: string;
  count: number;
  status: string;
  eta?: Date;
  active?: boolean;
}
export const TotalCount: React.FC<TotalCountProps> = ({
  active = true,
  color,
  count,
  eta,
  status,
}) => (
  <TotalCountContainer active={active}>
    <Circle color={color} />
    <StatusText css={sharedCss}>
      <div>{`Total ${taskStatusToCopy[status as TaskStatus]}`}</div>
      {eta &&
        `(${msToDuration(new Date(eta).valueOf() - Date.now())} remaining)`}
    </StatusText>
    <NumberText css={sharedCss}>{count}</NumberText>
  </TotalCountContainer>
);

const TooltipContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
`;

const FlexColumnContainer = styled.div`
  width: 150px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  color: ${gray.dark2};
`;

const TotalCountContainer = styled.div<{ active?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${size.xs};
  color: ${gray.dark2};
  ${({ active }) => !active && inactiveElementStyle};
`;

const Circle = styled.div<{ color: string }>`
  background-color: ${({ color }) => color};
  border-radius: ${size.xxs};
  width: ${size.xs};
  height: ${size.xs};
  margin-right: ${size.s};
`;

const NumberText = styled(Disclaimer)`
  width: ${size.l};
  font-weight: bold;
  text-align: center;
`;

const StatusText = styled(Disclaimer)`
  width: ${size.xxl};
  text-align: left;
`;

const SubStatusText = styled(Disclaimer)`
  width: ${size.xxl};
  text-align: left;
  margin: 2px 0px 0px 20px;
  word-break: normal;
  overflow-wrap: anywhere;
`;

const sharedCss = css`
  font-size: 9px;
  line-height: ${size.s};
`;
