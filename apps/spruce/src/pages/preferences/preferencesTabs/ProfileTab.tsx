import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import styled from "@emotion/styled";
import Button, { Variant } from "@leafygreen-ui/button";
import { Skeleton } from "antd";
import { usePreferencesAnalytics } from "analytics";
import { SettingsCard } from "components/SettingsCard";
import { SpruceForm } from "components/SpruceForm";
import { listOfDateFormatStrings, timeZones, TimeFormat } from "constants/time";
import { useToastContext } from "context/toast";
import {
  UpdateUserSettingsMutation,
  UpdateUserSettingsMutationVariables,
  AwsRegionsQuery,
} from "gql/generated/types";
import { UPDATE_USER_SETTINGS } from "gql/mutations";
import { AWS_REGIONS } from "gql/queries";
import { useUserSettings } from "hooks";
import { getDateCopy, omitTypename } from "utils/string";

const dateFormats = listOfDateFormatStrings.map((format) => ({
  value: format,
  str: `${format} - ${getDateCopy("08/31/2022", {
    dateFormat: format,
    dateOnly: true,
  })}`,
}));

export const ProfileTab: React.FC = () => {
  const { sendEvent } = usePreferencesAnalytics();
  const dispatchToast = useToastContext();

  const { loading, userSettings } = useUserSettings();
  const {
    dateFormat,
    githubUser,
    region,
    timeFormat: dbTimeFormat,
    timezone,
  } = userSettings ?? {};
  const lastKnownAs = githubUser?.lastKnownAs || "";
  const timeFormat = dbTimeFormat || TimeFormat.TwelveHour;

  const { data: awsRegionData, loading: awsRegionLoading } =
    useQuery<AwsRegionsQuery>(AWS_REGIONS);
  const awsRegions = awsRegionData?.awsRegions || [];

  const [updateUserSettings, { loading: updateLoading }] = useMutation<
    UpdateUserSettingsMutation,
    UpdateUserSettingsMutationVariables
  >(UPDATE_USER_SETTINGS, {
    onCompleted: () => {
      dispatchToast.success(`Your changes have successfully been saved.`);
    },
    onError: (err) => {
      dispatchToast.error(`Error while saving settings: '${err.message}'`);
    },
    refetchQueries: ["UserSettings"],
  });

  const [hasErrors, setHasErrors] = useState(false);
  const [formState, setFormState] = useState<{
    timezone: string;
    region: string;
    githubUser: { lastKnownAs?: string };
    dateFormat: string;
    timeFormat: string;
  }>({
    // @ts-expect-error: FIXME. This comment was added by an automated script.
    timezone,
    // @ts-expect-error: FIXME. This comment was added by an automated script.
    region,
    githubUser: { lastKnownAs },
    // @ts-expect-error: FIXME. This comment was added by an automated script.
    dateFormat,
    timeFormat,
  });

  useEffect(() => {
    setFormState({
      githubUser: omitTypename(githubUser || {}),
      // @ts-expect-error: FIXME. This comment was added by an automated script.
      timezone,
      // @ts-expect-error: FIXME. This comment was added by an automated script.
      region,
      // @ts-expect-error: FIXME. This comment was added by an automated script.
      dateFormat,
      timeFormat,
    });
  }, [dateFormat, githubUser, region, timeFormat, timezone]);

  const handleSubmit = () => {
    updateUserSettings({
      variables: {
        userSettings: formState,
      },
    });
    sendEvent({
      name: "Saved profile info",
    });
  };

  if (loading || awsRegionLoading) {
    return <Skeleton active />;
  }

  return (
    <SettingsCard>
      <ContentWrapper>
        <SpruceForm
          formData={formState}
          onChange={({ errors, formData }) => {
            setHasErrors(errors.length > 0);
            setFormState(formData);
          }}
          schema={{
            properties: {
              githubUser: {
                // @ts-expect-error: FIXME. This comment was added by an automated script.
                title: null,
                properties: {
                  lastKnownAs: {
                    type: "string",
                    title: "GitHub Username",
                  },
                },
              },
              timezone: {
                type: "string",
                title: "Timezone",
                oneOf: [
                  ...timeZones.map(({ str, value }) => ({
                    type: "string" as "string",
                    title: str,
                    enum: [value],
                  })),
                ],
              },
              region: {
                type: "string",
                title: "AWS Region",
                enum: awsRegions,
              },
              dateFormat: {
                type: "string",
                title: "Date Format",
                oneOf: [
                  ...dateFormats.map(({ str, value }) => ({
                    type: "string" as "string",
                    title: str,
                    enum: [value],
                  })),
                ],
              },
              timeFormat: {
                type: "string",
                title: "Time Format",
                oneOf: [
                  {
                    type: "string" as "string",
                    title: "12-hour clock",
                    description: "Display time with AM/PM, e.g. 12:34 PM",
                    enum: [TimeFormat.TwelveHour],
                  },

                  {
                    type: "string" as "string",
                    title: "24-hour clock",
                    description: "Use 24-hour notation, e.g. 13:34",
                    enum: [TimeFormat.TwentyFourHour],
                  },
                ],
              },
            },
          }}
          uiSchema={{
            timezone: {
              "ui:placeholder": "Select a timezone",
            },
            region: {
              "ui:placeholder": "Select an AWS region",
            },
            githubUser: {
              lastKnownAs: {
                "ui:placeholder": "Enter your GitHub username",
              },
            },
            dateFormat: {
              "ui:placeholder": "Select a date format",
            },
            timeFormat: {
              "ui:widget": "radio",
            },
          }}
        />
        <Button
          data-cy="save-profile-changes-button"
          disabled={!hasErrors || updateLoading}
          onClick={handleSubmit}
          variant={Variant.Primary}
        >
          Save changes
        </Button>
      </ContentWrapper>
    </SettingsCard>
  );
};

const ContentWrapper = styled.div`
  width: 50%;
`;
