/**
 * /terms — terms of service.
 * @file src/web/features/main/pages/terms.tsx
 *
 * PLACEHOLDER content. Same caveat as the privacy page — you need
 * jurisdictional advice before a production launch.
 *
 * Minimum shape for a SaaS terms page:
 *   - Account + eligibility
 *   - Acceptable use
 *   - Fees + billing (link to /refund + /cancellation)
 *   - Intellectual property
 *   - Liability + warranty disclaimers
 *   - Termination
 *   - Governing law + dispute resolution
 *   - Contact
 *
 * TODO: Have a lawyer review. Templates like SaaSGuru or Termly are a
 * fine starting point — tailor liability sections in particular.
 */

import { MarketingPageHeader } from '../components/MarketingPageHeader';
import { Link } from 'react-router-dom';

export default function TermsPage() {
  const lastUpdated = 'YYYY-MM-DD';

  return (
    <>
      <MarketingPageHeader
        title="Terms of Service"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Terms' }]}
      />
      <div className="max-w-3xl mx-auto space-y-6">
        <p className="text-sm text-muted-foreground">
          Last updated: {lastUpdated}
        </p>

        <LegalSection title="Acceptance">
          <p>
            By creating an account, you agree to these terms. If you're
            using the service on behalf of a company, you represent that
            you have authority to bind that company.
          </p>
        </LegalSection>

        <LegalSection title="Your account">
          <p>
            You're responsible for the credentials on your account and
            for all activity under it. Don't share logins. Notify us
            immediately if you suspect unauthorized access.
          </p>
        </LegalSection>

        <LegalSection title="Acceptable use">
          <p>
            Short list of what users must not do — typically: no illegal
            content, no spam, no reverse engineering, no use that
            degrades service for others.
          </p>
        </LegalSection>

        <LegalSection title="Fees, refunds, cancellation">
          <p>
            Billing terms in one paragraph, with links to{' '}
            <Link to="/refund" className="text-primary underline-offset-4 hover:underline">
              the refund policy
            </Link>{' '}
            and{' '}
            <Link to="/cancellation" className="text-primary underline-offset-4 hover:underline">
              the cancellation policy
            </Link>
            .
          </p>
        </LegalSection>

        <LegalSection title="Liability">
          <p>
            Standard "service provided as-is" language here. Get
            legal review — this section is where most disputes land.
          </p>
        </LegalSection>

        <LegalSection title="Termination">
          <p>
            When you or we can end the relationship, and what happens
            to your data when that happens.
          </p>
        </LegalSection>

        <LegalSection title="Contact">
          <p>
            Questions? Email{' '}
            <a
              href="mailto:legal@example.com"
              className="text-primary underline-offset-4 hover:underline"
            >
              legal@example.com
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
