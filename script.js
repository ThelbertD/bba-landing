const form = document.getElementById('postForm');
const success = document.getElementById('success');
const btn = document.getElementById('generateBtn');
const btnText = btn.querySelector('.btn-text');

const tzHidden = document.getElementById('timezone');
const tzInput = document.getElementById('timezoneSearch');
const tzList = document.getElementById('tzList');

function getTimezones() {
  if (typeof Intl.supportedValuesOf === 'function') {
    try { return Intl.supportedValuesOf('timeZone'); } catch (_) { /* fall through */ }
  }
  return [
    'UTC',
    'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
    'America/Toronto', 'America/Mexico_City', 'America/Sao_Paulo',
    'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Madrid', 'Europe/Athens',
    'Africa/Cairo', 'Africa/Johannesburg',
    'Asia/Dubai', 'Asia/Karachi', 'Asia/Kolkata', 'Asia/Bangkok',
    'Asia/Singapore', 'Asia/Hong_Kong', 'Asia/Tokyo', 'Asia/Manila',
    'Australia/Sydney', 'Pacific/Auckland'
  ];
}

const allZones = getTimezones();
const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
let activeIndex = -1;
let filtered = allZones.slice();

function labelFor(zone) {
  return zone.replace(/_/g, ' ');
}

function renderList() {
  tzList.innerHTML = '';
  if (!filtered.length) {
    const empty = document.createElement('li');
    empty.className = 'tz-empty';
    empty.textContent = 'No matches';
    tzList.appendChild(empty);
    return;
  }
  filtered.forEach((zone, idx) => {
    const li = document.createElement('li');
    li.textContent = labelFor(zone);
    li.setAttribute('role', 'option');
    li.dataset.value = zone;
    if (zone === tzHidden.value) li.classList.add('selected');
    if (idx === activeIndex) li.classList.add('active');
    li.addEventListener('mousedown', (e) => {
      e.preventDefault();
      selectZone(zone);
    });
    tzList.appendChild(li);
  });
}

function openList() {
  tzList.classList.add('open');
  tzInput.setAttribute('aria-expanded', 'true');
}
function closeList() {
  tzList.classList.remove('open');
  tzInput.setAttribute('aria-expanded', 'false');
  activeIndex = -1;
}

function selectZone(zone) {
  tzHidden.value = zone;
  tzInput.value = labelFor(zone);
  closeList();
}

function filterList(query) {
  const q = query.trim().toLowerCase();
  filtered = q
    ? allZones.filter(z => z.toLowerCase().includes(q) || z.replace(/_/g, ' ').toLowerCase().includes(q))
    : allZones.slice();
  activeIndex = filtered.length ? 0 : -1;
  renderList();
}

tzInput.addEventListener('focus', () => {
  filterList(tzInput.value === labelFor(tzHidden.value) ? '' : tzInput.value);
  openList();
});
tzInput.addEventListener('input', () => {
  filterList(tzInput.value);
  openList();
});
tzInput.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (!tzList.classList.contains('open')) { filterList(tzInput.value); openList(); return; }
    if (filtered.length) { activeIndex = (activeIndex + 1) % filtered.length; renderList(); }
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (filtered.length) { activeIndex = (activeIndex - 1 + filtered.length) % filtered.length; renderList(); }
  } else if (e.key === 'Enter') {
    if (tzList.classList.contains('open') && activeIndex >= 0 && filtered[activeIndex]) {
      e.preventDefault();
      selectZone(filtered[activeIndex]);
    }
  } else if (e.key === 'Escape') {
    closeList();
  }
});
document.addEventListener('mousedown', (e) => {
  if (!document.getElementById('tzCombobox').contains(e.target)) closeList();
});

// initial selection: user's local timezone (if known), else first entry
const initial = allZones.includes(userTz) ? userTz : allZones[0];
selectZone(initial);

// toggle .has-value on date/time inputs so the "selected" design kicks in
['scheduleDate', 'scheduleTime'].forEach((id) => {
  const el = document.getElementById(id);
  const sync = () => el.classList.toggle('has-value', !!el.value);
  el.addEventListener('input', sync);
  el.addEventListener('change', sync);
  sync();
});

async function generate(e) {
  e.preventDefault();

  const title = document.getElementById('title').value.trim();
  const caption = document.getElementById('caption').value.trim();
  const hashtags = document.getElementById('hashtags').value.trim();
  const contentLink = document.getElementById('contentLink').value.trim();
  const scheduleDate = document.getElementById('scheduleDate').value;
  const scheduleTime = document.getElementById('scheduleTime').value;
  const timezone = tzHidden.value;

  if (!title || !caption || !contentLink || !scheduleDate || !scheduleTime || !timezone) {
    alert('Please fill in all required fields.');
    return;
  }
  if (!allZones.includes(timezone)) {
    alert('Please pick a time zone from the list.');
    tzInput.focus();
    return;
  }

  btn.classList.add('disabled');
  btnText.textContent = 'Scheduling...';

  // n8n webhook
  const WEBHOOK_URL = 'https://betterbodyacademy.app.n8n.cloud/webhook/974a2442-821a-4c00-b4cd-022194affd26';

  const payload = {
    title,
    caption,
    hashtags,
    contentLink,
    schedule: {
      date: scheduleDate,
      time: scheduleTime,
      timezone,
      iso: `${scheduleDate}T${scheduleTime}`
    }
  };

  try {
    if (WEBHOOK_URL) {
      await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }
    form.style.display = 'none';
    success.classList.add('show');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err) {
    btn.classList.remove('disabled');
    btnText.textContent = 'Schedule My Content';
    alert('Something went wrong. Please try again.');
  }
}

btn.addEventListener('click', generate);
form.addEventListener('submit', generate);
