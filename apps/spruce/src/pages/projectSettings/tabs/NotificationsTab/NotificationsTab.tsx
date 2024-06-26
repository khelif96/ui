import { useMemo } from "react";
import { ValidateProps } from "components/SpruceForm";
import { ProjectSettingsTabRoutes } from "constants/routes";
import { invalidProjectTriggerSubscriptionCombinations } from "constants/triggers";
import { BaseTab } from "../BaseTab";
import { ProjectType } from "../utils";
import { getFormSchema } from "./getFormSchema";
import { NotificationsFormState, TabProps } from "./types";

const tab = ProjectSettingsTabRoutes.Notifications;

export const NotificationsTab: React.FC<TabProps> = ({
  projectData,
  projectType,
  repoData,
}) => {
  const initialFormState = projectData || repoData;

  const formSchema = useMemo(
    () =>
      getFormSchema(
        // @ts-expect-error: FIXME. This comment was added by an automated script.
        projectType === ProjectType.AttachedProject ? repoData : null,
        projectType,
      ),
    [projectType, repoData],
  );

  return (
    <BaseTab
      formSchema={formSchema}
      // @ts-expect-error: FIXME. This comment was added by an automated script.
      initialFormState={initialFormState}
      tab={tab}
      validate={validate}
    />
  );
};

const validate = ((formData, errors) => {
  const { subscriptions } = formData;

  // @ts-expect-error: FIXME. This comment was added by an automated script.
  subscriptions.forEach((subscription, i) => {
    const { subscriptionData } = subscription || {};
    const { event, notification } = subscriptionData || {};
    const { notificationSelect } = notification || {};
    const { eventSelect } = event || {};

    Object.entries(invalidProjectTriggerSubscriptionCombinations).forEach(
      ([notificationType, eventType]) => {
        if (notificationSelect === notificationType) {
          const hasMatchingEvent = eventType.some((e) => e === eventSelect);
          if (hasMatchingEvent) {
            // @ts-expect-error: FIXME. This comment was added by an automated script.
            errors.subscriptions[
              i
            ].subscriptionData?.notification?.notificationSelect?.addError(
              "Subscription type not allowed for tasks in a project.",
            );
          }
        }
      },
    );
  });
  return errors;
}) satisfies ValidateProps<NotificationsFormState>;
