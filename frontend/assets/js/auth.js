const menuBtn = document.querySelector('.menu-btn');
const navLinks = document.querySelector('.nav-links');

if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('open');
    });
}

const ACCOUNT_KEY = 'fashionAccount';
const SESSION_KEY = 'fashionUser';
const AUTH_API_ORIGIN = window.location.port === '5501' ? 'http://127.0.0.1:8000' : '';

async function authRequest(path, data) {
    const response = await fetch(`${AUTH_API_ORIGIN}/api/auth/${path}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.detail || 'Authentication request failed.');
    return result;
}

function saveSession(account) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({
        name: account.name,
        email: account.email,
        location: account.location || '',
        phone: account.phone || ''
    }));
}

function getSession() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); }
    catch (error) { return null; }
}

const loginForm = document.querySelector('.auth-form[data-action="Login"]');
if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = loginForm.querySelector('[name="email"]').value.trim().toLowerCase();
        const password = loginForm.querySelector('[name="password"]').value;
        try {
            const account = await authRequest('login', { email, password });
            saveSession(account);
            window.location.href = 'profile.html';
        } catch (error) {
            alert(error.message);
        }
    });
}

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
    const session = getSession();
    if (!session) {
        const guestMessage = document.querySelector('#profileGuestMessage');
        const profileName = document.querySelector('#profileDisplayName');
        if (guestMessage) guestMessage.classList.remove('hidden');
        if (profileName) profileName.textContent = 'Please login';
        profileView.classList.add('hidden');
        profileForm.classList.add('hidden');
    } else {
        ['name', 'email', 'location', 'phone'].forEach((field) => {
            const input = profileForm.querySelector(`#profile-${field}`);
            const output = document.querySelector(`#view-${field}`);
            if (input) input.value = session[field] || '';
            if (output) output.textContent = session[field] || 'Not added';
        });
        const profileName = document.querySelector('#profileDisplayName');
        if (profileName) profileName.textContent = session.name || 'Fashion customer';
    }

    profileForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const name = profileForm.querySelector('#profile-name').value;
        const email = profileForm.querySelector('#profile-email').value;
        const location = profileForm.querySelector('#profile-location').value;
        const phone = profileForm.querySelector('#profile-phone').value;

        const account = JSON.parse(localStorage.getItem(ACCOUNT_KEY) || '{}');
        const updatedAccount = { ...account, name, email, location, phone };
        localStorage.setItem(ACCOUNT_KEY, JSON.stringify(updatedAccount));
        saveSession(updatedAccount);
        document.querySelector('#view-name').textContent = name || 'Not added';
        document.querySelector('#view-email').textContent = email || 'Not added';
        document.querySelector('#view-location').textContent = location || 'Not added';
        document.querySelector('#view-phone').textContent = phone || 'Not added';
        const profileName = document.querySelector('#profileDisplayName');
        if (profileName) profileName.textContent = name || 'Fashion customer';

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
    registerForm.addEventListener('submit', async (event) => {
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
            try {
                const account = await authRequest('register', {
                    name: document.getElementById('fullname').value.trim(),
                    email: document.getElementById('email-register').value.trim().toLowerCase(),
                    password: passwordInput.value
                });
                saveSession(account);
                window.location.href = 'profile.html';
            } catch (error) {
                alert(error.message);
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

