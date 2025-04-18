import { cloneElement, useState } from "react";
import { useQuery } from "@apollo/client";
import { Menu, MenuItem } from "@leafygreen-ui/menu";
import { zIndex } from "@evg-ui/lib/constants/tokens";
import { PlusButton, Size, Variant } from "components/Buttons";
import {
  UserProjectSettingsPermissionsQuery,
  UserProjectSettingsPermissionsQueryVariables,
} from "gql/generated/types";
import { USER_PROJECT_SETTINGS_PERMISSIONS } from "gql/queries";
import { CopyProjectModal } from "./CopyProjectModal";
import { CreateProjectModal } from "./CreateProjectModal";
import { ProjectType } from "./tabs/utils";

const NewProjectButton = (
  <PlusButton
    data-cy="new-project-button"
    size={Size.Small}
    variant={Variant.Primary}
  >
    New Project
  </PlusButton>
);

interface Props {
  id: string;
  label: string;
  owner: string;
  projectType: ProjectType;
  repo: string;
}

export const CreateDuplicateProjectButton: React.FC<Props> = ({
  id,
  label,
  owner,
  projectType,
  repo,
}) => {
  const { data } = useQuery<
    UserProjectSettingsPermissionsQuery,
    UserProjectSettingsPermissionsQueryVariables
  >(USER_PROJECT_SETTINGS_PERMISSIONS, {
    variables: { projectIdentifier: id },
    skip: !id,
  });

  const {
    user: {
      permissions: { canCreateProject },
    },
  } = data ?? { user: { permissions: {} } };

  const [menuOpen, setMenuOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [copyModalOpen, setCopyModalOpen] = useState(false);

  if (!canCreateProject) {
    return null;
  }

  return (
    <>
      {projectType === ProjectType.Repo ? (
        // Use cloneElement so that the same component can be used as a button and a Menu trigger
        cloneElement(NewProjectButton, {
          onClick: () => setCreateModalOpen(true),
        })
      ) : (
        <Menu
          data-cy="new-project-menu"
          open={menuOpen}
          popoverZIndex={zIndex.popover}
          setOpen={setMenuOpen}
          trigger={NewProjectButton}
        >
          <MenuItem
            data-cy="create-project-button"
            onClick={() => {
              setMenuOpen(false);
              setCreateModalOpen(true);
            }}
          >
            Create New Project
          </MenuItem>
          <MenuItem
            data-cy="copy-project-button"
            onClick={() => {
              setMenuOpen(false);
              setCopyModalOpen(true);
            }}
          >
            Duplicate Current Project
          </MenuItem>
        </Menu>
      )}
      {owner && repo && (
        <CreateProjectModal
          handleClose={() => setCreateModalOpen(false)}
          open={createModalOpen}
          owner={owner}
          repo={repo}
        />
      )}
      <CopyProjectModal
        handleClose={() => setCopyModalOpen(false)}
        id={id}
        label={label}
        open={copyModalOpen}
      />
    </>
  );
};
