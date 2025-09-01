export function useIconService() {
  const iconMapping = {
    // Social Media
    'twitter.com': 'fab fa-twitter',
    'x.com': 'fab fa-x-twitter',
    'linkedin.com': 'fab fa-linkedin',
    'youtube.com': 'fab fa-youtube',
    'whatsapp.com': 'fab fa-whatsapp',

    // Tech
    'github.com': 'fab fa-github',
    'stackoverflow.com': 'fab fa-stack-overflow',
    'reddit.com': 'fab fa-reddit',
    'discord.com': 'fab fa-discord',
    'medium.com': 'fab fa-medium',

    // Islamic Sites
    'islamqa.info': 'fas fa-mosque',
    'quran.com': 'fas fa-book-quran',
    'sunnah.com': 'fas fa-book-open',
    'islamweb.net': 'fas fa-crescent',
    'islamhouse.com': 'fas fa-mosque',
    'islamicfinder.org': 'fas fa-compass',

    // Google Services
    'gmail.com': 'fas fa-envelope',
    'drive.google.com': 'fab fa-google-drive',
    'docs.google.com': 'fas fa-file-alt',
    'maps.google.com': 'fas fa-map-marked-alt',

    // E-commerce
    'amazon.com': 'fab fa-amazon',
    'ebay.com': 'fab fa-ebay',

    // Entertainment
    'netflix.com': 'fas fa-film',
    'spotify.com': 'fab fa-spotify',
    'twitch.tv': 'fab fa-twitch',

    // Others
    'wikipedia.org': 'fab fa-wikipedia-w',
    'paypal.com': 'fab fa-paypal',
  }

  const normalizeUrl = (url) => {
    if (!url) return url

    // Remove whitespace
    url = url.trim()

    // Add https:// if no protocol
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url
    }

    return url
  }

  const getIconForDomain = (url) => {
    const domain = new URL(normalizeUrl(url)).hostname.replace('www.', '')

    if (iconMapping[domain]) {
      return iconMapping[domain]
    }

    for (const [key, icon] of Object.entries(iconMapping)) {
      if (domain.includes(key)) {
        return icon
      }
    }
    return null
  }

  const fetchWebsiteIcon = async (url) => {
    const cleanUrl = normalizeUrl(url)
    try {
      const domain = new URL(cleanUrl).hostname
      const faviconServices = [
        `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
        `https://favicon.yandex.net/favicon/${domain}`
      ]

      for (const service of faviconServices) {
        try {
          await fetch(service, { mode: 'no-cors' })
          return service
        } catch {
          continue
        }
      }
    } catch (error) {
      console.log('Error fetching favicon:', error)
    }
    return null
  }

  return {
    getIconForDomain,
    fetchWebsiteIcon,
    normalizeUrl
  }
}