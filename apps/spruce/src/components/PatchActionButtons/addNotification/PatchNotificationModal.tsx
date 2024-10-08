import { useParams } from "react-router-dom";
import { useVersionAnalytics } from "analytics";
import { NotificationModal } from "components/Notifications";
import { slugs } from "constants/routes";
import { versionTriggers } from "constants/triggers";
import { subscriptionMethods as versionSubscriptionMethods } from "types/subscription";

interface ModalProps {
  visible: boolean;
  onCancel: () => void;
}

export const PatchNotificationModal: React.FC<ModalProps> = ({
  onCancel,
  visible,
}) => {
  const { [slugs.versionId]: versionId } = useParams();
  // @ts-expect-error: FIXME. This comment was added by an automated script.
  const { sendEvent } = useVersionAnalytics(versionId);

  return (
    <NotificationModal
      data-cy="patch-notification-modal"
      onCancel={onCancel}
      // @ts-expect-error: FIXME. This comment was added by an automated script.
      resourceId={versionId}
      sendAnalyticsEvent={(subscription) =>
        sendEvent({
          name: "Created notification",
          "subscription.type": subscription.subscriber.type || "",
          "subscription.trigger": subscription.trigger || "",
        })
      }
      subscriptionMethods={versionSubscriptionMethods}
      triggers={versionTriggers}
      type="version"
      visible={visible}
    />
  );
};
