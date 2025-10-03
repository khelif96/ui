import { usePageViewDuration } from "@evg-ui/lib/analytics/hooks";
import { usePageTitle } from "@evg-ui/lib/hooks/usePageTitle";
import LogWindow from "components/LogWindow";
import { useLogContext } from "context/LogContext";
import FileDropper from "./LogDrop/FileDropper";

const LogDrop = () => {
  const { hasLogs, logMetadata } = useLogContext();
  usePageTitle(`${hasLogs ? logMetadata?.fileName : "Upload logs"} | Parsley`);
  usePageViewDuration("Log Drop", {
    "page.has_logs": hasLogs ?? false,
  });
  return hasLogs ? <LogWindow /> : <FileDropper />;
};

export default LogDrop;
