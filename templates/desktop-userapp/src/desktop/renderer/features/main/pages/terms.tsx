import React from 'react';
import { PageLayout } from '@voilajsx/uikit/page';
import { Card, CardContent } from '@voilajsx/uikit/card';
import { FileText } from 'lucide-react';
import { Header, Footer, SEO } from '../../../shared/components';

const TermsOfServicePage: React.FC = () => {
  return (
    <PageLayout>
      <SEO
        title="Terms of Service"
        description="Terms and conditions for using UserApp"
        keywords="terms, service, legal, agreement"
      />
      <Header />

      <PageLayout.Content>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
              <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <Card>
            <CardContent className="pt-6 prose prose-sm max-w-none">
              <section className="mb-6">
                <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  By accessing and using UserApp ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms of Service, please do not use the Service.
                </p>
              </section>

              <section className="mb-6">
                <h2 className="text-xl font-semibold mb-3">2. Use License</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Permission is granted to temporarily access and use the Service for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Modify or copy the materials</li>
                  <li>Use the materials for any commercial purpose or for any public display</li>
                  <li>Attempt to reverse engineer any software contained in the Service</li>
                  <li>Remove any copyright or other proprietary notations from the materials</li>
                  <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
                </ul>
              </section>

              <section className="mb-6">
                <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
                </p>
              </section>

              <section className="mb-6">
                <h2 className="text-xl font-semibold mb-3">4. Privacy and Data Protection</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Your use of the Service is also governed by our Privacy Policy. Please review our Privacy Policy, which also governs the Service and informs users of our data collection practices.
                </p>
              </section>

              <section className="mb-6">
                <h2 className="text-xl font-semibold mb-3">5. Prohibited Uses</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You may use the Service only for lawful purposes and in accordance with these Terms. You agree not to use the Service:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>In any way that violates any applicable national or international law or regulation</li>
                  <li>To transmit, or procure the sending of, any advertising or promotional material without our prior written consent</li>
                  <li>To impersonate or attempt to impersonate the Company, a Company employee, another user, or any other person or entity</li>
                  <li>In any way that infringes upon the rights of others, or in any way is illegal, threatening, fraudulent, or harmful</li>
                </ul>
              </section>

              <section className="mb-6">
                <h2 className="text-xl font-semibold mb-3">6. Intellectual Property</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  The Service and its original content, features, and functionality are and will remain the exclusive property of UserApp and its licensors. The Service is protected by copyright, trademark, and other laws of both the country and foreign countries.
                </p>
              </section>

              <section className="mb-6">
                <h2 className="text-xl font-semibold mb-3">7. Termination</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  If you wish to terminate your account, you may simply discontinue using the Service.
                </p>
              </section>

              <section className="mb-6">
                <h2 className="text-xl font-semibold mb-3">8. Limitation of Liability</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  In no event shall UserApp, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
                </p>
              </section>

              <section className="mb-6">
                <h2 className="text-xl font-semibold mb-3">9. Disclaimer</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The Service is provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement or course of performance.
                </p>
              </section>

              <section className="mb-6">
                <h2 className="text-xl font-semibold mb-3">10. Changes to Terms</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
                </p>
              </section>

              <section className="mb-6">
                <h2 className="text-xl font-semibold mb-3">11. Contact Us</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  If you have any questions about these Terms, please contact us through the application support channels.
                </p>
              </section>
            </CardContent>
          </Card>
        </div>
      </PageLayout.Content>

      <Footer />
    </PageLayout>
  );
};

export default TermsOfServicePage;
