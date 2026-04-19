/**
 * / — marketing homepage.
 * @file src/web/features/main/pages/index.tsx
 *
 * This is the first thing a visitor sees. Default is a generic hero +
 * three-feature grid + CTA — deliberately skeletal so you replace the
 * copy, not fight with the structure.
 *
 * TODO: Replace placeholder copy with real positioning for your product.
 * TODO: Replace the three feature cards with the three most important
 *       value props for your audience. Keep it at three — any more and
 *       attention scatters.
 * TODO: Consider adding sections below the hero: social proof, pricing,
 *       FAQ. Each is one .tsx file under pages/ (e.g. pricing.tsx).
 *
 * Unauthenticated visitors see this full page. Authenticated users also
 * see it (they might be here to share the link or read the policies);
 * the header shows "Dashboard" for signed-in users so there's a one-click
 * path back into the app.
 */

import { Link } from 'react-router-dom';
import { Button } from '@bloomneo/uikit';
import { MarketingLayout } from '../components/MarketingLayout';

export default function HomePage() {
  return (
    <MarketingLayout>
      {/* Hero — keep the headline to one sentence. "What it is, who
          it's for." Subhead adds the "why now". CTA is the single
          next action. */}
      <section className="py-16 md:py-24 text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-4xl mx-auto">
          Your product's headline goes here.
        </h1>
        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          A one-sentence description of who this is for and why they
          should care.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Button size="lg" asChild>
            <Link to="/auth/register">Get started</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/about">Learn more</Link>
          </Button>
        </div>
      </section>

      {/* Features — three cards, each one value prop. Resist the urge
          to add a fourth or fifth. Three sticks. */}
      <section className="py-12 border-t">
        <div className="grid gap-8 md:grid-cols-3">
          <FeatureCard
            title="Feature one"
            body="Describe a concrete benefit a user gets. One sentence."
          />
          <FeatureCard
            title="Feature two"
            body="Another concrete benefit. Avoid adjectives — nouns and verbs."
          />
          <FeatureCard
            title="Feature three"
            body="The third differentiator. What do you have that others don't?"
          />
        </div>
      </section>

      {/* Footer CTA — one more ask before they scroll to the footer. */}
      <section className="py-16 text-center border-t">
        <h2 className="text-2xl md:text-3xl font-semibold">
          Ready to start?
        </h2>
        <p className="mt-3 text-muted-foreground">
          A brief repeat of the hero promise.
        </p>
        <Button size="lg" className="mt-6" asChild>
          <Link to="/auth/register">Create free account</Link>
        </Button>
      </section>
    </MarketingLayout>
  );
}

function FeatureCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="text-center">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
