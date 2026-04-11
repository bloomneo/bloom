import React from 'react';
import { PageLayout } from '@bloomneo/uikit/page';
import { Header, Footer, SEO } from '../../../shared/components';

const TermsPage: React.FC = () => {
  return (
    <PageLayout>
      <SEO
        title="Terms of Service"
        description="Terms of service and conditions for using our platform"
        keywords="terms, service, conditions, legal"
      />
      <Header />

      <PageLayout.Content>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-foreground">Terms of Service</h1>
              <p className="text-muted-foreground">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>

            {/* Content */}
            <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  By accessing and using this service, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">2. Use License</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Permission is granted to temporarily download one copy of the materials on our website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>modify or copy the materials</li>
                  <li>use the materials for any commercial purpose or for any public display (commercial or non-commercial)</li>
                  <li>attempt to decompile or reverse engineer any software contained on our website</li>
                  <li>remove any copyright or other proprietary notations from the materials</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  This license shall automatically terminate if you violate any of these restrictions and may be terminated by us at any time.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">3. Disclaimer</h2>
                <p className="text-muted-foreground leading-relaxed">
                  The materials on our website are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">4. Limitations</h2>
                <p className="text-muted-foreground leading-relaxed">
                  In no event shall our company or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on our website, even if we or our authorized representative has been notified orally or in writing of the possibility of such damage.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">5. User Account</h2>
                <p className="text-muted-foreground leading-relaxed">
                  When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for maintaining the confidentiality of your account.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">6. Privacy Policy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the service, to understand our practices.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">7. Prohibited Uses</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You may not use our service:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>For any unlawful purpose or to solicit others to undertake unlawful acts</li>
                  <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                  <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                  <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                  <li>To submit false or misleading information</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">8. Termination</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">9. Changes to Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">10. Contact Information</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have any questions about these Terms of Service, please contact us through our support channels.
                </p>
              </section>
            </div>

            {/* Back Link */}
            <div className="text-center pt-8 border-t border-border">
              <a
                href="/"
                className="inline-flex items-center text-primary hover:underline font-medium"
              >
                ← Back to Home
              </a>
            </div>
          </div>
        </div>
      </PageLayout.Content>

      <Footer />
    </PageLayout>
  );
};

export default TermsPage;