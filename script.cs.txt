// ---------- footer year ----------
document.getElementById('year').textContent = new Date().getFullYear();

// ---------- mobile nav ----------
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');

navToggle.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

// close mobile nav after tapping a link
mainNav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// ---------- application form ----------
const applyForm = document.getElementById('applyForm');

if (applyForm) {
  const formStatus = document.getElementById('formStatus');
  const submitBtn = applyForm.querySelector('button[type="submit"]');

  applyForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting…';
    formStatus.style.color = '';

    const payload = {
      fullName,
      regNumber: document.getElementById('regNumber').value.trim(),
      year: document.getElementById('year').value.trim(),
      email,
      phone: document.getElementById('phone').value.trim(),
      interest: document.getElementById('interest').value.trim(),
      interestArea: Array.from(
        document.querySelectorAll('input[name="interestArea"]:checked')
      ).map((el) => el.value),
      _gotcha: document.querySelector('input[name="_gotcha"]').value,
    };

    try {
      const response = await fetch(applyForm.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (response.ok && data.ok) {
        formStatus.textContent = fullName
          ? `Thanks, ${fullName.split(' ')[0]} — your application is in. Check ${email || 'your university email'} for next steps.`
          : "Thanks — your application is in. We'll follow up on your university email.";
        applyForm.reset();
      } else {
        formStatus.style.color = '#E8483A';
        formStatus.textContent = (data.errors && data.errors[0]) || 'Something went wrong. Please try again.';
      }
    } catch (err) {
      formStatus.style.color = '#E8483A';
      formStatus.textContent =
        "Couldn't reach the server. Make sure the backend is running, or try again shortly.";
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit application';
    }
  });
}