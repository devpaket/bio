document.querySelectorAll('.badge').forEach(badge => {
  badge.addEventListener('click', () => {
    const key = badge.dataset.badge;
    if (key === 'live') {
      window.open('https://t.me/paket_6', '_blank');
      return;
    }
    if (key === 'bet') {
      window.open('https://t.me/+y3GV5Plgo8VmYjQy', '_blank');
      return;
    }
    // Остальные — раскрытие секции
    const section = document.getElementById('section-' + key);
    if (section) {
      section.classList.toggle('open');
    }
  });
});

document.querySelectorAll('.profile-gift').forEach(gift => {
  gift.addEventListener('click', (e) => {
    e.stopPropagation();
    document.querySelectorAll('.profile-gift').forEach(g => g.classList.remove('show'));
    gift.classList.toggle('show');
  });
});
document.addEventListener('click', () => {
  document.querySelectorAll('.profile-gift').forEach(g => g.classList.remove('show'));
});

// === Единый погодный fetch для всех ===
(function() {
  const API_KEY = '9adcd69f0503af2c8fc3fa678e330e5c';
  const CITY = 'Yekaterinburg,ru';
  const avatar = document.querySelector('.avatar');
  if (!avatar) return;

  function getTimeOfDay(dt, timezone) {
    const local = new Date((dt + timezone) * 1000);
    const hour = local.getUTCHours();
    if (hour >= 4 && hour < 7) return 'dawn';
    if (hour >= 7 && hour < 19) return 'day';
    if (hour >= 19 && hour < 22) return 'sunset';
    if (hour >= 22 || hour < 4) return 'night';
    return 'day';
  }

  function setWeatherEffect(weather, timeOfDay) {
    avatar.classList.remove(
      'weather-sunny', 'weather-clouds', 'weather-rain', 'weather-snow', 'weather-thunder', 'weather-fog',
      'day-morning', 'day-day', 'day-evening', 'day-night', 'day-dawn', 'day-sunset'
    );
    avatar.classList.add('day-' + timeOfDay);
    switch (weather) {
      case 'Clear': avatar.classList.add('weather-sunny'); break;
      case 'Clouds': avatar.classList.add('weather-clouds'); break;
      case 'Rain': case 'Drizzle': avatar.classList.add('weather-rain'); break;
      case 'Snow': avatar.classList.add('weather-snow'); break;
      case 'Thunderstorm': avatar.classList.add('weather-thunder'); break;
      case 'Mist': case 'Smoke': case 'Haze': case 'Fog': case 'Dust': case 'Sand': case 'Ash': avatar.classList.add('weather-fog'); break;
      default: break;
    }
  }

  // УБРАН CORS-прокси, запрос напрямую к OpenWeatherMap
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${API_KEY}&lang=ru&units=metric`)
    .then(r => r.json())
    .then(data => {
      if (data && data.weather && data.weather[0] && data.dt && data.timezone !== undefined) {
        const timeOfDay = getTimeOfDay(data.dt, data.timezone);
        setWeatherEffect(data.weather[0].main, timeOfDay);
        window.__lastWeatherData = data;
        window.dispatchEvent(new Event('weatherLoaded'));
      } else {
        window.__lastWeatherData = { error: true };
        window.dispatchEvent(new Event('weatherLoaded'));
      }
    })
    .catch(() => {
      window.__lastWeatherData = { error: true };
      window.dispatchEvent(new Event('weatherLoaded'));
    });
})();

(function atmosphericAvatarGlow() {
  const avatar = document.querySelector('.avatar');
  if (!avatar) return;

  function getTimeOfDayCustom(dt, timezone) {
    // Определяем локальное время (часы)
    const local = dt ? new Date((dt + timezone) * 1000) : new Date();
    const hour = local.getUTCHours();
    if (hour >= 4 && hour < 7) return 'dawn';      // рассвет
    if (hour >= 7 && hour < 19) return 'day';      // день
    if (hour >= 19 && hour < 22) return 'sunset';  // закат
    if (hour >= 22 || hour < 4) return 'night';    // ночь
    return 'day';
  }

  // Атмосферные цвета для неба Екатеринбурга по погоде и времени суток
  const skyGlow = {
    'Clear.dawn':    ['#fce4ec'], // рассвет: розово-голубой
    'Clear.day':     ['#81d4fa'], // день: ярко-голубой
    'Clear.sunset':  ['#ffb74d'], // закат: оранжево-розовый
    'Clear.night':   ['#283593'], // ночь: тёмно-синий
    'Clouds.dawn':   ['#b0bec5'],
    'Clouds.day':    ['#cfd8dc'],
    'Clouds.sunset': ['#ffccbc'],
    'Clouds.night':  ['#263238'],
    'Rain.dawn':     ['#90a4ae'],
    'Rain.day':      ['#455a64'],
    'Rain.sunset':   ['#607d8b'],
    'Rain.night':    ['#212121'],
    'Drizzle.dawn':  ['#90a4ae'],
    'Drizzle.day':   ['#455a64'],
    'Drizzle.sunset':['#607d8b'],
    'Drizzle.night': ['#212121'],
    'Snow.dawn':     ['#e3f2fd'],
    'Snow.day':      ['#b3e5fc'],
    'Snow.sunset':   ['#fffde7'],
    'Snow.night':    ['#78909c'],
    'Mist.dawn':     ['#eceff1'],
    'Mist.day':      ['#b0bec5'],
    'Mist.sunset':   ['#ffe082'],
    'Mist.night':    ['#263238'],
    'Fog.dawn':      ['#eceff1'],
    'Fog.day':       ['#b0bec5'],
    'Fog.sunset':    ['#ffe082'],
    'Fog.night':     ['#263238'],
    'Thunderstorm.dawn':    ['#ffd600'],
    'Thunderstorm.day':     ['#ffd600'],
    'Thunderstorm.sunset':  ['#ffb300'],
    'Thunderstorm.night':   ['#000'],
    // fallback
    'default':       ['#b3e5fc']
  };

  function getWeatherTimeKeyCustom() {
    // Определяем погоду и время суток по классам
    const weather = Array.from(avatar.classList).find(c => c.startsWith('weather-'));
    let w = 'Clear';
    if (weather) w = weather.replace('weather-','');
    // Получаем время суток по дате (если есть глобальные данные о погоде)
    let t = 'day';
    if (window.__lastWeatherData && window.__lastWeatherData.dt && window.__lastWeatherData.timezone !== undefined) {
      t = getTimeOfDayCustom(window.__lastWeatherData.dt, window.__lastWeatherData.timezone);
    } else {
      t = getTimeOfDayCustom();
    }
    return `${w}.${t}`;
  }

  function hexToRgb(hex) {
    let c = hex.replace('#','');
    if (c.length === 3) c = c[0]+c[0]+c[1]+c[1]+c[2]+c[2];
    const num = parseInt(c,16);
    return [ (num>>16)&255, (num>>8)&255, num&255 ];
  }
  function rgbToHex([r,g,b]) {
    return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
  }
  function pulseColor(hex, percent) {
    // Делает цвет чуть ярче/тусклее на percent (-0.1..+0.1)
    let [r,g,b] = hexToRgb(hex);
    r = Math.min(255, Math.max(0, Math.round(r + (255 - r) * percent)));
    g = Math.min(255, Math.max(0, Math.round(g + (255 - g) * percent)));
    b = Math.min(255, Math.max(0, Math.round(b + (255 - b) * percent)));
    return rgbToHex([r,g,b]);
  }

  function setAtmosphericGlow() {
    const key = getWeatherTimeKeyCustom();
    const base = skyGlow[key] || skyGlow['default'];
    avatar.style.boxShadow = `0 0 48px 18px ${base[0]}`;
    avatar.style.setProperty('--glow-color', base[0]);
  }
  setAtmosphericGlow();
  setInterval(setAtmosphericGlow, 60000); // обновлять раз в минуту

  // Накопительное расширение свечения при кликах
  let glowLevel = 0;
  let glowTimeout = null;
  function updateGlowExpand() {
    // Максимальный радиус — 48 + 32*glowLevel (ограничим до 5 кликов)
    const key = getWeatherTimeKeyCustom();
    const base = skyGlow[key] || skyGlow['default'];
    const radius = 48 + Math.min(glowLevel, 5) * 32;
    const spread = 18 + Math.min(glowLevel, 5) * 10;
    avatar.style.boxShadow = `0 0 ${radius}px ${spread}px ${base[0]}`;
    avatar.style.setProperty('--glow-color', base[0]);
  }
  avatar.addEventListener('click', () => {
    glowLevel++;
    updateGlowExpand();
    if (glowTimeout) clearTimeout(glowTimeout);
    glowTimeout = setTimeout(() => {
      glowLevel = 0;
      setAtmosphericGlow();
    }, 1400);
  });
})();

// === Получение точного времени Екатеринбурга через worldtimeapi.org ===
(function fetchEkaterinburgTime() {
  fetch('https://worldtimeapi.org/api/timezone/Asia/Yekaterinburg')
    .then(r => r.json())
    .then(data => {
      if (data && data.datetime) {
        window.__ekbTime = new Date(data.datetime);
        window.dispatchEvent(new Event('ekbTimeLoaded'));
      }
    })
    .catch(() => {});
})();

(function profileFactsRotator() {
  function getWeather() {
    if (window.__lastWeatherData && window.__lastWeatherData.weather && window.__lastWeatherData.weather[0]) {
      return window.__lastWeatherData.weather[0].description;
    }
    if (window.__lastWeatherData && window.__lastWeatherData.error) {
      return 'Погода не загружена';
    }
    return 'Погода загружается...';
  }
  function getTime() {
    // Используем точное время из worldtimeapi.org, если оно есть
    if (window.__ekbTime) {
      let ekb = new Date(window.__ekbTime);
      if (window.__ekbTimeFetchLocal) {
        const diff = Date.now() - window.__ekbTimeFetchLocal;
        ekb = new Date(ekb.getTime() + diff);
      }
      // Вычитаем 3 часа
      ekb = new Date(ekb.getTime() - 3 * 3600 * 1000);
      return ekb.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    }
    // Fallback: старый способ
    let ekb;
    if (window.__lastWeatherData && window.__lastWeatherData.dt) {
      ekb = new Date((window.__lastWeatherData.dt + 5 * 3600) * 1000);
      // Вычитаем 3 часа
      ekb = new Date(ekb.getTime() - 3 * 3600 * 1000);
    } else {
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      ekb = new Date(utc + 5 * 3600 * 1000);
      // Вычитаем 3 часа
      ekb = new Date(ekb.getTime() - 3 * 3600 * 1000);
    }
    return ekb.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  }
  const facts = [
    () => `Сейчас в Екатеринбурге: <b>${getWeather()}</b>`,
    () => 'Пишу код на <b>Python</b> и <b>JavaScript</b>',
    () => '<a class="tg-mini-btn" href="https://t.me/Dev_Paket" target="_blank">Telegram</a>',
    () => 'В CRMP-сфере с <b>2022</b> года',
    () => 'Проект <b>PaketBet</b> основан год назад',
    () => 'Играю в <b>BlackRussia</b> на сервере <span style="color:#4fc3f7;font-weight:600;">Kazan (27)</span>',
    () => 'Мой первый проект — <b>BlackRP</b>'
  ];
  const el = document.querySelector('.profile-facts');
  if (!el) return;
  let idx = 0;
  let intervalId = null;
  let started = false;
  function showFact(i) {
    el.style.opacity = 0;
    setTimeout(() => {
      el.innerHTML = facts[i % facts.length]();
      el.style.opacity = 0.93;
    }, 320);
  }
  function startRotation() {
    if (started) return;
    started = true;
    if (intervalId) clearInterval(intervalId);
    showFact(idx);
    intervalId = setInterval(() => {
      idx = (idx + 1) % facts.length;
      showFact(idx);
    }, 5000);
    // Удалено: обновление текущего факта каждую минуту
  }
  if (window.__lastWeatherData) {
    startRotation();
  } else {
    window.addEventListener('weatherLoaded', startRotation, { once: true });
    // Fallback: если погода не загрузилась за 3 секунды, запускаем ротацию с заглушкой
    setTimeout(() => {
      if (!started) startRotation();
    }, 3000);
  }
  // Обновлять факт с погодой и временем при каждом новом weatherLoaded
  window.addEventListener('weatherLoaded', () => {
    showFact(idx);
  });
})();

// ДОБАВЛЯЕМ сохранение времени локального запроса для "тикающего" времени
window.addEventListener('ekbTimeLoaded', function() {
  window.__ekbTimeFetchLocal = Date.now();
});

// === КУРСЫ TON, BTC, ETH ===
(function fetchCryptoRates() {
  async function updateRates() {
    try {
      const url = 'https://api.coingecko.com/api/v3/simple/price?ids=the-open-network,bitcoin,ethereum&vs_currencies=rub';
      const res = await fetch(url);
      const data = await res.json();
      if (data['the-open-network'] && document.getElementById('ton-rate')) {
        document.getElementById('ton-rate').textContent = Math.round(data['the-open-network'].rub).toLocaleString('ru-RU');
      }
      if (data['bitcoin'] && document.getElementById('btc-rate')) {
        document.getElementById('btc-rate').textContent = Math.round(data['bitcoin'].rub).toLocaleString('ru-RU');
      }
      if (data['ethereum'] && document.getElementById('eth-rate')) {
        document.getElementById('eth-rate').textContent = Math.round(data['ethereum'].rub).toLocaleString('ru-RU');
      }
    } catch (e) {
      // fallback: ничего не делаем
    }
  }
  updateRates();
  setInterval(updateRates, 120000); // обновлять раз в 2 минуты
})();

// === ЛЕТАЮЩИЕ ПИКСЕЛЬНЫЕ ОБЪЕКТЫ ПО ВРЕМЕНИ СУТОК ===
(function flyingObjects() {
  // SVG-иконки и эмодзи
  const ICONS = {
    sun: `<span style="font-size:32px;line-height:1;user-select:none;">☁️</span>`, // облако вместо солнца
    moon: `<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M28 18c0 6.627-5.373 12-12 12-2.1 0-4.07-0.54-5.75-1.5C16.5 28 24 20.5 24 10.75c0-1.68-0.19-3.31-0.54-4.85C26.13 8.93 28 13.19 28 18z" fill="#fff"/></svg>`,
    star: `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><polygon points="16,4 19,13 29,13 21,19 24,28 16,22 8,28 11,19 3,13 13,13" fill="#fff"/></svg>`
  };
  const container = document.querySelector('.flying-bags');
  // pixel-counter больше не нужен, убираем проверку
  if (!container) return;
  const OBJ_COUNT = 11;
  function random(min, max) { return Math.random() * (max - min) + min; }
  function getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 19) return 'sun'; // утро и день
    if (hour >= 19 && hour < 23) return 'moon'; // вечер
    return 'star'; // ночь
  }
  function launchObj(obj, iconType) {
    const startX = random(0, window.innerWidth - 40);
    const endX = startX + random(-80, 80);
    const size = random(28, 48);
    const duration = random(7, 16);
    const delay = random(0, 3);
    obj.style.left = `${startX}px`;
    obj.style.top = `-60px`;
    obj.style.width = `${size}px`;
    obj.style.height = `${size}px`;
    obj.style.transition = `none`;
    obj.style.opacity = random(0.5, 0.92).toFixed(2);
    obj.style.pointerEvents = 'auto';
    obj.style.transform = 'none';
    obj.classList.remove('collected');
    requestAnimationFrame(() => {
      obj.style.transition = `transform ${duration}s linear, opacity 0.7s`;
      obj.style.transform = `translate(${endX - startX}px, ${window.innerHeight + 80}px)`;
    });
    setTimeout(() => {
      obj.style.opacity = 0;
      setTimeout(() => {
        obj.style.transition = 'none';
        obj.style.transform = 'none';
        launchObj(obj, iconType);
      }, 700);
    }, duration * 1000 + delay * 1000);
  }
  function collectObj(obj) {
    obj.classList.add('collected');
    obj.style.opacity = 0;
    obj.style.pointerEvents = 'none';
    setTimeout(() => {
      obj.style.transition = 'none';
      obj.style.transform = 'none';
      launchObj(obj, getTimeOfDay());
    }, 1200);
  }
  for (let i = 0; i < OBJ_COUNT; ++i) {
    const iconType = getTimeOfDay();
    const obj = document.createElement('div');
    obj.className = 'flying-bag collectable';
    obj.innerHTML = ICONS[iconType];
    obj.addEventListener('click', () => collectObj(obj));
    container.appendChild(obj);
    setTimeout(() => launchObj(obj, iconType), i * 900 + Math.random() * 500);
  }
})(); 
