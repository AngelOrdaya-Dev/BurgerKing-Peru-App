/**
 * BURGER KING® PERÚ – MOBILE APP ECOSYSTEM
 * Application Engine & Interactive Hand-off Controller
 * Version: 3.0.1 (Flame & Crave)
 */

// Application State
const appState = {
  currentScreen: '01-login',
  coronasBalance: 450,
  user: {
    name: 'Camila Rodríguez',
    phone: '+51 987 654 321',
    email: 'camila.rodriguez@email.pe',
    address: 'Av. Alfredo Benavides 402, Dpto 501, Miraflores, Lima',
    tier: 'Rey Fuego',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80'
  },
  serviceMode: 'delivery', // 'delivery' | 'takeaway' | 'autoking'
  cart: [
    {
      id: 1,
      title: 'Whopper® Person...',
      fullName: 'Whopper® Personalizado Doble',
      price: 30.90,
      qty: 1,
      desc: 'Doble carne, sin cebolla, tocino extra, Papas medianas...',
      isCustomized: true,
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&auto=format&fit=crop&q=80'
    },
    {
      id: 2,
      title: 'Stacker® Doble',
      fullName: 'Stacker® Doble',
      price: 29.90,
      qty: 1,
      desc: 'Con queso cheddar fundido y salsa stacker original',
      isCustomized: false,
      image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=200&auto=format&fit=crop&q=80'
    },
    {
      id: 3,
      title: 'Aros de Cebolla Gra...',
      fullName: 'Aros de Cebolla Grandes',
      price: 11.90,
      qty: 1,
      desc: 'Porción grande con dip de salsa BBQ ahumada',
      isCustomized: false,
      image: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=200&auto=format&fit=crop&q=80'
    }
  ],
  coupon: {
    code: 'BKBIENVENIDO20',
    applied: true,
    discountPct: 0.20 // 20%
  },
  useCoronasShipping: true,
  shippingCost: 6.00,
  
  // Customizer Working State
  customizer: {
    itemTitle: 'Whopper® Clásica',
    basePrice: 22.90,
    itemImage: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    size: 'simple', // 'simple' | 'doble' | 'triple'
    sizeExtra: 0,
    ingredients: {
      pepinillos: { level: 'Normal', extra: 0 },
      cebolla: { level: 'Normal', extra: 0 },
      tomate: { level: 'Normal', extra: 0 },
      bbq: { level: 'Ninguna', extra: 0 }
    },
    addons: {
      cheese: 0,
      bacon: 0
    },
    isCombo: false,
    comboExtra: 8.00,
    qty: 1
  },

  // King Tracker State
  trackerMap: null,
  riderMarker: null,
  riderAnimationInterval: null
};

// Friendly Screen Names
const screenNames = {
  '01-login': '01. Login',
  '02-inicio': '02. Inicio',
  '03-menu': '03. Menú',
  '04-customizer': '04. Personalizar',
  '05-cart': '05. Carrito',
  '06-checkout': '06. Checkout',
  '07-tracker': '07. Tracker',
  '08-cupones': '08. Cupones',
  '09-coronas': '09. Coronas',
  '10-perfil': '10. Mi Perfil'
};

// ==========================================================================
// 1. NAVIGATION & SCREEN SWITCHING (NATIVE WEB APP ENGINE)
// ==========================================================================

function resetAllScrollsToTop(target) {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  const appShell = document.getElementById('appShell');
  if (appShell) appShell.scrollTop = 0;
  if (target) {
    target.scrollTop = 0;
    const scrollBody = target.querySelector('.screen-scroll-body');
    if (scrollBody) scrollBody.scrollTop = 0;
  }
  document.querySelectorAll('.screen-scroll-body').forEach(el => {
    el.scrollTop = 0;
  });
}

