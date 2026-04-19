/**
 * /about — about page.
 * @file src/web/features/main/pages/about.tsx
 *
 * Two sections by default: mission (who you are, why you exist) and
 * team (optional). Replace every placeholder sentence with real copy.
 *
 * TODO: Add team photos or company timeline if that's your vibe.
 * TODO: Link to /contact from here — the "talk to a human" path matters.
 */

import { MarketingLayout } from '../components/MarketingLayout';

export default function AboutPage() {
  return (
    <MarketingLayout
      title="About"
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'About' }]}
    >
      <div className="prose max-w-2xl mx-auto space-y-6">
        <section>
          <h2 className="text-2xl font-semibold">Our mission</h2>
          <p>
            One paragraph on why this product exists. Who is it for? What
            problem does it solve? What's the outcome for a happy user?
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold">The team</h2>
          <p>
            Who is building this? Keep it short — names and roles are
            enough. People don't need a life story, they need to know
            they can trust the humans behind the product.
          </p>
        </section>
      </div>
    </MarketingLayout>
  );
}
