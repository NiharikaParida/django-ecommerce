const menuBtn = document.querySelector('.menu-btn');
const navLinks = document.querySelector('.nav-links');

if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('open');
    });
}

const authForms = document.querySelectorAll('.auth-form');

authForms.forEach(form => {
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const action = form.dataset.action;
        alert(`${action} action submitted.`);
    });
});

const profileEditBtn = document.querySelector('.profile-edit-btn');
const profileCancelBtn = document.querySelector('.profile-cancel-btn');
const profileForm = document.querySelector('.profile-form');
const profileView = document.querySelector('.profile-view');

if (profileEditBtn && profileForm && profileView) {
    profileEditBtn.addEventListener('click', () => {
        profileView.classList.add('hidden');
        profileForm.classList.remove('hidden');
    });
}

if (profileCancelBtn && profileForm && profileView) {
    profileCancelBtn.addEventListener('click', () => {
        profileForm.classList.add('hidden');
        profileView.classList.remove('hidden');
    });
}

if (profileForm && profileView) {
    profileForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const name = profileForm.querySelector('#profile-name').value;
        const email = profileForm.querySelector('#profile-email').value;
        const location = profileForm.querySelector('#profile-location').value;
        const phone = profileForm.querySelector('#profile-phone').value;

        document.querySelector('#view-name').textContent = name;
        document.querySelector('#view-email').textContent = email;
        document.querySelector('#view-location').textContent = location;
        document.querySelector('#view-phone').textContent = phone;

        profileForm.classList.add('hidden');
        profileView.classList.remove('hidden');
        alert('Profile updated successfully.');
    });
}

const registerForm = document.getElementById('register-form');
const passwordInput = document.getElementById('password-register');
const confirmPasswordInput = document.getElementById('confirm-password');
const confirmMessage = document.getElementById('confirm-message');
const passwordBars = Array.from(document.querySelectorAll('.password-meter span'));
const validationItems = Array.from(document.querySelectorAll('.validation-item'));

function getPasswordChecks(value) {
    return [
        { rule: 'length', passed: value.length >= 8 },
        { rule: 'digit', passed: /\d/.test(value) },
        { rule: 'uppercase', passed: /[A-Z]/.test(value) },
        { rule: 'lowercase', passed: /[a-z]/.test(value) },
        { rule: 'special', passed: /[^A-Za-z0-9]/.test(value) }
    ];
}

function updatePasswordFeedback(value) {
    const checks = getPasswordChecks(value);
    const strengthScore = checks.filter(({ passed }) => passed).length;

    validationItems.forEach(item => {
        const check = checks.find(({ rule }) => rule === item.dataset.rule);
        item.classList.toggle('valid', check?.passed);
        item.classList.toggle('invalid', !check?.passed && value.length > 0);
    });

    passwordBars.forEach((bar, index) => {
        bar.classList.toggle('active', index < Math.min(4, strengthScore));
    });

    if (value.length === 0) {
        passwordBars.forEach(bar => bar.classList.remove('active'));
    }
}

function validatePasswordMatch() {
    if (!confirmPasswordInput || !confirmMessage) {
        return true;
    }

    if (confirmPasswordInput.value.length === 0) {
        confirmMessage.textContent = '';
        return true;
    }

    const isMatch = passwordInput.value === confirmPasswordInput.value;
    confirmMessage.textContent = isMatch ? 'Passwords match.' : 'Passwords do not match.';
    confirmMessage.style.color = isMatch ? '#1f9d5a' : '#D72638';
    return isMatch;
}

if (passwordInput) {
    passwordInput.addEventListener('input', () => {
        updatePasswordFeedback(passwordInput.value);
        validatePasswordMatch();
    });
}

if (confirmPasswordInput) {
    confirmPasswordInput.addEventListener('input', validatePasswordMatch);
}

if (registerForm) {
    registerForm.addEventListener('submit', (event) => {
        const checks = getPasswordChecks(passwordInput?.value || '');
        const isValidPassword = checks.every(({ passed }) => passed);
        const isMatch = validatePasswordMatch();

        if (!isValidPassword || !isMatch) {
            event.preventDefault();
            updatePasswordFeedback(passwordInput?.value || '');
            validatePasswordMatch();
            alert('Please make sure your password has at least 8 characters and includes a number, uppercase letter, lowercase letter, and special character.');
        } else {
            event.preventDefault();
            alert('Account created successfully.');
            registerForm.reset();
            updatePasswordFeedback('');
            if (confirmMessage) {
                confirmMessage.textContent = '';
                confirmMessage.style.color = '';
            }
        }
    });
}

const searchInput = document.getElementById('user-search');
const filterButtons = Array.from(document.querySelectorAll('.chip'));
const userCards = Array.from(document.querySelectorAll('.users-card'));
const emptyState = document.getElementById('empty-state');

function filterUsers() {
    const activeFilter = document.querySelector('.chip.active')?.dataset.filter || 'all';
    const query = searchInput?.value.toLowerCase() || '';
    let visibleCount = 0;

    userCards.forEach(card => {
        const matchesFilter = activeFilter === 'all' || card.dataset.role === activeFilter;
        const searchableText = `${card.dataset.name} ${card.dataset.role} ${card.dataset.status}`.toLowerCase();
        const matchesQuery = searchableText.includes(query);
        const isVisible = matchesFilter && matchesQuery;

        card.style.display = isVisible ? 'flex' : 'none';
        if (isVisible) visibleCount += 1;
    });

    if (emptyState) {
        emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
    }
}

if (searchInput) {
    searchInput.addEventListener('input', filterUsers);
}

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterButtons.forEach(item => item.classList.remove('active'));
        button.classList.add('active');
        filterUsers();
    });
});

