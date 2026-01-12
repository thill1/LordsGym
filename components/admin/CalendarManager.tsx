import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { useCalendar } from '../../context/CalendarContext';
import { CalendarEvent } from '../../lib/calendar-utils';
import ConfirmDialog from '../ConfirmDialog';

const CalendarManager: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const { events, isLoading, addEvent, updateEvent, deleteEvent, refreshEvents } = useCalendar();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; eventId: string | null }>({ isOpen: false, eventId: null });
  const [filterClassType, setFilterClassType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    class_type: 'community' as 'community' | 'outreach',
    capacity: ''
  });

  useEffect(() => {
    refreshEvents();
  }, [refreshEvents]);

  const openModal = (event?: CalendarEvent) => {
    // Only allow editing Community and Outreach events (not holidays)
    if (event && event.class_type === 'holiday') {
      showError('Holidays are automatically generated and cannot be edited.');
      return;
    }

    if (event) {
      setEditingEvent(event);
      setFormData({
        title: event.title,
        description: event.description || '',
        start_time: event.start_time.slice(0, 16), // Format for datetime-local input
        end_time: event.end_time.slice(0, 16),
        class_type: event.class_type as 'community' | 'outreach',
        capacity: event.capacity?.toString() || ''
      });
    } else {
      setEditingEvent(null);
      setFormData({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        class_type: 'community',
        capacity: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const eventData: Omit<CalendarEvent, 'id'> = {
        title: formData.title,
        description: formData.description || null,
        start_time: new Date(formData.start_time).toISOString(),
        end_time: new Date(formData.end_time).toISOString(),
        instructor_id: null,
        class_type: formData.class_type,
        capacity: formData.capacity ? parseInt(formData.capacity) : null
      };

      if (editingEvent) {
        updateEvent(editingEvent.id, eventData);
        showSuccess('Event updated successfully!');
      } else {
        addEvent(eventData);
        showSuccess('Event added successfully!');
      }

      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving event:', error);
      showError('Failed to save event.');
    }
  };

  const handleDelete = (id: string) => {
    const event = events.find(e => e.id === id);
    if (event && event.class_type === 'holiday') {
      showError('Holidays are automatically generated and cannot be deleted.');
      setDeleteConfirm({ isOpen: false, eventId: null });
      return;
    }

    try {
      deleteEvent(id);
      showSuccess('Event deleted successfully!');
      setDeleteConfirm({ isOpen: false, eventId: null });
    } catch (error) {
      console.error('Error deleting event:', error);
      showError('Failed to delete event.');
      setDeleteConfirm({ isOpen: false, eventId: null });
    }
  };

  const classTypes = [
    { value: 'community', label: 'Community' },
    { value: 'outreach', label: 'Outreach' }
  ];

  // Filter to only show Community, Outreach, and Holiday events
  const allowedTypes = ['community', 'outreach', 'holiday'];
  const filteredEvents = events
    .filter(event => allowedTypes.includes(event.class_type?.toLowerCase()))
    .filter(event => {
      const matchesClassType = filterClassType === 'all' || event.class_type === filterClassType;
      const matchesSearch = searchQuery === '' || 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesClassType && matchesSearch;
    });

  return (
    <div className="space-y-8 fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold dark:text-white">Calendar Management</h1>
        <button
          onClick={() => openModal()}
          className="px-4 py-2 bg-brand-red text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Add Event
        </button>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Note:</strong> US Federal Holidays are automatically generated and displayed. You can only add and edit Community and Outreach events.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg shadow-sm flex flex-col sm:flex-row gap-4 items-center">
        <input
          type="text"
          placeholder="Search events..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red dark:bg-neutral-900 dark:text-white"
        />
        <select
          value={filterClassType}
          onChange={(e) => setFilterClassType(e.target.value)}
          className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red dark:bg-neutral-900 dark:text-white"
        >
          <option value="all">All Types</option>
          <option value="community">Community</option>
          <option value="outreach">Outreach</option>
          <option value="holiday">Holiday</option>
        </select>
      </div>

      {isLoading ? (
        <div className="bg-white dark:bg-neutral-800 p-12 rounded-lg shadow-sm text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red mx-auto"></div>
          <p className="mt-4 text-neutral-500 dark:text-neutral-400">Loading events...</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700">
                <tr>
                  <th className="p-4 font-bold text-sm dark:text-white">Title</th>
                  <th className="p-4 font-bold text-sm dark:text-white">Type</th>
                  <th className="p-4 font-bold text-sm dark:text-white">Start Time</th>
                  <th className="p-4 font-bold text-sm dark:text-white">End Time</th>
                  <th className="p-4 font-bold text-sm dark:text-white">Capacity</th>
                  <th className="p-4 font-bold text-sm text-right dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-700">
                {filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-neutral-500">
                      {events.length === 0 
                        ? 'No events found. Create your first event to get started.'
                        : 'No events match your filters.'}
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map(event => {
                    const isHoliday = event.class_type === 'holiday';
                    return (
                      <tr key={event.id} className={`hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors ${isHoliday ? 'opacity-75' : ''}`}>
                        <td className="p-4 font-bold text-sm dark:text-white">
                          {event.title}
                          {isHoliday && <span className="ml-2 text-xs text-neutral-400">(Auto-generated)</span>}
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-1 rounded text-xs font-bold uppercase bg-neutral-100 dark:bg-neutral-900 dark:text-white">
                            {event.class_type}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-neutral-500 dark:text-neutral-400">
                          {new Date(event.start_time).toLocaleString()}
                        </td>
                        <td className="p-4 text-sm text-neutral-500 dark:text-neutral-400">
                          {new Date(event.end_time).toLocaleString()}
                        </td>
                        <td className="p-4 text-sm dark:text-white">
                          {event.capacity || 'Unlimited'}
                        </td>
                        <td className="p-4 text-right space-x-3">
                          {!isHoliday && (
                            <>
                              <button
                                onClick={() => openModal(event)}
                                className="text-brand-charcoal dark:text-white font-bold text-xs uppercase hover:text-brand-red transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => setDeleteConfirm({ isOpen: true, eventId: event.id })}
                                className="text-red-500 font-bold text-xs uppercase hover:text-red-700 transition-colors"
                              >
                                Delete
                              </button>
                            </>
                          )}
                          {isHoliday && (
                            <span className="text-xs text-neutral-400 italic">Read-only</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 dark:text-white">
              {editingEvent ? 'Edit Event' : 'Add New Event'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Start Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1 dark:text-neutral-300">End Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Event Type</label>
                  <select
                    value={formData.class_type}
                    onChange={(e) => setFormData({ ...formData, class_type: e.target.value as 'community' | 'outreach' })}
                    className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
                  >
                    {classTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1 dark:text-neutral-300">Capacity</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    placeholder="Unlimited"
                    className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t dark:border-neutral-700 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-brand-charcoal dark:text-white rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-red text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete Event"
        message="Are you sure you want to delete this event? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={() => deleteConfirm.eventId && handleDelete(deleteConfirm.eventId)}
        onCancel={() => setDeleteConfirm({ isOpen: false, eventId: null })}
        variant="danger"
      />
    </div>
  );
};

export default CalendarManager;
