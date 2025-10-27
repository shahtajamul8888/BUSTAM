// Theme Toggle
const themeToggle = document.getElementById('theme-toggle');
let isDark = false;
themeToggle.onclick = () => {
  document.body.classList.toggle('bg-gray-950');
  document.body.classList.toggle('text-white');
  isDark = !isDark;
  themeToggle.textContent = isDark ? '☀️' : '🌙';
};

// WhatsApp OTP Auth Simulation (replace with backend integration for real deployment)
const authSection = document.getElementById('auth-section');
const appSection = document.getElementById('app-section');
const sendOtpBtn = document.getElementById('send-otp');
const otpArea = document.getElementById('otp-area');
const loginMsg = document.getElementById('login-msg');
let sentOTP = null;

sendOtpBtn.onclick = function() {
  const num = document.getElementById('whatsapp').value.trim();
  if (!/^(\+91)?[0-9]{10}$/.test(num.replace('+91',''))) {
    loginMsg.textContent = "Please enter a valid 10-digit WhatsApp number (with or without +91)";
    loginMsg.className = "text-pink-400 text-center mt-2";
    otpArea.classList.add('hidden');
    return;
  }
  sentOTP = Math.floor(100000 + Math.random() * 900000).toString();
  otpArea.classList.remove('hidden');
  loginMsg.textContent = "OTP sent to WhatsApp (simulated: " + sentOTP + ")";
  loginMsg.className = "text-green-400 text-center mt-2";
  // FOR REAL: Call your backend API here to trigger WhatsApp OTP
};
document.getElementById('verify-otp').onclick = (e) => {
  const enteredOTP = document.getElementById('otp-field').value;
  if (enteredOTP === sentOTP) {
    loginMsg.textContent = "Login Success!";
    window.setTimeout(() => {
      authSection.style.display = "none";
      appSection.classList.remove('hidden');
      loadReminders();
    }, 800);
  } else {
    loginMsg.textContent = "Incorrect OTP";
    loginMsg.className = "text-pink-400 text-center mt-2";
  }
};
document.getElementById('logout').onclick = () => {
  appSection.classList.add('hidden');
  authSection.style.display = "flex";
  document.getElementById('whatsapp').value = "";
  otpArea.classList.add('hidden');
  loginMsg.textContent = "";
};

// Marquee fallback for browsers without <marquee>
if (!("HTMLMarqueeElement" in window)) {
  const marquee = document.querySelector("marquee");
  if (marquee) marquee.innerHTML += ' | Developed by Tajamul';
}

// Modal logic
const modal = document.getElementById('reminder-modal');
document.getElementById('add-reminder-btn').onclick = () => openModal();
document.getElementById('close-modal').onclick = () => modal.classList.add('hidden');
modal.onclick = e => { if (e.target === modal) modal.classList.add('hidden'); };
const reminderForm = document.getElementById('reminder-form');
let editIndex = null;

