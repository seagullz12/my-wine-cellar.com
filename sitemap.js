
const routes = [
  { path: '/', priority: 1.0 },
  { path: '/sign-in', priority: 0.8 },
  { path: '/sign-up', priority: 0.8 },
  { path: '/cellar', priority: 0.9 },
  { path: '/personal-sommelier', priority: 0.7 },
  { path: '/add-wine', priority: 0.5 },
  { path: '/shared', priority: 0.5 },
  
];

const generateSitemap = () => {
  return `
    <?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap-image/1.1">
      ${routes
        .map(route => `
        <url>
          <loc>${`https://www.my-wine-cellar.com${route.path}`}</loc>
          <priority>${route.priority}</priority>
        </url>
      `)
        .join('')}
    </urlset>
  `;
};

module.exports = { generateSitemap };