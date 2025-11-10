import type { AnchorHTMLAttributes, PropsWithChildren } from 'react';
import { buildExternalLinkAttrs } from '../utils/linking';

interface LinkOutProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'rel' | 'target'> {
  /** Whether to retain the referrer header for analytics/SEO association. */
  allowReferrer: boolean;
  /** Defaults to true for external links; set false if you want same-tab navigation. */
  newTab?: boolean;
}

export function LinkOut({ allowReferrer, newTab = true, children, ...rest }: PropsWithChildren<LinkOutProps>) {
  const externalAttrs = buildExternalLinkAttrs({ allowReferrer, newTab });

  return (
    <a {...externalAttrs} {...rest}>
      {children}
    </a>
  );
}
