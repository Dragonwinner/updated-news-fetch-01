import { stripHtml } from '../utils/helpers';

export async function extractArticleContent(url: string): Promise<string> {
  if (!url || !url.startsWith('http')) {
    return '';
  }

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'mode': 'no-cors',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    
    // Create a DOM parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Remove unwanted elements
    const elementsToRemove = doc.querySelectorAll(
      'script, style, nav, header, footer, iframe, .ad, .advertisement, .social-share, .comments, aside'
    );
    elementsToRemove.forEach(el => el.remove());
    
    // Try multiple selectors to find the main content
    const mainSelectors = [
      'article',
      '[role="main"]',
      'main',
      '.article-content',
      '.post-content',
      '.entry-content',
      '#main-content',
    ];

    let mainContent = null;
    for (const selector of mainSelectors) {
      mainContent = doc.querySelector(selector);
      if (mainContent) break;
    }

    // If no main content found, fall back to body
    const paragraphs = (mainContent || doc.body).querySelectorAll('p');
    
    // Extract and clean text from paragraphs
    const textContent = Array.from(paragraphs)
      .map(p => p.textContent)
      .filter(text => {
        if (!text) return false;
        const cleaned = text.trim();
        // Filter out short snippets and common unwanted elements
        return cleaned.length > 50 && 
               !cleaned.includes('cookie') &&
               !cleaned.includes('subscribe') &&
               !cleaned.includes('newsletter');
      })
      .join('\n\n');
    
    return stripHtml(textContent) || 'No content could be extracted';
  } catch (error) {
    console.error('Error extracting article content:', error);
    return '';
  }
}