import React, { useState } from 'react';
import { Plus } from 'lucide-react';

interface HabitFormProps {
  onAdd: (habit: { name: string; description: string; reminderTime: string }) => void;
}

export const HabitForm: React.FC<HabitFormProps> = ({ onAdd }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [reminderTime, setReminderTime] = useState('09:00');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ name, description, reminderTime });
    setName('');
    setDescription('');
    setReminderTime('09:00');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 mb-8 border border-purple-100">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Habit</h2>
      <div className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Habit Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field"
            placeholder="Enter habit name"
            required
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input-field"
            placeholder="Describe your habit"
            rows={3}
          />
        </div>
        <div>
          <label htmlFor="reminderTime" className="block text-sm font-medium text-gray-700 mb-2">
            Reminder Time
          </label>
          <input
            type="time"
            id="reminderTime"
            value={reminderTime}
            onChange={(e) => setReminderTime(e.target.value)}
            className="input-field"
            required
          />
        </div>
        <button type="submit" className="btn-primary flex items-center gap-2 w-full justify-center">
          <Plus size={20} />
          Add Habit
        </button>
      </div>
    </form>
  );
};