/**
 * /contact — contact page.
 * @file src/web/features/main/pages/contact.tsx
 *
 * Ships with a simple read-only block (email + support hours). No form
 * by default — forms require a backend endpoint + spam protection, and
 * email links are zero-config. Replace with a form once you need lead
 * capture analytics.
 *
 * TODO: Wire the email/phone/whatsapp values up to /api/settings/public
 * so the admin settings page is the source of truth (you already store
 * support_email, support_phone, support_whatsapp_url there).
 * TODO: Add a contact form that posts to a new feature, e.g.
 * src/api/features/contact-message/, with rate limiting via appkit.
 */

import { MarketingPageHeader } from '../components/MarketingPageHeader';

export default function ContactPage() {
  return (
    <>
      <MarketingPageHeader
        title="Contact"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Contact' }]}
      />
      <div className="max-w-xl mx-auto space-y-6">
        <p className="text-muted-foreground">
          Reach out — we read every message and reply within one business day.
        </p>

        <div className="space-y-4">
          <ContactRow
            label="Email"
            value="hello@example.com"
            href="mailto:hello@example.com"
          />
          <ContactRow
            label="Support hours"
            value="Monday – Friday, 9 am – 6 pm IST"
          />
          {/* TODO: Add phone / whatsapp rows here. */}
        </div>
      </div>
    </>
  );
}

function ContactRow({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="flex items-start gap-4 border-b pb-4">
      <span className="w-32 text-sm font-medium text-muted-foreground flex-shrink-0">
        {label}
      </span>
      {href ? (
        <a href={href} className="text-primary underline-offset-4 hover:underline">
          {value}
        </a>
      ) : (
        <span>{value}</span>
      )}
    </div>
  );
}
