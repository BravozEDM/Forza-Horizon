const SOCIAL_LINKS = [
  {
    name: "Twitch",
    url: "https://www.twitch.tv/blancogmr",
    hoverClass: "hover:bg-purple-600/20 hover:border-purple-500/50",
    icon: `<svg class="w-4 h-4 text-purple-400 fill-current" viewBox="0 0 24 24"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/></svg>`
  },
  {
    name: "YouTube",
    url: "https://www.youtube.com/@BlancoGMR",
    hoverClass: "hover:bg-rose-600/20 hover:border-rose-500/50",
    icon: `<svg class="w-4 h-4 text-rose-500 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`
  },
  {
    name: "TikTok",
    url: "https://www.tiktok.com/@blanco.gmr",
    hoverClass: "hover:bg-cyan-500/20 hover:border-forza-cyan/50",
    icon: `<svg class="w-4 h-4 text-forza-cyan fill-current" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>`
  },
  {
    name: "Instagram",
    url: "https://www.instagram.com/",
    hoverClass: "hover:bg-pink-600/20 hover:border-pink-500/50",
    icon: `<svg class="w-4 h-4 text-pink-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>`
  }
];

function renderSocialLinks() {
  const container = document.getElementById("social-links");
  if (!container) return;

  container.innerHTML = SOCIAL_LINKS.map(item => `
    <a href="${item.url}" target="_blank" rel="noopener noreferrer"
       class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-carbon-850 ${item.hoverClass} border border-white/10 text-slate-200 hover:text-white text-xs font-bold transition"
       title="${item.name}">
      ${item.icon}
      <span>${item.name}</span>
    </a>
  `).join("");
}

document.addEventListener("DOMContentLoaded", renderSocialLinks);
