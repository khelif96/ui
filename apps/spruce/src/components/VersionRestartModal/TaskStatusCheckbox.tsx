import { memo } from "react";
import styled from "@emotion/styled";
import { Checkbox } from "@leafygreen-ui/checkbox";
import { size } from "@evg-ui/lib/constants/tokens";
import { TaskStatus } from "@evg-ui/lib/types/task";
import { TaskBox as BaseTaskBox } from "components/TaskBox";

interface TaskStatusCheckboxProps {
  baseStatus?: string;
  checked: boolean;
  displayName: string;
  onClick: () => void;
  status: string;
  taskId: string;
}

const CheckboxComponent: React.FC<TaskStatusCheckboxProps> = ({
  baseStatus,
  checked,
  displayName,
  onClick,
  status,
  taskId,
}) => (
  <Checkbox
    bold={false}
    checked={checked}
    data-cy="task-status-checkbox"
    label={
      <StateItemWrapper>
        <TaskBox squareSize={14} status={status as TaskStatus} />
        {baseStatus ? (
          <TaskBox squareSize={14} status={baseStatus as TaskStatus} />
        ) : (
          <EmptyCell />
        )}
        <div>{displayName}</div>
      </StateItemWrapper>
    }
    name={taskId}
    onClick={onClick}
  />
);

export const TaskStatusCheckbox = memo(CheckboxComponent);

const StateItemWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: ${size.xxs};
  white-space: nowrap;
`;

const TaskBox = styled(BaseTaskBox)`
  float: none;
  flex-shrink: 0;
`;

const CHECKBOX_SQUARE_SIZE = 14;
const CHECKBOX_SQUARE_BORDER = 1;

const EmptyCell = styled.span`
  width: ${CHECKBOX_SQUARE_SIZE + CHECKBOX_SQUARE_BORDER * 2}px;
  flex-shrink: 0;
`;