function switchScreen(screenId) {
  // Hide all screens
  const screens = document.querySelectorAll('.screen-view');
  screens.forEach(s => s.classList.remove('active'));

  // Target screen
  const target = document.getElementById(`view-${screenId}`);
  if (target) {
    target.classList.add('active');
    appState.currentScreen = screenId;
    
    // Scroll to top immediately and after paint
    resetAllScrollsToTop(target);
    requestAnimationFrame(() => resetAllScrollsToTop(target));
    setTimeout(() => resetAllScrollsToTop(target), 20);
  }

  // Highlight active tab in all Fixed Bottom Navigation Bars
  document.querySelectorAll('.bottom-nav-bar .bottom-tab-btn').forEach(btn => {
    const navTarget = btn.getAttribute('data-nav-target');
    if (navTarget === screenId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // If switched to King Tracker, re-invalidate Leaflet map
  if (screenId === '07-tracker') {
    setTimeout(initKingTrackerMap, 200);
  }
}

// Update Clock in Status Bar
function updateClock() {
  const clock = document.getElementById('statusClock');
  if (clock) {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    clock.textContent = `${h}:${m}`;
  }
}
setInterval(updateClock, 30000);
updateClock();

// ==========================================================================
// 2. AUTHENTICATION, USER RECOGNITION & LOGIN (SCREEN 01)
// ==========================================================================

const knownUsersDB = [
  {
    match: ['987654321', 'camila', 'camila.rodriguez@email.pe'],
    name: 'Camila Rodríguez',
    phone: '+51 987 654 321',
    email: 'camila.rodriguez@email.pe',
    tier: 'Rey Fuego',
    coronas: 450,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80'
  },
  {
    match: ['999888777', 'carlos', 'carlos.mendoza@email.pe'],
    name: 'Carlos Mendoza',
    phone: '+51 999 888 777',
    email: 'carlos.mendoza@email.pe',
    tier: 'Rey Supremo',
    coronas: 620,
    avatar: ''
  },
  {
    match: ['912345678', 'diego', 'diego.vargas@email.pe'],
    name: 'Diego Vargas',
    phone: '+51 912 345 678',
    email: 'diego.vargas@email.pe',
    tier: 'Rey Fuego',
    coronas: 480,
    avatar: ''
  }
];

function getInitials(fullName) {
  const parts = (fullName || 'Rey BK').trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getFirstName(fullName) {
  return ((fullName || 'Cliente').trim().split(/\s+/)[0]) || 'Cliente';
}

function previewUserRecognition(nameVal) {
  const cleanName = (nameVal || '').trim() || 'Cliente BK';
  const firstName = getFirstName(cleanName);
  const recNameEl = document.getElementById('recBannerName');
  const recBtnFirstEl = document.getElementById('recBtnFirstName');
  const recAvatarWrap = document.querySelector('.rec-avatar-wrap');

  if (recNameEl) recNameEl.textContent = cleanName;
  if (recBtnFirstEl) recBtnFirstEl.textContent = firstName;

  const isCamila = cleanName.toLowerCase().includes('camila');
  if (recAvatarWrap) {
    if (isCamila) {
      recAvatarWrap.innerHTML = `<img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80" alt="${cleanName}"><span class="rec-online-dot"></span>`;
    } else {
      recAvatarWrap.innerHTML = `<span>${getInitials(cleanName)}</span><span class="rec-online-dot"></span>`;
    }
  }
}

function lookupKnownUser(contactVal) {
  const normalized = (contactVal || '').replace(/\s+/g, '').toLowerCase();
  const found = knownUsersDB.find(u => u.match.some(m => normalized.includes(m)));
  const recMeta = document.getElementById('recBannerMeta');

  if (found) {
    const nameInput = document.getElementById('loginNameInput');
    if (nameInput) nameInput.value = found.name;
    previewUserRecognition(found.name);
    if (recMeta) recMeta.textContent = `${found.phone} • Nivel ${found.tier} (${found.coronas} Coronas)`;
  } else if (recMeta && contactVal.trim()) {
    const formattedPhone = contactVal.includes('@') ? contactVal.trim() : `+51 ${contactVal.trim()}`;
    recMeta.textContent = `${formattedPhone} • Miembro Club BK (${appState.coronasBalance} Coronas)`;
  }
}

function syncUserProfileUI() {
  const user = appState.user;
  const firstName = getFirstName(user.name);
  const initials = getInitials(user.name);
  const isCamila = user.name.toLowerCase().includes('camila');

  // 1. Update Login Recognized Banner
  const recNameEl = document.getElementById('recBannerName');
  const recBtnFirstEl = document.getElementById('recBtnFirstName');
  const recMetaEl = document.getElementById('recBannerMeta');
  const nameInput = document.getElementById('loginNameInput');
  const phoneInput = document.getElementById('loginPhoneInput');

  if (recNameEl) recNameEl.textContent = user.name;
  if (recBtnFirstEl) recBtnFirstEl.textContent = firstName;
  if (recMetaEl) recMetaEl.textContent = `${user.phone} • Nivel ${user.tier} (${appState.coronasBalance} Coronas)`;
  if (nameInput) nameInput.value = user.name;
  if (phoneInput) phoneInput.value = user.phone.replace('+51 ', '');

  // 2. Update Greetings on Home (02-inicio) & Coronas (09-coronas)
  document.querySelectorAll('.greeting-title, .greeting-name').forEach(el => {
    el.textContent = `¡Hola, ${firstName}!`;
  });

  // 3. Update Profile Screen (10-perfil)
  const profName = document.querySelector('.profile-name');
  const profEmail = document.querySelector('.profile-email');
  const profPhone = document.getElementById('profilePhoneText');
  const profYape = document.getElementById('profileYapeText');
  if (profName) profName.textContent = user.name;
  if (profEmail) profEmail.textContent = user.email;
  if (profPhone) profPhone.textContent = user.phone;
  if (profYape) profYape.textContent = `Yape ${user.phone.replace('+51 ', '')}`;

  // 4. Update Avatars across all top headers and profile
  document.querySelectorAll('.user-avatar-circle').forEach(circle => {
    circle.setAttribute('title', `Cuenta de ${user.name}`);
    if (isCamila && user.avatar) {
      circle.innerHTML = `<img src="${user.avatar}" alt="${user.name}">`;
    } else {
      circle.innerHTML = `<div class="user-avatar-initials">${initials}</div>`;
    }
  });

  const profAvatarWrap = document.querySelector('.avatar-wrap-edit img');
  if (profAvatarWrap) {
    profAvatarWrap.alt = user.name;
  }
}

function saveAndApplyUser(name, contactRaw) {
  const cleanName = (name || '').trim() || 'Camila Rodríguez';
  const rawContact = (contactRaw || '').trim() || '987 654 321';
  const isEmail = rawContact.includes('@');

  const phone = isEmail ? appState.user.phone : (rawContact.startsWith('+51') ? rawContact : `+51 ${rawContact}`);
  const email = isEmail ? rawContact : `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '.').replace(/\.+/g, '.')}@email.pe`;
  const isCamila = cleanName.toLowerCase().includes('camila');

  appState.user = {
    ...appState.user,
    name: cleanName,
    phone: phone,
    email: email,
    avatar: isCamila ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80' : ''
  };

  try {
    localStorage.setItem('bk_peru_user', JSON.stringify(appState.user));
  } catch (e) {}

  syncUserProfileUI();
}

function toggleAuthTab(type) {
  const tabPhone = document.getElementById('tabPhone');
  const tabEmail = document.getElementById('tabEmail');
  const groupPhone = document.getElementById('groupPhone');
  const prefix = document.getElementById('phoneCountryPrefix');
  const input = document.getElementById('loginPhoneInput');

  if (type === 'phone') {
    tabPhone.classList.add('active');
    tabEmail.classList.remove('active');
    groupPhone.querySelector('.field-label').textContent = 'NÚMERO DE CELULAR';
    groupPhone.querySelector('.input-helper').textContent = 'Te enviaremos un código SMS de verificación segura.';
    if (prefix) prefix.style.display = 'flex';
    if (input) {
      input.type = 'tel';
      input.value = appState.user.phone.replace('+51 ', '');
      input.placeholder = '987 654 321';
    }
  } else {
    tabPhone.classList.remove('active');
    tabEmail.classList.add('active');
    groupPhone.querySelector('.field-label').textContent = 'CORREO ELECTRÓNICO';
    groupPhone.querySelector('.input-helper').textContent = 'Inicia con tu cuenta registrada en Delosi BK.';
    if (prefix) prefix.style.display = 'none';
    if (input) {
      input.type = 'email';
      input.value = appState.user.email;
      input.placeholder = 'tu.correo@email.pe';
    }
  }
}

function togglePasswordVisibility() {
  const input = document.getElementById('loginPasswordInput');
  if (input.type === 'password') {
    input.type = 'text';
    input.value = 'BurgerKing2026!';
  } else {
    input.type = 'password';
    input.value = '••••••••';
  }
}

function handleQuickRecognizedLogin() {
  const nameInput = document.getElementById('loginNameInput');
  const phoneInput = document.getElementById('loginPhoneInput');
  saveAndApplyUser(nameInput ? nameInput.value : appState.user.name, phoneInput ? phoneInput.value : appState.user.phone);
  const firstName = getFirstName(appState.user.name);
  showToast(`¡Hola de nuevo, ${firstName}! Tu cuenta King está activa`, 'crown');
  setTimeout(() => {
    switchScreen('02-inicio');
  }, 300);
}

function handleLogin() {
  const nameInput = document.getElementById('loginNameInput');
  const phoneInput = document.getElementById('loginPhoneInput');
  saveAndApplyUser(nameInput ? nameInput.value : appState.user.name, phoneInput ? phoneInput.value : appState.user.phone);
  const firstName = getFirstName(appState.user.name);
  showToast(`¡Bienvenido(a) ${firstName}! Sesión iniciada (${appState.user.phone})`, 'crown');
  setTimeout(() => {
    switchScreen('02-inicio');
  }, 350);
}

function handleWhatsAppLogin() {
  const nameInput = document.getElementById('loginNameInput');
  const phoneInput = document.getElementById('loginPhoneInput');
  saveAndApplyUser(nameInput ? nameInput.value : appState.user.name, phoneInput ? phoneInput.value : appState.user.phone);
  const firstName = getFirstName(appState.user.name);
  showToast(`¡Verificado por WhatsApp! Hola, ${firstName}`, 'whatsapp');
  setTimeout(() => {
    switchScreen('02-inicio');
  }, 450);
}

function handleOAuthLogin(provider) {
  const nameInput = document.getElementById('loginNameInput');
  const phoneInput = document.getElementById('loginPhoneInput');
  saveAndApplyUser(nameInput ? nameInput.value : appState.user.name, phoneInput ? phoneInput.value : appState.user.phone);
  const firstName = getFirstName(appState.user.name);
  showToast(`Autenticado con ${provider} como ${firstName}`, 'success');
  setTimeout(() => {
    switchScreen('02-inicio');
  }, 400);
}

function handleGuestLogin() {
  saveAndApplyUser('Invitado King', '900 000 000');
  showToast('Ingresando en Modo Invitado a Burger King® Perú', 'flame');
  setTimeout(() => {
    switchScreen('02-inicio');
  }, 300);
}

function handleLogout() {
  showToast(`Hasta pronto, ${getFirstName(appState.user.name)}. Sesión cerrada`, 'info');
  setTimeout(() => {
    switchScreen('01-login');
  }, 350);
}

// ==========================================================================
// 3. INICIO / FEED PRINCIPAL (SCREEN 02)
// ==========================================================================

function selectServiceMode(mode) {
  appState.serviceMode = mode;
  document.querySelectorAll('.service-pill-btn').forEach(btn => btn.classList.remove('active'));
  
  if (mode === 'delivery') {
    document.getElementById('svcDelivery').classList.add('active');
    showToast('Modo Delivery activo: tiempo estimado 35-45 min', 'bike');
  } else if (mode === 'takeaway') {
    document.getElementById('svcTakeaway').classList.add('active');
    showToast('Modo Para Llevar: Retira en Burger King Benavides', 'bag');
  } else {
    document.getElementById('svcAutoking').classList.add('active');
    showToast('Auto-King activo: Recoge en carril vehicular', 'car');
  }
}

function quickAddComboPromo() {
  addToCartDirect(
    'Mega King Fest (2 Whopper® + Papas + 2 Bebidas)',
    39.90,
    'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=200&auto=format&fit=crop&q=80',
    'Combo 35% OFF Mega King Fest'
  );
  showToast('¡Mega King Fest agregado a tu bandeja!', 'flame');
}

function quickReorder() {
  addToCartDirect(
    'Whopper® Doble',
    31.50,
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&auto=format&fit=crop&q=80',
    'Sin cebolla • Con Papas y Bebida'
  );
  showToast('¡Tu último pedido fue reordenado!', 'bag');
  setTimeout(() => switchScreen('05-cart'), 350);
}

// ==========================================================================
// 4. MENÚ DIGITAL (SCREEN 03)
// ==========================================================================

function openMenuWithCategory(category) {
  switchScreen('03-menu');
  const pillBtn = document.querySelector(`#view-03-menu .cat-pill[data-cat-pill="${category}"]`);
  filterMenuByCategory(category, pillBtn);
}

function selectMenuLocationChip(mode, btnEl) {
  document.querySelectorAll('#view-03-menu .loc-chip').forEach(c => c.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
  selectServiceMode(mode);
}

function filterMenuByCategory(category, btnEl) {
  document.querySelectorAll('#view-03-menu .cat-pill').forEach(p => p.classList.remove('active'));
  if (btnEl) {
    btnEl.classList.add('active');
  } else {
    const fallback = document.querySelector(`#view-03-menu .cat-pill[data-cat-pill="${category}"]`);
    if (fallback) fallback.classList.add('active');
  }

  const allCards = document.querySelectorAll('#view-03-menu .menu-item-card');
  let visibleCount = 0;
  allCards.forEach(card => {
    const cat = card.getAttribute('data-category') || 'res';
    if (category === 'all' || cat === category) {
      card.style.display = 'block';
      visibleCount++;
    } else {
      card.style.display = 'none';
    }
  });

  const snacksHeader = document.getElementById('snacksCatalogHeader');
  if (snacksHeader) {
    snacksHeader.style.display = (category === 'all' || category === 'snacks') ? 'flex' : 'none';
  }

  const countBadge = document.querySelector('#view-03-menu .options-count-badge');
  if (countBadge) {
    countBadge.textContent = `${visibleCount} OPCIONES`;
  }
}

function toggleMenuFilter(btn, filterType) {
  btn.classList.toggle('active');
  const isActive = btn.classList.contains('active');
  const cards = document.querySelectorAll('#view-03-menu .menu-item-card');

  if (!isActive) {
    cards.forEach(c => c.style.display = 'block');
    showToast(`Filtro ${filterType} desactivado`, 'info');
    return;
  }

  cards.forEach(card => {
    const tags = (card.getAttribute('data-tags') || '') + ' ' + card.textContent.toLowerCase();
    if (filterType === 'veggie') {
      card.style.display = (tags.includes('vegetal') || tags.includes('veggie') || tags.includes('mozzarella')) ? 'block' : 'none';
    } else if (filterType === 'spicy') {
      card.style.display = (tags.includes('bbq') || tags.includes('stacker') || tags.includes('tejano')) ? 'block' : 'none';
    } else {
      card.style.display = 'block';
    }
  });
  showToast(`Filtro ${filterType}: Activado`, 'flame');
}

function handleMenuSearch(query) {
  const q = query.toLowerCase().trim();
  const cards = document.querySelectorAll('#view-03-menu .menu-item-card');
  cards.forEach(card => {
    const text = card.textContent.toLowerCase();
    if (!q || text.includes(q)) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

function toggleFavorite(btn) {
  const isFilled = btn.classList.contains('active');
  if (!isFilled) {
    btn.classList.add('active');
    btn.innerHTML = '<svg class="bk-icon-sm icon-fav filled" viewBox="0 0 24 24" fill="#D62300" stroke="#D62300" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
    showToast('Guardado en tus Favoritos BK', 'flame');
  } else {
    btn.classList.remove('active');
    btn.innerHTML = '<svg class="bk-icon-sm icon-fav" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
    showToast('Eliminado de tus favoritos', 'info');
  }
}

function quickAddComboUpgrade() {
  addToCartDirect(
    'Upgrade a Combo (Papas medianas + Gaseosa)',
    4.90,
    'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=200&auto=format&fit=crop&q=80',
    'Acompañamiento especial BK'
  );
  showToast('¡Combo de papas y gaseosa añadido!', 'bag');
}

function quickMinusSide(btn) {
  const countEl = btn.parentElement.querySelector('.step-count');
  let current = parseInt(countEl.textContent);
  if (current > 1) {
    countEl.textContent = current - 1;
  }
}

function quickPlusSide(btn, name, price) {
  const countEl = btn.parentElement.querySelector('.step-count');
  let current = parseInt(countEl.textContent);
  countEl.textContent = current + 1;
  addToCartDirect(name, price, 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=200&auto=format&fit=crop&q=80', 'Snack crujiente 4 unidades');
}

// ==========================================================================
// 5. PERSONALIZAR WHOPPER "A TU MANERA" (SCREEN 04)
// ==========================================================================

function openCustomizer(productTitle, basePrice, image) {
  appState.customizer.itemTitle = productTitle;
  appState.customizer.basePrice = basePrice;
  appState.customizer.itemImage = image;
  appState.customizer.size = 'simple';
  appState.customizer.sizeExtra = 0;
  appState.customizer.addons = { cheese: 0, bacon: 0 };
  appState.customizer.isCombo = false;
  appState.customizer.qty = 1;

  document.getElementById('customizerHeaderTitle').textContent = `Personalizar ${productTitle.split(' ')[0]}`;
  document.getElementById('customizerProductTitle').textContent = productTitle;
  document.getElementById('customizerBasePrice').textContent = `S/ ${basePrice.toFixed(2)}`;
  document.getElementById('customizerHeroImg').src = image;

  // Reset UI radios
  document.querySelectorAll('.size-radio-card').forEach((card, idx) => {
    if (idx === 0) card.classList.add('active');
    else card.classList.remove('active');
  });

  // Reset addons
  document.getElementById('qtyCheese').textContent = '0';
  document.getElementById('qtyBacon').textContent = '0';
  document.getElementById('chkComboUpsell').checked = false;
  document.getElementById('customQty').textContent = '1';

  recalculateCustomizerPrice();
  switchScreen('04-customizer');
}

function selectPattySize(size, extraPrice, element) {
  appState.customizer.size = size;
  appState.customizer.sizeExtra = extraPrice;

  document.querySelectorAll('.size-radio-grid .size-radio-card').forEach(c => c.classList.remove('active'));
  element.classList.add('active');

  recalculateCustomizerPrice();
}

function setIngredientLevel(ingredient, level, extraPrice, element) {
  appState.customizer.ingredients[ingredient] = { level, extra: extraPrice };

  const container = element.parentElement;
  container.querySelectorAll('.seg-btn').forEach(btn => btn.classList.remove('active'));
  element.classList.add('active');

  const lbl = document.getElementById(`lbl-${ingredient}`);
  if (lbl) lbl.textContent = level;

  recalculateCustomizerPrice();
}

function changeAddon(addon, delta) {
  let val = appState.customizer.addons[addon] + delta;
  if (val < 0) val = 0;
  if (val > 5) val = 5;

  appState.customizer.addons[addon] = val;
  if (addon === 'cheese') {
    document.getElementById('qtyCheese').textContent = val;
  } else if (addon === 'bacon') {
    document.getElementById('qtyBacon').textContent = val;
  }

  recalculateCustomizerPrice();
}

function toggleComboUpsell(isChecked) {
  appState.customizer.isCombo = isChecked;
  recalculateCustomizerPrice();
}

function changeCustomQty(delta) {
  let q = appState.customizer.qty + delta;
  if (q < 1) q = 1;
  appState.customizer.qty = q;
  document.getElementById('customQty').textContent = q;
  recalculateCustomizerPrice();
}

function recalculateCustomizerPrice() {
  const c = appState.customizer;
  let unitPrice = c.basePrice + c.sizeExtra;

  // Ingredients extra
  Object.values(c.ingredients).forEach(ing => {
    unitPrice += ing.extra;
  });

  // Addons extra
  unitPrice += (c.addons.cheese * 2.50);
  unitPrice += (c.addons.bacon * 3.50);

  // Combo extra
  if (c.isCombo) {
    unitPrice += c.comboExtra;
  }

  const total = unitPrice * c.qty;
  document.getElementById('customFinalTotal').textContent = `S/ ${total.toFixed(2)}`;
  return total;
}

function commitCustomizationToCart() {
  const c = appState.customizer;
  const singlePrice = recalculateCustomizerPrice() / c.qty;

  // Build customization description
  const parts = [];
  if (c.size === 'doble') parts.push('Doble carne');
  else if (c.size === 'triple') parts.push('Triple carne');

  if (c.ingredients.cebolla.level === 'Sin cebolla') parts.push('sin cebolla');
  if (c.ingredients.pepinillos.level === 'Sin pepinillo') parts.push('sin pepinillos');
  if (c.ingredients.tomate.level === 'Extra') parts.push('tomate extra');
  if (c.addons.bacon > 0) parts.push(`tocino extra (${c.addons.bacon}x)`);
  if (c.addons.cheese > 0) parts.push(`queso fundido (${c.addons.cheese}x)`);
  if (c.isCombo) parts.push('En Combo con papas y bebida');

  const desc = parts.length > 0 ? parts.join(', ') : 'Receta clásica completa a la parrilla';

  appState.cart.unshift({
    id: Date.now(),
    title: `${c.itemTitle.split(' ')[0]}® Person...`,
    fullName: `${c.itemTitle} "A Tu Manera"`,
    price: singlePrice,
    qty: c.qty,
    desc: desc,
    isCustomized: true,
    image: c.itemImage
  });

  recalculateCart();
  renderCartItems();
  showToast('¡Hamburguesa personalizada agregada a la bandeja!', 'flame');
  switchScreen('05-cart');
}

// ==========================================================================
// 6. CARRITO DE CORONAS & CALCULATIONS (SCREEN 05)
// ==========================================================================

function addToCartDirect(name, price, image, desc) {
  // Check if item exists
  const existing = appState.cart.find(item => item.fullName === name && !item.isCustomized);
  if (existing) {
    existing.qty += 1;
  } else {
    appState.cart.push({
      id: Date.now(),
      title: name.length > 18 ? name.substring(0, 16) + '...' : name,
      fullName: name,
      price: price,
      qty: 1,
      desc: desc || 'Sabor flame-grilled 100% vacuna',
      isCustomized: false,
      image: image
    });
  }

  recalculateCart();
  renderCartItems();
  showToast(`¡${name} agregado a tu bandeja!`, 'bag');
}

function updateCartItemQty(itemId, delta) {
  const item = appState.cart.find(i => i.id === itemId);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    removeCartItem(itemId);
    return;
  }

  recalculateCart();
  renderCartItems();
}

function removeCartItem(itemId) {
  appState.cart = appState.cart.filter(i => i.id !== itemId);
  recalculateCart();
  renderCartItems();
  showToast('Producto retirado de la bandeja', 'info');
}

function renderCartItems() {
  const container = document.getElementById('cartListContainer');
  if (!container) return;

  if (appState.cart.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding: 30px 10px; color: var(--color-text-muted);">
        <div style="margin-bottom: 12px; display: inline-flex; align-items: center; justify-content: center; width: 56px; height: 56px; border-radius: 50%; background: var(--color-container-low); color: var(--color-primary-flame);"><svg class="bk-icon" style="width: 28px; height: 28px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg></div>
        <strong>Tu bandeja está vacía</strong>
        <p style="font-size: 11px; margin-top: 4px;">Explora el menú y corona tu antojo.</p>
        <button class="btn-primary-flame mt-md" onclick="switchScreen('03-menu')">Ir al Menú</button>
      </div>
    `;
    return;
  }

  container.innerHTML = appState.cart.map(item => `
    <div class="cart-item-row" id="cart-item-${item.id}">
      <div class="cart-thumb-wrap">
        <span class="qty-bubble">${item.qty}x</span>
        <img src="${item.image}" alt="${item.fullName}">
      </div>
      <div class="cart-item-info">
        <div class="cart-item-title-row">
          <h4>${item.title}</h4>
          <span class="cart-item-price">S/ ${(item.price * item.qty).toFixed(2)}</span>
        </div>
        <p class="cart-item-sub">${item.desc}</p>
        ${item.isCustomized ? '<span class="badge-customized"><svg class="bk-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> Personalizado</span>' : ''}
        <div class="cart-item-actions-row">
          <div class="stepper-box-mini">
            <button class="step-btn-mini" onclick="updateCartItemQty(${item.id}, -1)">-</button>
            <span class="step-qty-mini">${item.qty}</span>
            <button class="step-btn-mini" onclick="updateCartItemQty(${item.id}, 1)">+</button>
          </div>
          <div class="cart-item-links">
            ${item.isCustomized ? `<button class="btn-text-link" onclick="openCustomizer('${item.fullName}', ${item.price}, '${item.image}')"><svg class="bk-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Editar</button><span>•</span>` : ''}
            <button class="btn-trash-icon" onclick="removeCartItem(${item.id})" aria-label="Eliminar"><svg class="bk-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function recalculateCart() {
  // 1. Subtotal
  const subtotal = appState.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  
  // 2. Discount
  let discount = 0;
  if (appState.coupon.applied && subtotal > 0) {
    discount = subtotal * appState.coupon.discountPct;
  }

  // 3. Shipping
  const shipping = appState.useCoronasShipping ? 0 : appState.shippingCost;

  // 4. Final Total
  const finalTotal = Math.max(0, subtotal - discount + shipping);

  // Update DOM Elements
  const subEl = document.getElementById('cartSubtotal');
  const discEl = document.getElementById('cartDiscount');
  const shipEl = document.getElementById('cartShipping');
  const finEl = document.getElementById('cartFinalTotal');
  const stickyEl = document.getElementById('cartStickyTotal');
  const checkoutFinEl = document.getElementById('checkoutFinalTotal');
  const floatText = document.getElementById('floatingCartText');
  const headCount = document.getElementById('headerCartCount');
  const badgeCount = document.getElementById('cartBadgeCount');

  const totalItems = appState.cart.reduce((sum, i) => sum + i.qty, 0);

  if (subEl) subEl.textContent = `S/ ${subtotal.toFixed(2)}`;
  if (discEl) discEl.textContent = `-S/ ${discount.toFixed(2)}`;
  if (shipEl) {
    if (appState.useCoronasShipping) {
      shipEl.innerHTML = `<span class="old-price">S/ 6.00</span><strong class="text-free">GRATIS</strong>`;
    } else {
      shipEl.innerHTML = `<strong>S/ ${appState.shippingCost.toFixed(2)}</strong>`;
    }
  }
  if (finEl) finEl.textContent = `S/ ${finalTotal.toFixed(2)}`;
  if (stickyEl) stickyEl.innerHTML = `S/ ${finalTotal.toFixed(2)} <svg class="bk-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`;
  if (checkoutFinEl) checkoutFinEl.textContent = `S/ ${finalTotal.toFixed(2)}`;
  
  const chkSubLbl = document.getElementById('checkoutSubtotalLabel');
  const chkSubVal = document.getElementById('checkoutSubtotalVal');
  const chkIgvVal = document.getElementById('checkoutIgvVal');
  const chkBtnTotal = document.getElementById('checkoutBtnTotal');
  if (chkSubLbl) chkSubLbl.textContent = `Subtotal (${totalItems} ítems a la parrilla)`;
  if (chkSubVal) chkSubVal.textContent = `S/ ${subtotal.toFixed(2)}`;
  if (chkIgvVal) chkIgvVal.textContent = `S/ ${(finalTotal * 0.18).toFixed(2)}`;
  if (chkBtnTotal) chkBtnTotal.innerHTML = `S/ ${finalTotal.toFixed(2)} <svg class="bk-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`;

  if (floatText) floatText.textContent = `S/ ${finalTotal.toFixed(2)} • ${totalItems} ítems`;
  if (headCount) headCount.textContent = totalItems;
  if (badgeCount) badgeCount.textContent = `${totalItems} items`;
  const homeBadge = document.getElementById('homeCartBadge');
  if (homeBadge) homeBadge.textContent = totalItems;

  // Sync all fixed header cart badges & coronas counters across every screen
  document.querySelectorAll('.header-cart-icon-btn .cart-badge-pill').forEach(badge => {
    badge.textContent = totalItems;
  });
  document.querySelectorAll('.coronas-coin-pill .coin-val').forEach(valEl => {
    valEl.textContent = appState.coronasBalance;
  });
}

function removeCoupon() {
  appState.coupon.applied = false;
  document.getElementById('couponBox').style.opacity = '0.5';
  document.getElementById('couponStatusTag').textContent = 'Sin cupón';
  document.getElementById('couponStatusTag').style.color = 'var(--color-text-muted)';
  recalculateCart();
  showToast('Cupón desaplicado de la orden', 'info');
}

function applyCouponCode(code) {
  if (code === 'BKBIENVENIDO20') {
    appState.coupon.applied = true;
    appState.coupon.discountPct = 0.20;
    recalculateCart();
    showToast('¡Cupón BKBIENVENIDO20 aplicado! (-20% de descuento)', 'success');
    switchScreen('05-cart');
  } else {
    showToast('Código de cupón no reconocido', 'alert');
  }
}

function toggleCoronasShipping(isChecked) {
  appState.useCoronasShipping = isChecked;
  recalculateCart();
  if (isChecked) {
    showToast('Envío Gratis activado con 100 Coronas BK', 'crown');
  } else {
    showToast('Envío regular restaurado', 'info');
  }
}

// ==========================================================================
// 7. CHECKOUT Y PASARELA DE PAGOS PERÚ (SCREEN 06)
// ==========================================================================

function toggleCheckoutRewards(isChecked) {
  if (isChecked) {
    showToast('¡Canje de 240 Coronas aplicado al total!', 'crown');
  } else {
    showToast('Coronas reservadas para tu siguiente pedido', 'crown');
  }
}

function selectPaymentMethod(method) {
  document.querySelectorAll('.payment-method-row').forEach(row => row.classList.remove('active'));
  
  const selectedRadio = document.querySelector(`input[name="paymentMethod"][value="${method}"]`);
  if (selectedRadio) {
    selectedRadio.closest('.payment-method-row').classList.add('active');
  }

  if (method === 'yape') {
    showToast('Seleccionado Yape / Plin (Generando QR dinámico al confirmar)', 'info');
  } else if (method === 'bcp') {
    showToast('Tarjeta de Débito BCP Visa •••• 4821 seleccionada', 'card');
  } else {
    showToast('Pago contra entrega seleccionado (Efectivo o POS inalámbrico)', 'cash');
  }
}

function toggleInvoiceType(type) {
  const tabBoleta = document.getElementById('tabBoleta');
  const tabFactura = document.getElementById('tabFactura');
  const lblDoc = document.getElementById('lblDocType');
  const docInput = document.getElementById('docNumberInput');

  if (type === 'boleta') {
    tabBoleta.classList.add('active');
    tabFactura.classList.remove('active');
    lblDoc.textContent = 'DNI (Opcional para boletas menores a S/ 700)';
    docInput.value = '72849103';
    docInput.placeholder = 'DNI 8 dígitos';
    showToast('Comprobante SUNAT: Boleta de Venta electrónica', 'receipt');
  } else {
    tabBoleta.classList.remove('active');
    tabFactura.classList.add('active');
    lblDoc.textContent = 'RUC y Razón Social (SUNAT)';
    docInput.value = '20100106979';
    docInput.placeholder = 'RUC 11 dígitos';
    showToast('Comprobante SUNAT: Factura con crédito fiscal RUC', 'receipt');
  }
}

function processOrderToTracker() {
  const btn = document.getElementById('btnPlaceOrder');
  btn.innerHTML = `<span>Procesando pago seguro...</span>`;
  btn.disabled = true;

  setTimeout(() => {
    btn.innerHTML = `<span class="btn-text">Confirmar y Pedir</span><span class="btn-total-dynamic">S/ 58.16 <svg class="bk-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></span>`;
    btn.disabled = false;
    showToast('¡Pago aprobado! Pedido #BK-84920 enviado a cocina', 'flame');
    switchScreen('07-tracker');
  }, 900);
}

// ==========================================================================
// 8. KING TRACKER EN VIVO CON LEAFLET MAP (SCREEN 07)
// ==========================================================================

function initKingTrackerMap() {
  const mapElement = document.getElementById('kingTrackerMap');
  if (!mapElement || typeof L === 'undefined') return;

  // If map already initialized, just resize
  if (appState.trackerMap) {
    appState.trackerMap.invalidateSize();
    return;
  }

  // Miraflores coordinates (Av. Benavides / Calle Schell)
  const storeLat = -12.1265;
  const storeLng = -77.0240;
  const clientLat = -12.1195;
  const clientLng = -77.0305;

  // Initialize Map
  const map = L.map('kingTrackerMap', {
    center: [-12.1230, -77.0270],
    zoom: 15,
    zoomControl: false,
    attributionControl: false
  });
  appState.trackerMap = map;

  // CartoDB Positron / OSM Warm Tiles
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    maxZoom: 19
  }).addTo(map);

  // Custom SVG Markers
  const storeIcon = L.divIcon({
    html: '<div style="background:#D62300; color:#FFFFFF; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid #FFFFFF; box-shadow:0 3px 8px rgba(0,0,0,0.3);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 11h16a1 1 0 0 0 1-1C20.5 5.5 16.5 3 12 3S3.5 5.5 3 10a1 1 0 0 0 1 1z"/><path d="M3 17h18a2 2 0 0 1 0 4H3a2 2 0 0 1 0-4z"/><path d="M4 14h16"/></svg></div>',
    className: 'bk-store-marker',
    iconSize: [34, 34],
    iconAnchor: [17, 17]
  });

  const clientIcon = L.divIcon({
    html: '<div style="background:#2E282A; color:#FFC72C; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid #FFFFFF; box-shadow:0 3px 8px rgba(0,0,0,0.3);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>',
    className: 'bk-client-marker',
    iconSize: [34, 34],
    iconAnchor: [17, 17]
  });

  const riderIcon = L.divIcon({
    html: '<div style="background:#FFC72C; color:#D62300; width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2.5px solid #D62300; box-shadow:0 4px 10px rgba(214,35,0,0.4);"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><path d="M15 6h2"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg></div>',
    className: 'bk-rider-marker',
    iconSize: [36, 36],
    iconAnchor: [18, 18]
  });

  L.marker([storeLat, storeLng], { icon: storeIcon }).addTo(map).bindPopup('<b>Burger King Benavides</b><br>Preparado y sellado');
  L.marker([clientLat, clientLng], { icon: clientIcon }).addTo(map).bindPopup('<b>Tu ubicación de entrega</b><br>Av. Alfredo Benavides 402');

  // Route Polyline
  const routePoints = [
    [storeLat, storeLng],
    [-12.1252, -77.0255],
    [-12.1235, -77.0270],
    [-12.1215, -77.0288],
    [clientLat, clientLng]
  ];

  L.polyline(routePoints, {
    color: '#D62300',
    weight: 4,
    opacity: 0.8,
    dashArray: '8, 6'
  }).addTo(map);

  // Moving Rider Marker Animation
  let currentStep = 1;
  const rider = L.marker(routePoints[currentStep], { icon: riderIcon }).addTo(map);
  appState.riderMarker = rider;

  // Animate rider along route
  if (appState.riderAnimationInterval) clearInterval(appState.riderAnimationInterval);
  appState.riderAnimationInterval = setInterval(() => {
    currentStep = (currentStep + 1) % routePoints.length;
    rider.setLatLng(routePoints[currentStep]);
  }, 4000);
}

function triggerCallDriver() {
  showToast('Llamando a Carlos Mendoza (+51 987 112 334)...', 'phone');
}

function triggerWhatsAppDriver() {
  showToast('Abriendo chat directo de WhatsApp con tu repartidor', 'whatsapp');
}

function toggleOrderAccordion() {
  const body = document.getElementById('orderAccordionBody');
  if (body.style.display === 'none') {
    body.style.display = 'block';
  } else {
    body.style.display = 'none';
  }
}

function openOrderReceiptModal() {
  showToast('Descargando comprobante electrónico oficial SUNAT (PDF)', 'receipt');
}

function openSupportModal() {
  showToast('Conectando con Mesa de Ayuda BK Perú...', 'info');
}

// ==========================================================================
// 9. CUPONES Y PROMOCIONES (SCREEN 08)
// ==========================================================================

function filterCouponCategory(cat, element) {
  document.querySelectorAll('.cuponera-filter-pills .coupon-pill-btn').forEach(btn => btn.classList.remove('active'));
  element.classList.add('active');
  showToast(`Cuponera: ${cat === 'para-ti' ? 'Para Ti Personalizados' : '2x1 Favoritos'}`, 'info');
}

function redeemCouponDirect(couponName, price, image) {
  addToCartDirect(couponName, price, image, 'Cupón canjeado con descuento especial');
  showToast(`¡Cupón ${couponName} canjeado y añadido a tu bandeja!`, 'crown');
  setTimeout(() => switchScreen('05-cart'), 400);
}

function shareCouponWhatsApp() {
  const text = encodeURIComponent('¡Hola! Te regalo 20% OFF en tu primer pedido de Burger King Perú. ¡Pide aquí con sabor a la parrilla!');
  showToast('¡Enlace de invitación generado! +150 Coronas registradas tras su primer pedido', 'crown');
  window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
}

function copyReferralLink() {
  navigator.clipboard.writeText('https://burgerking.com.pe/app/ref/CAMILA150')
    .then(() => showToast('¡Enlace copiado al portapapeles! Compartelo por WhatsApp', 'info'))
    .catch(() => showToast('Enlace de referido: burgerking.com.pe/app/ref/CAMILA150', 'info'));
}

function validatePaperCode() {
  const input = document.getElementById('paperCodeInput');
  const code = input.value.trim().toUpperCase();
  if (code.includes('BK') || code.length >= 6) {
    showToast(`¡Código ${code} validado! Cupón de S/ 15.00 acreditado a tu cuenta`, 'crown');
    input.value = '';
  } else {
    showToast('Código de cupón impreso inválido', 'alert');
  }
}

// ==========================================================================
// 10. CLUB DE CORONAS (SCREEN 09)
// ==========================================================================

function filterRewardCatalog(cost, element) {
  document.querySelectorAll('#view-09-coronas .filter-pill').forEach(btn => btn.classList.remove('active'));
  element.classList.add('active');

  const cards = document.querySelectorAll('.rewards-catalog-list .reward-item-card');
  cards.forEach(card => {
    const cardCost = card.getAttribute('data-cost');
    if (cost === 'all' || cardCost === cost) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

function claimLoyaltyReward(rewardName, coronasCost, image) {
  if (appState.coronasBalance >= coronasCost) {
    appState.coronasBalance -= coronasCost;
    
    // Update balance displays
    document.getElementById('loyaltyCardBalance').textContent = appState.coronasBalance;
    document.getElementById('loyaltyTopVal').textContent = appState.coronasBalance;
    document.getElementById('topCoronasVal').textContent = appState.coronasBalance;

    addToCartDirect(`${rewardName} (Recompensa Corona)`, 0.00, image, `Canjeado con ${coronasCost} Coronas`);
    showToast(`¡Canjeaste ${rewardName} gratis por ${coronasCost} Coronas!`, 'crown');
    setTimeout(() => switchScreen('05-cart'), 450);
  } else {
    showToast(`Te faltan coronas para este premio. Tu saldo es ${appState.coronasBalance}`, 'alert');
  }
}

function openRewardsHistoryModal() {
  showToast('Mostrando historial de movimientos y puntos acumulados', 'receipt');
}

function showMissionsModal() {
  showToast('Misión 1: Pide 2 combos Whopper en 7 días (+100c)\nMisión 2: Añade un Sundae (+50c)', 'crown');
}

// ==========================================================================
// 11. MI PERFIL & INDECOPI LIBRO DE RECLAMACIONES (SCREEN 10)
// ==========================================================================

function openSupportWhatsApp() {
  window.open('https://api.whatsapp.com/send?phone=51987654321&text=Hola%20Burger%20King%20Per%C3%BA,%20necesito%20asistencia', '_blank');
}

function openLibroReclamaciones() {
  const modal = document.getElementById('modalLibroReclamaciones');
  if (modal) modal.classList.add('active');
}

function openLegalModal() {
  const modal = document.getElementById('modalLegal');
  if (modal) modal.classList.add('active');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
}

function openEditProfileModal() {
  const nameIn = document.getElementById('editProfName');
  const emailIn = document.getElementById('editProfEmail');
  const phoneIn = document.getElementById('editProfPhone');
  if (nameIn) nameIn.value = appState.user.name;
  if (emailIn) emailIn.value = appState.user.email;
  if (phoneIn) phoneIn.value = appState.user.phone;
  const modal = document.getElementById('modalEditProfile');
  if (modal) modal.classList.add('active');
}

function saveProfileModal(event) {
  event.preventDefault();
  const nameIn = document.getElementById('editProfName');
  const emailIn = document.getElementById('editProfEmail');
  const phoneIn = document.getElementById('editProfPhone');
  if (nameIn && nameIn.value.trim()) appState.user.name = nameIn.value.trim();
  if (emailIn && emailIn.value.trim()) appState.user.email = emailIn.value.trim();
  if (phoneIn && phoneIn.value.trim()) appState.user.phone = phoneIn.value.trim();
  try {
    localStorage.setItem('bk_peru_user', JSON.stringify(appState.user));
  } catch (e) {}
  syncUserProfileUI();
  closeModal('modalEditProfile');
  showToast('¡Datos de tu perfil actualizados con éxito!', 'success');
}

function openEditAddressModal() {
  const addrIn = document.getElementById('editAddrInput');
  if (addrIn && appState.user.address) addrIn.value = appState.user.address;
  const modal = document.getElementById('modalEditAddress');
  if (modal) modal.classList.add('active');
}

function saveAddressModal(event) {
  event.preventDefault();
  const addrIn = document.getElementById('editAddrInput');
  const noteIn = document.getElementById('editAddrNoteInput');
  if (addrIn && addrIn.value.trim()) {
    appState.user.address = addrIn.value.trim();
    document.querySelectorAll('.address-preview-text p, .addr-text').forEach((el, idx) => {
      if (idx === 0) el.textContent = appState.user.address;
    });
  }
  if (noteIn && noteIn.value.trim()) {
    const noteSpan = document.querySelector('.delivery-note-pill span:nth-child(2)');
    if (noteSpan) noteSpan.textContent = `Nota: "${noteIn.value.trim()}"`;
  }
  try {
    localStorage.setItem('bk_peru_user', JSON.stringify(appState.user));
  } catch (e) {}
  closeModal('modalEditAddress');
  showToast('Dirección y referencia de entrega actualizadas', 'bike');
}

function selectSavedAddress(address, label) {
  appState.user.address = address;
  const checkoutAddrTitle = document.querySelector('.address-preview-text strong');
  const checkoutAddrText = document.querySelector('.address-preview-text p');
  if (checkoutAddrTitle) checkoutAddrTitle.textContent = label;
  if (checkoutAddrText) checkoutAddrText.textContent = address;
  showToast(`Dirección activa: ${label}`, 'bike');
}

function openAddCardModal() {
  const modal = document.getElementById('modalAddCard');
  if (modal) modal.classList.add('active');
}

function saveNewCardModal(event) {
  event.preventDefault();
  const numIn = document.getElementById('newCardNumber');
  const raw = (numIn && numIn.value.trim()) ? numIn.value.replace(/\s+/g, '') : '45579920';
  const last4 = raw.slice(-4) || '9920';
  const chipsRow = document.querySelector('.payment-chips-row');
  if (chipsRow) {
    const chip = document.createElement('div');
    chip.className = 'pay-chip';
    chip.innerHTML = `<span><svg class="bk-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> Tarjeta •••• ${last4}</span><span class="chip-status">Activa</span>`;
    chipsRow.appendChild(chip);
  }
  closeModal('modalAddCard');
  showToast(`¡Tarjeta terminada en ${last4} vinculada con éxito!`, 'card');
}

function submitReclamacion(event) {
  event.preventDefault();
  closeModal('modalLibroReclamaciones');
  const code = `HR-2026-DELOSI-${Math.floor(10000 + Math.random() * 90000)}`;
  showToast(`¡Hoja de Reclamación ${code} registrada ante Indecopi! Copia enviada a tu correo.`, 'institution');
}

// ==========================================================================
// 12. TOAST NOTIFICATIONS HELPER
// ==========================================================================

let toastTimeout = null;

const toastIcons = {
  flame: '<svg class="bk-icon icon-flame" viewBox="0 0 24 24" fill="none" stroke="#D62300" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3.5z"/></svg>',
  crown: '<svg class="bk-icon" viewBox="0 0 24 24" fill="none" stroke="#FFB800" stroke-width="2"><polygon points="2 4 5 18 19 18 22 4 15 10 12 4 9 10 2 4"/></svg>',
  bag: '<svg class="bk-icon" viewBox="0 0 24 24" fill="none" stroke="#D62300" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
  bike: '<svg class="bk-icon" viewBox="0 0 24 24" fill="none" stroke="#D62300" stroke-width="2"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><path d="M15 6h2"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>',
  car: '<svg class="bk-icon" viewBox="0 0 24 24" fill="none" stroke="#D62300" stroke-width="2"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9C2.1 11.1 2 11.5 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>',
  success: '<svg class="bk-icon" viewBox="0 0 24 24" fill="none" stroke="#25D366" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>',
  info: '<svg class="bk-icon" viewBox="0 0 24 24" fill="none" stroke="#FFC72C" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
  alert: '<svg class="bk-icon" viewBox="0 0 24 24" fill="none" stroke="#D62300" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
  card: '<svg class="bk-icon" viewBox="0 0 24 24" fill="none" stroke="#2E282A" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>',
  cash: '<svg class="bk-icon" viewBox="0 0 24 24" fill="none" stroke="#25D366" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/></svg>',
  receipt: '<svg class="bk-icon" viewBox="0 0 24 24" fill="none" stroke="#2E282A" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
  phone: '<svg class="bk-icon" viewBox="0 0 24 24" fill="none" stroke="#D62300" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
  whatsapp: '<svg class="bk-icon icon-whatsapp" viewBox="0 0 24 24" fill="#25D366"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67Z"/></svg>',
  institution: '<svg class="bk-icon" viewBox="0 0 24 24" fill="none" stroke="#2E282A" stroke-width="2"><line x1="2" y1="22" x2="22" y2="22"/><polyline points="2 7 12 2 22 7"/><line x1="6" y1="7" x2="6" y2="22"/><line x1="10" y1="7" x2="10" y2="22"/><line x1="14" y1="7" x2="14" y2="22"/><line x1="18" y1="7" x2="18" y2="22"/></svg>'
};

function showToast(message, iconKey = 'flame') {
  const toast = document.getElementById('toastMessage');
  const iconEl = document.getElementById('toastIcon');
  const textEl = document.getElementById('toastText');

  if (!toast) return;

  iconEl.innerHTML = toastIcons[iconKey] || toastIcons.flame;
  textEl.textContent = message;

  toast.classList.add('active');

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('active');
  }, 3200);
}

// Close Modals when clicking outside
document.querySelectorAll('.modal-backdrop').forEach(modal => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });
});

// Initialize on Load
document.addEventListener('DOMContentLoaded', () => {
  try {
    const savedUser = localStorage.getItem('bk_peru_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      if (parsed && parsed.name) {
        appState.user = { ...appState.user, ...parsed };
      }
    }
  } catch (e) {}

  syncUserProfileUI();
  recalculateCart();
  renderCartItems();
  switchScreen('01-login');
});

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
