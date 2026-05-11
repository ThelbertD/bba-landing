const form = document.getElementById('postForm');
const success = document.getElementById('success');
const btn = document.getElementById('generateBtn');
const btnText = btn.querySelector('.btn-text');

async function generate(e) {
  e.preventDefault();

  const caption = document.getElementById('caption').value.trim();
  const topic = document.getElementById('topic').value.trim();

  if (!caption || !topic) {
    alert('Please fill in both Caption and Topic.');
    return;
  }

  btn.classList.add('disabled');
  btnText.textContent = 'Generating...';

  // Replace with your backend webhook that generates the video
  const WEBHOOK_URL = '';

  try {
    if (WEBHOOK_URL) {
      await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption, topic })
      });
    }
    form.style.display = 'none';
    success.classList.add('show');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err) {
    btn.classList.remove('disabled');
    btnText.textContent = 'Generate My Video';
    alert('Something went wrong. Please try again.');
  }
}

btn.addEventListener('click', generate);
form.addEventListener('submit', generate);
