/**
 * /about — about page.
 * @file src/web/features/main/pages/about.tsx
 *
 * Three sections: mission, values, team. Every paragraph is a
 * placeholder — readable enough to ship while you customize, generic
 * enough to find-and-replace in an afternoon.
 *
 * TODO: Replace "MyApp" with your product name (also in site.ts).
 * TODO: Swap the team block for real names + photos once you have them.
 */

import { Link } from 'react-router-dom';
import { MarketingPageHeader } from '../components/MarketingPageHeader';
import { SEO } from '../../../shared/components';

const VALUES: Array<{ title: string; body: string }> = [
  {
    title: 'Clarity over cleverness',
    body:
      'We prefer obvious code, plain language, and decisions an outside reader can reason about. Clever shortcuts age into tech debt; clarity compounds.',
  },
  {
    title: 'Ship small, ship often',
    body:
      'Every change is small enough to revert. Every week has a release. Every product decision has a one-paragraph rationale you can read a year later.',
  },
  {
    title: 'Respect the person on the other side',
    body:
      'Customers, teammates, auditors, regulators — all humans. We default to honest answers, documented trade-offs, and no dark patterns.',
  },
];

const TEAM: Array<{ name: string; role: string; bio: string }> = [
  {
    name: 'Jordan Rivera',
    role: 'Founder & CEO',
    bio:
      'Previously led product at [Prior Company]. Wrote the first line of code of MyApp on a Sunday; has regretted and been grateful for it in equal measure.',
  },
  {
    name: 'Sam Okafor',
    role: 'Head of Engineering',
    bio:
      'Ten years shipping infrastructure at mid-stage startups. Believes observability is a feature and migrations are poetry.',
  },
  {
    name: 'Priya Sundaram',
    role: 'Design',
    bio:
      'Comes from a typography background. If you see a font you like on the site, thank Priya. If you see one you don\'t, talk to Priya.',
  },
];

export default function AboutPage() {
  return (
    <>
      <SEO title="About" />
      <MarketingPageHeader
        title="About"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'About' }]}
      />

      <div className="mx-auto space-y-12">
        {/* Mission */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Our mission</h2>
          <p className="text-muted-foreground">
            MyApp exists to give small teams an admin console that feels
            built for them — without the enterprise sprawl, without the
            six-month integration, and without quitting the tools they
            already use. We started because we kept rebuilding the same
            "users + audit log + settings" page at every job, and
            eventually decided to make it once, properly, for everyone.
          </p>
          <p className="text-muted-foreground">
            Today we power admin surfaces for teams across SaaS,
            healthcare, and fintech. We are deliberately small, move in
            the open, and spend an unusual amount of time on the
            details you don't see.
          </p>
        </section>

        {/* Values */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">What we value</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {VALUES.map((v) => (
              <div key={v.title} className="space-y-1.5">
                <h3 className="font-medium">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">The team</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {TEAM.map((m) => (
              <div key={m.name} className="space-y-1">
                <p className="font-medium">{m.name}</p>
                <p className="text-xs text-muted-foreground">{m.role}</p>
                <p className="text-sm text-muted-foreground pt-1">{m.bio}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="border-t pt-8 text-center space-y-3">
          <h2 className="text-xl font-semibold">Want to talk?</h2>
          <p className="text-muted-foreground">
            We answer every email we get. Product ideas, integration
            questions, feedback on the docs — all welcome.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center text-primary hover:underline"
          >
            Get in touch →
          </Link>
        </section>
      </div>
    </>
  );
}
