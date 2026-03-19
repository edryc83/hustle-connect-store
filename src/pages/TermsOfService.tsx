import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const TermsOfService = () => (
  <div className="min-h-screen flex flex-col bg-background text-foreground">
    <Navbar />
    <main className="flex-1 mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: March 13, 2026</p>

      <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground [&_h2]:text-foreground [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-8 [&_h2]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1">
        <p>Welcome to Afristall. By accessing or using our platform, you agree to be bound by these Terms of Service. Please read them carefully.</p>

        <h2>1. Acceptance of Terms</h2>
        <p>By creating an account or using Afristall, you agree to these Terms, our Privacy Policy, and our Cookie Policy. If you do not agree, please do not use our services.</p>

        <h2>2. Eligibility</h2>
        <p>You must be at least 18 years old to use Afristall. By using our platform, you represent that you meet this requirement.</p>

        <h2>3. Account Responsibilities</h2>
        <ul>
          <li>You are responsible for maintaining the confidentiality of your account credentials</li>
          <li>You are responsible for all activities that occur under your account</li>
          <li>You must provide accurate and complete information when creating your account</li>
          <li>You must promptly update any changes to your information</li>
        </ul>

        <h2>4. Seller Obligations</h2>
        <p>As a seller on Afristall, you agree to:</p>
        <ul>
          <li>Provide accurate product descriptions, images, and pricing</li>
          <li>Fulfill orders promptly and communicate with buyers</li>
          <li>Comply with all applicable laws and regulations in your jurisdiction</li>
          <li>Not list prohibited, counterfeit, or illegal items</li>
          <li>Handle customer complaints and disputes in good faith</li>
        </ul>

        <h2>5. Buyer Responsibilities</h2>
        <p>As a buyer, you understand that:</p>
        <ul>
          <li>Transactions are between you and the seller directly</li>
          <li>Afristall facilitates connections but does not guarantee product quality</li>
          <li>You should verify product details before placing orders</li>
          <li>Communication with sellers occurs via WhatsApp or other channels provided</li>
        </ul>

        <h2>6. Prohibited Activities</h2>
        <p>You may not:</p>
        <ul>
          <li>Use the platform for any illegal or unauthorized purpose</li>
          <li>Post false, misleading, or deceptive content</li>
          <li>Harass, abuse, or harm other users</li>
          <li>Attempt to gain unauthorized access to the platform</li>
          <li>Scrape, copy, or redistribute platform content without permission</li>
          <li>Interfere with the platform's operation or security</li>
        </ul>

        <h2>7. Intellectual Property</h2>
        <p>The Afristall name, logo, and platform design are our intellectual property. Sellers retain ownership of their product images and descriptions but grant Afristall a license to display them on the platform.</p>

        <h2>8. Limitation of Liability</h2>
        <p>Afristall is a marketplace platform that connects buyers and sellers. We are not responsible for:</p>
        <ul>
          <li>The quality, safety, or legality of products listed</li>
          <li>The accuracy of product listings or seller information</li>
          <li>Disputes between buyers and sellers</li>
          <li>Any loss or damage arising from transactions</li>
        </ul>

        <h2>9. Termination</h2>
        <p>We reserve the right to suspend or terminate your account at our discretion if you violate these Terms or engage in activities harmful to the platform or its users.</p>

        <h2>10. Changes to Terms</h2>
        <p>We may modify these Terms at any time. Continued use of the platform after changes constitutes acceptance of the updated Terms.</p>

        <h2>11. Governing Law</h2>
        <p>These Terms shall be governed by and construed in accordance with the laws of the Republic of Uganda.</p>

        <h2>12. Contact</h2>
        <p>For questions about these Terms, contact us at <strong>support@afristall.com</strong>.</p>
      </div>
    </main>
    <Footer />
  </div>
);

export default TermsOfService;
