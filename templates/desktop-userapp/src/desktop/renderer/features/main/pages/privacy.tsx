import React from 'react';
import { PageLayout } from '@voilajsx/uikit/page';
import { Card, CardContent } from '@voilajsx/uikit/card';
import { Shield } from 'lucide-react';
import { Header, Footer, SEO } from '../../../shared/components';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <PageLayout>
      <SEO
        title="Privacy Policy"
        description="Privacy policy and data protection information for UserApp"
        keywords="privacy, policy, data protection, GDPR"
      />
      <Header />

      <PageLayout.Content>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
              <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <Card>
            <CardContent className="pt-6 prose prose-sm max-w-none">
              <section className="mb-6">
                <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Welcome to UserApp ("we", "our", or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our desktop application.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the application.
                </p>
              </section>

              <section className="mb-6">
                <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We collect information that you provide directly to us when you:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Create an account</li>
                  <li>Update your profile information</li>
                  <li>Use the application features</li>
                  <li>Contact us for support</li>
                </ul>

                <h3 className="text-lg font-semibold mt-4 mb-2">Personal Information</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  The personal information we collect may include:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Name and contact information (email address, phone number)</li>
                  <li>Account credentials (username, password)</li>
                  <li>Profile information</li>
                  <li>Any other information you choose to provide</li>
                </ul>

                <h3 className="text-lg font-semibold mt-4 mb-2">Usage Data</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We may automatically collect certain information when you use the application, including:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Application usage statistics</li>
                  <li>Error logs and diagnostic information</li>
                  <li>Device information and operating system details</li>
                  <li>Session duration and frequency of use</li>
                </ul>
              </section>

              <section className="mb-6">
                <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We use the information we collect or receive to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Provide, operate, and maintain the application</li>
                  <li>Improve, personalize, and expand our application</li>
                  <li>Understand and analyze how you use our application</li>
                  <li>Develop new products, services, features, and functionality</li>
                  <li>Communicate with you for customer service and support</li>
                  <li>Send you technical notices, updates, and security alerts</li>
                  <li>Prevent fraud and ensure the security of our application</li>
                </ul>
              </section>

              <section className="mb-6">
                <h2 className="text-xl font-semibold mb-3">4. Data Storage and Security</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Your data is stored locally on your device in a secure SQLite database. We implement appropriate technical and organizational security measures to protect your personal information, including:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Encryption of sensitive data</li>
                  <li>Password hashing using industry-standard algorithms</li>
                  <li>Regular security assessments</li>
                  <li>Access controls and authentication mechanisms</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  However, no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.
                </p>
              </section>

              <section className="mb-6">
                <h2 className="text-xl font-semibold mb-3">5. Data Sharing and Disclosure</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li><strong>With your consent:</strong> We may share your information when you give us explicit permission</li>
                  <li><strong>For legal reasons:</strong> We may disclose your information if required by law or in response to valid requests by public authorities</li>
                  <li><strong>To protect rights:</strong> We may disclose your information where we believe it is necessary to investigate, prevent, or take action regarding potential violations of our policies, suspected fraud, or situations involving potential threats to safety</li>
                </ul>
              </section>

              <section className="mb-6">
                <h2 className="text-xl font-semibold mb-3">6. Your Privacy Rights</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Depending on your location, you may have the following rights regarding your personal information:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li><strong>Access:</strong> Request access to your personal data</li>
                  <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal data</li>
                  <li><strong>Data portability:</strong> Request transfer of your data to another service</li>
                  <li><strong>Objection:</strong> Object to processing of your personal data</li>
                  <li><strong>Restriction:</strong> Request restriction of processing your personal data</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  To exercise these rights, please contact us through the application support channels.
                </p>
              </section>

              <section className="mb-6">
                <h2 className="text-xl font-semibold mb-3">7. Data Retention</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. When we no longer need your personal information, we will securely delete or anonymize it.
                </p>
              </section>

              <section className="mb-6">
                <h2 className="text-xl font-semibold mb-3">8. Children's Privacy</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Our application is not intended for use by children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
                </p>
              </section>

              <section className="mb-6">
                <h2 className="text-xl font-semibold mb-3">9. Changes to This Privacy Policy</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Changes to this Privacy Policy are effective when they are posted on this page.
                </p>
              </section>

              <section className="mb-6">
                <h2 className="text-xl font-semibold mb-3">10. Third-Party Services</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Our application may contain links to third-party websites or services that are not owned or controlled by us. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party websites or services.
                </p>
              </section>

              <section className="mb-6">
                <h2 className="text-xl font-semibold mb-3">11. Contact Us</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  If you have any questions about this Privacy Policy, please contact us through the application support channels. We will respond to your request within a reasonable timeframe.
                </p>
              </section>

              <section className="mb-6">
                <h2 className="text-xl font-semibold mb-3">12. Consent</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  By using our application, you hereby consent to our Privacy Policy and agree to its terms.
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

export default PrivacyPolicyPage;
