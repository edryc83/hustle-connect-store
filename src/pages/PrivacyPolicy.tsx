import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const PrivacyPolicy = () => (
  <div className="min-h-screen flex flex-col bg-background text-foreground">
    <Navbar />
    <main className="flex-1 mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: March 13, 2026</p>

      <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground [&_h2]:text-foreground [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:text-foreground [&_h3]:font-medium [&_h3]:mt-4 [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">
        <p>Afristall ("we", "us", or "our") operates the Afristall platform. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.</p>

        <h2>1. Information We Collect</h2>
        <h3>Personal Information</h3>
        <p>When you create an account or use our services, we may collect:</p>
        <ul>
          <li>Name, email address, and phone number</li>
          <li>Store name, bio, and profile picture</li>
          <li>WhatsApp number and social media links</li>
          <li>Location information (city, district, address)</li>
          <li>Payment and transaction details</li>
        </ul>

        <h3>Automatically Collected Information</h3>
        <ul>
          <li>Device information and browser type</li>
          <li>IP address and usage analytics</li>
          <li>Cookies and similar tracking technologies</li>
        </ul>

        <h2>2. How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Provide, maintain, and improve our platform</li>
          <li>Create and manage your seller account and storefront</li>
          <li>Process orders and facilitate buyer-seller communication</li>
          <li>Send notifications about orders and platform updates</li>
          <li>Analyze usage patterns to improve user experience</li>
          <li>Prevent fraud and ensure platform security</li>
        </ul>

        <h2>3. Information Sharing</h2>
        <p>We do not sell your personal information. We may share your data with:</p>
        <ul>
          <li><strong>Buyers:</strong> Your store information, product listings, and contact details are publicly visible on your storefront</li>
          <li><strong>Service Providers:</strong> Third-party services that help us operate the platform (hosting, analytics, communication)</li>
          <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
        </ul>

        <h2>4. Data Security</h2>
        <p>We implement appropriate technical and organizational measures to protect your personal information. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.</p>

        <h2>5. Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Access, update, or delete your personal information</li>
          <li>Opt out of marketing communications</li>
          <li>Request a copy of your data</li>
          <li>Close your account at any time</li>
        </ul>

        <h2>6. Data Retention</h2>
        <p>We retain your personal information for as long as your account is active or as needed to provide you services. We may retain certain information as required by law or for legitimate business purposes.</p>

        <h2>7. Children's Privacy</h2>
        <p>Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children.</p>

        <h2>8. Changes to This Policy</h2>
        <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.</p>

        <h2>9. Contact Us</h2>
        <p>If you have questions about this Privacy Policy, please contact us via our platform or at <strong>support@afristall.com</strong>.</p>
      </div>
    </main>
    <Footer />
  </div>
);

export default PrivacyPolicy;
