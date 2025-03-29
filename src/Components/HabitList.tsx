import React from 'react';
import { CheckCircle, Circle, Trophy } from 'lucide-react';
import type { Habit } from '../types/habit';

interface HabitListProps {
  habits: Habit[];
  onToggle: (id: string) => void;
}

export const HabitList: React.FC<HabitListProps> = ({ habits, onToggle }) => {
  return (
    <div className="space-y-4">
      {habits.map((habit) => (
        <div key={habit.id} className="habit-card">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{habit.name}</h3>
              <p className="text-gray-600 mb-2">{habit.description}</p>
              <p className="text-sm text-gray-500 flex items-center">
                <span className="inline-block w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                Reminder at {habit.reminderTime}
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 bg-amber-50 px-3 py-1 rounded-full">
                <Trophy size={18} className="text-amber-500" />
                <span className="font-semibold text-amber-700">{habit.streak}</span>
              </div>
              <button
                onClick={() => onToggle(habit.id)}
                className="text-purple-600 hover:text-purple-800 transition-colors"
              >
                {habit.completed ? (
                  <CheckCircle size={32} className="text-green-500" />
                ) : (
                  <Circle size={32} className="hover:scale-110 transition-transform" />
                )}
              </button>
            </div>
          </div>
        </div>
      ))}
      {habits.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No habits added yet. Start by adding a new habit above!
        </div>
      )}
    </div>
  );
};