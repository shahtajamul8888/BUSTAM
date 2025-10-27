// Theme Toggle
const themeToggle = document.getElementById('theme-toggle');
let isDark = localStorage.getItem('bustam_theme') === 'dark';
if (isDark) document.body.classList.add('dark');
updateThemeIcon();

themeToggle.onclick = () => {
  isDark = !isDark;
  document.body.classList.toggle('dark');
  localStorage.setItem('bustam_theme', isDark ? 'dark' : 'light');
  updateThemeIcon();
};

function updateThemeIcon() {
  themeToggle.textContent = isDark ? '☀️' : '🌙';
}

// Digital Clock
function updateClock() {
  const now = new Date();
  document.getElementById('clock').textContent = now.toLocaleTimeString('en-IN', { hour12: false });
}
setInterval(updateClock, 1000);
updateClock();

// Login System (Simulated OTP)
const loginCard = document.getElementById('login-card');
const appSection = document.getElementById('app-section');
const loginForm = document.getElementById('login-form');
const otpArea = document.getElementById('otp-area');
const loginMsg = document.getElementById('login-msg');
let sentOTP = null;

loginForm.onsubmit = function(e) {
  e.preventDefault();
  const num = document.getElementById('wa').value.trim();
  if (!/^(\+91)?[0-9]{10}$/.test(num.replace('+91', ''))) {
    showLoginMessage("Please enter a valid 10-digit WhatsApp number 📱", "error");
    return;
  }
  
  sentOTP = Math.floor(100000 + Math.random() * 900000).toString();
  otpArea.classList.remove('hidden');
  showLoginMessage(`OTP sent! (Demo: ${sentOTP}) 📨`, "success");
};

document.getElementById('verify-otp').onclick = function(e) {
  e.preventDefault();
  const enteredOTP = document.getElementById('otp-field').value;
  if (enteredOTP === sentOTP) {
    showLoginMessage("Login Success! Welcome to BUSTAM! 🎉", "success");
    setTimeout(() => {
      loginCard.classList.add('hidden');
      appSection.classList.remove('hidden');
      loadReminders();
      showNextReminder();
    }, 1500);
  } else {
    showLoginMessage("Incorrect OTP. Try again! ❌", "error");
  }
};

function showLoginMessage(msg, type) {
  loginMsg.textContent = msg;
  loginMsg.className = `text-center mt-4 font-semibold ${type === 'error' ? 'text-red-500' : 'text-green-500'}`;
}

// Logout
document.getElementById('logout').onclick = () => {
  appSection.classList.add('hidden');
  loginCard.classList.remove('hidden');
  document.getElementById('wa').value = '';
  otpArea.classList.add('hidden');
  loginMsg.textContent = '';
  toast("Logged out successfully! 👋", "info");
};

// Reminder Storage
const STORAGE_KEY = 'bustam_reminders';
function getReminders() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}
function saveReminders(reminders) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
}

