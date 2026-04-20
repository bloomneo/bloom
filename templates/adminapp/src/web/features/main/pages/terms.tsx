/**
 * /terms — terms of service.
 * @file src/web/features/main/pages/terms.tsx
 *
 * PLACEHOLDER legal copy — readable enough to ship while you
 * customize, but NOT a substitute for lawyer review before launch.
 * Liability and jurisdiction sections in particular deserve a
 * proper attorney's eye.
 *
 * Reference models: Stripe Services Agreement, Linear Terms,
 *   Vercel ToS. Pick one that matches your business shape, adapt,
 *   then have counsel mark it up.
 *
 * TODO: Have a lawyer review before production.
 */

import { Link } from 'react-router-dom';
import { MarketingPageHeader } from '../components/MarketingPageHeader';
import { SEO } from '../../../shared/components';

const COMPANY = 'MyApp Inc.';
const CONTACT_EMAIL = 'legal@example.com';
const LAST_UPDATED = 'YYYY-MM-DD';

export default function TermsPage() {
  return (
    <>
      <SEO title="Terms of Service" />
      <MarketingPageHeader
        title="Terms of Service"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Terms' }]}
      />

      <div className="mx-auto space-y-8">
        <p className="text-sm text-muted-foreground">
          Last updated: {LAST_UPDATED} &nbsp;·&nbsp; Entity: {COMPANY}
        </p>

        <LegalSection title="1. Acceptance">
          <p>
            By creating an account or using the service, you agree to
            these terms. If you're signing up on behalf of a company,
            you represent that you have authority to bind that company,
            and "you" in this document means both you personally and
            the company.
          </p>
          <p>
            If you don't agree to any part of this, don't use the
            service. If you stop agreeing later, stop using the service
            — you can always{' '}
            <Link to="/cancellation" className="text-primary hover:underline">
              cancel
            </Link>
            .
          </p>
        </LegalSection>

        <LegalSection title="2. Your account">
          <ul className="list-disc pl-5 space-y-1">
            <li>
              You must provide accurate information when you sign up and
              keep it current.
            </li>
            <li>
              You are responsible for the credentials on your account.
              Use a strong password and enable MFA if we offer it.
            </li>
            <li>
              You must be 16 or older (18 in some jurisdictions — your
              local rules apply).
            </li>
            <li>
              One person per account. Don't share logins — invite
              teammates via the built-in user management instead.
            </li>
            <li>
              Notify us immediately at{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">
                {CONTACT_EMAIL}
              </a>{' '}
              if you suspect unauthorized access.
            </li>
          </ul>
        </LegalSection>

        <LegalSection title="3. Acceptable use">
          <p>You agree not to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Use the service for anything illegal in your jurisdiction or ours.</li>
            <li>
              Send spam, malware, or content that violates others' rights
              (copyright, privacy, publicity).
            </li>
            <li>
              Reverse-engineer, decompile, or otherwise try to extract our
              source code — except where applicable law overrides this.
            </li>
            <li>
              Abuse automated access in a way that degrades service for
              others. Reasonable rate-limited use is fine; scraping
              aggressively or running DoS-style patterns isn't.
            </li>
            <li>
              Resell or white-label the service without a separate written
              agreement.
            </li>
          </ul>
          <p>
            We may suspend or terminate accounts that violate this
            section. Where possible we'll warn first; when harm is
            immediate we may act without notice.
          </p>
        </LegalSection>

        <LegalSection title="4. Content & data">
          <p>
            You own the content you put into the service. By uploading
            it, you grant us a limited, non-exclusive license to store,
            transmit, process, and display it — solely to operate the
            service and as permitted by our{' '}
            <Link to="/privacy" className="text-primary hover:underline">
              privacy policy
            </Link>
            . That license ends when you delete the content or close your
            account (subject to backup retention windows).
          </p>
          <p>
            We don't claim ownership of your content and we don't use it
            to train generic AI models.
          </p>
        </LegalSection>

        <LegalSection title="5. Fees, refunds, cancellation">
          <p>
            Paid plans are billed in advance for the selected cycle
            (monthly or annual). Fees are in USD unless your billing
            region is set otherwise; taxes may apply per local rules.
          </p>
          <p>
            For refund details, see the{' '}
            <Link to="/refund" className="text-primary hover:underline">
              refund policy
            </Link>
            . For cancellation mechanics, see the{' '}
            <Link to="/cancellation" className="text-primary hover:underline">
              cancellation policy
            </Link>
            .
          </p>
          <p>
            We can change prices by giving you at least 30 days' notice
            via email. If you don't agree with a new price, you can
            cancel before it takes effect.
          </p>
        </LegalSection>

        <LegalSection title="6. Availability">
          <p>
            We target 99.9% monthly uptime for the production tier. We
            schedule maintenance windows and announce them at least 72
            hours in advance on our status page. We make no
            availability guarantees for trial or free-tier accounts.
          </p>
        </LegalSection>

        <LegalSection title="7. Liability">
          <p>
            The service is provided "as is". To the maximum extent
            permitted by law, our total liability for any claim
            arising out of or relating to the service is limited to
            the greater of (a) the fees you paid us in the 12 months
            before the claim, or (b) USD 100.
          </p>
          <p>
            We are not liable for indirect, consequential, or
            incidental damages (lost profits, lost data not caused by
            our gross negligence, reputational harm).
          </p>
          <p>
            Some jurisdictions don't allow these limits. Where they
            don't, the limits apply only to the extent allowed.
          </p>
        </LegalSection>

        <LegalSection title="8. Indemnification">
          <p>
            You agree to defend and hold us harmless from third-party
            claims arising out of your content or your breach of
            these terms. We agree to the same if a claim alleges our
            service infringes a third party's IP — provided you give
            us prompt notice and let us control the defense.
          </p>
        </LegalSection>

        <LegalSection title="9. Termination">
          <p>
            You can close your account any time by following the{' '}
            <Link to="/cancellation" className="text-primary hover:underline">
              cancellation flow
            </Link>
            . We can terminate your account for material breach of these
            terms; we'll give notice where possible and always give you
            a way to export your data first.
          </p>
          <p>
            On termination, clauses that by their nature survive
            (liability, indemnification, governing law) continue to
            apply.
          </p>
        </LegalSection>

        <LegalSection title="10. Governing law & disputes">
          <p>
            These terms are governed by the laws of [jurisdiction —
            e.g. State of Delaware, USA], without regard to conflict of
            laws principles.
          </p>
          <p>
            Any dispute will be resolved exclusively in the state or
            federal courts of [venue — e.g. Wilmington, Delaware], and
            you consent to that jurisdiction.
          </p>
        </LegalSection>

        <LegalSection title="11. Changes">
          <p>
            We may update these terms. When we change material points,
            we update the "last updated" date above and email every
            account at least 14 days before the change takes effect.
            Continuing to use the service after the effective date
            means you accept the new terms.
          </p>
        </LegalSection>

        <LegalSection title="12. Contact">
          <p>
            Questions? Email{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">
              {CONTACT_EMAIL}
            </a>
            . For non-legal support, see the{' '}
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
