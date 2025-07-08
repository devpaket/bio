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