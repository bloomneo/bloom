import React from 'react';
import { PageLayout } from '@bloomneo/uikit/page';
import { Header, Footer, SEO } from '../../../shared/components';

const PrivacyPage: React.FC = () => {
  return (
    <PageLayout>
      <SEO
        title="Privacy Policy"
        description="Privacy policy detailing how we collect, use, and protect your personal information"
        keywords="privacy, policy, data protection, personal information"
      />
      <Header />

      <PageLayout.Content>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-foreground">Privacy Policy</h1>
              <p className="text-muted-foreground">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>

            {/* Content */}
            <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">1. Information We Collect</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support.
                </p>

                <h3 className="text-xl font-medium text-foreground mb-3">Personal Information</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Name and contact information (email address, phone number)</li>
                  <li>Account credentials (username, password)</li>
                  <li>Profile information and preferences</li>
                  <li>Communication and correspondence records</li>
                </ul>

                <h3 className="text-xl font-medium text-foreground mb-3 mt-6">Usage Information</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Device information (IP address, browser type, device identifiers)</li>
                  <li>Usage patterns and activity logs</li>
                  <li>Performance and error data</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">2. How We Use Your Information</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We use the information we collect for various purposes, including:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Providing, maintaining, and improving our services</li>
                  <li>Processing transactions and sending related information</li>
                  <li>Sending technical notices, updates, and security alerts</li>
                  <li>Responding to your comments, questions, and customer service requests</li>
                  <li>Monitoring usage and analyzing trends to improve user experience</li>
                  <li>Detecting, preventing, and addressing technical issues and security threats</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">3. Information Sharing and Disclosure</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We do not sell, trade, or otherwise transfer your personal information to third parties, except in the following circumstances:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>With your explicit consent</li>
                  <li>To comply with legal obligations or court orders</li>
                  <li>To protect our rights, property, or safety, or that of others</li>
                  <li>In connection with a business transfer or merger</li>
                  <li>With trusted service providers who assist in operating our services</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">4. Data Security</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include encryption, secure data transmission, and regular security assessments.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">5. Data Retention</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We retain your personal information only for as long as necessary to fulfill the purposes outlined in this privacy policy, comply with legal obligations, resolve disputes, and enforce our agreements.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">6. Your Rights and Choices</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Depending on your location, you may have certain rights regarding your personal information:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li><strong>Access:</strong> Request access to your personal information</li>
                  <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                  <li><strong>Portability:</strong> Request a copy of your information in a structured format</li>
                  <li><strong>Withdrawal:</strong> Withdraw consent where processing is based on consent</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">7. Cookies and Tracking</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We use cookies and similar tracking technologies to collect information about your browsing activities and to provide personalized experiences. You can control cookie preferences through your browser settings.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">8. Third-Party Links</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Our service may contain links to third-party websites or services. We are not responsible for the privacy practices of these external sites and encourage you to review their privacy policies.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">9. Children's Privacy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you become aware that a child has provided us with personal information, please contact us.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">10. International Data Transfers</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information during such transfers.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">11. Changes to This Policy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may update this privacy policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">12. Contact Us</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have any questions about this privacy policy or our privacy practices, please contact us through our support channels. We are committed to resolving any privacy concerns you may have.
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

export default PrivacyPage;