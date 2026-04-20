/**
 * / — marketing homepage.
 * @file src/web/features/main/pages/index.tsx
 *
 * First thing a visitor sees. Default shape:
 *   - Hero (headline + subhead + two CTAs)
 *   - Feature grid (three cards, one value prop each)
 *   - "How it works" three-step strip
 *   - Social-proof placeholder (customer logos)
 *   - Footer CTA
 *
 * The copy is a realistic placeholder — clearly swappable, but
 * structured enough that a fresh scaffold doesn't look like lorem
 * ipsum. Pitch your product by editing strings, not rewriting
 * layout.
 *
 * TODO: Replace every placeholder sentence with your real positioning.
 * TODO: Swap CUSTOMER_LOGOS with real logos (SVGs in `public/logos/`).
 * TODO: Add /pricing + /docs pages once they exist.
 */

import { Link } from 'react-router-dom';
import { SEO } from '../../../shared/components';
import { Button } from '@bloomneo/uikit';
import {
  Users,
  ShieldCheck,
  Zap,
  LogIn,
  ClipboardList,
  Rocket,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Users,
    title: 'User management',
    body:
      'Invite, assign roles, audit access. Nine-tier role/level model so "admin" doesn\'t have to mean "everything".',
  },
  {
    icon: ClipboardList,
    title: 'Audit everything',
    body:
      'Every admin action is logged with actor, before/after diff, and IP. Searchable, exportable, ready for compliance.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure by default',
    body:
      'JWT auth, bcrypt passwords, env-scoped secrets, rate-limited endpoints. The safe path is the easy path.',
  },
];

const STEPS = [
  {
    icon: LogIn,
    title: 'Sign up in 30 seconds',
    body:
      'Email, a password, and you\'re in. No credit card to start. No sales call.',
  },
  {
    icon: Zap,
    title: 'Configure from the admin console',
    body:
      'Invite teammates, set roles, wire up email provider. Everything in one place.',
  },
  {
    icon: Rocket,
    title: 'Ship the product you came here to build',
    body:
      'The admin plumbing is done. Spend your time on what\'s actually yours.',
  },
];

// Replace with <img src="/logos/..." alt="..." /> per company.
const CUSTOMER_LOGOS = ['Acme', 'Globex', 'Initech', 'Umbrella', 'Stark'];

export default function HomePage() {
  return (
    <>
      {/* No title → tab reads just "MyApp" (homepage convention). */}
      <SEO />

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 text-center">
        <p className="text-sm font-medium text-primary">
          An admin console your team will actually use
        </p>
        <h1 className="mt-3 text-4xl md:text-6xl font-bold tracking-tight max-w-4xl mx-auto">
          Manage users, settings, and audit logs in one place.
        </h1>
        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Built for small teams that want an admin interface without
          the six-month enterprise rollout. Open every page, everything
          works on day one.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Button size="lg" asChild>
            <Link to="/auth/register">Start free</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/about">See what's inside</Link>
          </Button>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          No credit card required · Free for the first 10 users
        </p>
      </section>

      {/* ── Social proof strip ──────────────────────────────────── */}
      <section className="py-8 border-t">
        <p className="text-center text-xs uppercase tracking-wider text-muted-foreground mb-6">
          Trusted by teams at
        </p>
        <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-4">
          {CUSTOMER_LOGOS.map((logo) => (
            <span
              key={logo}
              className="text-xl font-semibold text-muted-foreground/70 tracking-tight"
            >
              {logo}
            </span>
          ))}
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────── */}
      <section className="py-16 border-t">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-semibold">
            Everything you need. Nothing you don't.
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Three hundred lines of admin code compressed into three
            hundred useful interactions. We build the boring parts so
            you build the interesting ones.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {FEATURES.map((f) => (
            <FeatureCard
              key={f.title}
              icon={f.icon}
              title={f.title}
              body={f.body}
            />
          ))}
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────── */}
      <section className="py-16 border-t">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-semibold">
            From install to in-production in an afternoon
          </h2>
        </div>
        <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
          {STEPS.map((s, i) => (
            <div key={s.title} className="space-y-3">
              <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <s.icon className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Step {i + 1}
              </p>
              <h3 className="text-lg font-semibold">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer CTA ──────────────────────────────────────────── */}
      <section className="py-16 text-center border-t">
        <h2 className="text-2xl md:text-3xl font-semibold">
          Ready when you are.
        </h2>
        <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
          Five minutes to set up. Zero lock-in. Built on a stack you
          can read end-to-end.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Button size="lg" asChild>
            <Link to="/auth/register">Create free account</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/contact">Talk to us</Link>
          </Button>
        </div>
      </section>
    </>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Users;
  title: string;
  body: string;
}) {
  return (
    <div className="space-y-3">
      <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
