import { TaskStatus } from "@evg-ui/lib/types/task";
import { TestStatus } from "@evg-ui/lib/types/test";
import { GroupedTask, TaskHistoryTask } from "./types";

const emptyTests = {
  testResults: [],
};

export const tasks: TaskHistoryTask[] = [
  {
    id: "a",
    activated: true,
    displayStatus: TaskStatus.Succeeded,
    execution: 0,
    latestExecution: 0,
    order: 100,
    revision: "aef363719d0287e92cd83749a827bae",
    createTime: new Date("2025-04-03T10:22:13Z"),
    canRestart: true,
    canSchedule: false,
    versionMetadata: {
      id: "version_id",
      author: "Evergreen Admin",
      message: "DEVPROD-1234: A",
    },
    tests: emptyTests,
  },
  {
    id: "b",
    activated: true,
    displayStatus: TaskStatus.WillRun,
    execution: 0,
    latestExecution: 1,
    order: 99,
    revision: "b",
    createTime: new Date("2025-04-03T10:21:13Z"),
    canRestart: true,
    canSchedule: false,
    versionMetadata: {
      id: "version_id",
      author: "Evergreen Admin",
      message: "DEVPROD-1234: B",
    },
    tests: emptyTests,
  },
  {
    id: "c",
    activated: false,
    displayStatus: TaskStatus.Unscheduled,
    execution: 0,
    latestExecution: 0,
    order: 98,
    revision: "ce135c28ba11e9189cae",
    createTime: new Date("2025-04-03T10:20:13Z"),
    canRestart: false,
    canSchedule: true,
    versionMetadata: {
      id: "version_id",
      author: "Evergreen Admin",
      message: "DEVPROD-1234: C",
    },
    tests: emptyTests,
  },
  {
    id: "d",
    activated: true,
    displayStatus: TaskStatus.SetupFailed,
    execution: 0,
    latestExecution: 0,
    order: 97,
    revision: "d",
    createTime: new Date("2025-04-02T10:22:13Z"),
    canRestart: true,
    canSchedule: false,
    versionMetadata: {
      id: "version_id",
      author: "Evergreen Admin",
      message: "DEVPROD-1234: D",
    },
    tests: emptyTests,
  },
  {
    id: "e",
    activated: false,
    displayStatus: TaskStatus.Unscheduled,
    execution: 0,
    latestExecution: 0,
    order: 96,
    revision: "e",
    createTime: new Date("2025-04-02T10:21:13Z"),
    canRestart: true,
    canSchedule: true,
    versionMetadata: {
      id: "version_id",
      author: "Evergreen Admin",
      message: "DEVPROD-1234: E",
    },
    tests: emptyTests,
  },
  {
    id: "f",
    activated: true,
    displayStatus: TaskStatus.Failed,
    execution: 0,
    latestExecution: 0,
    order: 95,
    revision: "f",
    createTime: new Date("2025-04-01T10:22:13Z"),
    canRestart: true,
    canSchedule: false,
    versionMetadata: {
      id: "version_id",
      author: "Evergreen Admin",
      message: "DEVPROD-1234: F",
    },
    tests: {
      testResults: [
        {
          id: "e2e_test_id",
          testFile: "e2e_test",
          status: TestStatus.Fail,
          logs: { urlParsley: "a-parsley-url.mongodb.com" },
        },
      ],
    },
  },
  {
    id: "g",
    activated: false,
    displayStatus: TaskStatus.Unscheduled,
    execution: 0,
    latestExecution: 0,
    order: 94,
    revision: "g",
    createTime: new Date("2025-04-01T10:21:13Z"),
    canRestart: false,
    canSchedule: true,
    versionMetadata: {
      id: "version_id",
      author: "Evergreen Admin",
      message: "DEVPROD-1234: G",
    },
    tests: emptyTests,
  },
  {
    id: "h",
    activated: false,
    displayStatus: TaskStatus.Unscheduled,
    execution: 0,
    latestExecution: 0,
    order: 93,
    revision: "h",
    createTime: new Date("2025-04-01T10:20:13Z"),
    canRestart: false,
    canSchedule: true,
    versionMetadata: {
      id: "version_id",
      author: "Evergreen Admin",
      message: "DEVPROD-1234: H",
    },
    tests: emptyTests,
  },
  {
    id: "i",
    activated: false,
    displayStatus: TaskStatus.Unscheduled,
    execution: 0,
    latestExecution: 0,
    order: 92,
    revision: "i",
    createTime: new Date("2025-04-01T10:18:13Z"),
    canRestart: false,
    canSchedule: true,
    versionMetadata: {
      id: "version_id",
      author: "Evergreen Admin",
      message: "DEVPROD-1234: I",
    },
    tests: emptyTests,
  },
  {
    id: "j",
    activated: true,
    displayStatus: TaskStatus.KnownIssue,
    execution: 0,
    latestExecution: 3,
    order: 91,
    revision: "j",
    createTime: new Date("2025-03-30T10:22:13Z"),
    canRestart: true,
    canSchedule: false,
    versionMetadata: {
      id: "version_id",
      author: "Evergreen Admin",
      message: "DEVPROD-1234: J",
    },
    tests: emptyTests,
  },
  {
    id: "k",
    activated: true,
    displayStatus: TaskStatus.SystemFailed,
    execution: 0,
    latestExecution: 0,
    order: 90,
    revision: "k",
    createTime: new Date("2025-03-29T10:22:13Z"),
    canRestart: true,
    canSchedule: false,
    versionMetadata: {
      id: "version_id",
      author: "Evergreen Admin",
      message: "DEVPROD-1234: K",
    },
    tests: emptyTests,
  },
];

