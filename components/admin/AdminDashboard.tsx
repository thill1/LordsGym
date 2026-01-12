import React from 'react';
import { useStore } from '../../context/StoreContext';

const AdminDashboard: React.FC = () => {
  const { products, testimonials } = useStore();

  // Mock metrics - these would come from Supabase in production
  const metrics = {
    totalMembers: 1245,
    leadsThisWeek: 38,
    storeProducts: products.length,
    totalRevenue: 0, // Would calculate from orders
    activeTestimonials: testimonials.length
  };

  return (
    <div className="space-y-8 fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold dark:text-white">Overview</h1>
        <div className="text-sm text-neutral-500 dark:text-neutral-400">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border-l-4 border-brand-red">
          <h3 className="text-neutral-500 text-sm font-bold uppercase tracking-wider">Total Members</h3>
          <p className="text-4xl font-bold mt-2 dark:text-white">{metrics.totalMembers.toLocaleString()}</p>
          <p className="text-xs text-neutral-400 mt-1">+12% from last month</p>
        </div>

        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
          <h3 className="text-neutral-500 text-sm font-bold uppercase tracking-wider">Leads (This Week)</h3>
          <p className="text-4xl font-bold mt-2 dark:text-white">{metrics.leadsThisWeek}</p>
          <p className="text-xs text-neutral-400 mt-1">+5 from last week</p>
        </div>

        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border-l-4 border-emerald-500">
          <h3 className="text-neutral-500 text-sm font-bold uppercase tracking-wider">Store Products</h3>
          <p className="text-4xl font-bold mt-2 dark:text-white">{metrics.storeProducts}</p>
          <p className="text-xs text-neutral-400 mt-1">Active products</p>
        </div>

        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border-l-4 border-amber-500">
          <h3 className="text-neutral-500 text-sm font-bold uppercase tracking-wider">Total Revenue</h3>
          <p className="text-4xl font-bold mt-2 dark:text-white">${metrics.totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-neutral-400 mt-1">This month</p>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm">
        <h3 className="text-xl font-bold mb-4 dark:text-white">Recent Activity</h3>
        <div className="space-y-4">
          {[
            { type: 'membership', message: 'New Membership Inquiry', user: 'John Doe', time: '2 hours ago', status: 'new' },
            { type: 'product', message: 'Product Updated', user: 'Admin', time: '5 hours ago', status: 'updated' },
            { type: 'testimonial', message: 'Testimonial Added', user: 'Sarah J.', time: '1 day ago', status: 'new' }
          ].map((activity, i) => (
            <div key={i} className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-700 pb-2">
              <div>
                <p className="font-bold text-sm dark:text-white">{activity.message}</p>
                <p className="text-xs text-neutral-500">{activity.user} • {activity.time}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded ${
                activity.status === 'new' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200'
              }`}>
                {activity.status === 'new' ? 'New' : 'Updated'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm">
        <h3 className="text-xl font-bold mb-4 dark:text-white">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors text-left">
            <h4 className="font-bold text-sm dark:text-white mb-1">Add New Product</h4>
            <p className="text-xs text-neutral-500">Create a new store item</p>
          </button>
          <button className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors text-left">
            <h4 className="font-bold text-sm dark:text-white mb-1">Schedule Class</h4>
            <p className="text-xs text-neutral-500">Add calendar event</p>
          </button>
          <button className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors text-left">
            <h4 className="font-bold text-sm dark:text-white mb-1">Edit Home Page</h4>
            <p className="text-xs text-neutral-500">Update hero content</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
