import { useMemo } from "react";
import { useQuery } from "@apollo/client";
import {
  Combobox,
  ComboboxGroup,
  ComboboxOption,
} from "@leafygreen-ui/combobox";
import { useNavigate } from "react-router-dom";
import { zIndex } from "@evg-ui/lib/constants/tokens";
import { getDistroSettingsRoute } from "constants/routes";
import { DistrosQuery, DistrosQueryVariables } from "gql/generated/types";
import { DISTROS } from "gql/queries";

interface DistroSelectProps {
  selectedDistro: string;
}

export const DistroSelect: React.FC<DistroSelectProps> = ({
  selectedDistro,
}) => {
  const navigate = useNavigate();

  const { data: distrosData, loading } = useQuery<
    DistrosQuery,
    DistrosQueryVariables
  >(DISTROS, {
    variables: {
      onlySpawnable: false,
    },
  });

  const [adminOnly, nonAdminOnly] = useMemo(
    () => filterAdminOnlyDistros(distrosData?.distros ?? []),
    [distrosData?.distros],
  );

  return loading ? null : (
    <Combobox
      clearable={false}
      data-cy="distro-select"
      label="Distro"
      // @ts-expect-error: FIXME. This comment was added by an automated script.
      onChange={(distroId: string) => {
        navigate(getDistroSettingsRoute(distroId));
      }}
      placeholder="Select distro"
      popoverZIndex={zIndex.popover}
      portalClassName="distro-select-options"
      value={selectedDistro}
    >
      {nonAdminOnly.map(({ name }) => (
        <ComboboxOption key={name} value={name}>
          {name}
        </ComboboxOption>
      ))}
      {adminOnly.length > 0 && (
        <ComboboxGroup label="Admin-Only">
          {adminOnly.map(({ name }) => (
            <ComboboxOption key={name} value={name}>
              {name}
            </ComboboxOption>
          ))}
        </ComboboxGroup>
      )}
    </Combobox>
  );
};

// Returns an array of [adminOnlyDistros, nonAdminOnlyDistros]
const filterAdminOnlyDistros = (distros: DistrosQuery["distros"]) =>
  distros.reduce(
    (accum, distro) => {
      const [adminOnly, nonAdminOnly] = accum;
      // @ts-expect-error: FIXME. This comment was added by an automated script.
      (distro.adminOnly ? adminOnly : nonAdminOnly).push(distro);
      return accum;
    },
    [[], []],
  );
