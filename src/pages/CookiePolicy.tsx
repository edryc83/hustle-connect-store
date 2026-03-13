import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const CookiePolicy = () => (
  <div className="min-h-screen flex flex-col bg-background text-foreground">
    <Navbar />
    <main className="flex-1 mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold mb-2">Cookie Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: March 13, 2026</p>

      <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground [&_h2]:text-foreground [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-8 [&_h2]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">
        <p>This Cookie Policy explains how Afristall uses cookies and similar tracking technologies when you visit our platform.</p>

        <h2>1. What Are Cookies?</h2>
        <p>Cookies are small text files stored on your device when you visit a website. They help us recognize your device and remember certain information about your visit.</p>

        <h2>2. Types of Cookies We Use</h2>

        <h3 className="text-foreground font-medium mt-4 mb-2">Essential Cookies</h3>
        <p>These cookies are necessary for the platform to function properly. They enable core features like authentication, security, and account management. You cannot opt out of these cookies.</p>

        <h3 className="text-foreground font-medium mt-4 mb-2">Analytics Cookies</h3>
        <p>We use analytics cookies to understand how visitors interact with our platform. This helps us improve user experience and platform performance. Data collected includes pages visited, time spent, and navigation patterns.</p>

        <h3 className="text-foreground font-medium mt-4 mb-2">Functional Cookies</h3>
        <p>These cookies remember your preferences (such as theme settings and language) to provide a more personalized experience.</p>

        <h2>3. Third-Party Cookies</h2>
        <p>Some cookies may be set by third-party services we use, including:</p>
        <ul>
          <li>Analytics providers for usage tracking</li>
          <li>Authentication services for secure login</li>
          <li>Content delivery networks for performance</li>
        </ul>

        <h2>4. Managing Cookies</h2>
        <p>You can control cookies through your browser settings. Most browsers allow you to:</p>
        <ul>
          <li>View what cookies are stored on your device</li>
          <li>Delete individual or all cookies</li>
          <li>Block cookies from specific or all websites</li>
          <li>Set preferences for different types of cookies</li>
        </ul>
        <p>Please note that disabling certain cookies may affect the functionality of our platform.</p>

        <h2>5. Local Storage</h2>
        <p>In addition to cookies, we may use browser local storage to store preferences such as your selected theme (light/dark mode) and visitor name for storefronts.</p>

        <h2>6. Changes to This Policy</h2>
        <p>We may update this Cookie Policy periodically. Changes will be posted on this page with an updated revision date.</p>

        <h2>7. Contact Us</h2>
        <p>If you have questions about our use of cookies, contact us at <strong>support@afristall.com</strong>.</p>
      </div>
    </main>
    <Footer />
  </div>
);

export default CookiePolicy;
