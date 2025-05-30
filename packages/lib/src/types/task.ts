export enum TaskStatus {
  Inactive = "inactive",

  // TaskUnstarted is assigned to a display task after cleaning up one of
  // its execution tasks. This indicates that the display task is
  // pending a rerun
  Unstarted = "unstarted",

  // TaskUndispatched indicates either
  //  1. a task is not scheduled to run (when Task.Activated == false)
  //  2. a task is scheduled to run (when Task.Activated == true)
  Undispatched = "undispatched",
  WillRun = "will-run",
  Unscheduled = "unscheduled",

  // TaskStarted indicates a task is currently running
  Started = "started",

  // TaskDispatched indicates that an agent has received the task, but
  // the agent has not yet told Evergreen that it's running the task
  Dispatched = "dispatched",

  // This is a temporary status which is the same as undispatched, but
  // with the additional info that it's waiting for a dependency
  Pending = "pending",

  // The statuses below indicate that a task has finished.
  Succeeded = "success",

  // These statuses indicate that the task failed, and it is likely a problem
  // with the code being tested
  Failed = "failed",
  TestTimedOut = "test-timed-out",
  TaskTimedOut = "task-timed-out",

  // These statuses indicate that the task failed, and it is likely a problem
  // with the systems running the task
  SetupFailed = "setup-failed",
  SystemFailed = "system-failed",
  SystemTimedOut = "system-timed-out",
  SystemUnresponsive = "system-unresponsive",

  // This status means that the task will not run because a dependency was
  // not satisfied
  Blocked = "blocked",
  Aborted = "aborted",

  KnownIssue = "known-issue",
}

// Task status sorted in order of "relevance", with the most likely actionable at the top.
export const SortedTaskStatus = [
  TaskStatus.Failed,
  TaskStatus.TestTimedOut,
  TaskStatus.TaskTimedOut,
  TaskStatus.KnownIssue,
  TaskStatus.SetupFailed,
  TaskStatus.SystemFailed,
  TaskStatus.SystemTimedOut,
  TaskStatus.SystemUnresponsive,
  TaskStatus.Started,
  TaskStatus.Dispatched,
  TaskStatus.Succeeded,
  TaskStatus.Undispatched,
  TaskStatus.WillRun,
  TaskStatus.Aborted,
  TaskStatus.Blocked,
  TaskStatus.Unscheduled,
];

export enum TaskStatusUmbrella {
  Failed = "failed-umbrella",
  SystemFailure = "system-failure-umbrella",
  Running = "running-umbrella",
  Undispatched = "undispatched-umbrella",
  Scheduled = "scheduled-umbrella",
}
