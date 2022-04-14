import { useState } from "react";
import styled from "@emotion/styled";
import { Label } from "@leafygreen-ui/typography";
import { Input, Select } from "antd";
import { useLocation } from "react-router";
import Icon from "components/Icon";
import { useUpdateURLQueryParams } from "hooks/useUpdateURLQueryParams";
import { queryString, url } from "utils";

const { upsertQueryParam } = url;
const { parseQueryString } = queryString;

const { Option } = Select;
type option = {
  value: string;
  displayName: string;
  placeHolderText: string;
};

interface TupleSelectProps {
  options: option[];
  onSubmit?: ({ category, value }: { category: string; value: string }) => void;
}
export const TupleSelect: React.VFC<TupleSelectProps> = ({
  options,
  onSubmit = () => {},
}) => {
  const [input, setInput] = useState("");
  const [selected, setSelected] = useState(options[0].value);
  const updateQueryParams = useUpdateURLQueryParams();
  const { search } = useLocation();
  const queryParams = parseQueryString(search);

  const handleOnSubmit = () => {
    const selectedParams = queryParams[selected] as string[];
    const updatedParams = upsertQueryParam(selectedParams, input);
    onSubmit({ category: selected, value: input });
    updateQueryParams({ [selected]: updatedParams });
    setInput("");
  };
  const selectedOption = options.find((o) => o.value === selected);
  return (
    <Container>
      <Label htmlFor="filter-input">
        Add New {selectedOption.displayName} Filter
      </Label>
      <Input.Group compact>
        <Select
          style={{ width: "30%" }}
          value={selected}
          onChange={(v) => setSelected(v)}
          aria-label="Select Drop Down"
          data-cy="tuple-select-dropdown"
        >
          {options.map((o) => (
            <Option
              key={o.value}
              value={o.value}
              data-cy={`tuple-select-option-${o.value}`}
            >
              {o.displayName}
            </Option>
          ))}
        </Select>
        <Input
          id="filter-input"
          aria-label="Select Text Input"
          data-cy="tuple-select-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ width: "70%" }}
          placeholder={selectedOption.placeHolderText}
          suffix={
            <Icon
              glyph="Plus"
              onClick={handleOnSubmit}
              aria-label="Select plus button"
              data-cy="tuple-select-button"
            />
          }
          onPressEnter={handleOnSubmit}
        />
      </Input.Group>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;
