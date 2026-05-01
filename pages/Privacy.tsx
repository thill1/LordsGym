import React from 'react';
import Section from '../components/Section';

const LAST_UPDATED = 'May 1, 2026';

const Privacy: React.FC = () => {
  return (
    <>
      <div className="bg-brand-charcoal pt-32 pb-16 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-neutral-400 text-sm">Last updated: {LAST_UPDATED}</p>
      </div>

      <Section>
        <div className="max-w-3xl mx-auto prose prose-neutral dark:prose-invert prose-headings:font-bold prose-headings:tracking-tight prose-a:text-brand-red hover:prose-a:text-brand-charcoal text-neutral-700 dark:text-neutral-300">

          <p>
            Lord&apos;s Gym Auburn (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) is committed to protecting
            your privacy. This Privacy Policy explains how we collect, use, and safeguard
            information when you visit our website at{' '}
            <a href="https://lordsgymoutreach.com">lordsgymoutreach.com</a> or interact with
            our services.
          </p>

          <h2>1. Information We Collect</h2>

          <h3>Information you provide directly</h3>
          <ul>
            <li>
              <strong>Contact form submissions</strong> — your name, email address, phone number,
              and message when you reach out to us or book a tour.
            </li>
            <li>
              <strong>Membership inquiries</strong> — any information shared when signing up for
              membership through our third-party provider (Mindbody).
            </li>
            <li>
              <strong>Purchase information</strong> — when you buy merchandise through our shop,
              your order and payment details are processed securely by Square. We do not store
              payment card numbers on our servers.
            </li>
          </ul>

          <h3>Information collected automatically</h3>
          <ul>
            <li>
              <strong>Page view analytics</strong> — we record which pages are visited (path,
              referrer, and an anonymized session identifier) to understand how visitors use our
              site. No personally identifiable information is stored in these records.
            </li>
            <li>
              <strong>Browser and device information</strong> — standard web server logs may
              include your IP address, browser type, and operating system. These are used solely
              for security and performance monitoring.
            </li>
            <li>
              <strong>Cookies and local storage</strong> — our site uses browser local storage to
              remember your theme preference (light/dark mode) and shopping cart contents. We do
              not use third-party advertising cookies.
            </li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <ul>
            <li>To respond to contact form submissions and booking requests.</li>
            <li>To process merchandise orders and send order confirmations.</li>
            <li>To improve the website based on aggregate usage analytics.</li>
            <li>To display publicly posted Google Reviews on our site.</li>
            <li>To maintain the security and integrity of our systems.</li>
          </ul>
          <p>We do not sell, rent, or share your personal information with third parties for
          marketing purposes.</p>

          <h2>3. Third-Party Services</h2>
          <p>We work with the following third-party services, each governed by their own privacy policies:</p>
          <ul>
            <li>
              <strong>Supabase</strong> — our backend database and authentication provider.
              Data is stored in the United States and is subject to Supabase&apos;s{' '}
              <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">
                Privacy Policy
              </a>.
            </li>
            <li>
              <strong>Square</strong> — payment processing for merchandise orders. Square&apos;s{' '}
              <a href="https://squareup.com/us/en/legal/general/privacy" target="_blank" rel="noopener noreferrer">
                Privacy Policy
              </a>{' '}
              applies to any payment data you provide.
            </li>
            <li>
              <strong>Mindbody</strong> — gym membership management and class scheduling.
              Their{' '}
              <a href="https://company.mindbodyonline.com/privacy" target="_blank" rel="noopener noreferrer">
                Privacy Policy
              </a>{' '}
              governs data collected through the membership sign-up process.
            </li>
            <li>
              <strong>Google</strong> — we display reviews from Google Maps. Google&apos;s{' '}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
                Privacy Policy
              </a>{' '}
              applies to information associated with those reviews.
            </li>
            <li>
              <strong>Cloudflare</strong> — our website is hosted on Cloudflare Pages. Cloudflare
              may process connection metadata as described in their{' '}
              <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer">
                Privacy Policy
              </a>.
            </li>
          </ul>

          <h2>4. Data Retention</h2>
          <p>
            Contact form submissions are retained for as long as needed to respond to your
            inquiry and for reasonable business record-keeping, generally no longer than two
            years. Anonymized page-view analytics may be retained indefinitely for trend
            analysis.
          </p>

          <h2>5. Your California Privacy Rights (CCPA)</h2>
          <p>
            If you are a California resident, the California Consumer Privacy Act (CCPA) gives
            you the right to:
          </p>
          <ul>
            <li>Know what personal information we collect, use, and disclose.</li>
            <li>Request deletion of your personal information.</li>
            <li>Opt out of the sale of personal information (we do not sell personal data).</li>
            <li>Non-discrimination for exercising your rights.</li>
          </ul>
          <p>
            To exercise any of these rights, please contact us at{' '}
            <a href="mailto:lordsgymoutreach@gmail.com">lordsgymoutreach@gmail.com</a>.
            We will respond within 45 days as required by law.
          </p>

          <h2>6. Children&apos;s Privacy</h2>
          <p>
            Our website is not directed at children under 13 years of age. We do not knowingly
            collect personal information from children under 13. If you believe a child has
            submitted personal information to us, please contact us immediately.
          </p>

          <h2>7. Security</h2>
          <p>
            We use industry-standard measures to protect your information, including encrypted
            data transmission (HTTPS), access-controlled databases, and regular security reviews.
            No method of transmission over the internet is 100% secure; we cannot guarantee
            absolute security.
          </p>

          <h2>8. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. When we do, we will revise the
            &ldquo;Last updated&rdquo; date at the top of this page. Continued use of our website
            after changes are posted constitutes acceptance of the updated policy.
          </p>

          <h2>9. Contact Us</h2>
          <p>
            If you have questions or concerns about this Privacy Policy or how we handle your
            data, please reach out:
          </p>
          <address className="not-italic space-y-1 text-sm">
            <div><strong>Lord&apos;s Gym Auburn</strong></div>
            <div>258 Elm Ave, Auburn, CA 95603</div>
            <div>
              <a href="mailto:lordsgymoutreach@gmail.com">lordsgymoutreach@gmail.com</a>
            </div>
            <div>530-537-2105</div>
          </address>

        </div>
      </Section>
    </>
  );
};

export default Privacy;
