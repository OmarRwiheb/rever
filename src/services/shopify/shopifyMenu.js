// services/shopifyMenus.js
import { apiClient } from '../axios';

/** Query menu + resource handles for clean internal hrefs */
const MENU_QUERY = `
  query Menu($handle: String!) {
    menu(handle: $handle) {
      items {
        title
        url
        resource {
          __typename
          ... on Collection { handle }
          ... on Product    { handle }
          ... on Page       { handle }
          ... on Blog       { handle }
          ... on Article    { handle }
        }
        items {
          title
          url
          resource {
            __typename
            ... on Collection { handle }
            ... on Product    { handle }
            ... on Page       { handle }
            ... on Blog       { handle }
            ... on Article    { handle }
          }
          items {
            title
            url
            resource {
              __typename
              ... on Collection { handle }
              ... on Product    { handle }
              ... on Page       { handle }
              ... on Blog       { handle }
              ... on Article    { handle }
            }
          }
        }
      }
    }
  }
`;

/** Build site-relative hrefs from resource or URL */
function toHref(url, resource) {
  if (resource?.__typename && resource?.handle) {
    switch (resource.__typename) {
      case 'Collection': return `/collections/${resource.handle}`;
      case 'Product':    return `/products/${resource.handle}`;
      case 'Page':       return `/pages/${resource.handle}`;
      case 'Blog':       return `/blogs/${resource.handle}`;
      case 'Article':    return `/blogs/${resource.handle}`; // adjust if you use /blogs/:blog/:article
      default: break;
    }
  }
  if (!url) return '#';
  if (url.startsWith('/')) return url;
  try { return new URL(url).pathname || '/'; } catch { return url.startsWith('/') ? url : `/${url}`; }
}

/**
 * Output:
 * [
 *   { name, href, hasDropdown: false } |
 *   { name, href, hasDropdown: true, dropdownItems: [{ title, href, links: []|[...] }] }
 * ]
 *
 * Rule:
 * - 2nd layer WITH children → { title, href, links:[...] }
 * - 2nd layer WITHOUT children → { title, href, links: [] }
 */
function transformMenuToNavLinks(menu) {
  const roots = Array.isArray(menu?.items) ? menu.items : [];

  return roots.map((root) => {
    const rootHref = toHref(root.url, root.resource);
    const children = Array.isArray(root.items) ? root.items : [];

    if (children.length === 0) {
      return { name: root.title, href: rootHref, hasDropdown: false };
    }

    const dropdownItems = children.map((section) => {
      const sectionHref = toHref(section.url, section.resource);
      const grandchildren = Array.isArray(section.items) ? section.items : [];

      return {
        title: section.title,
        href: sectionHref, // second-layer is clickable
        links: grandchildren.map((leaf) => ({
          name: leaf.title,
          href: toHref(leaf.url, leaf.resource),
        })), // [] if none
      };
    });

    return {
      name: root.title,
      href: rootHref,
      hasDropdown: true,
      dropdownItems,
    };
  });
}

export async function getNavLinks(handle = 'main-menu') {
  const data = await apiClient.graphql(MENU_QUERY, { handle });
  if (!data?.menu) return [];
  return transformMenuToNavLinks(data.menu);
}
