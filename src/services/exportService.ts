import { NewsArticle } from '../types';
import { formatDistanceToNow } from 'date-fns';

export async function exportToTxt(articles: NewsArticle[]): Promise<void> {
  const content = articles.map(article => {
    const timestamp = new Date(article.publishedAt);
    return `
Title: ${article.title}
Source: ${article.source}
Published: ${timestamp.toLocaleString()} (${formatDistanceToNow(timestamp, { addSuffix: true })})
URL: ${article.url}

${article.content || article.description}

-------------------------------------------
`;
  }).join('\n');

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `news-export-${new Date().toISOString().split('T')[0]}.txt`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function exportToPdf(articles: NewsArticle[]): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  
  let y = 10;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 10;
  const lineHeight = 7;

  articles.forEach((article, index) => {
    const timestamp = new Date(article.publishedAt);
    
    // Add new page if needed
    if (y > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }

    // Title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    const title = doc.splitTextToSize(article.title, 180);
    doc.text(title, margin, y);
    y += title.length * lineHeight;

    // Metadata
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Source: ${article.source}`, margin, y);
    y += lineHeight;
    doc.text(`Published: ${timestamp.toLocaleString()}`, margin, y);
    y += lineHeight;
    doc.text(`URL: ${article.url}`, margin, y);
    y += lineHeight * 1.5;

    // Content
    doc.setFontSize(11);
    const content = doc.splitTextToSize(article.content || article.description, 180);
    
    // Check if content fits on current page
    if (y + content.length * lineHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    
    doc.text(content, margin, y);
    y += content.length * lineHeight + 10;

    // Separator
    if (index < articles.length - 1) {
      doc.setDrawColor(200);
      doc.line(margin, y, 200 - margin, y);
      y += 10;
    }

    // Add new page for next article if close to bottom
    if (y > pageHeight - 40 && index < articles.length - 1) {
      doc.addPage();
      y = margin;
    }
  });

  doc.save(`news-export-${new Date().toISOString().split('T')[0]}.pdf`);
}