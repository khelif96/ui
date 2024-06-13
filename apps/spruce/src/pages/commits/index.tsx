import { useEffect } from "react";
import { useQuery } from "@apollo/client";
import styled from "@emotion/styled";
import Cookies from "js-cookie";
import { useParams, useNavigate } from "react-router-dom";
import { useProjectHealthAnalytics } from "analytics/projectHealth/useProjectHealthAnalytics";
import { ProjectBanner, RepotrackerBanner } from "components/Banners";
import FilterBadges, {
  useFilterBadgeQueryParams,
} from "components/FilterBadges";
import { ProjectSelect } from "components/ProjectSelect";
import { PageWrapper } from "components/styles";
import { ALL_VALUE } from "components/TreeSelect";
import TupleSelectWithRegexConditional from "components/TupleSelectWithRegexConditional";
import WelcomeModal from "components/WelcomeModal";
import {
  CURRENT_PROJECT,
  CY_DISABLE_COMMITS_WELCOME_MODAL,
} from "constants/cookies";
import { DEFAULT_POLL_INTERVAL } from "constants/index";
import { getCommitsRoute, slugs } from "constants/routes";
import { size } from "constants/tokens";
import { newMainlineCommitsUser } from "constants/welcomeModalProps";
import { useToastContext } from "context/toast";
import {
  SpruceConfigQuery,
  SpruceConfigQueryVariables,
  MainlineCommitsQuery,
  MainlineCommitsQueryVariables,
  ProjectHealthView,
} from "gql/generated/types";
import { MAINLINE_COMMITS, SPRUCE_CONFIG } from "gql/queries";
import {
  usePageTitle,
  usePolling,
  useUpsertQueryParams,
  useUserSettings,
} from "hooks";
import { useProjectRedirect } from "hooks/useProjectRedirect";
import { useQueryParam } from "hooks/useQueryParam";
import { ProjectFilterOptions, MainlineCommitQueryParams } from "types/commits";
import { validators } from "utils";
import { isProduction } from "utils/environmentVariables";
import { CommitsWrapper } from "./CommitsWrapper";
import CommitTypeSelector from "./CommitTypeSelector";
import { useCommitLimit } from "./hooks/useCommitLimit";
import { PaginationButtons } from "./PaginationButtons";
import { StatusSelect } from "./StatusSelect";
import { getMainlineCommitsQueryVariables, getFilterStatus } from "./utils";
import { ViewToggle } from "./ViewToggle";
import { WaterfallMenu } from "./WaterfallMenu";

const { validateRegexp } = validators;

const shouldDisableForTest =
  !isProduction() && Cookies.get(CY_DISABLE_COMMITS_WELCOME_MODAL) === "true";

