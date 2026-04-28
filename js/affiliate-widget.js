(function () {
  if (typeof AFFILIATE_PRODUCTS === 'undefined') return;

  const placeholder = document.getElementById('affiliate-widget');
  if (!placeholder) return;

  const body = document.body;
  const category = (body.dataset.categoryId || body.dataset.category || '').toLowerCase();

  function getPageType() {
    const path = window.location.pathname;
    if (path === '/' || path === '/index.html') return 'homepage';
    if (path.startsWith('/categories/')) return 'category_page';
    if (path.startsWith('/blog/')) return 'blog';
    if (path.startsWith('/color/')) return 'coloring_page';
    return 'other';
  }

  const pool = AFFILIATE_PRODUCTS.filter(p =>
    p.categories.includes('all') || (category && p.categories.includes(category))
  );

  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const picks = pool.slice(0, 3);

  if (picks.length === 0) return;

  const HEADINGS = [
    'You May Also Enjoy',
    'Supplies You\'ll Love for Your Kids',
    'Take the Fun Offline Too',
    'Perfect Picks for Little Artists',
    'Real Crayons for Real Masterpieces',
    'Bring the Colors to Life at Home',
    'Stock Up the Art Corner',
    'Great Finds for Young Artists',
    'Color Beyond the Screen',
    'Little Artists Need the Right Tools',
  ];
  const heading = HEADINGS[Math.floor(Math.random() * HEADINGS.length)];

  const TAG = 'arko09-20';

  const cards = picks.map(p => {
    const imgSrc = `https://m.media-amazon.com/images/P/${p.asin}.01.AC_SL200_.jpg`;
    return `
    <a href="https://www.amazon.com/dp/${p.asin}?tag=${TAG}"
       rel="noopener sponsored" target="_blank" class="affiliate-card">
      <div class="affiliate-img-wrap">
        <img class="affiliate-img"
             src="${imgSrc}"
             alt="${p.name}"
             onerror="this.src='/assets/img-placeholder.svg'">
      </div>
      <div class="affiliate-text">
        <span class="affiliate-name">${p.name}</span>
        <span class="affiliate-desc">${p.description}</span>
        <span class="affiliate-price">${p.price}</span>
      </div>
    </a>`;
  }).join('');

  placeholder.innerHTML = `
    <section class="affiliate-picks">
      <p class="affiliate-label">${heading}</p>
      <div class="affiliate-list">${cards}</div>
      <p class="affiliate-disclosure">As an Amazon Associate, MagicPencil earns from qualifying purchases.</p>
    </section>`;

  const pageType = getPageType();

  // Fire widget impression event
  if (typeof trackAffiliateWidgetImpression === 'function') {
    trackAffiliateWidgetImpression(
      category || 'all',
      pageType,
      picks.map(p => p.asin)
    );
  }

  // Fire click event on each affiliate card
  if (typeof trackAffiliateClick === 'function') {
    placeholder.querySelectorAll('.affiliate-card').forEach((link, i) => {
      const product = picks[i];
      if (!product) return;
      link.addEventListener('click', () => {
        trackAffiliateClick(product.asin, product.name, category || 'all', pageType);
      });
    });
  }
})();
