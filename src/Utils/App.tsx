import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { HabitForm } from './components/HabitForm';
import { HabitList } from './components/HabitList';
import { DailyQuote } from './components/DailyQuote';
import { requestNotificationPermission, scheduleNotification } from './utils/notifications';
import { getDailyQuote } from './utils/api';
import type { Habit } from './types/habit';
import type { Quote } from './types/weather';

function App() {
  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('habits');
    return saved ? JSON.parse(saved) : [];
  });
  const [quote, setQuote] = useState<Quote | null>(null);

  useEffect(() => {
    localStorage.setItem('habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    requestNotificationPermission();
    
    const fetchData = async () => {
      const quoteData = await getDailyQuote();
      setQuote(quoteData);
    };
    
    fetchData();

    const quoteInterval = setInterval(async () => {
      const quoteData = await getDailyQuote();
      setQuote(quoteData);
    }, 86400000);

    return () => {
      clearInterval(quoteInterval);
    };
  }, []);

  const handleAddHabit = ({ name, description, reminderTime }: {
    name: string;
    description: string;
    reminderTime: string;
  }) => {
    const newHabit: Habit = {
      id: crypto.randomUUID(),
      name,
      description,
      reminderTime,
      completed: false,
      streak: 0,
    };

    setHabits((prev) => [...prev, newHabit]);
    scheduleNotification(name, reminderTime);
  };

  const toggleHabit = (id: string) => {
    setHabits((prev) =>
      prev.map((habit) =>
        habit.id === id
          ? {
              ...habit,
              completed: !habit.completed,
              streak: !habit.completed ? habit.streak + 1 : habit.streak,
            }
          : habit
      )
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      <div className="max-w-3xl mx-auto py-12 px-4 animate-fadeIn">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text">
            Habit Tracker
          </h1>
          <Bell className="text-purple-600" size={28} />
        </div>
        
        <DailyQuote quote={quote} />
        <HabitForm onAdd={handleAddHabit} />
        <HabitList habits={habits} onToggle={toggleHabit} />
      </div>
    </div>
  );
}

export default App;