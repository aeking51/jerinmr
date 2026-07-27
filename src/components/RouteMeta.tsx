import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_ORIGIN = "https://www.jerinmr.com";

const NOINDEX_PREFIXES = ["/admin", "/sl/", "/forgot-password", "/reset-password"];

function setLinkTag(rel: string, href: string) {
  let tag = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!tag) {
    tag = document.createElement("link");
    tag.setAttribute("rel", rel);
    document.head.appendChild(tag);
  }
  tag.setAttribute("href", href);
}

function setMetaTag(key: string, content: string, isProperty = false) {
  const attr = isProperty ? "property" : "name";
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

/**
 * Keeps canonical / og:url self-referencing per route and marks
 * non-public routes (admin, auth, short links, 404) as noindex.
 */
const RouteMeta = () => {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    const url = `${SITE_ORIGIN}${path === "/" ? "/" : path.replace(/\/$/, "")}`;

    setLinkTag("canonical", url);
    setMetaTag("og:url", url, true);

    const isPrivate = NOINDEX_PREFIXES.some((p) => path.startsWith(p));
    setMetaTag("robots", isPrivate ? "noindex, nofollow" : "index, follow");
  }, [location.pathname]);

  return null;
};

export default RouteMeta;
