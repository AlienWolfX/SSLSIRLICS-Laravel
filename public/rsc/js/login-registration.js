//--------------------Switching between Login and Register Modals----------------------//

document.addEventListener('DOMContentLoaded', () => {
    // Get the modals
    const loginModal = document.getElementById('login');
    const registerModal = document.getElementById('register');
    
    // Get all interactive elements
    const registerLink = document.querySelector('.register-link');
    const loginLink = document.querySelector('.login-link');
    const loginButton = document.querySelector('[data-bs-target="#login"]');
    const registerButton = document.querySelector('[data-bs-target="#register"]');
    const closeButtons = document.querySelectorAll('.icon-close');
    
    // Initialize Bootstrap modals with options
    const modalOptions = {
        backdrop: true, // Changed to true to allow clicking outside to close
        keyboard: true  // Allow ESC key to close
    };
    
    const loginBsModal = new bootstrap.Modal(loginModal, modalOptions);
    const registerBsModal = new bootstrap.Modal(registerModal, modalOptions);
    
    // Function to cleanup modal effects
    const cleanupModalEffects = () => {
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
            backdrop.remove();
        }
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
    };

    // Function to handle modal switching with proper cleanup
    const switchModals = (fromModal, toModal) => {
        fromModal.hide();
        cleanupModalEffects();
        setTimeout(() => {
            toModal.show();
        }, 150); // Reduced delay for smoother transition
    };
    
    // Get all register links (both from login modal and any other locations)
    const registerLinks = document.querySelectorAll('.register-link');
    const loginLinks = document.querySelectorAll('.login-link');

    // Register link click handlers
    registerLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchModals(loginBsModal, registerBsModal);
        });
    });
    
    // Login link click handlers
    loginLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchModals(registerBsModal, loginBsModal);
        });
    });

    // Close button handlers
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            loginBsModal.hide();
            registerBsModal.hide();
            cleanupModalEffects();
        });
    });

    // Form reset and cleanup on modal hide
    [loginModal, registerModal].forEach(modal => {
        modal?.addEventListener('hidden.bs.modal', () => {
            const form = modal.querySelector('form');
            if (form) {
                form.reset();
                // Clear any error messages
                const errorDiv = form.querySelector('.alert');
                if (errorDiv) {
                    errorDiv.classList.add('d-none');
                }
            }
            cleanupModalEffects();
        });
    });

    // Button click handlers
    loginButton?.addEventListener('click', (e) => {
        e.preventDefault();
        registerBsModal.hide();
        cleanupModalEffects();
        setTimeout(() => {
            loginBsModal.show();
        }, 150);
    });

    registerButton?.addEventListener('click', (e) => {
        e.preventDefault();
        loginBsModal.hide();
        cleanupModalEffects();
        setTimeout(() => {
            registerBsModal.show();
        }, 150);
    });

    // Handle clicks on modal backdrop
    [loginModal, registerModal].forEach(modal => {
        modal?.addEventListener('click', (e) => {
            if (e.target === modal) {
                const bsModal = bootstrap.Modal.getInstance(modal);
                if (bsModal) {
                    bsModal.hide();
                    cleanupModalEffects();
                }
            }
        });
    });
});

//--------------------Switching between Login and Register Modals close----------------------//



//--------------------Login Validation----------------------//

// Add to your login success handler
const handleLoginSuccess = () => {
    localStorage.setItem('isLoggedIn', 'true');
    // Get map instance and update markers
    const map = window.streetlightMap; // Assuming you've stored your map instance globally
    if (map) {
        map.updateMarkersVisibility();
    }
};

// Add to your logout handler
const handleLogout = () => {
    localStorage.setItem('isLoggedIn', 'false');
    // Get map instance and update markers
    const map = window.streetlightMap;
    if (map) {
        map.updateMarkersVisibility();
    }
};

// Add to your DOMContentLoaded event
document.addEventListener('DOMContentLoaded', () => {
    // Initialize login state if not set
    if (!localStorage.getItem('isLoggedIn')) {
        localStorage.setItem('isLoggedIn', 'false');
    }
    
    // Update markers visibility based on initial login state
    const map = window.streetlightMap;
    if (map) {
        map.updateMarkersVisibility();
    }
});
