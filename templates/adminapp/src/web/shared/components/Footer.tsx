/**
 * Shared footer rendered inside every MarketingLayout-wrapped page.
 * @file src/web/shared/components/Footer.tsx
 *
 * Admin pages use AdminShell (not MarketingLayout) and render without
 * a footer — the bottom-nav takes that real estate on mobile anyway.
 *
 * TODO: Swap the hard-coded company name + links for values pulled
 * from /api/settings/public (business_name, support_email). That way
 * the footer updates from the admin settings editor.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Footer as UIFooter } from '@bloomneo/uikit';
import { ArrowUp } from 'lucide-react';

/**
 * Public-facing footer link set. Every payment-processor onboarding
 * form asks for a refund + cancellation URL; this is where those live.
 * Order: legal first, then contact — legal links get the most clicks
 * from processor review.
 */
const FOOTER_LINKS: Array<{ label: string; to: string }> = [
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
  { label: 'Terms', to: '/terms' },
  { label: 'Privacy', to: '/privacy' },
  { label: 'Refund', to: '/refund' },
  { label: 'Cancellation', to: '/cancellation' },
];

/**
 * Floating "Back to top" button. Appears in the bottom-right of the
 * viewport after the user has scrolled ~400px down, and scrolls back
 * to the top on click. Hidden until needed so short pages don't show
 * a pointless floating control.
 *
 * Lives inside the Footer component because visually it anchors to
 * the footer area — but the actual element is fixed-positioned so it
 * doesn't shift the footer's layout.
 */
function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      aria-label="Scroll to top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-6 z-40 size-10 rounded-full bg-primary text-primary-foreground shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}

export const Footer: React.FC = () => {
  return (
    <>
      <UIFooter tone="subtle" size="xl">
        <div className="flex flex-col gap-6 py-6">
          {/* Links row — wraps to multiple rows on narrow screens. */}
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Copyright. Replace "MyApp" with your real brand — see the
              TODO at the top of this file for how to make it dynamic. */}
          <div className="border-t pt-4 text-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} MyApp. All rights reserved.
            </p>
          </div>
        </div>
      </UIFooter>
      <BackToTopButton />
    </>
  );
};
