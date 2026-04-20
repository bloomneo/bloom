/**
 * /privacy — privacy policy.
 * @file src/web/features/main/pages/privacy.tsx
 *
 * PLACEHOLDER legal copy. Readable and structured enough to pass a
 * payment-processor review out of the box, but NOT a substitute for
 * lawyer review before handling real user data. Every section below
 * should be tailored to what YOUR app actually collects and does.
 *
 * Jurisdictions to keep in mind:
 *   - GDPR (EU / UK) — Articles 15–22 rights, lawful basis, DPO
 *   - CCPA / CPRA (California) — right to know / delete / opt out
 *   - India DPDP Act 2023 — notice + consent for Indian residents
 *   - PIPEDA (Canada) — minimum-necessary + accountability
 *
 * TODO: Have a lawyer review before production.
 * TODO: Source `businessName` + `supportEmail` from
 *   /api/settings/public so changing the brand in admin updates here.
 */

import { Link } from 'react-router-dom';
import { MarketingPageHeader } from '../components/MarketingPageHeader';
import { SEO } from '../../../shared/components';

const COMPANY = 'MyApp Inc.'; // TODO: replace with your legal entity
const CONTACT_EMAIL = 'privacy@example.com';
const LAST_UPDATED = 'YYYY-MM-DD'; // TODO: bump on every material change

export default function PrivacyPage() {
  return (
    <>
      <SEO title="Privacy Policy" />
      <MarketingPageHeader
        title="Privacy Policy"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Privacy' }]}
      />

      <div className="mx-auto space-y-8">
        <p className="text-sm text-muted-foreground">
          Last updated: {LAST_UPDATED} &nbsp;·&nbsp; Entity: {COMPANY}
        </p>

        <LegalSection title="1. Summary">
          <p>
            We collect the information you give us (email, name,
            password) and the information your device reveals (IP
            address, browser, locale). We use it to run the product,
            keep it secure, and communicate with you. We don't sell
            your data, we don't use it to train generic AI models,
            and we keep it only as long as we need it.
          </p>
          <p>
            The rest of this document is the full version of that
            paragraph, in the detail regulators require. Read whatever
            matters to you and email{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">
              {CONTACT_EMAIL}
            </a>{' '}
            if anything isn't clear.
          </p>
        </LegalSection>

        <LegalSection title="2. What we collect">
          <p>We collect three categories of data:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Account data:</strong> email, display name, hashed
              password, phone (optional), role.
            </li>
            <li>
              <strong>Usage data:</strong> pages you visit, actions you
              take inside the product, timestamps. Stored in our audit
              log for security + product improvement.
            </li>
            <li>
              <strong>Device + network data:</strong> IP address,
              user-agent string, approximate location derived from IP
              (country / region level).
            </li>
          </ul>
          <p>
            We do NOT collect: precise location, contact lists, social
            graphs, biometrics, or anything we haven't told you about
            above.
          </p>
        </LegalSection>

        <LegalSection title="3. Why we collect it (lawful basis)">
          <p>Under GDPR terminology:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Contract:</strong> account data and usage data are
              necessary to deliver the service you signed up for.
            </li>
            <li>
              <strong>Legitimate interest:</strong> device + network
              data, used for security (fraud, account takeover) and
              product improvement.
            </li>
            <li>
              <strong>Consent:</strong> anything else (e.g. marketing
              emails, optional analytics beacons). You can withdraw
              consent at any time from your account settings.
            </li>
          </ul>
        </LegalSection>

        <LegalSection title="4. How we use it">
          <ul className="list-disc pl-5 space-y-1">
            <li>Authenticate your account and enforce role permissions.</li>
            <li>
              Send you transactional email (account verification,
              password resets, receipts).
            </li>
            <li>
              Detect abuse — rate limiting, suspicious-login alerts,
              impossible-travel detection.
            </li>
            <li>
              Improve the product via aggregated, de-identified usage
              patterns. Individual behavior is never sold or shared.
            </li>
            <li>
              Meet legal obligations (tax, audit, court order).
            </li>
          </ul>
        </LegalSection>

        <LegalSection title="5. Who we share it with">
          <p>
            We share data only with the processors we need to run the
            service. Each is contractually bound to the same standards
            we hold ourselves to. Current list:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>[Hosting provider — e.g. DigitalOcean, AWS, Fly.io]</li>
            <li>[Database / storage provider]</li>
            <li>[Email delivery — e.g. Resend, Mailgun, SendGrid]</li>
            <li>[Payment processor — e.g. Stripe, Razorpay]</li>
            <li>[Error monitoring — e.g. Sentry]</li>
          </ul>
          <p>
            We don't share data with advertisers, data brokers, or
            model-training providers.
          </p>
        </LegalSection>

        <LegalSection title="6. How long we keep it">
          <p>
            <strong>Account data:</strong> as long as your account is
            active + 90 days. After that, we delete it unless legal
            retention requires longer (e.g. tax records — 7 years in
            India / UK).
          </p>
          <p>
            <strong>Audit log:</strong> 90 days by default. Configurable
            per-deploy — check{' '}
            <code className="font-mono text-xs">audit.service.ts</code>{' '}
            in your installation.
          </p>
          <p>
            <strong>Backups:</strong> 30-day rolling retention; fully
            deleted after a canceled account's 90-day window.
          </p>
        </LegalSection>

        <LegalSection title="7. Your rights">
          <p>
            Regardless of where you live, we give every user the
            following rights:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Access:</strong> a copy of the data we hold on
              you, in a portable format (JSON).
            </li>
            <li>
              <strong>Correction:</strong> fix anything inaccurate.
            </li>
            <li>
              <strong>Deletion:</strong> we wipe your account and
              derived records, subject to legal retention.
            </li>
            <li>
              <strong>Objection:</strong> opt out of any optional
              processing (marketing email, analytics).
            </li>
          </ul>
          <p>
            To exercise any right, email{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">
              {CONTACT_EMAIL}
            </a>{' '}
            from the email on your account. We reply within 30 days.
          </p>
        </LegalSection>

        <LegalSection title="8. Security">
          <p>
            Passwords are hashed with bcrypt. Data in transit is TLS
            1.2+. Data at rest is encrypted by the hosting platform.
            Access to production systems requires MFA. Audit logs
            record every admin-level action.
          </p>
        </LegalSection>

        <LegalSection title="9. International transfers">
          <p>
            Our primary servers are in [region]. If you're in the EEA /
            UK and your data crosses borders, we rely on Standard
            Contractual Clauses with each sub-processor. Ask if you
            want copies.
          </p>
        </LegalSection>

        <LegalSection title="10. Children">
          <p>
            The service isn't for users under 16. We don't knowingly
            collect data from children. If you believe we have, write
            to{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">
              {CONTACT_EMAIL}
            </a>{' '}
            and we will delete it.
          </p>
        </LegalSection>

        <LegalSection title="11. Changes to this policy">
          <p>
            When we change material points, we update the "last
            updated" date above and email every account at least 14
            days before the change takes effect. You'll always be
            able to see previous versions on request.
          </p>
        </LegalSection>

        <LegalSection title="12. Contact">
          <p>
            Data controller: {COMPANY}
            <br />
            Email:{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">
              {CONTACT_EMAIL}
            </a>
            <br />
            Postal: [address on the{' '}
            <Link to="/contact" className="text-primary hover:underline">
              contact page
            </Link>
            ]
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
