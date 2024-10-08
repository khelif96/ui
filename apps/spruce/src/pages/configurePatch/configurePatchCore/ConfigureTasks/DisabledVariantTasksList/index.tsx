import Checkbox from "@leafygreen-ui/checkbox";
import { Body } from "@leafygreen-ui/typography";
import { VariantTask } from "gql/generated/types";
import { TaskLayoutGrid } from "../styles";
import { CheckboxState } from "../types";

interface DisabledVariantTasksListProps {
  "data-cy": string;
  status: CheckboxState;
  variantTasks: VariantTask[];
}

const DisabledVariantTasksList: React.FC<DisabledVariantTasksListProps> = ({
  "data-cy": dataCy,
  status,
  variantTasks,
}) => (
  <>
    {variantTasks.map(({ name, tasks }) => (
      <div key={`variant_${name}`}>
        <Body>{name}</Body>
        <TaskLayoutGrid>
          {tasks.map((taskName) => (
            <Checkbox
              key={`${name}-${taskName}`}
              checked={status === CheckboxState.Checked}
              data-cy={dataCy}
              disabled
              label={taskName}
            />
          ))}
        </TaskLayoutGrid>
      </div>
    ))}
  </>
);

export default DisabledVariantTasksList;
