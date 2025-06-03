// script.js
// Elements
const dateInput     = document.getElementById('session-date');
const timeInput     = document.getElementById('session-time');
const hoursInput    = document.getElementById('session-hours');
const descInput     = document.getElementById('session-desc');
const emailInput    = document.getElementById('client-email');
const tutorName     = document.getElementById('tutor-name').textContent;
const pricePerSess  = parseFloat(document.getElementById('tutor-price').textContent.replace('€',''));
const summary = {
  name:  document.getElementById('sum-tutor-name'),
  price: document.getElementById('sum-price'),
  hours: document.getElementById('sum-hours'),
  date:  document.getElementById('sum-date'),
  time:  document.getElementById('sum-time'),
  email: document.getElementById('sum-email'),
  total: document.getElementById('sum-total')
};

function updateSummary() {
  const dateVal = dateInput.value
    ? new Date(dateInput.value).toLocaleDateString()
    : '__/__/____';
  const timeVal = timeInput.value || '__:__';
  const hrs     = parseInt(hoursInput.value) || 1;
  const total   = (pricePerSess * hrs).toFixed(2).replace('.', ',') + '€';

  summary.name.textContent  = tutorName;
  summary.price.textContent = pricePerSess.toFixed(2).replace('.', ',') + '€';
  summary.hours.textContent = hrs;
  summary.date.textContent  = dateVal;
  summary.time.textContent  = timeVal;
  summary.email.textContent = emailInput.value || '—';
  summary.total.textContent = total;
}

// Payment selection
document.querySelectorAll('.payment-option').forEach(opt => {
  opt.addEventListener('click', () => {
    document.querySelectorAll('.payment-option')
      .forEach(o => o.classList.remove('selected'));
    opt.classList.add('selected');
  });
});

// Bind events
[dateInput, timeInput, hoursInput, descInput, emailInput]
  .forEach(el => el.addEventListener('input', updateSummary));

// Initialize
updateSummary();
