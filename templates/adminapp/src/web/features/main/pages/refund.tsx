/**
 * /refund — refund policy.
 * @file src/web/features/main/pages/refund.tsx
 *
 * Many payment processors (Razorpay, Stripe India, PayPal) require a
 * public refund policy URL before they'll enable live payments. This
 * file gives you one out of the box — edit to match your actual terms.
 *
 * TODO: Spell out exact windows, exceptions, and the process to request
 * a refund. Vague policies get you stuck in chargeback disputes.
 */

import { MarketingPageHeader } from '../components/MarketingPageHeader';

export default function RefundPage() {
  const lastUpdated = 'YYYY-MM-DD';

  return (
    <>
      <MarketingPageHeader
        title="Refund Policy"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Refund' }]}
      />
      <div className="max-w-3xl mx-auto space-y-6">
        <p className="text-sm text-muted-foreground">
          Last updated: {lastUpdated}
        </p>

        <LegalSection title="When refunds apply">
          <p>
            Describe the conditions under which you offer refunds —
            e.g. within 14 days of first purchase, unused subscriptions,
            duplicate charges.
          </p>
        </LegalSection>

        <LegalSection title="How to request a refund">
          <p>
            Email{' '}
            <a
              href="mailto:billing@example.com"
              className="text-primary underline-offset-4 hover:underline"
            >
              billing@example.com
            </a>{' '}
            with your account email and the charge you're disputing.
            We'll respond within 2 business days.
          </p>
        </LegalSection>

        <LegalSection title="Processing time">
          <p>
            Approved refunds are processed within 5–10 business days.
            The refund lands back on the original payment method; bank
            statement timing depends on your bank.
          </p>
        </LegalSection>

        <LegalSection title="Exceptions">
          <p>
            What's NOT refundable. Be explicit — "usage-based overages"
            or "pro-rated mid-cycle charges" are common carve-outs.
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
