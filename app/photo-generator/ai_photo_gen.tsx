import PrimaryButton from '@/components/ui/PrimaryButton';
import { generateFormalPhoto } from '@/services/photoGeneratorService';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystemLegacy from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const RED = '#c40000';

type PhotoSize = '1x1' | '2x2';

function getTimestampedFileName() {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `formal-photo-${stamp}.png`;
}

function extractBase64FromDataUri(dataUri: string): string {
  const parts = dataUri.split(',');
  return parts.length > 1 ? parts[1] : dataUri;
}

export default function PhotoGeneratorScreen() {
  const [sourceImageUri, setSourceImageUri] = useState<string | null>(null);
  const [generatedImageUri, setGeneratedImageUri] = useState<string | null>(null);
  const [size, setSize] = useState<PhotoSize>('1x1');
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow photo library access to upload your image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
      base64: false,
    });

    if (!result.canceled && result.assets?.length) {
      setSourceImageUri(result.assets[0].uri);
      setGeneratedImageUri(null);
    }
  };

  const handleGenerate = async () => {
    if (!sourceImageUri) {
      Alert.alert('Upload required', 'Please upload a photo first.');
      return;
    }

    try {
      setLoading(true);
      const generated = await generateFormalPhoto(sourceImageUri, size);
      setGeneratedImageUri(generated.dataUri);
    } catch (error: any) {
      Alert.alert(
        'Generation failed',
        error?.message || 'Could not generate formal photo right now. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedImageUri) return;

    try {
      const fileName = getTimestampedFileName();
      const base64 = extractBase64FromDataUri(generatedImageUri);

      if (Platform.OS === 'android') {
        const permission =
          await FileSystemLegacy.StorageAccessFramework.requestDirectoryPermissionsAsync();

        if (!permission.granted || !permission.directoryUri) {
          Alert.alert('Save cancelled', 'No folder was selected.');
          return;
        }

        const fileUri = await FileSystemLegacy.StorageAccessFramework.createFileAsync(
          permission.directoryUri,
          fileName,
          'image/png'
        );

        await FileSystemLegacy.writeAsStringAsync(fileUri, base64, {
          encoding: FileSystemLegacy.EncodingType.Base64,
        });

        Alert.alert('Saved', 'Your formal photo has been saved.');
        return;
      }

      const localPath = `${FileSystemLegacy.documentDirectory}${fileName}`;
      await FileSystemLegacy.writeAsStringAsync(localPath, base64, {
        encoding: FileSystemLegacy.EncodingType.Base64,
      });

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(localPath, {
          mimeType: 'image/png',
          dialogTitle: 'Save your formal photo',
        });
      } else {
        Alert.alert('Saved', `Photo saved to ${localPath}`);
      }
    } catch (error: any) {
      Alert.alert('Save failed', error?.message || 'Unable to save the generated photo.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>AI Formal Photo Generator</Text>
        <Text style={styles.subtitle}>
          Upload a selfie and generate a resume-ready formal portrait in seconds.
        </Text>

        <View style={styles.tipBox}>
          <Ionicons name="information-circle" size={20} color={RED} />
          <Text style={styles.tipText}>
            Please upload a photo that is in good lighting and your face is fully visible for a
            better result.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Photo Size</Text>
          <View style={styles.sizeRow}>
            <TouchableOpacity
              style={[styles.sizeButton, size === '1x1' && styles.sizeButtonActive]}
              onPress={() => setSize('1x1')}
            >
              <Text style={[styles.sizeButtonText, size === '1x1' && styles.sizeButtonTextActive]}>
                1x1
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sizeButton, size === '2x2' && styles.sizeButtonActive]}
              onPress={() => setSize('2x2')}
            >
              <Text style={[styles.sizeButtonText, size === '2x2' && styles.sizeButtonTextActive]}>
                2x2
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <PrimaryButton title="Upload Photo" onPress={pickImage} />

        {sourceImageUri ? (
          <View style={styles.previewCard}>
            <Text style={styles.previewTitle}>Uploaded Photo</Text>
            <Image source={{ uri: sourceImageUri }} style={styles.previewImage} />
          </View>
        ) : null}

        <PrimaryButton
          title={loading ? 'Generating...' : 'Generate Formal Photo'}
          onPress={handleGenerate}
          disabled={loading || !sourceImageUri}
          style={{ marginTop: 14 }}
        />

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={RED} />
            <Text style={styles.loadingText}>AI is generating your formal photo...</Text>
          </View>
        ) : null}

        {generatedImageUri ? (
          <View style={styles.previewCard}>
            <Text style={styles.previewTitle}>Generated Formal Photo ({size})</Text>
            <Image source={{ uri: generatedImageUri }} style={styles.previewImage} />
            <PrimaryButton title="Download Photo" onPress={handleDownload} style={{ marginTop: 12 }} />
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1a1a2e',
  },
  subtitle: {
    fontSize: 15,
    color: '#6c757d',
    lineHeight: 22,
  },
  tipBox: {
    backgroundColor: '#fff5f5',
    borderWidth: 1,
    borderColor: '#ffd8d8',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  tipText: {
    flex: 1,
    color: '#7a1f1f',
    lineHeight: 20,
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    marginTop: 6,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 8,
  },
  sizeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  sizeButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d3d2d2',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  sizeButtonActive: {
    borderColor: RED,
    backgroundColor: '#fff5f5',
  },
  sizeButtonText: {
    color: '#6c757d',
    fontWeight: '700',
  },
  sizeButtonTextActive: {
    color: RED,
  },
  previewCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1a1a2e',
    marginBottom: 10,
  },
  previewImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: '#f1f3f5',
  },
  loadingBox: {
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  loadingText: {
    color: '#6c757d',
    fontWeight: '600',
  },
});
