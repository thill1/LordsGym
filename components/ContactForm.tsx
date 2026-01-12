
import React, { useState } from 'react';
import Button from './Button';

const INQUIRY_TYPES = [
  'Gym Tour',
  '1on1 Coaching',
  'Membership Question',
  'Outreach/Volunteering',
  'Billing Question'
] as const;

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    inquiryType: '' as string,
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');

    // Create email subject with inquiry type
    const subject = encodeURIComponent(formData.inquiryType || 'Contact Form Inquiry');
    
    // Create email body with contact info and message
    const body = encodeURIComponent(
      `Contact Information:\n` +
      `Name: ${formData.firstName} ${formData.lastName}\n` +
      `Email: ${formData.email}\n` +
      `Phone: ${formData.phone || 'Not provided'}\n\n` +
      `Message:\n${formData.message}`
    );

    // Create mailto link
    const mailtoLink = `mailto:lordsgymoutreach@gmail.com?subject=${subject}&body=${body}`;
    
    // Open email client
    window.location.href = mailtoLink;
    
    // Show success message after a brief delay
    setTimeout(() => {
      setStatus('success');
      setFormData({ firstName: '', lastName: '', email: '', phone: '', inquiryType: '', message: '' });
    }, 500);
  };

  return (
    <div className="bg-white dark:bg-neutral-800 p-8 rounded-lg shadow-xl">
      <h3 className="text-2xl font-bold mb-6 uppercase tracking-wider text-brand-charcoal dark:text-white">Send a Message</h3>
      
      {status === 'success' ? (
        <div className="text-center py-12 fade-in">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h4 className="text-xl font-bold mb-2 text-brand-charcoal dark:text-white">Email Client Opened!</h4>
          <p className="text-neutral-500 mb-6">Your email client should have opened with the message pre-filled. Please review and send the email to complete your inquiry.</p>
          <Button onClick={() => setStatus('idle')} variant="outline" size="sm">Send Another</Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Inquiry Type</label>
            <div className="relative">
              <select
                name="inquiryType"
                value={formData.inquiryType}
                onChange={handleChange}
                required
                className="w-full p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded focus:border-brand-red outline-none transition-colors appearance-none cursor-pointer dark:text-white"
              >
                <option value="">Select an inquiry type...</option>
                {INQUIRY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">First Name</label>
              <input 
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded focus:border-brand-red outline-none transition-colors dark:text-white"
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Last Name</label>
              <input 
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded focus:border-brand-red outline-none transition-colors dark:text-white"
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Email</label>
              <input 
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded focus:border-brand-red outline-none transition-colors dark:text-white"
                placeholder="john@example.com"
              />
            </div>
             <div>
              <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Phone</label>
              <input 
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded focus:border-brand-red outline-none transition-colors dark:text-white"
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Message</label>
            <textarea 
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={4}
              className="w-full p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded focus:border-brand-red outline-none transition-colors resize-none dark:text-white"
              placeholder="How can we help you?"
            ></textarea>
          </div>

          <Button type="submit" fullWidth disabled={status === 'submitting'}>
            {status === 'submitting' ? 'Sending...' : 'Send Message'}
          </Button>
        </form>
      )}
    </div>
  );
};

export default ContactForm;
