// Initialize Lucide icons
lucide.createIcons();

// State Management
let userCredits = 2;
let selectedTemplate = null;
let selectedPlanData = null;
let generatedVisuals = [];
let templatesData = [];

// Utility function to shuffle an array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Base API URL - Adjust this based on your backend server
// Using a relative path to work with different environments
// const BASE_API_URL = '/api';
// If your backend is on a different port or domain, uncomment and adjust the following line:
const BASE_API_URL = 'https://backend-studyacreator.onrender.com/api';

// API Service for Templates
function renderSkeletonLoaders() {
  const grid = document.getElementById('templates-grid');
  grid.innerHTML = '';
  for (let i = 0; i < 8; i++) {
    const skeleton = document.createElement('div');
    skeleton.className = 'template-card-v2';
    skeleton.innerHTML = `
      <div class="card-v2-image-wrapper"><div class="card-v2-image skeleton"></div></div>
      <div class="card-v2-content">
        <div class="h-5 bg-slate-200 rounded w-3/4 mb-2 skeleton"></div>
        <div class="h-4 bg-slate-200 rounded w-1/2 skeleton"></div>
      </div>
    `;
    grid.appendChild(skeleton);
  }
}

async function fetchTemplates() {
  try {
    const response = await fetch(`${BASE_API_URL}/templates`);
    if (!response.ok) {
      throw new Error('Failed to fetch templates');
    }
    templatesData = await response.json();
    renderDynamicFilters(templatesData);
    // Automatically display the first theme's templates on initial load
        if (templatesData.length > 0) {
      // Update hero image with a random template
      const randomTemplate = templatesData[Math.floor(Math.random() * templatesData.length)];
      updateHeroVisual(randomTemplate);

      const firstTheme = new Set(templatesData.map(t => t.theme).filter(Boolean)).values().next().value;
      if (firstTheme) {
        filterByTheme(firstTheme, document.querySelector('.filter-btn'));
      }
    }
  } catch (error) {
    console.error('Error fetching templates:', error);
    displayErrorMessage('Impossible de charger les templates. Vérifiez si le serveur est en cours d\'exécution ou contactez le support.');
  }
}

async function fetchTemplatesByCategory(category) {
  try {
    const response = await fetch(`${BASE_API_URL}/templates/category/${category}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch templates for category ${category}`);
    }
    const filteredTemplates = await response.json();
    renderTemplates(filteredTemplates);
  } catch (error) {
    console.error(`Error fetching templates for category ${category}:`, error);
    displayErrorMessage(`Impossible de charger les templates pour la catégorie ${category}.`);
  }
}

async function fetchTemplatesByTheme(theme) {
  try {
    const response = await fetch(`${BASE_API_URL}/templates/theme/${theme}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch templates for theme ${theme}`);
    }
    const filteredTemplates = await response.json();
    renderTemplates(filteredTemplates);
  } catch (error) {
    console.error(`Error fetching templates for theme ${theme}:`, error);
    displayErrorMessage(`Impossible de charger les templates pour le thème ${theme}.`);
  }
}

function displayErrorMessage(message) {
  const grid = document.getElementById('templates-grid');
  grid.innerHTML = `<div class="col-span-full text-center p-8 text-red-600">${message}</div>`;
}

// Template Rendering
let templatesSwiper = null;

function renderTemplates(templates) {
  const grid = document.getElementById('templates-grid');
  const swiperWrapper = document.querySelector('.templates-swiper .swiper-wrapper');
  grid.innerHTML = '';
  swiperWrapper.innerHTML = '';
  
  if (templates.length === 0) {
    grid.innerHTML = '<div class="col-span-full text-center p-8 text-slate-600">No templates found.</div>';
    return;
  }

  templates.forEach(template => {
    const templateElement = document.createElement('div');
        templateElement.className = 'swiper-slide';
    templateElement.dataset.category = template.category || 'all';
    templateElement.dataset.theme = template.theme || 'default';
    templateElement.onclick = () => selectTemplate(template._id);
    
    templateElement.innerHTML = `
      <div class="card-v2-image-wrapper">
        <div class="card-v2-image bg-gradient-to-br from-${template.color || 'slate'}-400 to-${template.color || 'slate'}-500">
          ${template.imageUrl ? `<img src="${template.imageUrl}" alt="${template.name || 'Template'}" class="w-full h-full object-cover" loading="lazy">` : `<i data-lucide="${template.icon || 'image'}" class="w-20 h-20 text-white/70"></i>`}
        </div>
        <div class="card-v2-overlay">
          <button class="card-v2-button">Utiliser ce template</button>
        </div>
      </div>
      <div class="card-v2-content">
        <h3 class="card-v2-title">${template.category || 'Catégorie'}</h3>
        <p class="card-v2-subtitle">${template.tags ? template.tags.slice(0, 3).join(' . ') : 'Tags'}</p>
        ${template.isNew ? '<span class="card-v2-badge">Nouveau</span>' : ''}
      </div>
    `;
    
        const cardContent = templateElement.innerHTML;
    
    // Populate grid for desktop
    const gridCard = document.createElement('div');
    gridCard.className = 'template-card-v2 group';
    gridCard.innerHTML = cardContent;
    gridCard.onclick = () => selectTemplate(template._id);
    grid.appendChild(gridCard);

    // Populate swiper for mobile
    const swiperSlide = document.createElement('div');
    swiperSlide.className = 'swiper-slide';
    swiperSlide.innerHTML = `<div class="template-card-v2 group">${cardContent}</div>`;
    swiperSlide.onclick = () => selectTemplate(template._id);
    swiperWrapper.appendChild(swiperSlide);
  });
  
  // Reinitialize Lucide icons
  lucide.createIcons();
  initializeTemplatesSwiper();
}

