// THEME: Light/Dark
const themeToggle = document.getElementById('theme-toggle');
if (localStorage.getItem('bustam_theme') === "dark") dark(true);
themeToggle.onclick = () => dark();
function dark(force = false) {
  document.body.classList.toggle('dark', force ? true : undefined);
  themeToggle.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
  localStorage.setItem('bustam_theme', document.body.classList.contains('dark') ? "dark" : "light");
}

// DIGITAL CLOCK & COUNTDOWN
function clock() {
  const now = new Date();
  document.getElementById("clock").textContent = now.toLocaleTimeString("en-IN", { hour12: false });
}
setInterval(clock, 1000); clock();

// AUTH (OTP Simulated)
const authSection = document.getElementById('auth-section');
const appSection = document.getElementById('app-section');
const sendOtpBtn = document.getElementById('send-otp');
const otpArea = document.getElementById('otp-area');
const loginMsg = document.getElementById('login-msg');
let sentOTP = null;
sendOtpBtn.onclick = function () {
  const num = document.getElementById('whatsapp').value.trim();
  if (!/^(\+91)?[0-9]{10}$/.test(num.replace('+91', ''))) {
    loginMsg.textContent = "Enter a valid 10-digit WhatsApp number";
    loginMsg.className = "text-pink-500 text-center mt-3 font-semibold";
    otpArea.classList.add('hidden');
    return;
  }
  sentOTP = Math.floor(100000 + Math.random() * 900000).toString();
  otpArea.classList.remove('hidden');
  loginMsg.textContent = "OTP sent (simulated: " + sentOTP + ")";
  loginMsg.className = "text-green-500 text-center mt-3 font-semibold";
  // For PRODUCTION: integrate WhatsApp OTP API here!
};
document.getElementById('verify-otp').onclick = (e) => {
  const enteredOTP = document.getElementById('otp-field').value;
  if (enteredOTP === sentOTP) {
    loginMsg.textContent = "Login Success!";
    loginMsg.className = "text-green-500 text-center mt-3 font-semibold";
    setTimeout(() => {
      authSection.style.display = "none";
      appSection.classList.remove('hidden');
      loadReminders();
      showNextReminder();
    }, 600);
  } else {
    loginMsg.textContent = "Incorrect OTP";
    loginMsg.className = "text-pink-500 text-center mt-3 font-semibold";
  }
};
document.getElementById('logout').onclick = () => {
  appSection.classList.add('hidden');
  authSection.style.display = "flex";
  document.getElementById('whatsapp').value = "";
  otpArea.classList.add('hidden');
  loginMsg.textContent = "";
};
document.getElementById('nav-logout').onclick = () => { document.getElementById('logout').click(); };

