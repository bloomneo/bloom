/**
 * /cancellation — cancellation policy.
 * @file src/web/features/main/pages/cancellation.tsx
 *
 * Separate from refunds on purpose: cancellation = "stop the
 * subscription", refund = "give the money back". Users often need
 * only one. Splitting them prevents arguments.
 *
 * TODO: Replace with your real cancellation mechanics — self-serve
 * from /account, email-based, effective-immediately vs end-of-cycle.
 */

import { MarketingPageHeader } from '../components/MarketingPageHeader';
import { Link } from 'react-router-dom';

export default function CancellationPage() {
  const lastUpdated = 'YYYY-MM-DD';

  return (
    <>
      <MarketingPageHeader
        title="Cancellation Policy"
        breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Cancellation' },
      ]}
      />
      <div className="max-w-3xl mx-auto space-y-6">
        <p className="text-sm text-muted-foreground">
          Last updated: {lastUpdated}
        </p>

        <LegalSection title="Self-serve cancellation">
          <p>
            Signed-in users can cancel at{' '}
            <Link
              to="/account"
              className="text-primary underline-offset-4 hover:underline"
            >
              Account settings
            </Link>
            . Cancellation takes effect at the end of the current
            billing cycle — you keep access until then.
          </p>
        </LegalSection>

        <LegalSection title="Email cancellation">
          <p>
            Prefer email? Write to{' '}
            <a
              href="mailto:billing@example.com"
              className="text-primary underline-offset-4 hover:underline"
            >
              billing@example.com
            </a>{' '}
            from your account email. We'll confirm within 2 business days.
          </p>
        </LegalSection>

        <LegalSection title="What happens to your data">
          <p>
            On cancellation your subscription stops but your account
            stays dormant. After 90 days of inactivity, your data is
            deleted per our{' '}
            <Link to="/privacy" className="text-primary underline-offset-4 hover:underline">
              privacy policy
            </Link>
            . To delete immediately, email{' '}
            <a
              href="mailto:privacy@example.com"
              className="text-primary underline-offset-4 hover:underline"
            >
              privacy@example.com
            </a>
            .
          </p>
        </LegalSection>
      </div>
    </>
  );
}

function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}