// Load and Display Reminders
function loadReminders() {
  const list = document.getElementById('reminders-list');
  const emptyState = document.getElementById('empty-state');
  const searchQuery = document.getElementById('reminder-search').value.toLowerCase();
  const categoryFilter = document.getElementById('reminder-category').value;
  
  let reminders = getReminders().filter(rem => {
    const matchesSearch = !searchQuery || 
      rem.title.toLowerCase().includes(searchQuery) || 
      rem.desc.toLowerCase().includes(searchQuery);
    const matchesCategory = !categoryFilter || rem.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });
  
  reminders.sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time));
  
  if (reminders.length === 0) {
    list.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }
  
  emptyState.classList.add('hidden');
  list.innerHTML = '';
  
  reminders.forEach((rem, index) => {
    const dueDate = new Date(rem.date + 'T' + rem.time);
    const now = new Date();
    const isOverdue = dueDate < now && !rem.completed;
    const categoryEmojis = {
      'Work': '💼',
      'Personal': '🏠',
      'Urgent': '🚨',
      'Health': '🏥'
    };
    
    const card = document.createElement('div');
    card.className = `bg-white/70 dark:bg-slate-800/70 rounded-2xl p-5 shadow-lg border-l-4 hover:scale-105 transition-all ${
      isOverdue ? 'border-red-400' : rem.completed ? 'border-green-400' : 'border-purple-400'
    }`;
    
    card.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-2xl">${rem.completed ? '✅' : isOverdue ? '⏰' : categoryEmojis[rem.category] || '📝'}</span>
            <h3 class="font-bold text-lg text-gray-800 dark:text-white">${rem.title}</h3>
            ${rem.recurring ? '<span class="px-2 py-1 bg-purple-100 text-purple-600 rounded-full text-xs">🔄 Recurring</span>' : ''}
          </div>
          ${rem.desc ? `<p class="text-gray-600 dark:text-gray-300 mb-2">${rem.desc}</p>` : ''}
          <div class="flex items-center gap-4 text-sm text-gray-500">
            <span>📅 ${rem.date}</span>
            <span>⏰ ${rem.time}</span>
            <span class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">${categoryEmojis[rem.category]} ${rem.category}</span>
            ${isOverdue ? '<span class="text-red-500 font-semibold">⚠️ Overdue</span>' : ''}
          </div>
        </div>
        <div class="flex gap-2 ml-4">
          <button onclick="editReminder(${index})" class="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-600 transition">
            ✏️
          </button>
          <button onclick="toggleComplete(${index})" class="p-2 rounded-lg bg-green-100 hover:bg-green-200 text-green-600 transition">
            ${rem.completed ? '↩️' : '✅'}
          </button>
          <button onclick="deleteReminder(${index})" class="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 transition">
            🗑️
          </button>
        </div>
      </div>
    `;
    
    list.appendChild(card);
  });
  
  showNextReminder();
}

// Search and Filter Event Listeners
document.getElementById('reminder-search').oninput = loadReminders;
document.getElementById('reminder-category').onchange = loadReminders;

// Next Reminder Display
function showNextReminder() {
  const nextCard = document.getElementById('next-reminder-card');
  const now = new Date();
  const upcomingReminders = getReminders()
    .filter(rem => !rem.completed && new Date(rem.date + 'T' + rem.time) > now)
    .sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time));
  
  if (upcomingReminders.length > 0) {
    const nextRem = upcomingReminders[0];
    document.getElementById('next-rem-title').textContent = nextRem.title;
    document.getElementById('next-rem-time').textContent = `${nextRem.date} at ${nextRem.time}`;
    nextCard.classList.remove('hidden');
    startCountdown(nextRem);
  } else {
    nextCard.classList.add('hidden');
  }
}

function startCountdown(reminder) {
  const countdownEl = document.getElementById('next-countdown');
  const interval = setInterval(() => {
    const now = new Date();
    const due = new Date(reminder.date + 'T' + reminder.time);
    const diff = due - now;
    
    if (diff <= 0) {
      clearInterval(interval);
      countdownEl.textContent = '';
      showNextReminder();
      return;
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    countdownEl.textContent = `⏳ ${hours}h ${minutes}m ${seconds}s remaining`;
  }, 1000);
}

// Modal System
const modal = document.getElementById('reminder-modal');
const reminderForm = document.getElementById('reminder-form');
let editingIndex = null;

document.getElementById('add-reminder-btn').onclick = () => openModal();
document.getElementById('fab').onclick = () => openModal();
document.getElementById('close-modal').onclick = () => closeModal();
modal.onclick = (e) => { if (e.target === modal) closeModal(); };

function openModal(index = null) {
  editingIndex = index;
  modal.classList.remove('hidden');
  
  if (index !== null) {
    const rem = getReminders()[index];
    document.getElementById('rem-title').value = rem.title;
    document.getElementById('rem-desc').value = rem.desc || '';
    document.getElementById('rem-date').value = rem.date;
    document.getElementById('rem-time').value = rem.time;
    document.getElementById('rem-category').value = rem.category;
    document.getElementById('rem-recurring').checked = rem.recurring || false;
  } else {
    reminderForm.reset();
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('rem-date').value = today;
  }
}

function closeModal() {
  modal.classList.add('hidden');
  editingIndex = null;
}

reminderForm.onsubmit = function(e) {
  e.preventDefault();
  
  const reminder = {
    title: document.getElementById('rem-title').value.trim(),
    desc: document.getElementById('rem-desc').value.trim(),
    date: document.getElementById('rem-date').value,
    time: document.getElementById('rem-time').value,
    category: document.getElementById('rem-category').value,
    recurring: document.getElementById('rem-recurring').checked,
    completed: false,
    createdAt: new Date().toISOString()
  };
  
  let reminders = getReminders();
  
  if (editingIndex !== null) {
    reminders[editingIndex] = { ...reminders[editingIndex], ...reminder };
    toast("Reminder updated successfully! ✏️", "success");
  } else {
    reminders.push(reminder);
    toast("Reminder added successfully! 🎉", "success");
  }
  
  saveReminders(reminders);
  closeModal();
  loadReminders();
};

// Reminder Actions
function editReminder(index) {
  openModal(index);
}

function toggleComplete(index) {
  let reminders = getReminders();
  reminders[index].completed = !reminders[index].completed;
  
  if (reminders[index].completed && reminders[index].recurring) {
    // Create next occurrence for recurring reminders
    const nextDate = new Date(reminders[index].date + 'T' + reminders[index].time);
    nextDate.setDate(nextDate.getDate() + 1);
    reminders[index].date = nextDate.toISOString().split('T')[0];
    reminders[index].completed = false;
    toast("Recurring reminder scheduled for tomorrow! 🔄", "info");
  } else {
    toast(reminders[index].completed ? "Reminder completed! ✅" : "Reminder reactivated! ↩️", "success");
  }
  
  saveReminders(reminders);
  loadReminders();
}

function deleteReminder(index) {
  if (confirm("Are you sure you want to delete this reminder? 🗑️")) {
    let reminders = getReminders();
    reminders.splice(index, 1);
    saveReminders(reminders);
    loadReminders();
    toast("Reminder deleted! 🗑️", "info");
  }
}

// Toast Notifications
function toast(message, type = "info") {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  
  const colors = {
    success: 'from-green-400 to-emerald-500',
    error: 'from-red-400 to-pink-500',
    info: 'from-blue-400 to-purple-500',
    warning: 'from-yellow-400 to-orange-500'
  };
  
  toast.className = `bg-gradient-to-r ${colors[type] || colors.info} text-white px-6 py-4 rounded-2xl shadow-xl font-semibold transform transition-all duration-300 opacity-0 translate-x-full`;
  toast.textContent = message;
  
  container.appendChild(toast);
  
  // Animate in
  setTimeout(() => {
    toast.classList.remove('opacity-0', 'translate-x-full');
  }, 100);
  
  // Remove after 3 seconds
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-x-full');
    setTimeout(() => container.removeChild(toast), 300);
  }, 3000);
}

// Real-time Reminder Notifications
setInterval(() => {
  const now = new Date();
  const reminders = getReminders();
  
  reminders.forEach((rem, index) => {
    if (!rem.completed) {
      const dueDate = new Date(rem.date + 'T' + rem.time);
      const timeDiff = Math.abs(now - dueDate);
      
      // Notify if reminder is due (within 1 minute)
      if (timeDiff < 60000 && dueDate <= now) {
        toast(`⏰ REMINDER: ${rem.title}! 🔔`, "warning");
        
        // Browser notification if permission granted
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("BUSTAM Reminder", {
            body: `${rem.title} - ${rem.desc}`,
            icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⏰</text></svg>"
          });
        }
        
        // Auto-complete the reminder
        toggleComplete(index);
      }
    }
  });
}, 60000); // Check every minute

// Request notification permission
if ("Notification" in window && Notification.permission === "default") {
  Notification.requestPermission();
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
  if (e.ctrlKey && e.key === 'n') {
    e.preventDefault();
    openModal();
  }
});

// Initialize app
if (appSection.classList.contains('hidden')) {
  // Show login by default
} else {
  loadReminders();
  showNextReminder();
}