export const collapsedGroupedTasks: GroupedTask[] = [
  {
    date: tasks[0].createTime!,
    inactiveTasks: null,
    task: null,
    isMatching: false,
    commitCardRef: null,
  },
  {
    date: null,
    inactiveTasks: null,
    task: tasks[0],
    isMatching: true,
    commitCardRef: { current: null },
  },
  {
    date: null,
    inactiveTasks: null,
    task: tasks[1],
    isMatching: true,
    commitCardRef: { current: null },
  },
  {
    date: null,
    inactiveTasks: [tasks[2]],
    task: null,
    isMatching: false,
    commitCardRef: null,
  },
  {
    date: tasks[3].createTime!,
    inactiveTasks: null,
    task: null,
    isMatching: false,
    commitCardRef: null,
  },
  {
    date: null,
    inactiveTasks: null,
    task: tasks[3],
    isMatching: true,
    commitCardRef: { current: null },
  },
  {
    date: null,
    inactiveTasks: [tasks[4]],
    task: null,
    isMatching: false,
    commitCardRef: null,
  },
  {
    date: tasks[5].createTime!,
    inactiveTasks: null,
    task: null,
    isMatching: false,
    commitCardRef: null,
  },
  {
    date: null,
    inactiveTasks: null,
    task: tasks[5],
    isMatching: true,
    commitCardRef: { current: null },
  },
  {
    date: null,
    inactiveTasks: [tasks[6], tasks[7], tasks[8]],
    task: null,
    isMatching: false,
    commitCardRef: null,
  },
  {
    date: tasks[9].createTime!,
    inactiveTasks: null,
    task: null,
    isMatching: false,
    commitCardRef: null,
  },
  {
    date: null,
    inactiveTasks: null,
    task: tasks[9],
    isMatching: true,
    commitCardRef: { current: null },
  },
  {
    date: tasks[10].createTime!,
    inactiveTasks: null,
    task: null,
    isMatching: false,
    commitCardRef: null,
  },
  {
    date: null,
    inactiveTasks: null,
    task: tasks[10],
    isMatching: true,
    commitCardRef: { current: null },
  },
];

export const expandedGroupedTasks: GroupedTask[] = [
  {
    date: tasks[0].createTime!,
    inactiveTasks: null,
    task: null,
    isMatching: false,
    commitCardRef: null,
  },
  {
    date: null,
    inactiveTasks: null,
    task: tasks[0],
    isMatching: true,
    commitCardRef: { current: null },
  },
  {
    date: null,
    inactiveTasks: null,
    task: tasks[1],
    isMatching: true,
    commitCardRef: { current: null },
  },
  {
    date: null,
    inactiveTasks: null,
    task: tasks[2],
    isMatching: true,
    commitCardRef: { current: null },
  },
  {
    date: tasks[3].createTime!,
    inactiveTasks: null,
    task: null,
    isMatching: false,
    commitCardRef: null,
  },
  {
    date: null,
    inactiveTasks: null,
    task: tasks[3],
    isMatching: true,
    commitCardRef: { current: null },
  },
  {
    date: null,
    inactiveTasks: null,
    task: tasks[4],
    isMatching: true,
    commitCardRef: { current: null },
  },
  {
    date: tasks[5].createTime!,
    inactiveTasks: null,
    task: null,
    isMatching: false,
    commitCardRef: null,
  },
  {
    date: null,
    inactiveTasks: null,
    task: tasks[5],
    isMatching: true,
    commitCardRef: { current: null },
  },
  {
    date: null,
    inactiveTasks: null,
    task: tasks[6],
    isMatching: true,
    commitCardRef: { current: null },
  },
  {
    date: null,
    inactiveTasks: null,
    task: tasks[7],
    isMatching: true,
    commitCardRef: { current: null },
  },
  {
    date: null,
    inactiveTasks: null,
    task: tasks[8],
    isMatching: true,
    commitCardRef: { current: null },
  },
  {
    date: tasks[9].createTime!,
    inactiveTasks: null,
    isMatching: false,
    task: null,
    commitCardRef: null,
  },
  {
    date: null,
    inactiveTasks: null,
    task: tasks[9],
    isMatching: true,
    commitCardRef: { current: null },
  },
  {
    date: tasks[10].createTime!,
    inactiveTasks: null,
    task: null,
    isMatching: false,
    commitCardRef: null,
  },
  {
    date: null,
    inactiveTasks: null,
    task: tasks[10],
    isMatching: true,
    commitCardRef: { current: null },
  },
];
