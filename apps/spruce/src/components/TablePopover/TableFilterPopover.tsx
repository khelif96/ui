import { useState, useRef } from "react";
import styled from "@emotion/styled";
import Icon from "@leafygreen-ui/icon";
import IconButton from "@leafygreen-ui/icon-button";
import { palette } from "@leafygreen-ui/palette";
import Popover from "@leafygreen-ui/popover";
import { size } from "@evg-ui/lib/constants/tokens";
import { useOnClickOutside } from "@evg-ui/lib/hooks";
import { PopoverContainer } from "components/styles/Popover";
import { TreeDataEntry, TreeSelect } from "../TreeSelect";

const { blue, gray } = palette;

interface TableFilterPopoverProps {
  "data-cy"?: string;
  onConfirm: (filters: string[]) => void;
  options: TreeDataEntry[];
  value: string[];
}

export const TableFilterPopover: React.FC<TableFilterPopoverProps> = ({
  "data-cy": dataCy,
  onConfirm,
  options,
  value,
}) => {
  const [active, setActive] = useState(false);
  const hasFilters = value.length > 0;
  const iconColor = hasFilters ? blue.base : gray.dark2;

  const buttonRef = useRef(null);
  const popoverRef = useRef(null);

  // Handle onClickOutside
  useOnClickOutside([buttonRef, popoverRef], () => setActive(false));

  const onChange = (newFilters: string[]) => {
    onConfirm(newFilters);
  };

  return (
    <FilterWrapper>
      <IconButton
        ref={buttonRef}
        active={active}
        aria-label="Table Filter Popover Icon"
        data-cy={dataCy}
        data-highlighted={hasFilters}
        onClick={() => setActive(!active)}
      >
        <Icon color={iconColor} glyph="Filter" small="xsmall" />
      </IconButton>
      <Popover active={active} align="bottom" justify="middle">
        <PopoverContainer ref={popoverRef} data-cy={`${dataCy}-wrapper`}>
          {options.length > 0 ? (
            <TreeSelect
              hasStyling={false}
              onChange={onChange}
              state={value}
              tData={options}
            />
          ) : (
            <span>No filters available.</span>
          )}
        </PopoverContainer>
      </Popover>
    </FilterWrapper>
  );
};

const FilterWrapper = styled.div`
  margin-left: ${size.xxs};
`;
