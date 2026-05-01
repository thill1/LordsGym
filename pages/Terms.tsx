import React from 'react';
import Section from '../components/Section';

const LAST_UPDATED = 'May 1, 2026';

const Terms: React.FC = () => {
  return (
    <>
      <div className="bg-brand-charcoal pt-32 pb-16 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">Terms of Service</h1>
        <p className="text-neutral-400 text-sm">Last updated: {LAST_UPDATED}</p>
      </div>

      <Section>
        <div className="max-w-3xl mx-auto prose prose-neutral dark:prose-invert prose-headings:font-bold prose-headings:tracking-tight prose-a:text-brand-red hover:prose-a:text-brand-charcoal text-neutral-700 dark:text-neutral-300">

          <p>
            Please read these Terms of Service (&ldquo;Terms&rdquo;) carefully before using the
            Lord&apos;s Gym Auburn website located at{' '}
            <a href="https://lordsgymoutreach.com">lordsgymoutreach.com</a> (the
            &ldquo;Site&rdquo;). By accessing or using the Site, you agree to be bound by these
            Terms. If you do not agree, please do not use the Site.
          </p>

          <h2>1. About Us</h2>
          <p>
            Lord&apos;s Gym Auburn is a faith-based fitness facility located at 258 Elm Ave,
            Auburn, CA 95603. We provide gym memberships, personal training, community outreach
            programs, and merchandise.
          </p>

          <h2>2. Use of the Website</h2>
          <p>You agree to use this Site only for lawful purposes and in a manner that does not:</p>
          <ul>
            <li>Infringe the rights of others.</li>
            <li>Transmit unsolicited or unauthorized advertising material.</li>
            <li>Attempt to gain unauthorized access to any part of the Site or its systems.</li>
            <li>Interfere with the normal operation of the Site.</li>
          </ul>
          <p>
            We reserve the right to suspend or terminate access to the Site for any user who
            violates these Terms.
          </p>

          <h2>3. Health & Fitness Disclaimer</h2>
          <p>
            <strong>
              All fitness information, programs, and content provided on this Site — including
              descriptions of training programs, membership services, and class schedules — are
              for informational and promotional purposes only.
            </strong>
          </p>
          <p>
            Before beginning any exercise program, you should consult with a qualified
            healthcare professional, especially if you have any pre-existing medical conditions,
            injuries, or health concerns. Lord&apos;s Gym Auburn is not liable for any injury,
            health complication, or adverse outcome resulting from participation in gym
            activities or reliance on fitness information presented on this Site.
          </p>
          <p>
            Results from fitness programs vary by individual. We make no guarantees regarding
            specific outcomes such as weight loss, strength gains, or performance improvements.
          </p>

          <h2>4. Membership Terms</h2>
          <p>
            Gym memberships are managed through Mindbody, a third-party service. By purchasing
            a membership, you also agree to Mindbody&apos;s terms and any separate membership
            agreement provided at the time of enrollment. Membership rates, cancellation
            policies, and billing terms are governed by that separate agreement.
          </p>
          <p>
            Lord&apos;s Gym Auburn reserves the right to refuse or revoke membership to any
            individual who violates facility rules, engages in unsafe behavior, or fails to
            maintain a respectful environment for other members.
          </p>

          <h2>5. Personal Training</h2>
          <p>
            1-on-1 personal training sessions are scheduled directly with our coaching staff.
            Cancellation and rescheduling policies are communicated at the time of booking.
            Lord&apos;s Gym Auburn is not liable for any injury arising from personal training
            sessions when instructions are not followed as directed.
          </p>

          <h2>6. Online Shop & Merchandise</h2>
          <p>
            All merchandise sales are processed through Square. By making a purchase, you also
            agree to Square&apos;s terms of service. The following policies apply to merchandise
            orders:
          </p>
          <ul>
            <li>
              <strong>Payment</strong> — all prices are in U.S. dollars. Payment is due at the
              time of purchase.
            </li>
            <li>
              <strong>Availability</strong> — products are subject to availability. We reserve
              the right to cancel orders if an item becomes unavailable after purchase, in which
              case a full refund will be issued.
            </li>
            <li>
              <strong>Returns</strong> — due to the custom nature of our merchandise, all sales
              are final unless the item is defective or we shipped the wrong product. Please
              contact us within 7 days of receipt for any such issues.
            </li>
            <li>
              <strong>Shipping</strong> — shipping timelines are estimates and may vary. We are
              not responsible for delays caused by carriers.
            </li>
          </ul>

          <h2>7. Donations</h2>
          <p>
            Donations made through our Square donation links support Lord&apos;s Gym Auburn&apos;s
            community outreach programs. All donations are non-refundable. We are not a
            registered 501(c)(3) nonprofit; donations are not tax-deductible unless otherwise
            stated.
          </p>

          <h2>8. Intellectual Property</h2>
          <p>
            All content on this Site — including logos, graphics, text, photographs, and
            software — is the property of Lord&apos;s Gym Auburn or its content suppliers and is
            protected by applicable intellectual property laws. You may not reproduce,
            distribute, or create derivative works from Site content without our prior written
            permission.
          </p>

          <h2>9. Third-Party Links</h2>
          <p>
            This Site may contain links to third-party websites (such as Mindbody, Square, or
            Google Maps). These links are provided for convenience only. We do not endorse and
            are not responsible for the content, privacy practices, or terms of any third-party
            site.
          </p>

          <h2>10. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by applicable law, Lord&apos;s Gym Auburn, its
            owners, employees, and affiliates shall not be liable for any indirect, incidental,
            special, consequential, or punitive damages arising out of or related to your use of
            the Site or our services. Our total liability for any claim arising from use of this
            Site shall not exceed $100.
          </p>

          <h2>11. Disclaimer of Warranties</h2>
          <p>
            The Site and all content are provided &ldquo;as is&rdquo; and &ldquo;as
            available&rdquo; without warranties of any kind, express or implied, including but
            not limited to warranties of merchantability, fitness for a particular purpose, or
            non-infringement.
          </p>

          <h2>12. Governing Law</h2>
          <p>
            These Terms are governed by the laws of the State of California, without regard to
            conflict of law principles. Any disputes arising from these Terms or your use of the
            Site shall be resolved in the courts of Placer County, California.
          </p>

          <h2>13. Changes to These Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. Changes take effect
            immediately upon posting to the Site. Your continued use of the Site after any
            changes constitutes your acceptance of the revised Terms. We encourage you to
            review this page periodically.
          </p>

          <h2>14. Contact Us</h2>
          <p>Questions about these Terms? Reach us at:</p>
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

export default Terms;
