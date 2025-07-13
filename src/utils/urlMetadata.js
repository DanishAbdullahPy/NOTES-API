const axios = require('axios');
const cheerio = require('cheerio');


const extractMetadata = async (url) => {
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      maxRedirects: 5
    });

    const $ = cheerio.load(response.data);
    
    let title = '';
    
    title = $('meta[property="og:title"]').attr('content') ||
            $('meta[name="twitter:title"]').attr('content') ||
            $('title').text() ||
            $('h1').first().text() ||
            '';
    
    title = title.trim().replace(/\s+/g, ' ').substring(0, 200);
    
    let description = '';
    
    description = $('meta[property="og:description"]').attr('content') ||
                  $('meta[name="twitter:description"]').attr('content') ||
                  $('meta[name="description"]').attr('content') ||
                  '';
    
    description = description.trim().replace(/\s+/g, ' ').substring(0, 500);
    
    // Extract favicon
    let favicon = '';
    
    favicon = $('link[rel="icon"]').attr('href') ||
              $('link[rel="shortcut icon"]').attr('href') ||
              $('link[rel="apple-touch-icon"]').attr('href') ||
              '';
    
    if (favicon && !favicon.startsWith('http')) {
      const urlObj = new URL(url);
      if (favicon.startsWith('//')) {
        favicon = urlObj.protocol + favicon;
      } else if (favicon.startsWith('/')) {
        favicon = urlObj.origin + favicon;
      } else {
        favicon = urlObj.origin + '/' + favicon;
      }
    }
    
    let image = '';
    
    image = $('meta[property="og:image"]').attr('content') ||
            $('meta[name="twitter:image"]').attr('content') ||
            '';
    
    if (image && !image.startsWith('http')) {
      const urlObj = new URL(url);
      if (image.startsWith('//')) {
        image = urlObj.protocol + image;
      } else if (image.startsWith('/')) {
        image = urlObj.origin + image;
      } else {
        image = urlObj.origin + '/' + image;
      }
    }
    
    return {
      title: title || extractTitleFromUrl(url),
      description: description || '',
      favicon: favicon || '',
      image: image || ''
    };
    
  } catch (error) {
    console.log('Metadata extraction failed for:', url, error.message);
    
    return {
      title: extractTitleFromUrl(url),
      description: '',
      favicon: '',
      image: ''
    };
  }
};


const extractTitleFromUrl = (url) => {
  try {
    const urlObj = new URL(url);
    let title = urlObj.hostname.replace('www.', '');
    
    title = title.charAt(0).toUpperCase() + title.slice(1);
    
    return title;
  } catch (error) {
    return 'Untitled';
  }
};


const isValidUrl = (url) => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch (error) {
    return false;
  }
};


const normalizeUrl = (url) => {
  if (!url) return '';
  
  url = url.trim();
  
  // Add protocol if missing
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  
  return url;
};

module.exports = {
  extractMetadata,
  extractTitleFromUrl,
  isValidUrl,
  normalizeUrl
};