let activeTheme = '';

function renderDynamicFilters(templates) {
  const filtersContainer = document.getElementById('dynamic-filters-container');
  const themes = [...new Set(templates.map(t => t.theme).filter(Boolean))];
  
  filtersContainer.innerHTML = '';
  themes.forEach((theme, index) => {
    const button = document.createElement('button');
    button.className = 'filter-btn';
    if (index === 0) {
      button.classList.add('active');
      activeTheme = theme;
    }
    button.textContent = theme;
    button.onclick = (event) => filterByTheme(theme, event.target);
    filtersContainer.appendChild(button);
  });
}

function filterByTheme(theme, clickedButton) {
  activeTheme = theme;
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => btn.classList.remove('active'));
  clickedButton.classList.add('active');

    const filteredTemplates = templatesData.filter(t => t.theme === theme);
    const shuffledTemplates = shuffleArray([...filteredTemplates]);
  renderTemplates(shuffledTemplates.slice(0, 8));

  const viewAllContainer = document.getElementById('view-all-container');
  if (filteredTemplates.length > 8) {
    viewAllContainer.innerHTML = `<button onclick="openFullGalleryModal()" class="px-6 py-3 bg-slate-200 text-slate-800 font-medium rounded-lg hover:bg-slate-300 transition-all">Voir tout</button>`;
  } else {
    viewAllContainer.innerHTML = '';
  }
}

function updateHeroVisual(template) {
  const heroVisual = document.getElementById('hero-visual');
  if (template && template.imageUrl) {
    heroVisual.innerHTML = `
      <div class="aspect-square bg-white rounded-xl flex items-center justify-center overflow-hidden">
        <img src="${template.imageUrl}" alt="Hero Visual" class="w-full h-full object-cover">
      </div>
      <div class="mt-4 space-y-3">
        <div class="h-4 bg-slate-200 rounded w-3/4 skeleton"></div>
        <div class="h-4 bg-slate-200 rounded w-1/2 skeleton"></div>
      </div>
    `;
  }
}

function openFullGalleryModal() {
  const modal = document.getElementById('full-gallery-modal');
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  document.getElementById('full-gallery-title').textContent = `Galerie complète : ${activeTheme}`;

  const templatesForTheme = templatesData.filter(t => t.theme === activeTheme);
  const templatesByCategory = templatesForTheme.reduce((acc, template) => {
    const category = template.category || 'Général';
    if (!acc[category]) acc[category] = [];
    acc[category].push(template);
    return acc;
  }, {});

    const contentContainer = document.getElementById('modal-templates-grid');
  const filtersContainer = document.getElementById('modal-category-filters');
  contentContainer.innerHTML = '';
  filtersContainer.innerHTML = '';

    // Render category filters
  const categories = ['all', ...Object.keys(templatesByCategory)];
  categories.forEach(category => {
    const button = document.createElement('button');
    button.className = 'filter-btn';
    if (category === 'all') button.classList.add('active');
    button.textContent = category === 'all' ? 'Toutes' : category;
    button.onclick = (event) => filterModalByCategory(category, templatesByCategory, event.target);
    filtersContainer.appendChild(button);
  });

  // Initial render of all templates in the modal
  filterModalByCategory('all', templatesByCategory, filtersContainer.querySelector('.filter-btn'));

}

