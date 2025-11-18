// Initialize Lucide icons
lucide.createIcons();

// State Management
let userCredits = 2;
let selectedTemplate = null;
let selectedPlanData = null;
let generatedVisuals = [];

// Template Filtering
function filterTemplates(category) {
    const cards = document.querySelectorAll('.template-card-v2');
    const filterBtns = document.querySelectorAll('.filter-btn');

    // Update button styles
    filterBtns.forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Filter cards
    cards.forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Template Selection
function selectTemplate(templateId) {
    selectedTemplate = templateId;

    // Hide templates section, show generator
    document.getElementById('templates').classList.add('hidden-element');
    document.getElementById('generator').classList.remove('hidden-element');

    // Scroll to generator
    document.getElementById('generator').scrollIntoView({ behavior: 'smooth' });

    // Update preview with selected template
    updatePreview();
}

function backToTemplates() {
    document.getElementById('generator').classList.add('hidden-element');
    document.getElementById('templates').classList.remove('hidden-element');
    document.getElementById('templates').scrollIntoView({ behavior: 'smooth' });
}

// Preview Update
function updatePreview() {
    const title = document.getElementById('title-input').value;
    const description = document.getElementById('description-input').value;
    const color = document.getElementById('color-input').value;

    const preview = document.getElementById('template-preview');

    if (title || description) {
        preview.innerHTML = `
            <div class="w-full h-full p-8 flex flex-col justify-center" style="background: linear-gradient(135deg, ${color} 0%, ${adjustColor(color, -30)} 100%);">
                <div class="text-white">
                    <h3 class="text-3xl lg:text-4xl font-bold mb-4">${title || 'Votre titre'}</h3>
                    <p class="text-lg opacity-90">${description || 'Votre description'}</p>
                </div>
            </div>
        `;
    }
}

// Color Helper
function adjustColor(color, amount) {
    return '#' + color.replace(/^#/, '').replace(/../g, color => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
}

function syncColorInput(value) {
    document.getElementById('color-input').value = value;
    document.getElementById('color-hex').value = value;
    updatePreview();
}

// Logo Upload
function handleLogoUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('logo-thumbnail').src = e.target.result;
            document.getElementById('logo-name').textContent = file.name;
            document.getElementById('logo-preview').classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }
}

function removeLogo() {
    document.getElementById('logo-input').value = '';
    document.getElementById('logo-preview').classList.add('hidden');
}

// Style Selection
let selectedStyle = 'moderne';

function selectStyle(style) {
    selectedStyle = style;
    const styleBtns = document.querySelectorAll('.style-btn');
    styleBtns.forEach(btn => {
        if (btn.dataset.style === style) {
            btn.classList.add('border-violet-500', 'bg-violet-50', 'text-violet-900');
            btn.classList.remove('border-slate-300');
        } else {
            btn.classList.remove('border-violet-500', 'bg-violet-50', 'text-violet-900');
            btn.classList.add('border-slate-300');
        }
    });
}

// Visual Generation
function generateVisual() {
    // Check credits
    if (userCredits <= 0) {
        showCreditsModal();
        return;
    }

    // Validate form
    const title = document.getElementById('title-input').value;
    if (!title) {
        alert('Veuillez saisir au moins un titre pour votre visuel');
        return;
    }

    // Show loading modal
    showLoadingModal();

    // Simulate generation (3-8 seconds)
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);

            setTimeout(() => {
                // Decrease credits
                userCredits--;
                updateCreditsDisplay();

                // Hide loading, show result
                hideLoadingModal();
                showResultModal();

                // Store generated visual
                generatedVisuals.push({
                    template: selectedTemplate,
                    title: title,
                    date: new Date()
                });
            }, 500);
        }
        document.getElementById('progress-bar').style.width = progress + '%';
    }, 200);
}

function updateCreditsDisplay() {
    document.getElementById('credits-counter').textContent = userCredits;
}

