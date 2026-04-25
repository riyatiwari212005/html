/**
 * Helper functions for use in HTML - Define FIRST before DOMContentLoaded
 */

// Toggle dark mode
function toggleDarkMode() {
    console.log('toggleDarkMode called');
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    console.log('Step 1 - Current data-theme attribute:', currentTheme);

    let newTheme;
    if (currentTheme === 'dark') {
        console.log('Step 2 - Currently DARK, switching to LIGHT');
        newTheme = 'light';
    } else {
        console.log('Step 2 - Currently LIGHT (or unset), switching to DARK');
        newTheme = 'dark';
    }

    console.log('Step 3 - New theme will be:', newTheme);

    if (newTheme === 'dark') {
        console.log('Step 4 - Setting data-theme to dark');
        html.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme-preference', 'dark');
    } else {
        console.log('Step 4 - Removing data-theme attribute');
        html.removeAttribute('data-theme');
        localStorage.setItem('theme-preference', 'light');
    }

    console.log('Step 5 - Final data-theme value:', html.getAttribute('data-theme'));
    console.log('Step 6 - localStorage saved:', localStorage.getItem('theme-preference'));

    // Also update via manager if available
    if (window.themeManager) {
        console.log('Updating button via themeManager');
        window.themeManager.updateToggleButton(newTheme);
    }
}

// Get current theme
function getCurrentTheme() {
    if (window.themeManager) {
        return window.themeManager.getCurrentTheme();
    }
    return document.documentElement.getAttribute('data-theme') || 'light';
}

// Check device type
function getDeviceType() {
    if (window.themeManager) {
        return window.themeManager.checkMobileView();
    }
    return {
        isMobile: window.innerWidth < 768,
        isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
        isDesktop: window.innerWidth >= 1024
    };
}

/**
 * Dark Mode & Responsive Design Manager Class
 * Handles theme switching, persistence, and mobile view detection
 */

class DarkModeManager {
    constructor(options = {}) {
        this.storageKey = options.storageKey || 'theme-preference';
        this.defaultTheme = options.defaultTheme || 'light';
        this.toggleButtonSelector = options.toggleButtonSelector || '.theme-toggle';
        this.init();
    }

    /**
     * Initialize dark mode manager
     */
    init() {
        this.loadTheme();
        this.setupToggleButton();
        this.setupSystemPreference();
        this.checkMobileView();
        window.addEventListener('resize', () => this.checkMobileView());
    }

    /**
     * Load theme from localStorage or system preference
     */
    loadTheme() {
        // Check if user has saved preference
        const savedTheme = localStorage.getItem(this.storageKey);
        console.log('Saved theme in localStorage:', savedTheme);

        if (savedTheme) {
            this.setTheme(savedTheme);
        } else {
            // Default to light mode (don't use system preference)
            console.log('No saved preference, defaulting to light mode');
            this.setTheme('light');
        }
    }

    /**
     * Set theme (light or dark)
     */
    setTheme(theme) {
        const html = document.documentElement;
        console.log('setTheme called with:', theme);

        if (theme === 'dark') {
            html.setAttribute('data-theme', 'dark');
            console.log('Set data-theme to dark');
            localStorage.setItem(this.storageKey, 'dark');
            this.updateToggleButton('dark');
        } else {
            html.removeAttribute('data-theme');
            console.log('Removed data-theme attribute');
            localStorage.setItem(this.storageKey, 'light');
            this.updateToggleButton('light');
        }

        console.log('Final data-theme value:', html.getAttribute('data-theme'));
    }

