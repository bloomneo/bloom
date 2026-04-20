/**
 * /refund — refund policy.
 * @file src/web/features/main/pages/refund.tsx
 *
 * Payment processors (Razorpay, Stripe India, PayPal) require a
 * public refund policy URL before enabling live payments. This page
 * gives you one out of the box — edit the specific windows and
 * exceptions to match YOUR product's actual behavior before launch.
 *
 * TODO: Replace the placeholder windows with your real refund terms.
 * TODO: Source support/billing email from /api/settings/public so
 *   the admin Settings editor owns the address.
 */

import { Link } from 'react-router-dom';
import { MarketingPageHeader } from '../components/MarketingPageHeader';
import { SEO } from '../../../shared/components';

const BILLING_EMAIL = 'billing@example.com';
const LAST_UPDATED = 'YYYY-MM-DD';

export default function RefundPage() {
  return (
    <>
      <SEO title="Refund Policy" />
      <MarketingPageHeader
        title="Refund Policy"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Refund' }]}
      />

      <div className="mx-auto space-y-8">
        <p className="text-sm text-muted-foreground">
          Last updated: {LAST_UPDATED}
        </p>

        <section className="space-y-3 text-muted-foreground leading-relaxed">
          <p>
            We want you to be happy with the service. If you're not,
            we'd rather refund you than keep the money. This page
            explains when that works, how to request it, and the few
            situations where it doesn't apply.
          </p>
        </section>

        <LegalSection title="1. Refund window">
          <p>
            <strong>Monthly plans:</strong> full refund within 14 days
            of your first paid billing cycle, no questions asked.
          </p>
          <p>
            <strong>Annual plans:</strong> full refund within 30 days
            of signup. After 30 days, we'll pro-rate a refund for the
            unused portion of the year if you cancel due to a
            documented service-quality issue (extended downtime, data
            loss, regulatory non-compliance).
          </p>
          <p>
            <strong>Plan upgrades mid-cycle:</strong> refundable within
            14 days of the upgrade charge.
          </p>
        </LegalSection>

        <LegalSection title="2. How to request">
          <ol className="list-decimal pl-5 space-y-1">
            <li>
              Email{' '}
              <a
                href={`mailto:${BILLING_EMAIL}`}
                className="text-primary hover:underline"
              >
                {BILLING_EMAIL}
              </a>{' '}
              from the email address on your account.
            </li>
            <li>Include the invoice number or charge date.</li>
            <li>
              One sentence about why — helps us improve, not a
              requirement.
            </li>
          </ol>
          <p>
            We reply within 2 business days. Approved refunds are
            processed within 5–10 business days to the original payment
            method. Statement timing depends on your bank — expect
            another 3–5 days from there.
          </p>
        </LegalSection>

        <LegalSection title="3. What's NOT refundable">
          <ul className="list-disc pl-5 space-y-1">
            <li>
              Usage-based overage charges (e.g. API calls, storage
              beyond plan) already incurred. These reflect actual cost
              to us and aren't reversible.
            </li>
            <li>
              Add-on purchases with a one-time license fee (e.g. a
              perpetual theme) — 30-day refund only.
            </li>
            <li>
              Charges older than 12 months — we can't reverse them via
              the processor.
            </li>
            <li>
              Accounts terminated for violating the{' '}
              <Link to="/terms" className="text-primary hover:underline">
                terms of service
              </Link>{' '}
              (spam, illegal content, etc.).
            </li>
          </ul>
        </LegalSection>

        <LegalSection title="4. Chargebacks">
          <p>
            Please email us before filing a chargeback with your card
            issuer. Chargebacks cost us a non-refundable fee even when
            we refund you, and we'd rather spend that on the product.
            If you're unhappy, we'll find a way to fix it — promise.
          </p>
        </LegalSection>

        <LegalSection title="5. Questions">
          <p>
            Email{' '}
            <a
              href={`mailto:${BILLING_EMAIL}`}
              className="text-primary hover:underline"
            >
              {BILLING_EMAIL}
            </a>
            . Non-billing questions belong on the{' '}
            <Link to="/contact" className="text-primary hover:underline">
              contact page
            </Link>
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
      <div className="space-y-3 text-muted-foreground leading-relaxed">
        {children}
      </div>
    </section>
  );
}