// Modal Management
function showLoadingModal() {
    document.getElementById('loading-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function hideLoadingModal() {
    document.getElementById('loading-modal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function showResultModal() {
    document.getElementById('result-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeResultModal() {
    document.getElementById('result-modal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function showCreditsModal() {
    document.getElementById('credits-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeCreditsModal() {
    document.getElementById('credits-modal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function downloadVisual() {
    // Simulate download
    alert('Téléchargement démarré ! Votre visuel sera disponible dans quelques secondes.');
    closeResultModal();
}

function createAnother() {
    closeResultModal();
    // Reset form
    document.getElementById('generator-form').reset();
    updatePreview();
}

// Pricing
function selectPlan(planName, price, credits) {
    selectedPlanData = {
        name: planName,
        price: price,
        credits: credits
    };

    // Update checkout form
    document.getElementById('selected-plan-name').textContent = planName.charAt(0).toUpperCase() + planName.slice(1);
    document.getElementById('selected-plan-price').textContent = price.toLocaleString() + ' FCFA';

    // Show checkout
    document.getElementById('pricing').classList.add('hidden-element');
    document.getElementById('checkout').classList.remove('hidden-element');
    document.getElementById('checkout').scrollIntoView({ behavior: 'smooth' });
}

function contactForCustomPlan() {
    const message = encodeURIComponent('Bonjour, je suis intéressé par le plan Stratégique. Pouvez-vous me donner plus d\'informations ?');
    window.open(`https://wa.me/2250700000000?text=${message}`, '_blank');
}

function backToPricing() {
    document.getElementById('checkout').classList.add('hidden-element');
    document.getElementById('pricing').classList.remove('hidden-element');
    document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' });
}

function goToPricing() {
    closeCreditsModal();
    document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' });
}

function updateCheckoutPlan() {
    const select = document.getElementById('checkout-plan-select');
    const value = select.value.split('-');
    const planName = value[0];
    const price = parseInt(value[1]);
    const credits = parseInt(value[2]);

    selectedPlanData = { name: planName, price: price, credits: credits };

    document.getElementById('selected-plan-name').textContent = planName.charAt(0).toUpperCase() + planName.slice(1);
    document.getElementById('selected-plan-price').textContent = price.toLocaleString() + ' FCFA';
}

// Checkout Submission
function submitCheckout(event) {
    event.preventDefault();

    const firstname = document.getElementById('checkout-firstname').value;
    const lastname = document.getElementById('checkout-lastname').value;
    const phone = document.getElementById('checkout-phone').value;
    const email = document.getElementById('checkout-email').value;
    const country = document.getElementById('checkout-country').value;

    // Prepare WhatsApp message
    const message = `
🎨 NOUVELLE COMMANDE - Studya Creator

👤 CLIENT
Nom: ${firstname} ${lastname}
📞 Téléphone: ${phone}
📧 Email: ${email}
🌍 Pays: ${document.getElementById('checkout-country').options[document.getElementById('checkout-country').selectedIndex].text}

💳 COMMANDE
Plan: ${selectedPlanData.name}
Prix: ${selectedPlanData.price.toLocaleString()} FCFA
Crédits: ${selectedPlanData.credits} visuels

---
Merci de confirmer la réception de cette commande.
            `;

    const encodedMessage = encodeURIComponent(message.trim());
    const whatsappNumber = '2250700000000'; // À configurer

    // Open WhatsApp with pre-filled message
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');

    // Simulate payment confirmation (in real app, wait for webhook)
    setTimeout(() => {
        alert('Commande enregistrée ! Vous allez recevoir un lien vers votre espace client par email.');

        // Update user credits (simulation)
        userCredits += selectedPlanData.credits;
        updateCreditsDisplay();

        // Show dashboard
        document.getElementById('checkout').classList.add('hidden-element');
        document.getElementById('dashboard').classList.remove('hidden-element');
        document.getElementById('dashboard-credits').textContent = userCredits;
        document.getElementById('dashboard').scrollIntoView({ behavior: 'smooth' });
    }, 2000);
}

// Navigation Helpers
function scrollToGenerator() {
    if (selectedTemplate) {
        document.getElementById('generator').scrollIntoView({ behavior: 'smooth' });
    } else {
        document.getElementById('templates').scrollIntoView({ behavior: 'smooth' });
    }
}

// Drag and Drop for Logo
const dropZone = document.querySelector('.drop-zone');

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => {
        dropZone.classList.add('drag-over');
    });
});

['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => {
        dropZone.classList.remove('drag-over');
    });
});

dropZone.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        document.getElementById('logo-input').files = files;
        handleLogoUpload({ target: { files: files } });
    }
});

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    updateCreditsDisplay();
    initializeDarkMode();
});

// Dark Mode Toggle
function initializeDarkMode() {
    const desktopToggle = document.getElementById('dark-mode-toggle');
    const body = document.body;

    const setDarkMode = (enabled) => {
        if (enabled) {
            body.classList.add('dark-mode');
            localStorage.setItem('darkMode', 'enabled');
            desktopToggle.innerHTML = '<i data-lucide="sun" class="w-5 h-5"></i>';
        } else {
            body.classList.remove('dark-mode');
            localStorage.setItem('darkMode', 'disabled');
            desktopToggle.innerHTML = '<i data-lucide="moon" class="w-5 h-5"></i>';
        }
        lucide.createIcons();
    };

    // Initial state
    if (desktopToggle) {
        const isDarkMode = localStorage.getItem('darkMode') === 'enabled';
        setDarkMode(isDarkMode);

        // Event listener
        desktopToggle.addEventListener('click', () => {
            setDarkMode(!body.classList.contains('dark-mode'));
        });
    }
}

// Before/After Swiper
const beforeAfterSwiper = new Swiper('.before-after-swiper', {
    loop: true,
    autoHeight: true, // Adjust height automatically
    autoplay: {
        delay: 5000,
        disableOnInteraction: false,
    },
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
    },
});
