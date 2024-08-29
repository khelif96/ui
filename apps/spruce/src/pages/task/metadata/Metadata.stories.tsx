import styled from "@emotion/styled";
import { AbortInfo, MetStatus, RequiredStatus } from "gql/generated/types";
import { taskQuery } from "gql/mocks/taskData";
import { CustomStoryObj, CustomMeta } from "test_utils/types";
import { TaskStatus } from "types/task";
import { Metadata } from "./index";

export default {
  component: Metadata,
} satisfies CustomMeta<typeof Metadata>;

export const Default: CustomStoryObj<typeof Metadata> = {
  render: (args) => (
    <Container>
      <Metadata
        {...args}
        task={taskQuery.task}
        taskId={taskQuery.task.id}
        error={null}
      />
    </Container>
  ),
};

export const WithDependencies: CustomStoryObj<typeof Metadata> = {
  render: (args) => (
    <Container>
      <Metadata
        {...args}
        task={{
          ...taskQuery.task,
          dependsOn: [
            {
              buildVariant: "ubuntu1604",
              metStatus: MetStatus.Unmet,
              name: "Some dep",
              requiredStatus: RequiredStatus.MustSucceed,
              taskId: "some_task_id_1",
            },
            {
              buildVariant: "ubuntu1604",
              metStatus: MetStatus.Pending,
              name: "Some dep",
              requiredStatus: RequiredStatus.MustFinish,
              taskId: "some_task_id_2",
            },
            {
              buildVariant: "ubuntu1604",
              metStatus: MetStatus.Met,
              name: "Some dep",
              requiredStatus: RequiredStatus.MustFail,
              taskId: "some_task_id_3",
            },
            {
              buildVariant: "ubuntu1604",
              metStatus: MetStatus.Started,
              name: "Some dep",
              requiredStatus: RequiredStatus.MustFail,
              taskId: "some_task_id_4",
            },
          ],
        }}
        taskId={taskQuery.task.id}
        error={null}
      />
    </Container>
  ),
};

export const WithAbortMessage: CustomStoryObj<
  { abortInfoSelection: string } & React.ComponentProps<typeof Metadata>
> = {
  render: ({ abortInfoSelection, ...args }) => (
    <Container>
      <Metadata
        {...args}
        task={{
          ...taskQuery.task,
          aborted: true,
          abortInfo: abortInfoMap[abortInfoSelection],
        }}
        taskId={taskQuery.task.id}
        error={null}
      />
    </Container>
  ),
  args: {
    abortInfoSelection: "NoUser",
  },
  argTypes: {
    abortInfoSelection: {
      control: "select",
      options: [
        "NoUser",
        "AbortedBecauseOfFailingTask",
        "AbortedBecauseOfNewVersion",
        "AbortedBecausePRClosed",
      ],
    },
  },
};

export const OOMTracker: CustomStoryObj<typeof Metadata> = {
  render: (args) => (
    <Container>
      <Metadata
        {...args}
        task={{
          ...taskQuery.task,
          details: {
            failingCommand: "",
            description: "'shell.exec' in function 'yarn-test' (step 1 of 1)",
            diskDevices: [],
            oomTracker: {
              detected: true,
              pids: [12345, 67890],
            },
            status: TaskStatus.Failed,
            type: "type",
          },
        }}
        taskId={taskQuery.task.id}
        error={null}
      />
    </Container>
  ),
};

export const ContainerizedTask: CustomStoryObj<typeof Metadata> = {
  render: (args) => (
    <Container>
      <Metadata
        {...args}
        task={{
          ...taskQuery.task,
          hostId: null,
          ami: null,
          distroId: "",
          pod: {
            id: "pod_id",
          },
          spawnHostLink: null,
        }}
        taskId={taskQuery.task.id}
        error={null}
      />
    </Container>
  ),
};

const Container = styled.div`
  width: 275px;
`;

const abortInfoMap: Record<string, AbortInfo> = {
  NoUser: {
    buildVariantDisplayName: "~ Commit Queue",
    newVersion: "",
    prClosed: false,
    taskDisplayName: "api-task-server",
    taskID: "abc",
    user: "",
  },
  AbortedBecauseOfFailingTask: {
    buildVariantDisplayName: "~ Commit Queue",
    newVersion: "",
    prClosed: false,
    taskDisplayName: "api-task-server",
    taskID: "abc",
    user: "apiserver",
  },
  AbortedBecauseOfNewVersion: {
    buildVariantDisplayName: "",
    newVersion: "5ee1efb3d1fe073e194e8b5c",
    prClosed: false,
    taskDisplayName: "",
    taskID: "",
    user: "apiserver",
  },
  AbortedBecausePRClosed: {
    buildVariantDisplayName: "",
    newVersion: "",
    prClosed: true,
    taskDisplayName: "",
    taskID: "",
    user: "apiserver",
  },
};