// Reminders CRUD with LocalStorage
function loadReminders() {
  const list = document.getElementById('reminders-list');
  list.innerHTML = "";
  let reminders = JSON.parse(localStorage.getItem('bustam_reminders') || '[]');
  reminders.sort((a,b) => new Date(a.date+'T'+a.time) - new Date(b.date+'T'+b.time));
  if (!reminders.length) {
    list.innerHTML = '<div class="text-center text-gray-300">No reminders yet. Add yours!</div>';
    return;
  }
  reminders.forEach((rem, i) => {
    let dueDate = new Date(rem.date+'T'+rem.time), now = new Date();
    let overdue = dueDate < now && !rem.completed;
    let recurringText = rem.recurring ? '<span class="ml-1 px-2 rounded bg-pink-100 text-pink-500 text-xs">Recurring</span>' : '';
    list.innerHTML += `
      <div class="group bg-white/60 shadow-lg rounded-lg p-5 flex items-center justify-between hover:scale-105 transition relative animate-fadeIn border-l-4 ${overdue ? 'border-pink-600' : 'border-teal-400'}">
        <div>
          <div class="font-bold text-lg text-indigo-700 flex items-center">${rem.title || '(No Title)'} ${recurringText}</div>
          <div class="text-sm text-gray-700">${rem.desc}</div>
          <div class="mt-2 text-xs text-gray-500">${rem.date} @ ${rem.time} ${rem.completed ? '✅' : overdue ? '❗Overdue' : ''}</div>
        </div>
        <div class="flex items-center gap-2">
          <button class="edit px-2 py-1 rounded bg-indigo-400 hover:bg-indigo-600 text-white shadow" data-i="${i}">✏️</button>
          <button class="del px-2 py-1 rounded bg-pink-400 hover:bg-pink-600 text-white shadow" data-i="${i}">🗑️</button>
          <button class="done px-2 py-1 rounded bg-gradient-to-r from-emerald-400 to-teal-400 text-white shadow hover:scale-110" data-i="${i}">${rem.completed ? '⏪' : '✅'}</button>
        </div>
      </div>
    `;
  });
  setTimeout(() =>
    list.querySelectorAll(".animate-fadeIn").forEach(div => div.classList.remove("animate-fadeIn")),
    800);
  // Event delegation
  list.querySelectorAll('.edit').forEach(btn => btn.onclick = () => openModal(btn.dataset.i));
  list.querySelectorAll('.del').forEach(btn => btn.onclick = () => { removeReminder(btn.dataset.i); });
  list.querySelectorAll('.done').forEach(btn => btn.onclick = () => { toggleReminderCompleted(btn.dataset.i); });
}

function openModal(idx=null) {
  modal.classList.remove('hidden');
  editIndex = idx;
  if(idx !== null){
    let rem = JSON.parse(localStorage.getItem('bustam_reminders') || '[]')[idx];
    document.getElementById('rem-title').value = rem.title;
    document.getElementById('rem-desc').value = rem.desc;
    document.getElementById('rem-date').value = rem.date;
    document.getElementById('rem-time').value = rem.time;
    document.getElementById('rem-recurring').checked = rem.recurring;
  } else {
    reminderForm.reset();
  }
}

reminderForm.onsubmit = function (e) {
  e.preventDefault();
  let reminders = JSON.parse(localStorage.getItem('bustam_reminders') || '[]');
  const rem = {
    title: document.getElementById('rem-title').value,
    desc: document.getElementById('rem-desc').value,
    date: document.getElementById('rem-date').value,
    time: document.getElementById('rem-time').value,
    recurring: document.getElementById('rem-recurring').checked,
    completed: false,
  };
  if(editIndex !== null){
    reminders[editIndex] = {...rem, completed: reminders[editIndex].completed};
  } else {
    reminders.push(rem);
  }
  localStorage.setItem('bustam_reminders', JSON.stringify(reminders));
  modal.classList.add('hidden');
  loadReminders();
};
function removeReminder(i){
  let reminders = JSON.parse(localStorage.getItem('bustam_reminders') || '[]');
  reminders.splice(i, 1);
  localStorage.setItem('bustam_reminders', JSON.stringify(reminders));
  loadReminders();
}
function toggleReminderCompleted(i){
  let reminders = JSON.parse(localStorage.getItem('bustam_reminders') || '[]');
  reminders[i].completed = !reminders[i].completed;
  if(reminders[i].completed && reminders[i].recurring){
    // For recurring, reschedule reminder to next day
    const d = new Date(reminders[i].date + "T" + reminders[i].time);
    d.setDate(d.getDate() + 1);
    reminders[i].date = d.toISOString().substring(0,10);
    reminders[i].completed = false;
  }
  localStorage.setItem('bustam_reminders', JSON.stringify(reminders));
  loadReminders();
}

// Notification
setInterval(() => {
  let reminders = JSON.parse(localStorage.getItem('bustam_reminders') || '[]');
  let now = new Date();
  reminders.forEach((rem, i) => {
    if(!rem.completed){
      let remDate = new Date(rem.date+'T'+rem.time);
      if(Math.abs(now - remDate) < 60000) { // within 1 min
        alert(`⏰ Reminder: ${rem.title}\n${rem.desc || ''}\n${rem.date} ${rem.time}`);
        // Mark as completed
        toggleReminderCompleted(i);
      }
    }
  });
}, 60000);

// Animations
document.body.classList.add('animate-fadeIn');
