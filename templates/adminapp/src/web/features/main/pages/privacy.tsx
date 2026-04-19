/**
 * /privacy — privacy policy.
 * @file src/web/features/main/pages/privacy.tsx
 *
 * PLACEHOLDER content. You MUST customize this before launch —
 * privacy-policy copy is legally meaningful and "we use cookies" is
 * not a policy.
 *
 * Jurisdictions to consider:
 *   - GDPR (EU / UK) — rights under Articles 15–22, lawful basis
 *   - CCPA / CPRA (California) — right to know, delete, opt out
 *   - India DPDP Act (applies to Indian residents)
 *
 * TODO: Have a lawyer review before production. Consider a generator
 * like Termly or Iubenda for a starting draft, then tailor it.
 * TODO: Pull `business_name` and `support_email` from /api/settings/public
 * so this page updates when you change the company name centrally.
 */

import { MarketingLayout } from '../components/MarketingLayout';

export default function PrivacyPage() {
  const lastUpdated = 'YYYY-MM-DD'; // TODO: update when policy changes

  return (
    <MarketingLayout
      title="Privacy Policy"
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Privacy' }]}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <p className="text-sm text-muted-foreground">
          Last updated: {lastUpdated}
        </p>

        <LegalSection title="Overview">
          <p>
            A short plain-English summary of what this policy covers.
            Users should be able to read just this paragraph and know
            the shape of what you collect.
          </p>
        </LegalSection>

        <LegalSection title="Information we collect">
          <ul className="list-disc pl-5 space-y-1">
            <li>Account information (email, name, hashed password)</li>
            <li>Usage data (pages visited, actions taken) — see audit log policy below</li>
            <li>Device + network data (IP address, user agent)</li>
            {/* TODO: Add every category you actually collect. */}
          </ul>
        </LegalSection>

        <LegalSection title="How we use information">
          <p>
            Customize for your use case. Common buckets: account
            management, product improvement, security + fraud, legal
            compliance.
          </p>
        </LegalSection>

        <LegalSection title="Data retention">
          <p>
            How long you keep each category of data. For the audit log
            specifically, add the retention window you set (see
            <code className="mx-1 font-mono">audit.service.ts</code>'s
            TODO comment about scheduled purges).
          </p>
        </LegalSection>

        <LegalSection title="Your rights">
          <p>
            Spell out the access, correction, deletion, and portability
            rights you provide + how to exercise them. Link to{' '}
            <a href="/contact" className="text-primary underline-offset-4 hover:underline">
              /contact
            </a>{' '}
            as the request intake.
          </p>
        </LegalSection>

        <LegalSection title="Contact">
          <p>
            Questions? Email{' '}
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
    </MarketingLayout>
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
