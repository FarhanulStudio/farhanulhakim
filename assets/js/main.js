
    const themeToggle = document.getElementById('themeToggle');
    const themeToggleMobile = document.getElementById('themeToggleMobile');
    const body = document.body;
    const html = document.documentElement;

    function setThemeIcons(isLight) {
        [themeToggle, themeToggleMobile].forEach(btn => {
            if (!btn) return;
            const icon = btn.querySelector('i');
            if (isLight) {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            } else {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            }
        });
    }

    if (localStorage.getItem('theme') === 'light') {
        body.classList.add('light-mode');
        html.classList.add('light-mode');
        setThemeIcons(true);
    }

    function toggleTheme() {
        body.classList.toggle('light-mode');
        html.classList.toggle('light-mode');
        const isLight = body.classList.contains('light-mode');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
        setThemeIcons(isLight);
    }

    themeToggle.addEventListener('click', toggleTheme);
    if (themeToggleMobile) themeToggleMobile.addEventListener('click', toggleTheme);

    // ===== MOBILE DROPDOWN =====
    const menuToggle = document.getElementById('menuToggle');
    const mobileDropdown = document.getElementById('mobileDropdown');
    const mobileDropdownClose = document.getElementById('mobileDropdownClose');

    function openDropdown() {
        mobileDropdown.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeDropdown() {
        mobileDropdown.classList.remove('open');
        document.body.style.overflow = '';
    }

    menuToggle.addEventListener('click', openDropdown);
    mobileDropdownClose.addEventListener('click', closeDropdown);

    mobileDropdown.addEventListener('click', function(e) {
        if (e.target === mobileDropdown) closeDropdown();
    });

    document.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.addEventListener('click', function() {
            closeDropdown();
        });
    });
    