// REMINDER STORAGE
const REM_KEY = "bustam_reminders";
function getReminders() { return JSON.parse(localStorage.getItem(REM_KEY) || '[]'); }
function setReminders(arr) { localStorage.setItem(REM_KEY, JSON.stringify(arr)); }
function filterReminders(query, cat) {
  return getReminders().filter(r => 
    (!query || (r.title?.toLowerCase().includes(query) || r.desc?.toLowerCase().includes(query)))
    && (!cat || r.category === cat || cat === "")
  );
}
function loadReminders() {
  const list = document.getElementById('reminders-list');
  let searchQuery = document.getElementById("reminder-search").value.trim().toLowerCase();
  let searchCat = document.getElementById("reminder-category").value;
  let reminders = filterReminders(searchQuery, searchCat);
  reminders.sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time));
  
  list.innerHTML = "";
  if (!reminders.length) {
    list.innerHTML = '<div class="text-center text-gray-300 py-12 animate-fadeIn">No reminders yet. Add yours!</div>';
    document.getElementById("next-reminder-card").classList.add("hidden");
    return;
  }
  reminders.forEach((rem, i) => {
    let due = new Date(rem.date + 'T' + rem.time), now = new Date();
    let overdue = due < now && !rem.completed;
    let next = overdue ? "❗Overdue" : rem.completed ? "✅" : "";
    let recurringText = rem.recurring ? `<span class="ml-1 px-2 rounded bg-cyan-100 dark:bg-fuchsia-700 text-cyan-500 dark:text-white text-xs">Recurring</span>` : '';
    let category = rem.category ? `<span class="ml-2 px-2 rounded bg-pink-200 text-pink-700 text-xs">${rem.category}</span>` : '';
    list.innerHTML += `
    <div class="card bg-gradient-to-tr from-white via-cyan-50 to-fuchsia-50 dark:from-slate-900 p-5 rounded-xl shadow-lg flex justify-between items-center 
      hover:scale-105 transition animate-fadeIn border-l-8 ${overdue ? 'border-pink-600' : 'border-cyan-400'}">
      <div>
        <span class="font-bold text-lg flex items-center">
          ${rem.completed ? "✅" : overdue ? "⏰" : "🔔"}
          <span class="ml-2">${rem.title || '(No Title)'}</span>
          ${recurringText}${category}
        </span>
        <p class="text-gray-700 dark:text-gray-200 text-sm mt-1">${rem.desc}</p>
        <span class="text-xs text-gray-400">${rem.date} @ ${rem.time}<span> ${next}</span></span>
      </div>
      <div class="flex items-center gap-2">
        <button class="edit px-2 py-1 rounded bg-indigo-400 hover:bg-indigo-600 text-white shadow" data-i="${i}" aria-label="Edit">✏️</button>
        <button class="del px-2 py-1 rounded bg-pink-400 hover:bg-pink-600 text-white shadow" data-i="${i}" aria-label="Delete">🗑️</button>
        <button class="done px-2 py-1 rounded bg-gradient-to-r from-emerald-400 to-teal-400 text-white shadow hover:scale-110" data-i="${i}" aria-label="Mark as done">${rem.completed ? '⏪' : '✅'}</button>
      </div>
    </div>
    `;
  });
  setTimeout(() => list.querySelectorAll(".animate-fadeIn").forEach(div => div.classList.remove("animate-fadeIn")), 800);
  list.querySelectorAll('.edit').forEach(btn => btn.onclick = () => openModal(btn.dataset.i));
  list.querySelectorAll('.del').forEach(btn => btn.onclick = () => { removeReminder(btn.dataset.i); });
  list.querySelectorAll('.done').forEach(btn => btn.onclick = () => { toggleReminderCompleted(btn.dataset.i); });
  showNextReminder();
}

// FILTER EVENTS
document.getElementById("reminder-search").oninput = loadReminders;
document.getElementById("reminder-category").onchange = loadReminders;

// REAL-TIME NEXT REMINDER DISPLAY & COUNTDOWN
function showNextReminder() {
  const nextCard = document.getElementById('next-reminder-card');
  let now = new Date();
  let reminders = getReminders()
    .filter(r => !r.completed)
    .filter(r => new Date(r.date + 'T' + r.time) > now)
    .sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time));
  if (reminders.length) {
    nextCard.classList.remove('hidden');
    document.getElementById('next-rem-title').textContent = reminders[0].title;
    document.getElementById('next-rem-time').textContent = reminders[0].date + " @ " + reminders[0].time;
    countdownToNextReminder(reminders[0]);
  } else {
    nextCard.classList.add('hidden');
    document.getElementById('next-countdown').textContent = '';
  }
}
function countdownToNextReminder(rem) {
  let interval = setInterval(() => {
    let now = new Date(), due = new Date(rem.date + 'T' + rem.time);
    let diff = due - now;
    if (diff <= 0) {
      clearInterval(interval);
      document.getElementById('next-countdown').textContent = '';
      showNextReminder();
      return;
    }
    let hrs = Math.floor(diff / 3600000);
    let min = Math.floor((diff % 3600000) / 60000);
    let sec = Math.floor((diff % 60000) / 1000);
    document.getElementById('next-countdown').textContent =
      `⏳ In ${hrs}h ${min}m ${sec}s`;
  }, 1000);
}

// MODAL + FORM
const modal = document.getElementById('reminder-modal');
document.getElementById('add-reminder-btn').onclick = () => openModal();
document.getElementById('close-modal').onclick = () => closeModal();
modal.onclick = e => { if (e.target === modal) closeModal(); };
const reminderForm = document.getElementById('reminder-form');
let editIndex = null;
function openModal(idx = null) {
  modal.classList.remove('hidden'); editIndex = idx;
  if (idx !== null) {
    let rem = getReminders()[idx];
    document.getElementById('rem-title').value = rem.title;
    document.getElementById('rem-desc').value = rem.desc;
    document.getElementById('rem-date').value = rem.date;
    document.getElementById('rem-time').value = rem.time;
    document.getElementById('rem-recurring').checked = rem.recurring;
    document.getElementById('rem-category').value = rem.category || "";
  } else {
    reminderForm.reset();
  }
}
function closeModal() { modal.classList.add('hidden'); }
reminderForm.onsubmit = function (e) {
  e.preventDefault(); let reminders = getReminders();
  const rem = {
    title: document.getElementById('rem-title').value,
    desc: document.getElementById('rem-desc').value,
    date: document.getElementById('rem-date').value,
    time: document.getElementById('rem-time').value,
    recurring: document.getElementById('rem-recurring').checked,
    completed: false,
    category: document.getElementById('rem-category').value,
  };
  if (editIndex !== null) reminders[editIndex] = { ...rem, completed: reminders[editIndex].completed };
  else reminders.push(rem);
  setReminders(reminders);
  closeModal(); loadReminders(); toast("Reminder saved!", "success");
};