function filterModalByCategory(selectedCategory, templatesByCategory, clickedButton) {
  const contentContainer = document.getElementById('modal-templates-grid');
  contentContainer.innerHTML = '';

  document.querySelectorAll('#modal-category-filters .filter-btn').forEach(btn => btn.classList.remove('active'));
  clickedButton.classList.add('active');

  const categoriesToRender = selectedCategory === 'all' ? Object.keys(templatesByCategory) : [selectedCategory];

  categoriesToRender.forEach(category => {
    const categorySection = document.createElement('div');
    categorySection.className = 'mb-12';
    
    let templatesGridHTML = templatesByCategory[category].map(template => `
      <div class="template-card-v2 group" onclick="selectTemplate('${template._id}'); closeFullGalleryModal();">
        <div class="card-v2-image-wrapper">
          <div class="card-v2-image bg-gradient-to-br from-slate-400 to-slate-500">
             ${template.imageUrl ? `<img src="${template.imageUrl}" alt="${template.name || 'Template'}" class="w-full h-full object-cover" loading="lazy">` : `<i data-lucide="image" class="w-20 h-20 text-white/70"></i>`}
          </div>
           <div class="card-v2-overlay"><button class="card-v2-button">Utiliser</button></div>
        </div>
        <div class="card-v2-content"><h3 class="card-v2-title">${template.category || 'Catégorie'}</h3><p class="card-v2-subtitle">${template.tags ? template.tags.slice(0, 3).join(' . ') : 'Tags'}</p></div>
      </div>
    `).join('');

    categorySection.innerHTML = `
      <h4 class="text-xl font-medium text-slate-700 mb-4">${category}</h4>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
        ${templatesGridHTML}
      </div>
    `;
    contentContainer.appendChild(categorySection);
  });

  lucide.createIcons();
}

function closeFullGalleryModal() {
  const modal = document.getElementById('full-gallery-modal');
  modal.classList.add('hidden');
  document.body.style.overflow = 'auto';
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
  const selected = templatesData.find(t => t._id === selectedTemplate);

  let backgroundStyle = `background: linear-gradient(135deg, ${color} 0%, ${adjustColor(color, -30)} 100%);`;
  if (selected && selected.imageUrl) {
    backgroundStyle = `background-image: url('${selected.imageUrl}'); background-size: cover; background-position: center;`;
  }

  preview.innerHTML = `
    <div class="w-full h-full p-8 flex flex-col justify-center items-center relative" style="${backgroundStyle}">
            <div class="text-white text-center z-10">
        <h3 class="text-3xl lg:text-4xl font-bold mb-4" style="text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">${title || ''}</h3>
        <p class="text-lg opacity-90" style="text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">${description || ''}</p>
      </div>
    </div>
  `;
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
let selectedNetwork = 'facebook';

function selectNetwork(network) {
  selectedNetwork = network;
  const networkBtns = document.querySelectorAll('.network-btn');
  networkBtns.forEach(btn => {
    if (btn.dataset.network === network) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  lucide.createIcons(); // Re-render icons if needed
}

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
window.addEventListener('load', () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch(error => {
        console.log('ServiceWorker registration failed: ', error);
      });
  }
});

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.network-btn').forEach(btn => {
    btn.addEventListener('click', () => selectNetwork(btn.dataset.network));
  });
  lucide.createIcons();
  updateCreditsDisplay();
  initializeDarkMode();
  renderSkeletonLoaders();
  fetchTemplates();
  handlePWAInstallPrompt();
});

function handlePWAInstallPrompt() {
  const installPopup = document.getElementById('pwa-install-popup');
  const installBtn = document.getElementById('pwa-install-btn');
  const closeBtn = document.getElementById('pwa-close-btn');
  let deferredPrompt;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;

    // Show the custom install popup after a short delay
    setTimeout(() => {
      installPopup.classList.remove('hidden');
      setTimeout(() => installPopup.classList.add('show'), 10);
    }, 3000);
  });

  installBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      deferredPrompt = null;
      hidePopup();
    }
  });

  closeBtn.addEventListener('click', () => {
    hidePopup();
  });

  function hidePopup() {
    installPopup.classList.remove('show');
    setTimeout(() => installPopup.classList.add('hidden'), 400);
  }
}

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
function initializeTemplatesSwiper() {
  if (templatesSwiper) {
    templatesSwiper.destroy(true, true);
  }
  templatesSwiper = new Swiper('.templates-swiper', {
    effect: 'coverflow',
    grabCursor: true,
    centeredSlides: true,
    slidesPerView: 'auto',
    coverflowEffect: {
      rotate: 50,
      stretch: 0,
      depth: 100,
      modifier: 1,
      slideShadows: true,
    },
    pagination: {
      el: '.swiper-pagination',
    },
  });
}

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
