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
    const isOpen = gift.classList.contains('show');
    document.querySelectorAll('.profile-gift').forEach(g => g.classList.remove('show'));
    if (!isOpen) {
      gift.classList.add('show');
    }
  });
});
document.addEventListener('click', function() {
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

  // Удаляю прежний вызов setAtmosphericGlow();
  // setAtmosphericGlow();
  // setInterval(setAtmosphericGlow, 60000); // убираю прежний таймер

  // Новый способ: цвет устанавливается только после загрузки погоды
  function updateGlowAfterWeather() {
    setAtmosphericGlow();
    // Обновлять цвет раз в минуту только если погода успешно загружена
    if (window.__glowInterval) clearInterval(window.__glowInterval);
    window.__glowInterval = setInterval(setAtmosphericGlow, 60000);
  }
  window.addEventListener('weatherLoaded', updateGlowAfterWeather);

  // Если погода уже загружена к моменту инициализации (например, скрипт перезапущен)
  if (window.__lastWeatherData) {
    setAtmosphericGlow();
    if (window.__glowInterval) clearInterval(window.__glowInterval);
    window.__glowInterval = setInterval(setAtmosphericGlow, 60000);
  }

  // Накопительное расширение свечения при кликах
  let glowLevel = 0;
  let glowTimeout = null;
  const REJECT_THRESHOLD = 6;

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
    if (glowLevel >= REJECT_THRESHOLD) {
      avatar.classList.add('reject-shake');
      setTimeout(() => {
        avatar.classList.remove('reject-shake');
        glowLevel = 0;
        setAtmosphericGlow();
      }, 900); // длительность анимации
      return;
    }
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
    cloud: `<span style="font-size:32px;line-height:1;user-select:none;">☁️</span>`,
    star: `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><polygon points="16,4 19,13 29,13 21,19 24,28 16,22 8,28 11,19 3,13 13,13" fill="#fff"/></svg>`
  };
  const container = document.querySelector('.flying-bags');
  if (!container) return;
  const OBJ_COUNT = 11;
  function random(min, max) { return Math.random() * (max - min) + min; }

  // Получаем точное время Екатеринбурга (если есть)
  function getEkbHour() {
    if (window.__ekbTime) {
      let ekb = new Date(window.__ekbTime);
      if (window.__ekbTimeFetchLocal) {
        const diff = Date.now() - window.__ekbTimeFetchLocal;
        ekb = new Date(ekb.getTime() + diff);
      }
      return ekb.getHours();
    }
    // fallback: local time
    return new Date().getHours();
  }

  // Получаем текущую погоду (Rain/Drizzle/Clouds/...) из window.__lastWeatherData
  function getWeatherMain() {
    if (window.__lastWeatherData && window.__lastWeatherData.weather && window.__lastWeatherData.weather[0]) {
      return window.__lastWeatherData.weather[0].main;
    }
    return null;
  }

  function getIconType() {
    const hour = getEkbHour();
    const weather = getWeatherMain();
    // Если дождь — только облака
    if (weather === 'Rain' || weather === 'Drizzle') return 'cloud';
    // Если ночь по Екатеринбургу (22:00–4:00) — только звёзды
    if (hour >= 22 || hour < 4) return 'star';
    // В остальное время — ничего не падает
    return null;
  }

  function launchObj(obj, iconType) {
    if (!iconType) {
      obj.style.opacity = 0;
      setTimeout(() => launchObj(obj, getIconType()), 3000);
      return;
    }
    obj.innerHTML = ICONS[iconType];
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
        launchObj(obj, getIconType());
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
      launchObj(obj, getIconType());
    }, 1200);
  }
  for (let i = 0; i < OBJ_COUNT; ++i) {
    const iconType = getIconType();
    const obj = document.createElement('div');
    obj.className = 'flying-bag collectable';
    if (iconType) obj.innerHTML = ICONS[iconType];
    obj.addEventListener('click', () => collectObj(obj));
    container.appendChild(obj);
    setTimeout(() => launchObj(obj, getIconType()), i * 900 + Math.random() * 500);
  }
  // Обновлять объекты при смене погоды или времени
  window.addEventListener('weatherLoaded', () => {
    document.querySelectorAll('.flying-bag.collectable').forEach(obj => launchObj(obj, getIconType()));
  });
  window.addEventListener('ekbTimeLoaded', () => {
    document.querySelectorAll('.flying-bag.collectable').forEach(obj => launchObj(obj, getIconType()));
  });
})();

