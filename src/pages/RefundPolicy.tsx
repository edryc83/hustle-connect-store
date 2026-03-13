import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const RefundPolicy = () => (
  <div className="min-h-screen flex flex-col bg-background text-foreground">
    <Navbar />
    <main className="flex-1 mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold mb-2">Refund &amp; Return Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: March 13, 2026</p>

      <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground [&_h2]:text-foreground [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-8 [&_h2]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">
        <p>Afristall is a marketplace platform that connects buyers with independent sellers. Each seller manages their own inventory, shipping, and return policies. This policy outlines the general framework for refunds and returns on our platform.</p>

        <h2>1. Marketplace Model</h2>
        <p>Afristall does not directly sell products. All transactions occur between buyers and independent sellers. Each seller is responsible for their own refund and return policies.</p>

        <h2>2. Seller Responsibility</h2>
        <p>Sellers on Afristall are expected to:</p>
        <ul>
          <li>Clearly communicate their return and refund policies to buyers</li>
          <li>Respond to buyer complaints within a reasonable timeframe</li>
          <li>Honor any return or refund commitments they make</li>
          <li>Accurately describe products to minimize disputes</li>
        </ul>

        <h2>3. Buyer Guidelines</h2>
        <p>Before making a purchase, we recommend that buyers:</p>
        <ul>
          <li>Review the seller's return policy (if provided)</li>
          <li>Ask the seller about their refund terms via WhatsApp before ordering</li>
          <li>Verify product details, sizes, and specifications</li>
          <li>Keep records of all communication with the seller</li>
        </ul>

        <h2>4. Dispute Resolution</h2>
        <p>If you experience an issue with a purchase:</p>
        <ol className="list-decimal pl-5 space-y-1">
          <li><strong>Contact the seller directly</strong> via WhatsApp or other provided channels</li>
          <li><strong>Attempt to resolve</strong> the issue with the seller in good faith</li>
          <li><strong>Contact Afristall support</strong> if you are unable to reach a resolution — we may be able to mediate</li>
        </ol>

        <h2>5. Afristall's Role</h2>
        <p>While Afristall does not process payments or manage inventory directly, we may:</p>
        <ul>
          <li>Mediate disputes between buyers and sellers when requested</li>
          <li>Take action against sellers who engage in fraudulent practices</li>
          <li>Remove sellers who repeatedly fail to honor their commitments</li>
        </ul>

        <h2>6. Fraudulent Claims</h2>
        <p>Filing false refund claims or engaging in fraudulent activity may result in account suspension or termination.</p>

        <h2>7. Contact Us</h2>
        <p>For assistance with a dispute or question about this policy, contact us at <strong>support@afristall.com</strong>.</p>
      </div>
    </main>
    <Footer />
  </div>
);

export default RefundPolicy;
