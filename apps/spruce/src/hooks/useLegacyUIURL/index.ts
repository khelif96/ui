import { useState, useEffect } from "react";
import { matchPath, useLocation, Params } from "react-router-dom";
import { idSlugs, routes } from "constants/routes";
import { environmentVariables } from "utils";

const { getEvergreenUrl } = environmentVariables;

export const useLegacyUIURL = (): string | null => {
  const [id, setId] = useState("");
  const [legacyUIUrl, setLegacyUIUrl] = useState(null);
  const { pathname } = useLocation();

  const uiURL = getEvergreenUrl();

  useEffect(() => {
    setId("");
    setLegacyUIUrl(null);

    const legacyUIMap = {
      [`${routes.version}/*`]: `${uiURL}/version/${id}`,
      [`${routes.configurePatch}/*`]: `${uiURL}/patch/${id}`,
      [routes.userPatches]: `${uiURL}/patches/user/${id}`,
      [`${routes.task}/*`]: `${uiURL}/task/${id}`,
      [routes.spawnHost]: `${uiURL}/spawn#?resourcetype=hosts`,
      [routes.spawnVolume]: `${uiURL}/spawn#?resourcetype=volumes`,
      [routes.hosts]: `${uiURL}/hosts`,
      [routes.host]: `${uiURL}/host/${id}`,
    };
    const legacyUIKeys = Object.keys(legacyUIMap);
    for (let i = 0; i < legacyUIKeys.length; i++) {
      const matchedPath = matchPath(legacyUIKeys[i], pathname);
      if (matchedPath !== null) {
        // @ts-expect-error: FIXME. This comment was added by an automated script.
        setId(slugToId(matchedPath.params));
        // @ts-expect-error: FIXME. This comment was added by an automated script.
        setLegacyUIUrl(legacyUIMap[legacyUIKeys[i]]);
        break;
      }
    }
  }, [id, pathname, uiURL]);

  return legacyUIUrl;
};

/**
 * `slugToId` is a helper function that takes a Params object from react-router-dom's matchPath and returns a slug value from the slugs object if it is a suitable id.
 * @param matchedPathParams - Params object from react-router-dom's matchPath
 * @returns string | undefined
 */
const slugToId = (matchedPathParams: Params): string | undefined => {
  for (let i = 0; i < idSlugs.length; i++) {
    const key = idSlugs[i];
    if (matchedPathParams[key]) {
      return matchedPathParams[key];
    }
  }
  return undefined;
};
