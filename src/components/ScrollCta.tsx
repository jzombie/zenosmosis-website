import type { AnchorHTMLAttributes, MouseEvent, PropsWithChildren } from 'react';
import { scrollToHighlightedSection } from '../utils/linking';

interface ScrollCtaProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'onClick'> {
  /** id of the footer section to scroll to and temporarily highlight. */
  targetId: string;
  /** Fallback href used when the target section is missing. Defaults to mailto:. */
  fallbackHref?: string;
}

/**
 * Reusable in-page CTA that smooth-scrolls to a footer section and applies the
 * shared highlight treatment (red outline + arrow). Used by hero buttons like
 * Contact and Explore so the scroll/highlight behavior lives in one component.
 */
export function ScrollCta({
  targetId,
  fallbackHref,
  children,
  ...rest
}: PropsWithChildren<ScrollCtaProps>) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const found = scrollToHighlightedSection(targetId);
    if (!found && fallbackHref) {
      window.location.href = fallbackHref;
    }
  };

  return (
    <a href={`#${targetId}`} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