const Commits = () => {
  const dispatchToast = useToastContext();
  const navigate = useNavigate();
  const { sendEvent } = useProjectHealthAnalytics({ page: "Commit chart" });
  const { userSettings } = useUserSettings();
  const { useSpruceOptions } = userSettings ?? {};
  const { hasUsedMainlineCommitsBefore = true } = useSpruceOptions ?? {};
  const [ref, limit, isResizing] = useCommitLimit<HTMLDivElement>();

  const { [slugs.projectIdentifier]: projectIdentifier } = useParams();
  usePageTitle(`Project Health | ${projectIdentifier}`);

  const sendAnalyticsEvent = (id: string, identifier: string) => {
    sendEvent({
      name: "Redirect to project identifier",
      projectId: id,
      projectIdentifier: identifier,
    });
  };
  const { isRedirecting } = useProjectRedirect({
    sendAnalyticsEvent,
    shouldRedirect: true,
  });

  const recentlySelectedProject = Cookies.get(CURRENT_PROJECT);
  // Push default project to URL if there isn't a project in
  // the URL already and an mci-project-cookie does not exist.
  const { data: spruceData } = useQuery<
    SpruceConfigQuery,
    SpruceConfigQueryVariables
  >(SPRUCE_CONFIG, {
    skip: !!projectIdentifier || !!recentlySelectedProject,
  });

  useEffect(() => {
    if (!projectIdentifier) {
      if (recentlySelectedProject) {
        navigate(getCommitsRoute(recentlySelectedProject), { replace: true });
      } else if (spruceData) {
        // @ts-expect-error: FIXME. This comment was added by an automated script.
        navigate(getCommitsRoute(spruceData?.spruceConfig.ui.defaultProject), {
          replace: true,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectIdentifier, spruceData]);

  const [statusFilters] = useQueryParam<string[]>(
    ProjectFilterOptions.Status,
    [],
  );
  const [variantFilters] = useQueryParam<string[]>(
    ProjectFilterOptions.BuildVariant,
    [],
  );
  const [taskFilters] = useQueryParam<string[]>(ProjectFilterOptions.Task, []);
  const [viewFilter] = useQueryParam(
    ProjectFilterOptions.View,
    "" as ProjectHealthView,
  );
  const [requesterFilterParam] = useQueryParam<string[]>(
    MainlineCommitQueryParams.Requester,
    [],
  );
  const requesterFilters = requesterFilterParam.filter((r) => r !== ALL_VALUE);

  const [revisionParam] = useQueryParam<string>(
    MainlineCommitQueryParams.Revision,
    "",
  );
  const [skipOrderNumber] = useQueryParam<number>(
    MainlineCommitQueryParams.SkipOrderNumber,
    undefined,
  );

  const revision = revisionParam.length ? revisionParam : undefined;

  const filterState = {
    statuses: statusFilters,
    variants: variantFilters,
    tasks: taskFilters,
    requesters: requesterFilters,
    view: viewFilter || ProjectHealthView.Failed,
  };

  const variables = getMainlineCommitsQueryVariables({
    mainlineCommitOptions: {
      // @ts-expect-error: FIXME. This comment was added by an automated script.
      projectIdentifier,
      // @ts-expect-error: FIXME. This comment was added by an automated script.
      skipOrderNumber,
      limit,
      // @ts-expect-error: FIXME. This comment was added by an automated script.
      revision,
    },
    filterState,
  });

  const { hasFilters, hasTasks } = getFilterStatus(filterState);

  const { data, loading, refetch, startPolling, stopPolling } = useQuery<
    MainlineCommitsQuery,
    MainlineCommitsQueryVariables
  >(MAINLINE_COMMITS, {
    skip: !projectIdentifier || isRedirecting || isResizing,
    errorPolicy: "all",
    fetchPolicy: "cache-and-network",
    variables,
    pollInterval: DEFAULT_POLL_INTERVAL,
    onError: (e) =>
      dispatchToast.error(`There was an error loading the page: ${e.message}`),
  });
  // @ts-expect-error: FIXME. This comment was added by an automated script.
  usePolling({ startPolling, stopPolling, refetch });

  const { mainlineCommits } = data || {};
  const { nextPageOrderNumber, prevPageOrderNumber, versions } =
    mainlineCommits || {};

  const queryParamsToDisplay = new Set([
    ProjectFilterOptions.BuildVariant,
    ProjectFilterOptions.Task,
  ]);

  const { badges, handleClearAll, handleOnRemove } =
    useFilterBadgeQueryParams(queryParamsToDisplay);
  const onSubmit = useUpsertQueryParams();

  // @ts-expect-error: FIXME. This comment was added by an automated script.
  const onSubmitTupleSelect = ({ category, value }) => {
    onSubmit({ category, value });
    switch (category) {
      case ProjectFilterOptions.BuildVariant:
        sendEvent({ name: "Filter by build variant" });
        break;
      case ProjectFilterOptions.Task:
        sendEvent({ name: "Filter by task" });
        break;
      default:
    }
  };

  return (
    <PageWrapper>
      {/* @ts-expect-error: FIXME. This comment was added by an automated script. */}
      <ProjectBanner projectIdentifier={projectIdentifier} />
      {/* @ts-expect-error: FIXME. This comment was added by an automated script. */}
      <RepotrackerBanner projectIdentifier={projectIdentifier} />
      <PageContainer>
        <HeaderWrapper>
          <ElementWrapper width="35">
            <TupleSelectWithRegexConditional
              options={tupleSelectOptions}
              onSubmit={onSubmitTupleSelect}
              validator={validateRegexp}
              validatorErrorMessage="Invalid Regular Expression"
            />
          </ElementWrapper>
          <ElementWrapper width="20">
            <StatusSelect />
          </ElementWrapper>
          <ElementWrapper width="20">
            <CommitTypeSelector />
          </ElementWrapper>
          <ElementWrapper width="25">
            <ProjectSelect
              // @ts-expect-error: FIXME. This comment was added by an automated script.
              selectedProjectIdentifier={projectIdentifier}
              getRoute={getCommitsRoute}
              onSubmit={() => {
                sendEvent({
                  name: "Select project",
                });
              }}
            />
          </ElementWrapper>
          <WaterfallMenu />
        </HeaderWrapper>
        <BadgeWrapper>
          <FilterBadges
            onRemove={(b) => {
              sendEvent({ name: "Remove badge" });
              handleOnRemove(b);
            }}
            onClearAll={() => {
              sendEvent({ name: "Clear all badges" });
              handleClearAll();
            }}
            badges={badges}
          />
        </BadgeWrapper>
        <PaginationWrapper>
          {/* @ts-expect-error: FIXME. This comment was added by an automated script. */}
          <ViewToggle identifier={projectIdentifier} />
          <PaginationButtons
            // @ts-expect-error: FIXME. This comment was added by an automated script.
            prevPageOrderNumber={prevPageOrderNumber}
            // @ts-expect-error: FIXME. This comment was added by an automated script.
            nextPageOrderNumber={nextPageOrderNumber}
          />
        </PaginationWrapper>
        <div ref={ref}>
          <CommitsWrapper
            versions={versions}
            revision={revision}
            isLoading={
              (loading && !versions) ||
              !projectIdentifier ||
              isRedirecting ||
              isResizing
            }
            hasTaskFilter={hasTasks}
            hasFilters={hasFilters}
          />
        </div>
      </PageContainer>
      {!shouldDisableForTest && !hasUsedMainlineCommitsBefore && (
        <WelcomeModal
          param="hasUsedMainlineCommitsBefore"
          carouselCards={newMainlineCommitsUser}
        />
      )}
    </PageWrapper>
  );
};

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
`;
const HeaderWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: ${size.s};
`;
const BadgeWrapper = styled.div`
  margin: ${size.s} 0;
`;
const PaginationWrapper = styled.div`
  align-items: center;
  display: flex;
  gap: ${size.xs};
  justify-content: flex-end;
  padding-bottom: ${size.xs};
`;

const tupleSelectOptions = [
  {
    value: ProjectFilterOptions.BuildVariant,
    displayName: "Build Variant",
    placeHolderText: "Search build variants",
  },
  {
    value: ProjectFilterOptions.Task,
    displayName: "Task",
    placeHolderText: "Search task names",
  },
];

const ElementWrapper = styled.div`
  ${({ width }: { width: string }) => `width: ${width}%;`}
`;

export default Commits;
