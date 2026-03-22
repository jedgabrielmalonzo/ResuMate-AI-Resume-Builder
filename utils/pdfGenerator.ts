import * as Print from 'expo-print';
import { Directory, File, Paths } from 'expo-file-system';
import * as FileSystemLegacy from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
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

const DOWNLOADS_URI_KEY = '@resumate_downloads_directory_uri';

function buildResumeHTML(data: GeneratedResumeData, templateId: string): string {
  const colors = TEMPLATE_COLORS[templateId] ?? TEMPLATE_COLORS.chronological;

  const sectionsHTML = data.sections
    .map((section) => {
      const lines = section.content.split('\n').filter((l) => l.trim());
      const paragraphs = lines
        .filter((line) => !line.trimStart().startsWith('•'))
        .map((line) => {
          const isTargetRoleLine = /^(Desired Position|Target Role)\s*:/i.test(line.trim());
          if (isTargetRoleLine) {
            return `<p style="margin:4px 0 8px;text-align:center;font-weight:700;font-size:14px;letter-spacing:0.3px;color:#1f2937">${line}</p>`;
          }
          return `<p style="margin:4px 0">${line}</p>`;
        })
        .join('');
      const bulletItems = lines
        .filter((line) => line.trimStart().startsWith('•'))
        .map((line) => `<li>${line.replace(/^\s*•\s*/, '').trim()}</li>`)
        .join('');
      const bullets = bulletItems
        ? `<ul style="margin:6px 0 0;padding-left:16px;list-style:disc">${bulletItems}</ul>`
        : '';

      return `
        <div style="margin-bottom:20px">
          <div style="background:${colors.accent};color:${colors.text};padding:7px 14px;border-radius:3px;margin-bottom:8px">
            <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.1px">${section.title}</span>
          </div>
          <div style="padding:0 4px;font-size:13px;color:#333;line-height:1.65">
            ${paragraphs}
            ${bullets}
          </div>
        </div>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>
    body { font-family: Georgia, 'Times New Roman', serif; margin: 48px; color: #222; background: #fff; }
    ul { margin: 4px 0; padding-left: 18px; }
    li { margin-bottom: 3px; }
    p { margin: 4px 0; }
  </style>
</head>
<body>
  ${sectionsHTML}
</body>
</html>`;
}

function buildResumeFileName(templateId: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `resume-${templateId}-${timestamp}.pdf`;
}

async function getAndroidDownloadsDirectoryUri(): Promise<string> {
  const storedDirectoryUri = await AsyncStorage.getItem(DOWNLOADS_URI_KEY);
  if (storedDirectoryUri) {
    return storedDirectoryUri;
  }

  const permission =
    await FileSystemLegacy.StorageAccessFramework.requestDirectoryPermissionsAsync();

  if (!permission.granted || !permission.directoryUri) {
    throw new Error('Storage permission was not granted.');
  }

  await AsyncStorage.setItem(DOWNLOADS_URI_KEY, permission.directoryUri);
  return permission.directoryUri;
}

export async function exportResumeToPDF(
  data: GeneratedResumeData,
  templateId: string
): Promise<{ fileName: string; uri: string }> {
  const html = buildResumeHTML(data, templateId);
  const fileName = buildResumeFileName(templateId);

  // On Android, save to a user-selected public folder (recommended: Downloads).
  if (Platform.OS === 'android') {
    const { base64 } = await Print.printToFileAsync({ html, base64: true });
    if (!base64) {
      throw new Error('Failed to generate PDF content.');
    }

    let directoryUri = await getAndroidDownloadsDirectoryUri();

    try {
      const fileUri = await FileSystemLegacy.StorageAccessFramework.createFileAsync(
        directoryUri,
        fileName,
        'application/pdf'
      );

      await FileSystemLegacy.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystemLegacy.EncodingType.Base64,
      });

      return {
        fileName,
        uri: fileUri,
      };
    } catch {
      // Permission can become stale after app reinstall or settings changes.
      await AsyncStorage.removeItem(DOWNLOADS_URI_KEY);
      directoryUri = await getAndroidDownloadsDirectoryUri();

      const fileUri = await FileSystemLegacy.StorageAccessFramework.createFileAsync(
        directoryUri,
        fileName,
        'application/pdf'
      );

      await FileSystemLegacy.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystemLegacy.EncodingType.Base64,
      });

      return {
        fileName,
        uri: fileUri,
      };
    }
  }

  const { uri } = await Print.printToFileAsync({ html, base64: false });

  const resumesDirectory = new Directory(Paths.document, 'resumes');
  if (!resumesDirectory.exists) {
    resumesDirectory.create({ idempotent: true, intermediates: true });
  }

  const sourceFile = new File(uri);
  const destinationFile = new File(resumesDirectory, fileName);

  if (destinationFile.exists) {
    destinationFile.delete();
  }

  sourceFile.copy(destinationFile);

  return {
    fileName,
    uri: destinationFile.uri,
  };
}