// Корректировка позиции pop-up подарков, чтобы не выходили за пределы окна
function adjustGiftPopupPosition(gift) {
  const popup = gift.querySelector('.gift-popup');
  if (!popup) return;
  // Сбросить классы и стили
  popup.classList.remove('left', 'right', 'bottom');
  popup.style.left = '';
  popup.style.right = '';
  popup.style.top = '';
  popup.style.bottom = '';
  popup.style.transform = '';
  // Получить координаты
  const rect = popup.getBoundingClientRect();
  const pad = 8;
  let needAdjust = false;
  // Если выходит за левую границу
  if (rect.left < pad) {
    popup.style.left = (pad - rect.left) + 'px';
    needAdjust = true;
  }
  // Если выходит за правую границу
  if (rect.right > window.innerWidth - pad) {
    // Смещаем влево на разницу
    const shift = rect.right - (window.innerWidth - pad);
    popup.style.left = (parseInt(popup.style.left || 0) - shift) + 'px';
    needAdjust = true;
  }
  // Если выходит за верхнюю границу
  if (rect.top < pad) {
    popup.classList.add('bottom');
    needAdjust = true;
  }
  // Если не нужно корректировать, сбрасываем left
  if (!needAdjust) {
    popup.style.left = '';
  }
}
// Навешиваем обработчик на все подарки
function setupGiftPopupAdjust() {
  document.querySelectorAll('.profile-gift').forEach(gift => {
    gift.addEventListener('mouseenter', () => {
      setTimeout(() => adjustGiftPopupPosition(gift), 10);
    });
  });
}
setupGiftPopupAdjust();

// Анимация нажатия для подарков
function setupGiftPressAnimation() {
  document.querySelectorAll('.profile-gift').forEach(gift => {
    gift.addEventListener('mousedown', () => {
      gift.classList.remove('gift-press');
      void gift.offsetWidth; // reflow для повторной анимации
      gift.classList.add('gift-press');
      setTimeout(() => {
        gift.classList.remove('gift-press');
      }, 330);
    });
  });
}
setupGiftPressAnimation();

// DEBUG: Проверка добавления класса show
document.querySelectorAll('.profile-gift').forEach(gift => {
  gift.addEventListener('click', function(e) {
    e.stopPropagation();
    document.querySelectorAll('.profile-gift').forEach(g => g.classList.remove('show'));
    this.classList.add('show');
    // DEBUG: Выводим в консоль
    console.log('show added to', this);
    // Добавлено: корректировка позиции pop-up при клике
    adjustGiftPopupPosition(this);
  });
});
document.addEventListener('click', function() {
  document.querySelectorAll('.profile-gift').forEach(g => g.classList.remove('show'));
});

// Анимация отторжения для надписи PAKET
(function paketNameRejectShake() {
  const name = document.querySelector('.profile-name');
  if (!name) return;
  name.addEventListener('click', () => {
    name.classList.add('reject-shake');
    setTimeout(() => {
      name.classList.remove('reject-shake');
    }, 900);
  });
})();

(function paketAbsorbLogic() {
  const name = document.querySelector('.profile-name');
  const avatar = document.querySelector('.avatar');
  if (!name || !avatar) return;
  let clickStreak = 0;
  let lastClick = 0;
  let absorbStage = 0; // 0: обычный, 1: shake-режим, 2: поглощение
  let absorbed = false;
  let shakeInProgress = false;

  function playExpand(level) {
    avatar.classList.remove('avatar-expand1', 'avatar-expand2');
    void avatar.offsetWidth;
    if (level === 1) {
      avatar.classList.add('avatar-expand1');
      setTimeout(() => avatar.classList.remove('avatar-expand1'), 600);
    } else if (level === 2) {
      avatar.classList.add('avatar-expand2');
      setTimeout(() => avatar.classList.remove('avatar-expand2'), 700);
    }
  }
  function playReject(cb) {
    shakeInProgress = true;
    name.classList.remove('reject-shake');
    avatar.classList.remove('reject-shake');
    void name.offsetWidth; void avatar.offsetWidth;
    name.classList.add('reject-shake');
    avatar.classList.add('reject-shake');
    setTimeout(() => {
      name.classList.remove('reject-shake');
      avatar.classList.remove('reject-shake');
      shakeInProgress = false;
      if (cb) cb();
    }, 900);
  }
  function absorb() {
    absorbed = true;
    name.classList.add('absorb');
    avatar.classList.remove('absorb-glow');
    avatar.classList.add('absorb-expand');
    setTimeout(() => {
      name.style.display = 'none';
      avatar.classList.remove('absorb-expand');
    }, 1100);
  }
  function handleClick() {
    if (absorbed || shakeInProgress) return;
    const now = Date.now();
    if (now - lastClick > 2000) clickStreak = 0;
    lastClick = now;
    clickStreak++;
    if (absorbStage === 0) {
      if (clickStreak === 1) {
        playExpand(1);
      } else if (clickStreak === 2) {
        playExpand(2);
      } else if (clickStreak === 3) {
        playReject(() => {
          clickStreak = 0;
          absorbStage = 1;
        });
      }
    } else if (absorbStage === 1) {
      playReject(() => {
        if (clickStreak >= 3) {
          absorb();
          absorbStage = 2;
        }
      });
    }
  }
  name.addEventListener('click', handleClick);
  avatar.addEventListener('click', handleClick);
})(); 
