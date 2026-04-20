/**
 * /cancellation — cancellation policy.
 * @file src/web/features/main/pages/cancellation.tsx
 *
 * Separate from the refund policy on purpose:
 *   - Cancellation = "stop the subscription"
 *   - Refund       = "give the money back"
 *
 * Users often want one without the other. Splitting the pages avoids
 * confusion when an angry customer opens a chargeback because they
 * assume "cancel" means "refund too."
 *
 * TODO: If your app doesn't have self-serve cancellation yet, remove
 *   the /account-based path and lean on email-only. Promise to wire
 *   self-serve up — it reduces support load fast.
 */

import { Link } from 'react-router-dom';
import { MarketingPageHeader } from '../components/MarketingPageHeader';
import { SEO } from '../../../shared/components';

const BILLING_EMAIL = 'billing@example.com';
const PRIVACY_EMAIL = 'privacy@example.com';
const LAST_UPDATED = 'YYYY-MM-DD';

export default function CancellationPage() {
  return (
    <>
      <SEO title="Cancellation Policy" />
      <MarketingPageHeader
        title="Cancellation Policy"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Cancellation' },
        ]}
      />

      <div className="mx-auto space-y-8">
        <p className="text-sm text-muted-foreground">
          Last updated: {LAST_UPDATED}
        </p>

        <section className="space-y-3 text-muted-foreground leading-relaxed">
          <p>
            You can cancel at any time. We never lock you in with
            contracts or make you call a support line to do it. This
            page explains the two ways to cancel and what happens to
            your data afterward.
          </p>
        </section>

        <LegalSection title="1. Self-serve cancellation (recommended)">
          <p>
            Signed-in users can cancel from{' '}
            <Link to="/account" className="text-primary hover:underline">
              Account settings
            </Link>
            . Click <em>Cancel subscription</em> and confirm. The page
            will show you the exact date your access ends.
          </p>
          <p>
            <strong>Effective date:</strong> cancellation takes effect
            at the end of your current billing cycle. You keep the
            service until then — no "pay to the day" pro-rations.
          </p>
          <p>
            <strong>Confirmation:</strong> you get an email the moment
            you cancel, and a reminder 3 days before access ends so
            you can export anything you still need.
          </p>
        </LegalSection>

        <LegalSection title="2. Email cancellation">
          <p>
            Prefer email? Write to{' '}
            <a
              href={`mailto:${BILLING_EMAIL}`}
              className="text-primary hover:underline"
            >
              {BILLING_EMAIL}
            </a>{' '}
            from your account's email address. Include "Cancel
            subscription" in the subject so our queue routes it
            automatically.
          </p>
          <p>
            We confirm within 1 business day. Same end-of-cycle
            behavior as self-serve — you aren't charged again.
          </p>
        </LegalSection>

        <LegalSection title="3. Refunds at cancellation">
          <p>
            Cancellation does NOT trigger an automatic refund. If the
            cancellation falls inside the window described in the{' '}
            <Link to="/refund" className="text-primary hover:underline">
              refund policy
            </Link>
            , email us and we'll process one.
          </p>
        </LegalSection>

        <LegalSection title="4. What happens to your data">
          <p>
            When you cancel, we <strong>don't</strong> immediately
            delete your account. Your data stays dormant so you can
            come back and resume any time in the next 90 days without
            losing anything.
          </p>
          <p>
            After 90 days of inactivity, we delete the account and
            derived records per the{' '}
            <Link to="/privacy" className="text-primary hover:underline">
              privacy policy
            </Link>
            . Backups roll off within a further 30 days.
          </p>
          <p>
            <strong>Need to delete immediately?</strong> Email{' '}
            <a
              href={`mailto:${PRIVACY_EMAIL}`}
              className="text-primary hover:underline"
            >
              {PRIVACY_EMAIL}
            </a>{' '}
            from your account's email address. We'll confirm the delete
            within 1 business day.
          </p>
        </LegalSection>

        <LegalSection title="5. Data export">
          <p>
            Before or after cancellation (within the 90-day window), you
            can request a JSON export of your account data. It's usually
            delivered within the hour via email.
          </p>
        </LegalSection>

        <LegalSection title="6. Something we should fix?">
          <p>
            If you're cancelling because of a bug, a missing feature, or
            bad support, we'd love to hear about it before you go.
            Reply to your cancellation confirmation email and we'll
            read every word.
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
      <div className="space-y-3 text-muted-foreground leading-relaxed">
        {children}
      </div>
    </section>
  );
}
