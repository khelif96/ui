import { useEffect } from "react";
import { useQueryParam } from "hooks/useQueryParam";
import { HistoryQueryParams } from "types/history";
import { useHistoryTable } from "../HistoryTableContext";

const useJumpToCommit = () => {
  const [skipOrderNumber] = useQueryParam<number | null>(
    HistoryQueryParams.SelectedCommit,
    null,
  );

  const { setSelectedCommit } = useHistoryTable();
  useEffect(() => {
    if (skipOrderNumber) {
      setSelectedCommit(skipOrderNumber);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skipOrderNumber]);
};

export default useJumpToCommit;
