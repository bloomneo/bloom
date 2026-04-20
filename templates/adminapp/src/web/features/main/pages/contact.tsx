/**
 * /contact — contact page.
 * @file src/web/features/main/pages/contact.tsx
 *
 * Reads the live support details from `/api/settings/public` so the
 * admin's Settings → Contact card is the source of truth. Falls back
 * to sensible placeholders when a setting hasn't been filled in yet,
 * so a brand-new install still renders something useful.
 *
 * When `contact_form_enabled` is true, a form appears that posts to
 * `/api/contact-message` — the server owns the recipient address
 * (`contact_form_to_email`) so a compromised browser can't redirect
 * intake. See `api/features/contact-message/contact-message.route.ts`.
 *
 * @see ../../../../../docs/admin-patterns.md §8 settings
 * @see https://dev.bloomneo.com/adminapp/contact
 *
 * @llm-rule WHEN: Changing the contact-page layout or adding a new contact field
 * @llm-rule AVOID: Hardcoding emails/phones — the admin edits them in /admin/settings → Contact, which writes AppSetting rows surfaced via /api/settings/public
 * @llm-rule NOTE: The form recipient is NEVER sent to the client — it lives in `contact_form_to_email` (non-public) and is resolved server-side
 */

import { useEffect, useState } from 'react';
import { toast } from '@bloomneo/uikit';
import { MarketingPageHeader } from '../components/MarketingPageHeader';
import { SEO } from '../../../shared/components';

interface PublicSettings {
  businessName?: string;
  supportEmail?: string;
  supportPhone?: string;
  supportHours?: string;
  supportAddress?: string;
  supportWhatsappUrl?: string;
  contactForm?: { enabled: boolean };
}

const DEFAULTS = {
  supportEmail: 'support@example.com',
  supportPhone: '+1 (555) 010-2030',
  supportHours: 'Monday – Friday, 9 am – 6 pm',
  supportAddress: '[Street address], [City], [Postal code]',
};

const API_BASE =
  (import.meta as unknown as { env: Record<string, string> }).env.VITE_API_URL ??
  'http://localhost:3000';
const FRONTEND_KEY =
  (import.meta as unknown as { env: Record<string, string> }).env
    .VITE_FRONTEND_KEY ?? '';

export default function ContactPage() {
  const [settings, setSettings] = useState<PublicSettings | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE}/api/settings/public`, {
      headers: FRONTEND_KEY ? { 'X-Frontend-Key': FRONTEND_KEY } : {},
    })
      .then((r) => (r.ok ? r.json() : {}))
      .then((data: PublicSettings) => {
        if (!cancelled) setSettings(data ?? {});
      })
      .catch(() => {
        // Public settings are best-effort — the page still renders
        // with DEFAULTS if the fetch fails.
        if (!cancelled) setSettings({});
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const email = settings?.supportEmail || DEFAULTS.supportEmail;
  const phone = settings?.supportPhone || DEFAULTS.supportPhone;
  const hours = settings?.supportHours || DEFAULTS.supportHours;
  const address = settings?.supportAddress || DEFAULTS.supportAddress;
  const whatsapp = settings?.supportWhatsappUrl;
  const formEnabled = settings?.contactForm?.enabled === true;

  return (
    <>
      <SEO title="Contact" />
      <MarketingPageHeader
        title="Contact"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Contact' }]}
      />

      <div className="mx-auto space-y-10">
        <p className="text-muted-foreground">
          Every message is read by a human. If it's a support question,
          please write from the email address on your account so we can
          look up your workspace quickly.
        </p>

        {/* Primary email row — always visible. */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Reach us by email</h2>
          <div className="divide-y">
            <Row
              label="Support"
              value={email}
              href={`mailto:${email}`}
              note="Replies within 1 business day"
            />
            {whatsapp && (
              <Row
                label="WhatsApp"
                value={whatsapp.replace(/^https?:\/\//, '')}
                href={whatsapp}
                note="Tap to open a chat"
              />
            )}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Other details</h2>
          <div className="divide-y">
            <Row label="Phone" value={phone} href={`tel:${phone.replace(/[^+\d]/g, '')}`} />
            <Row label="Hours" value={hours} note="Voice replies within the window; email around the clock." />
            <Row label="Address" value={address} note="Mail us — we still open mail." />
          </div>
        </section>

        {/* Only render the form when the admin has turned it on. */}
        {formEnabled && <ContactForm />}

        <section className="border-t pt-6 text-sm text-muted-foreground">
          <p>
            Not finding what you need? Check the{' '}
            <a href="/about" className="text-primary hover:underline">
              About page
            </a>
            .
          </p>
        </section>
      </div>
    </>
  );
}

function Row({
  label,
  value,
  href,
  note,
}: {
  label: string;
  value: string;
  href?: string;
  note?: string;
}) {
  return (
    <div className="py-4 flex items-start justify-between gap-4 first:pt-0 last:pb-0">
      <div className="min-w-[8rem] text-sm font-medium text-muted-foreground flex-shrink-0">
        {label}
      </div>
      <div className="flex-1 space-y-0.5">
        {href ? (
          <a href={href} className="text-primary hover:underline break-all">
            {value}
          </a>
        ) : (
          <span>{value}</span>
        )}
        {note && <p className="text-xs text-muted-foreground">{note}</p>}
      </div>
    </div>
  );
}

/**
 * Contact form — posts to /api/contact-message. The server looks up
 * `contact_form_to_email` (or falls back to `support_email`) to decide
 * where to deliver, so we never send the recipient over the wire.
 */
function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error('Please fill in name, email and message.');
      return;
    }
    setSending(true);
    try {
      const res = await fetch(`${API_BASE}/api/contact-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(FRONTEND_KEY ? { 'X-Frontend-Key': FRONTEND_KEY } : {}),
        },
        body: JSON.stringify({ name, email, subject, message }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message ?? body?.error ?? res.statusText);
      }
      toast.success('Message sent — we\'ll be in touch.');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not send.');
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="space-y-4 border-t pt-8">
      <h2 className="text-lg font-semibold">Send a message</h2>
      <p className="text-sm text-muted-foreground">
        We'll reply to the email you provide.
      </p>
      <form onSubmit={submit} className="space-y-4 max-w-xl">
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="Name"
            value={name}
            onChange={setName}
            required
            placeholder="Your name"
          />
          <Field
            label="Email"
            value={email}
            onChange={setEmail}
            required
            type="email"
            placeholder="you@example.com"
          />
        </div>
        <Field
          label="Subject"
          value={subject}
          onChange={setSubject}
          placeholder="What's this about? (optional)"
        />
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Message</label>
          <textarea
            className="w-full rounded-md border border-input bg-background p-2 text-sm min-h-[120px]"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            placeholder="Tell us what you need help with…"
          />
        </div>
        <button
          type="submit"
          disabled={sending}
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {sending ? 'Sending…' : 'Send message'}
        </button>
      </form>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      <input
        type={type}
        className="w-full rounded-md border border-input bg-background p-2 text-sm"
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