    /**
     * Toggle between light and dark mode
     */
    toggle() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        console.log('Current theme attribute:', currentTheme);
        // If no data-theme or data-theme is 'light', switch to dark
        // If data-theme is 'dark', switch to light
        const isCurrentlyDark = currentTheme === 'dark';
        const newTheme = isCurrentlyDark ? 'light' : 'dark';
        console.log('Switching to theme:', newTheme);
        this.setTheme(newTheme);
        console.log('After setTheme - html data-theme:', document.documentElement.getAttribute('data-theme'));
    }

    /**
     * Get current theme
     */
    getCurrentTheme() {
        return document.documentElement.getAttribute('data-theme') || 'light';
    }

    /**
     * Setup toggle button click handler
     */
    setupToggleButton() {
        // Handle .theme-toggle class
        const themeButtons = document.querySelectorAll('.theme-toggle');
        themeButtons.forEach(btn => {
            btn.addEventListener('click', () => this.toggle());
        });

        // Handle .dark-mode-toggle class (new template)
        const darkModeButtons = document.querySelectorAll('.dark-mode-toggle');
        darkModeButtons.forEach(btn => {
            btn.addEventListener('click', () => this.toggle());
        });

        // Handle [data-theme-toggle] attribute
        const dataThemeButtons = document.querySelectorAll('[data-theme-toggle]');
        dataThemeButtons.forEach(btn => {
            btn.addEventListener('click', () => this.toggle());
        });
    }

    /**
     * Update toggle button appearance
     */
    updateToggleButton(theme) {
        // Update theme-toggle buttons (class selector)
        const themeButtons = document.querySelectorAll('.theme-toggle');
        themeButtons.forEach(btn => {
            if (theme === 'dark') {
                btn.innerHTML = '☀️ Light Mode';
                btn.setAttribute('aria-label', 'Switch to light mode');
            } else {
                btn.innerHTML = '🌙 Dark Mode';
                btn.setAttribute('aria-label', 'Switch to dark mode');
            }
        });

        // Update dark-mode-toggle buttons (new template style)
        const darkModeButtons = document.querySelectorAll('.dark-mode-toggle');
        darkModeButtons.forEach(btn => {
            const icon = btn.querySelector('.toggle-icon');
            const text = btn.querySelector('.toggle-text');

            if (theme === 'dark') {
                if (icon) icon.textContent = '☀️';
                if (text) text.textContent = 'Light';
                btn.setAttribute('aria-label', 'Switch to light mode');
            } else {
                if (icon) icon.textContent = '🌙';
                if (text) text.textContent = 'Dark';
                btn.setAttribute('aria-label', 'Switch to dark mode');
            }
        });

        // Update any data-theme-toggle buttons
        const dataThemeButtons = document.querySelectorAll('[data-theme-toggle]');
        dataThemeButtons.forEach(btn => {
            if (theme === 'dark') {
                btn.innerHTML = '☀️ Light';
                btn.setAttribute('aria-label', 'Switch to light mode');
            } else {
                btn.innerHTML = '🌙 Dark';
                btn.setAttribute('aria-label', 'Switch to dark mode');
            }
        });
    }

    /**
     * Listen to system theme preference changes
     */
    setupSystemPreference() {
        const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        darkModeQuery.addEventListener('change', (e) => {
            if (!localStorage.getItem(this.storageKey)) {
                this.setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    /**
     * Check if viewing on mobile
     */
    checkMobileView() {
        const isMobile = window.innerWidth < 768;
        const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;

        document.body.setAttribute('data-device', isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop');

        return {
            isMobile,
            isTablet,
            isDesktop: !isMobile && !isTablet
        };
    }

    /**
     * Check if currently on mobile
     */
    isMobile() {
        return window.innerWidth < 768;
    }

    /**
     * Check if currently on tablet
     */
    isTablet() {
        return window.innerWidth >= 768 && window.innerWidth < 1024;
    }

    /**
     * Check if currently on desktop
     */
    isDesktop() {
        return window.innerWidth >= 1024;
    }
}

/**
 * Initialize on DOM ready
 */
document.addEventListener('DOMContentLoaded', function () {
    // Create global instance
    window.themeManager = new DarkModeManager({
        storageKey: 'theme-preference',
        defaultTheme: 'light',
        toggleButtonSelector: '.theme-toggle, [data-theme-toggle]'
    });

    // Add keyboard shortcut (Ctrl/Cmd + Shift + D for dark mode toggle)
    document.addEventListener('keydown', function (e) {
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
            e.preventDefault();
            window.themeManager.toggle();
        }
    });
});
