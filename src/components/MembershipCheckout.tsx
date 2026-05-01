// Membership Checkout - Redirects to Mindbody CRM
// Lords Gym uses Mindbody for membership management

import { MINDBODY_MEMBERSHIP_URL } from '../../constants';

interface MembershipOption {
  id: string;
  name: string;
  description: string;
  price: string;
  period: string;
  setupFee: string;
  features: string[];
  popular?: boolean;
}

// ACTUAL Lords Gym Membership Pricing
const membershipOptions: MembershipOption[] = [
  {
    id: 'regular',
    name: 'Regular Monthly',
    description: 'Full gym access for dedicated athletes',
    price: '$39',
    period: '/month',
    setupFee: '+ $39 One-Time Setup Fee',
    features: [
      'Access to gym equipment',
      '24 HR Access',
      'No long-term contracts',
      'No annual fees',
    ],
    popular: true,
  },
  {
    id: 'student',
    name: 'Student Monthly',
    description: 'Current High School or College Student',
    price: '$29',
    period: '/month',
    setupFee: '+ $39 One-Time Setup Fee',
    features: [
      'Valid student ID required',
      'Access to gym equipment',
      '24 HR Access',
      'No long-term contracts',
    ],
  },
  {
    id: 'annual',
    name: '1 Year Paid In Full',
    description: 'Full year paid upfront - best value',
    price: '$360',
    period: '/year',
    setupFee: 'No setup fee',
    features: [
      'Full Year Paid Up Front',
      '24 HR Access',
      'No setup fee',
      'Best value option',
    ],
  },
];

export default function MembershipCheckout() {
  const handleJoin = () => {
    // Redirect to Mindbody CRM for membership management
    window.open(MINDBODY_MEMBERSHIP_URL, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            MONTH-TO-MONTH Memberships
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Join the community built on faith and forged in iron.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {membershipOptions.map((option) => (
            <div
              key={option.id}
              className={`bg-white rounded-lg shadow-lg overflow-hidden flex flex-col ${
                option.popular ? 'ring-2 ring-red-600 transform scale-105' : ''
              }`}
            >
              {option.popular && (
                <div className="bg-red-600 text-white text-center py-2 text-sm font-semibold">
                  MOST POPULAR
                </div>
              )}
              
              <div className="p-6 flex-1">
                <h3 className="text-xl font-bold text-gray-900 uppercase tracking-tight">
                  {option.name}
                </h3>
                <p className="mt-2 text-sm text-gray-500">{option.description}</p>
                
                <div className="mt-4 text-center bg-gray-100 rounded p-4">
                  <span className="text-4xl font-bold text-red-600">{option.price}</span>
                  <span className="text-gray-500 text-sm">{option.period}</span>
                  <div className="text-xs text-gray-400 mt-1">{option.setupFee}</div>
                </div>

                <ul className="mt-6 space-y-3">
                  {option.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <svg
                        className="flex-shrink-0 h-5 w-5 text-green-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="ml-2 text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-6 pt-0">
                <button
                  onClick={handleJoin}
                  className={`w-full py-3 px-4 rounded-md font-semibold text-white transition-colors ${
                    option.popular
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-gray-900 hover:bg-gray-800'
                  }`}
                >
                  Join Now
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Promos */}
        <div className="mt-16 text-center space-y-2">
          <p className="text-3xl md:text-4xl font-bold italic text-red-600 uppercase tracking-tighter">
            No Long Term Contracts!
          </p>
          <p className="text-3xl md:text-4xl font-bold italic text-red-600 uppercase tracking-tighter">
            No Annual Fees!
          </p>
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-8">Membership FAQ</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-bold text-lg mb-2">Why is there a setup fee?</h4>
              <p className="text-gray-500 text-sm">
                The $39 setup fee covers your initial onboarding, mobile app activation, 
                and administrative setup to get you 24/7 access immediately.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-2">How do I verify my Student status?</h4>
              <p className="text-gray-500 text-sm">
                Bring a valid student ID from any local high school or college 
                (like Sierra College) during staffed hours to activate your discounted rate.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-2">How does 24/7 access work?</h4>
              <p className="text-gray-500 text-sm">
                Members receive secure mobile app access that unlocks our front doors 
                at any time, day or night, ensuring you can train on your schedule.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-2">What does "No Annual Fees" mean?</h4>
              <p className="text-gray-500 text-sm">
                Unlike big-box gyms, we don't surprise you with an "equipment fee" or 
                "maintenance fee" six months into your membership. Your monthly price is your price.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center text-sm text-gray-500">
          <p>Memberships managed through Mindbody</p>
        </div>
      </div>
    </div>
  );
}
