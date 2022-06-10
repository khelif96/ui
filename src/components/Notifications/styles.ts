import styled from "@emotion/styled";
import { uiColors } from "@leafygreen-ui/palette";
import { Select, Input, Button } from "antd";
import { fontSize, size } from "constants/tokens";

const { gray } = uiColors;

export const inputWidth = "width: calc(80% - 55px);";

export const StyledSelect = styled(Select)`
  ${inputWidth}
  margin-bottom: ${size.xs};
`;

export const StyledInput = styled(Input)`
  ${inputWidth}
`;

export const ExtraFieldContainer = styled.div`
  margin-bottom: ${size.xs};
`;

export const Section = styled.div`
  padding-bottom: ${size.m};
  margin-bottom: ${size.m};
  border-bottom: 1px solid ${gray.light2};
`;

export const RegexSelectorInputContainer = styled.div`
  padding-top: ${size.xs};
`;
export const SectionLabelContainer = styled.div`
  padding-top: ${size.s};
`;

/* @ts-expect-error */
export const LeftButton = styled(Button)`
  margin-right: ${size.s};
` as typeof Button;

export const InputLabel = styled.label`
  font-size: ${fontSize.m};
  font-weight: bold;
`;
