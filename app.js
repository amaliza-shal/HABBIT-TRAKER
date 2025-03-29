// Habit Reminder App with Enhanced Notifications
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

    // ===== ENHANCED NOTIFICATION FUNCTIONS =====
    function showNotification(title, body) {
        if (!('Notification' in window)) {
            console.warn('Notifications not supported');
            return;
        }

        if (Notification.permission === 'granted') {
            // Create persistent notification
            const notification = new Notification(title, { 
                body,
                requireInteraction: true,  // Stays until clicked
                tag: 'habit-reminder',    // Prevents duplicates
                icon: 'https://cdn-icons-png.flaticon.com/512/3063/3063188.png' // Default icon
            });
            
            // Play notification sound
            playNotificationSound();
            
            // Vibrate if on mobile
            triggerVibration();
            
            // Auto-close after 15 seconds if not clicked
            setTimeout(() => notification.close(), 15000);
            
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission()
                .then(permission => {
                    if (permission === 'granted') showNotification(title, body);
                });
        }
    }

    function playNotificationSound() {
        try {
            // Web Audio API (no external files needed)
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1);
            
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.5);
        } catch (e) {
            console.log('Audio context not supported:', e);
        }
    }

    function triggerVibration() {
        if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200]); // Vibrate pattern
        }
    }

    function checkNotificationPermission() {
        if (!('Notification' in window)) return;
        if (Notification.permission === 'default') showModal();
    }

    function showModal() {
        permissionModal.style.display = 'flex';
    }

    // ===== HABIT MANAGEMENT FUNCTIONS =====
    function addHabit(e) {
        e.preventDefault();
        
        const habitName = document.getElementById('habitName').value;
        const reminderTime = document.getElementById('reminderTime').value;
        const dayCheckboxes = document.querySelectorAll('#reminderDays input[type="checkbox"]:checked');
        
        if (!habitName || !reminderTime || dayCheckboxes.length === 0) {
            alert('Please fill in all fields');
            return;
        }
        
        const habit = {
            id: Date.now(),
            name: habitName,
            time: reminderTime,
            days: Array.from(dayCheckboxes).map(cb => parseInt(cb.value))
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
        
        getHabits().forEach(habit => {
            if (habit.days.includes(currentDay) && habit.time === currentTime) {
                showNotification('Habit Reminder', `Time to ${habit.name}!`);
            }
        });
    }

    // ===== RELIABLE QUOTE FETCHING =====
    async function fetchMotivationalQuote() {
        // Local fallback quotes (guaranteed to work)
        const FALLBACK_QUOTES = [
            { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
            { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
            { text: "Small daily improvements lead to stunning results.", author: "Robin Sharma" }
        ];

        try {
            // Try primary API first
            const response = await fetch('https://type.fit/api/quotes');
            
            if (!response.ok) throw new Error(`API error: ${response.status}`);
            
            const quotes = await response.json();
            
            // Validate API response structure
            if (!Array.isArray(quotes)) throw new Error('Invalid API response format');
            
            // Filter out any invalid entries
            const validQuotes = quotes.filter(quote => 
                quote?.text && typeof quote.text === 'string'
            );
            
            if (validQuotes.length === 0) throw new Error('No valid quotes found');
            
            // Select random quote and clean author name
            const randomQuote = validQuotes[Math.floor(Math.random() * validQuotes.length)];
            const cleanAuthor = randomQuote.author 
                ? randomQuote.author.replace(', type.fit', '') 
                : 'Unknown';
            
            motivationalQuoteEl.textContent = `"${randomQuote.text}" — ${cleanAuthor}`;
            
        } catch (error) {
            console.error('Using fallback quotes:', error);
            // Use local fallback if API fails
            const randomFallback = FALLBACK_QUOTES[
                Math.floor(Math.random() * FALLBACK_QUOTES.length)
            ];
            motivationalQuoteEl.textContent = `"${randomFallback.text}" — ${randomFallback.author}`;
        }
    }

    // Event Listeners
    habitForm.addEventListener('submit', addHabit);
    testNotificationBtn.addEventListener('click', () => {
        showNotification('Test Notification', 'This is a test of the reminder system!');
    });
    allowNotificationsBtn.addEventListener('click', () => {
        Notification.requestPermission().then(permission => {
            permissionModal.style.display = 'none';
            if (permission === 'granted') {
                showNotification('Notifications Enabled', 'You will now receive reminders!');
            }
        });
    });
    denyNotificationsBtn.addEventListener('click', () => {
        permissionModal.style.display = 'none';
    });
});
