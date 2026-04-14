import { test as setup } from "@playwright/test";
import { execSync } from "child_process";

// eslint-disable-next-line playwright/expect-expect
setup("dumping the database", async ({}) => {
  try {
    execSync("pnpm evg-db-ops --dump");
  } catch (e) {
    console.error(e);
  }
});
