import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { GeneratedResumeData } from '@/context/ResumeContext';

const TEMPLATE_COLORS: Record<string, { accent: string; text: string }> = {
  chronological: { accent: '#2c3e50', text: '#ffffff' },
  functional: { accent: '#6a1b9a', text: '#ffffff' },
  hybrid: { accent: '#1565c0', text: '#ffffff' },
  mini: { accent: '#ef6c00', text: '#ffffff' },
  'student-entry': { accent: '#00897b', text: '#ffffff' },
  creative: { accent: '#FF4081', text: '#ffffff' },
  executive: { accent: '#1A237E', text: '#ffffff' },
};

function buildResumeHTML(data: GeneratedResumeData, templateId: string, base64Photo?: string, legacyColors?: boolean): string {
  const isPhotoTemplate = templateId.includes('photo');
  const hasPhoto = isPhotoTemplate && base64Photo;

  // Extract sections
  const contactSection = data.sections.find(s => s.title.toLowerCase().includes('contact'));
  const summarySection = data.sections.find(s => 
    s.title.toLowerCase().includes('summary') || 
    s.title.toLowerCase().includes('objective') || 
    s.title.toLowerCase().includes('profile')
  );
  
  const mainSections = data.sections.filter(s => 
    !s.title.toLowerCase().includes('contact') && 
    !(s.title.toLowerCase().includes('summary') || s.title.toLowerCase().includes('objective') || s.title.toLowerCase().includes('profile'))
  );

  let headerHTML = '';
  
  if (contactSection) {
    // If the old resume cached the broken photo url text, strip it out dynamically here
    const lines = contactSection.content
      .split('\n')
      .filter(l => l.trim() && !l.includes('Photo: file://'));

    const name = lines.length > 0 ? lines[0] : '';
    const otherContact = lines.slice(1).join(' | ');
    
    headerHTML += `
      <div style="text-align: ${hasPhoto ? 'left' : 'center'}; margin-bottom: 8px;">
        <h1 style="margin: 0; font-size: 26px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">${name}</h1>
        <p style="margin: 6px 0 0 0; font-size: 11px; color: #444;">${otherContact}</p>
      </div>
    `;
  }
  
  if (summarySection) {
    headerHTML += `
      <div style="text-align: justify; font-size: 11px; line-height: 1.5; margin-bottom: 24px;">
        ${summarySection.content}
      </div>
    `;
  }

  // Wrap header to support left-aligned photo
  let topAreaHTML = headerHTML;
  if (hasPhoto) {
    topAreaHTML = `
      <div style="display: flex; flex-direction: row; align-items: flex-start; margin-bottom: 24px;">
        <div style="width: 100px; height: 100px; flex-shrink: 0; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; margin-right: 20px;">
          <img src="${base64Photo}" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>
        <div style="flex: 1;">
          ${headerHTML}
        </div>
      </div>
    `;
  }

  const sectionsHTML = mainSections
    .map((section) => {
      const isSkills = section.title.toLowerCase().includes('skill');
      const isProjects = section.title.toLowerCase().includes('project') || section.title.toLowerCase().includes('achievement');
      
      let bodyHTML = '';
      
      if (isSkills) {
        // Try to render skills as a table if it looks like "Category: Skill1, Skill2"
        const lines = section.content.split('\n').filter(l => l.trim());
        const rows = lines.map(line => {
          const cleanLine = line.replace(/^•\s*/, '').trim();
          const parts = cleanLine.split(':');
          if (parts.length >= 2) {
            return `<tr><td style="width: 25%; font-weight: bold; padding: 4px 0; border-bottom: 1px solid #eee;">${parts[0].trim()}</td><td style="padding: 4px 0; border-bottom: 1px solid #eee;">${parts.slice(1).join(':').trim()}</td></tr>`;
          }
          return `<tr><td colspan="2" style="padding: 4px 0; border-bottom: 1px solid #eee;">${cleanLine}</td></tr>`;
        }).join('');
        
        bodyHTML = `
          <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 6px;">
            ${rows}
          </table>
        `;
      } else if (isProjects) {
        // Render projects/achievements as a numbered list
        const lines = section.content.split('\n').filter(l => l.trim());
        let listItems = '';
        let currentItem = '';
        
        lines.forEach(line => {
          if (line.match(/^\d+\. /) || line.match(/^[A-Z][a-z]+:/)) {
            // New item
            if (currentItem) listItems += `<li style="margin-bottom: 8px;">${currentItem}</li>`;
            currentItem = line.replace(/^\d+\.\s*/, '');
          } else if (line.trimStart().startsWith('•')) {
             currentItem += `<br/>&nbsp;&nbsp;• ${line.replace(/^•\s*/, '')}`;
          } else {
            currentItem += `<br/>${line}`;
          }
        });
        if (currentItem) listItems += `<li style="margin-bottom: 8px;">${currentItem}</li>`;
        
        bodyHTML = `
          <ol style="font-size: 11px; padding-left: 20px; line-height: 1.5; margin-top: 6px;">
            ${listItems}
          </ol>
        `;
      } else {
        // Default rendering for work/education
        const lines = section.content.split('\n').filter((l) => l.trim());
        const paragraphs = lines
          .filter((line) => !line.trimStart().startsWith('•'))
          .map((line) => {
            // Bold the role/company line if it looks like "Role - Company | Date"
            if (line.includes('|') || line.includes(' - ')) {
               return `<p style="margin:6px 0 2px 0; font-weight: bold;">${line}</p>`;
            }
            return `<p style="margin:2px 0">${line}</p>`;
          })
          .join('');
        const bulletItems = lines
          .filter((line) => line.trimStart().startsWith('•'))
          .map((line) => `<li>${line.replace(/^\s*•\s*/, '').trim()}</li>`)
          .join('');
          
        const bullets = bulletItems
          ? `<ul style="margin:4px 0 0;padding-left:14px;list-style:disc;">${bulletItems}</ul>`
          : '';
          
        bodyHTML = `
          <div style="font-size: 11px; line-height: 1.5; margin-top: 6px;">
            ${paragraphs}
            ${bullets}
          </div>
        `;
      }

      const colors = TEMPLATE_COLORS[templateId] ?? TEMPLATE_COLORS.chronological;
      const headerStyles = legacyColors 
        ? `background:${colors.accent};color:${colors.text};padding:7px 14px;border-radius:3px;margin: 0 0 8px 0;` 
        : `color: #000; margin: 0 0 4px 0; padding-bottom: 4px; border-bottom: 1px solid #000;`;

      return `
        <div style="margin-bottom: 16px;">
          <h2 style="font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; ${headerStyles}">
            ${section.title}
          </h2>
          ${bodyHTML}
        </div>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 40px; color: #000; background: #fff; }
    ul { margin: 4px 0; padding-left: 14px; }
    ol { margin: 4px 0; padding-left: 18px; }
    li { margin-bottom: 3px; }
    p { margin: 4px 0; }
    * { box-sizing: border-box; }
  </style>
</head>
<body>
  ${topAreaHTML}
  ${sectionsHTML}
</body>
</html>`;
}

function buildResumeFileName(templateId: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `resume-${templateId}-${timestamp}.pdf`;
}

export async function exportResumeToPDF(
  data: GeneratedResumeData,
  templateId: string,
  legacyColors?: boolean
): Promise<{ fileName: string; uri: string }> {
  // Read local file as base64 if available to render cleanly in WebKit/PDF
  let base64Photo: string | undefined = undefined;
  if (data.photoUri && templateId.includes('photo')) {
    if (data.photoUri.startsWith('data:image')) {
      // It was already converted to base64 properly during Image Selection
      base64Photo = data.photoUri;
    } else {
      try {
        const FileSystem = require('expo-file-system');
        const rawBase64 = await FileSystem.readAsStringAsync(data.photoUri, { enum: 1, encoding: FileSystem.EncodingType.Base64 });
        base64Photo = `data:image/jpeg;base64,${rawBase64}`;
      } catch (err) {
        console.warn("Failed to encode photo to base64 for PDF", err);
      }
    }
  }

  const html = buildResumeHTML(data, templateId, base64Photo, legacyColors);
  const fileName = buildResumeFileName(templateId);

  // Generate PDF to app's temp cache — no permissions required.
  const { uri } = await Print.printToFileAsync({ html, base64: false });

  // Open native share sheet so user can save to Downloads, Drive, etc.
  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) {
    throw new Error('Sharing is not available on this device.');
  }

  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    dialogTitle: 'Save your resume',
    UTI: 'com.adobe.pdf',
  });

  return { fileName, uri };
}
