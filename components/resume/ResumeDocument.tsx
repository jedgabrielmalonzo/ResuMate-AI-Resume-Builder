import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { GeneratedResumeData } from '@/context/ResumeContext';

interface Props {
  data: GeneratedResumeData;
  templateId: string;
  legacyColors?: boolean;
}

const TEMPLATE_STYLES: Record<string, { accent: string; headerText: string }> = {
  chronological: { accent: '#2c3e50', headerText: '#ffffff' },
  functional: { accent: '#6a1b9a', headerText: '#ffffff' },
  hybrid: { accent: '#1565c0', headerText: '#ffffff' },
  mini: { accent: '#ef6c00', headerText: '#ffffff' },
  'student-entry': { accent: '#00897b', headerText: '#ffffff' },
  creative: { accent: '#FF4081', headerText: '#ffffff' },
  executive: { accent: '#1A237E', headerText: '#ffffff' },
};

export default function ResumeDocument({ data, templateId, legacyColors }: Props) {
  const isPhotoTemplate = templateId.includes('photo');
  const hasPhoto = isPhotoTemplate && data.photoUri;

  // Find header-like sections to render them differently
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

  return (
    <View style={styles.paper}>
      {/* Header Area */}
      <View style={styles.headerArea}>
        {hasPhoto && (
          <View style={styles.photoContainer}>
            <Image source={{ uri: data.photoUri! }} style={styles.photo} resizeMode="cover" />
          </View>
        )}

        <View style={[styles.headerTextContainer, hasPhoto && styles.headerTextWithPhoto]}>
           {contactSection && (
            <View style={styles.contactContainer}>
              {contactSection.content.split('\n').map((line, i) => (
                <Text key={i} style={[
                  styles.headerLine, 
                  i === 0 && styles.headerNameLine // first line is usually name
                ]}>
                  {line}
                </Text>
              ))}
            </View>
          )}

          {summarySection && (
            <View style={styles.summaryContainer}>
               <Text style={styles.summaryText}>{summarySection.content}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Main Sections */}
      {mainSections.map((section, index) => {
        const style = TEMPLATE_STYLES[templateId] ?? TEMPLATE_STYLES.chronological;
        
        return (
          <View key={index} style={styles.section}>
            <View style={[styles.sectionHeader, legacyColors && { backgroundColor: style.accent, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 3, borderBottomWidth: 0 }]}>
              <Text style={[styles.sectionTitle, legacyColors && { color: style.headerText }]}>{section.title}</Text>
              {!legacyColors && <View style={styles.sectionDivider} />}
            </View>
            
            <View style={styles.sectionBody}>
            {section.content.split('\n').map((line, i) => {
              if (!line.trim()) return null;
              const isBullet = line.trimStart().startsWith('•');
              
              // Try to detect bold pairs like "Role - Company" or similar by parsing common resume patterns
              // For simplicity in preview, we just render it cleanly. (PDF rendering will be more complex).
              
              return (
                <View key={i} style={[styles.contentRow, isBullet && styles.bulletRow]}>
                  <Text style={[styles.contentLine]}>
                    {line}
                  </Text>
                </View>
              );
            })}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  paper: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    marginHorizontal: 8,
    marginVertical: 12,
  },
  headerArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    gap: 16,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center', // Center align header by default for clean ATS look
  },
  headerTextWithPhoto: {
    alignItems: 'flex-start', // Left align if there's a photo on the right
  },
  photoContainer: {
    width: 80,
    height: 80,
    borderRadius: 8, // slight rounding, not full circle for 1x1 ID formal look
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  contactContainer: {
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
  },
  headerLine: {
    fontSize: 12,
    color: '#444',
    textAlign: 'center',
    marginBottom: 2,
  },
  headerNameLine: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  summaryContainer: {
    width: '100%',
    marginTop: 8,
  },
  summaryText: {
    fontSize: 12,
    color: '#333',
    lineHeight: 18,
    textAlign: 'justify',
  },
  section: {
    marginBottom: 18,
  },
  sectionHeader: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#000',
    width: '100%',
  },
  sectionBody: {
    paddingHorizontal: 0,
  },
  contentRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  bulletRow: {
    paddingLeft: 12,
  },
  contentLine: {
    fontSize: 12,
    color: '#222',
    lineHeight: 18,
    flex: 1,
  },
});
