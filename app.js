// Habit Reminder App with RapidAPI Quotes
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const habitForm = document.getElementById('habitForm');
    const habitsList = document.getElementById('habitsList');
    const testNotificationBtn = document.getElementById('testNotification');
    const permissionModal = document.getElementById('permissionModal');
    const allowNotificationsBtn = document.getElementById('allowNotifications');
    const denyNotificationsBtn = document.getElementById('denyNotifications');
    const motivationalQuoteEl = document.getElementById('motivationalQuote');
    
    // Initialize the app
    initApp();
    
    function initApp() {
        checkNotificationPermission();
        loadHabits();
        setupReminders();
        fetchMotivationalQuote();
    }

    // ===== NOTIFICATION FUNCTIONS =====
    function checkNotificationPermission() {
        if (!('Notification' in window)) {
            console.warn('This browser does not support notifications');
            return;
        }
        
        if (Notification.permission === 'default') {
            showModal();
        } else if (Notification.permission === 'denied') {
            console.log('Notifications blocked by user');
        }
    }
    
    function showModal() {
        permissionModal.style.display = 'flex';
    }
    
    function hideModal() {
        permissionModal.style.display = 'none';
    }
    
    function requestNotificationPermission() {
        if (!('Notification' in window)) {
            alert('This browser does not support desktop notifications');
            return;
        }
        
        Notification.requestPermission()
            .then(permission => {
                hideModal();
                if (permission === 'granted') {
                    showNotification(
                        'Habit Reminder', 
                        'Notifications enabled! You\'ll now receive habit reminders.'
                    );
                }
            })
            .catch(err => {
                console.error('Error requesting notification permission:', err);
                hideModal();
            });
    }
    
    function showNotification(title, body) {
        if (!('Notification' in window)) {
            console.warn('This browser does not support notifications');
            return;
        }
        
        try {
            if (Notification.permission === 'granted') {
                new Notification(title, { body });
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission()
                    .then(permission => {
                        if (permission === 'granted') {
                            new Notification(title, { body });
                        }
                    });
            }
        } catch (error) {
            console.error('Error showing notification:', error);
        }
    }
    
    function sendTestNotification() {
        if (!('Notification' in window)) {
            alert('This browser does not support desktop notifications');
            return;
        }

        if (Notification.permission === 'granted') {
            showNotification(
                'Test Notification', 
                'This is a test notification from Habit Reminder!'
            );
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission()
                .then(permission => {
                    if (permission === 'granted') {
                        showNotification(
                            'Test Notification', 
                            'This is a test notification from Habit Reminder!'
                        );
                    } else {
                        alert('Please enable notifications to use this feature.');
                    }
                });
        } else {
            alert('Notifications were blocked. Please enable them in your browser settings.');
        }
    }

    // ===== HABIT TRACKING FUNCTIONS =====
    function addHabit(e) {
        e.preventDefault();
        
        const habitName = document.getElementById('habitName').value;
        const reminderTime = document.getElementById('reminderTime').value;
        const dayCheckboxes = document.querySelectorAll('#reminderDays input[type="checkbox"]:checked');
        
        if (!habitName || !reminderTime || dayCheckboxes.length === 0) {
            alert('Please fill in all fields');
            return;
        }
        
        const days = Array.from(dayCheckboxes).map(cb => parseInt(cb.value));
        
        const habit = {
            id: Date.now(),
            name: habitName,
            time: reminderTime,
            days: days
        };
        
        saveHabit(habit);
        renderHabit(habit);
        habitForm.reset();
    }
    
    function saveHabit(habit) {
        const habits = getHabits();
        habits.push(habit);
        localStorage.setItem('habits', JSON.stringify(habits));
    }
    
    function getHabits() {
        return JSON.parse(localStorage.getItem('habits')) || [];
    }
    
    function loadHabits() {
        const habits = getHabits();
        habitsList.innerHTML = '';
        
        if (habits.length === 0) {
            habitsList.innerHTML = '<p class="empty-state">No habits added yet.</p>';
            return;
        }
        
        habits.forEach(habit => renderHabit(habit));
    }
    
    function renderHabit(habit) {
        if (habitsList.querySelector('.empty-state')) {
            habitsList.innerHTML = '';
        }
        
        const daysMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const daysText = habit.days.map(day => daysMap[day]).join(', ');
        
        const habitEl = document.createElement('div');
        habitEl.className = 'habit-item fade-in';
        habitEl.innerHTML = `
            <div>
                <h3 class="habit-name">${habit.name}</h3>
                <p class="habit-details">${habit.time} on ${daysText}</p>
            </div>
            <button data-id="${habit.id}" class="delete-habit">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        habitsList.appendChild(habitEl);
        habitEl.querySelector('.delete-habit').addEventListener('click', () => deleteHabit(habit.id));
    }
    
    function deleteHabit(id) {
        const habits = getHabits().filter(habit => habit.id !== id);
        localStorage.setItem('habits', JSON.stringify(habits));
        loadHabits();
    }
    
    function setupReminders() {
        setInterval(checkReminders, 60000);
        checkReminders();
    }
    
    function checkReminders() {
        if (!('Notification' in window) || Notification.permission !== 'granted') return;
        
        const now = new Date();
        const currentDay = now.getDay();
        const currentTime = now.getHours().toString().padStart(2, '0') + ':' + 
                         now.getMinutes().toString().padStart(2, '0');
        
        const habits = getHabits();
        
        habits.forEach(habit => {
            if (habit.days.includes(currentDay)) {
                if (habit.time === currentTime) {
                    showNotification('Habit Reminder', `Time to ${habit.name}!`);
                }
            }
        });
    }

    // ===== QUOTE API FUNCTIONS =====
    async function fetchMotivationalQuote() {
        // Fallback quotes
        const FALLBACK_QUOTES = [
            { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
            { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
            { text: "Small daily improvements lead to stunning results.", author: "Robin Sharma" }
        ];
        
        // Check cache first
        const cachedQuote = localStorage.getItem('dailyQuote');
        if (cachedQuote) {
            motivationalQuoteEl.textContent = cachedQuote;
            return;
        }
        
        try {
            // RapidAPI call
            const url = 'https://random-quote-generator2.p.rapidapi.com/randomQuote';
            const options = {
                method: 'GET',
                headers: {
                    'x-rapidapi-key': '756014f0d6msh1b1accca748d026p150be8jsn9db97b6721a0',
                    'x-rapidapi-host': 'random-quote-generator2.p.rapidapi.com'
                }
            };
            
            const response = await fetch(url, options);
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            const quoteText = `"${data.quote}" — ${data.author || 'Unknown'}`;
            
            motivationalQuoteEl.textContent = quoteText;
            localStorage.setItem('dailyQuote', quoteText);
            
        } catch (error) {
            console.error('API failed, using fallback:', error);
            const randomFallback = FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
            motivationalQuoteEl.textContent = `"${randomFallback.text}" — ${randomFallback.author}`;
        }
    }

    // Event Listeners
    habitForm.addEventListener('submit', addHabit);
    testNotificationBtn.addEventListener('click', sendTestNotification);
    allowNotificationsBtn.addEventListener('click', requestNotificationPermission);
    denyNotificationsBtn.addEventListener('click', hideModal);
});
