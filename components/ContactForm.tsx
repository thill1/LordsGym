
import React, { useState } from 'react';
import Button from './Button';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

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
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    if (!isSupabaseConfigured()) {
      setStatus('error');
      setErrorMessage('Contact form is not configured. Please try again later.');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('contact-form', {
        body: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone || undefined,
          inquiryType: formData.inquiryType,
          message: formData.message,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setStatus('success');
      setFormData({ firstName: '', lastName: '', email: '', phone: '', inquiryType: '', message: '' });
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-800 p-8 rounded-lg shadow-xl">
      <h3 className="text-2xl font-bold mb-6 uppercase tracking-wider text-brand-charcoal dark:text-white">Send a Message</h3>
      
      {status === 'success' ? (
        <div className="text-center py-12 fade-in">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h4 className="text-xl font-bold mb-2 text-brand-charcoal dark:text-white">Message Sent!</h4>
          <p className="text-neutral-500 dark:text-neutral-400 mb-6">Your message has been sent successfully. We&apos;ll respond as soon as we can.</p>
          <Button onClick={() => setStatus('idle')} variant="outline" size="sm">Send Another</Button>
        </div>
      ) : status === 'error' ? (
        <div className="text-center py-12 fade-in">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h4 className="text-xl font-bold mb-2 text-brand-charcoal dark:text-white">Something went wrong</h4>
          <p className="text-neutral-500 dark:text-neutral-400 mb-6">{errorMessage}</p>
          <Button onClick={() => setStatus('idle')} variant="outline" size="sm">Try Again</Button>
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
