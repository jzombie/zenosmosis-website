import type { AnchorHTMLAttributes } from 'react';

interface LinkPreference {
  allowReferrer: boolean;
  newTab?: boolean;
}

interface ExternalLinkAttributes {
  target?: AnchorHTMLAttributes<HTMLAnchorElement>['target'];
  rel: AnchorHTMLAttributes<HTMLAnchorElement>['rel'];
}

const noopener = 'noopener';
const noreferrer = 'noreferrer';

/**
 * Shared utility to build consistent link attributes so we never forget to declare
 * whether a link should preserve the referrer header. Keeps usage explicit per link.
 */
export function buildExternalLinkAttrs({ allowReferrer, newTab = true }: LinkPreference): ExternalLinkAttributes {
  const relParts = [noopener];

  if (!allowReferrer) {
    relParts.push(noreferrer);
  }

  return {
    target: newTab ? '_blank' : undefined,
    rel: relParts.join(' '),
  };
}

/**
 * Helper used when triggering links through JS (e.g. list items acting like buttons)
 * to ensure referrer handling matches the declarative anchors we render elsewhere.
 */
export function openLink(url: string, { allowReferrer, newTab = true }: LinkPreference) {
  const target = newTab ? '_blank' : '_self';
  const features = allowReferrer ? noopener : `${noopener},${noreferrer}`;
  if (newTab) {
    window.open(url, target, features);
  } else {
    window.open(url, target);
  }
}
