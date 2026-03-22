import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GeneratedResumeData } from '@/context/ResumeContext';

interface Props {
  data: GeneratedResumeData;
  templateId: string;
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

export default function ResumeDocument({ data, templateId }: Props) {
  const style = TEMPLATE_STYLES[templateId] ?? TEMPLATE_STYLES.chronological;

  return (
    <View style={styles.paper}>
      {data.sections.map((section, index) => (
        <View key={index} style={styles.section}>
          <View style={[styles.sectionHeader, { backgroundColor: style.accent }]}>
            <Text style={[styles.sectionTitle, { color: style.headerText }]}>
              {section.title}
            </Text>
          </View>
          <View style={styles.sectionBody}>
            {section.content.split('\n').map((line, i) => {
              if (!line.trim()) return null;
              const isBullet = line.trimStart().startsWith('•');
              const isTargetRoleLine = /^(Desired Position|Target Role)\s*:/i.test(
                line.trim()
              );
              return (
                <Text
                  key={i}
                  style={[
                    styles.contentLine,
                    isBullet && styles.bullet,
                    isTargetRoleLine && styles.targetRoleLine,
                  ]}
                >
                  {line}
                </Text>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  paper: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    marginHorizontal: 4,
    marginVertical: 8,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 3,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  sectionBody: {
    paddingHorizontal: 4,
  },
  contentLine: {
    fontSize: 13,
    color: '#333',
    lineHeight: 21,
  },
  bullet: {
    paddingLeft: 8,
  },
  targetRoleLine: {
    fontWeight: '700',
    fontSize: 14,
    textAlign: 'center',
    letterSpacing: 0.3,
    color: '#1f2937',
    marginBottom: 4,
  },
});