// REMOVE/COMPLETE
function removeReminder(i) {
  let reminders = getReminders(); reminders.splice(i, 1);
  setReminders(reminders); loadReminders(); toast("Reminder deleted.", "info");
}
function toggleReminderCompleted(i) {
  let reminders = getReminders();
  reminders[i].completed = !reminders[i].completed;
  if (reminders[i].completed && reminders[i].recurring) {
    const d = new Date(reminders[i].date + "T" + reminders[i].time);
    d.setDate(d.getDate() + 1);
    reminders[i].date = d.toISOString().substring(0, 10);
    reminders[i].completed = false;
  }
  setReminders(reminders); loadReminders();
  toast(reminders[i].completed ? "Marked as done!" : "Reactivated.", "success");
}
document.body.onkeydown = (e) => { if (e.key === "Escape") closeModal(); };

// TOAST/NOTIFY
function toast(msg, type = "info") {
  const toastDiv = document.createElement('div');
  let colors = { success: 'from-teal-400 to-fuchsia-400', info: 'from-indigo-400 to-pink-400', warn: 'from-amber-400 to-pink-500' },
    color = colors[type] || colors.info;
  toastDiv.className = `rounded-2xl px-6 py-4 text-lg font-semibold text-white bg-gradient-to-tr ${color} shadow-xl animate-fadeIn`;
  toastDiv.innerHTML = msg;
  document.getElementById('toast-container').appendChild(toastDiv);
  setTimeout(() => toastDiv.remove(), 2400);
}
// Browser Notifications (optional, notifies if permission granted)
if ("Notification" in window) Notification.requestPermission();
function notify(title, body) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, { body });
  }
}

// REAL-TIME NOTIFICATIONS
setInterval(() => {
  let reminders = getReminders(), now = new Date();
  reminders.forEach((rem, i) => {
    if (!rem.completed) {
      let remDate = new Date(rem.date + 'T' + rem.time);
      if (Math.abs(now - remDate) < 10000 && now >= remDate) {
        toast(`⏰ <b>${rem.title}</b><br>${rem.desc || ""} <br>${rem.date} ${rem.time}`, "warn");
        notify("BUSTAM Reminder", `${rem.title} @${rem.time} - ${rem.desc}`);
        toggleReminderCompleted(i); showNextReminder();
      }
    }
  });
}, 10000);

// CALENDAR PLUGIN (shows dates only, can be replaced with fullcalendar.io)
function calendarPreview() {
  const calDiv = document.getElementById("calendar");
  let rems = getReminders();
  if (!rems.length) { calDiv.innerHTML = ""; return; }
  let today = new Date(), tmp = {};
  rems.forEach(rem => {
    if (!tmp[rem.date]) tmp[rem.date] = [];
    tmp[rem.date].push(rem.title);
  });
  let markup = `<div class="bg-white/70 dark:bg-slate-800 rounded-xl shadow p-5">
  <div class="font-bold mb-2 text-cyan-600 dark:text-cyan-300">Reminder Dates</div><div class="flex flex-wrap gap-2">`;
  Object.keys(tmp).sort().forEach(date => {
    const d = new Date(date);
    const day = d.toLocaleDateString('en-IN', { weekday: "short", month: "short", day: "numeric" });
    markup += `<span class="px-3 py-1 rounded-full bg-fuchsia-200 dark:bg-fuchsia-700 text-blue-900 dark:text-white text-sm">${day} (${tmp[date].length})</span>`;
  });
  calDiv.innerHTML = markup + "</div></div>";
}
setInterval(calendarPreview, 5000); // Update calendar preview

// INIT
calendarPreview();