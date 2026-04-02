import React, { useState, useEffect } from 'react';
import { resumeTemplates } from '@/components/resume/templates';
import { getTemplateRecommendations, generateResume } from '@/services/aiService';
import { useResumeContext } from '@/context/ResumeContext';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { resumeService, SavedResume, ResumeTemplate } from '@/services/resumeService';
import { Ionicons } from '@expo/vector-icons';

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ThemedText } from '../../components/themed-text';
import { ThemedView } from '../../components/themed-view';
import { useThemeColor } from '../../hooks/use-theme-color';
import ScreenHeader from '@/components/ui/ScreenHeader';
import InputField from '@/components/ui/InputField';
import Checkbox from '@/components/ui/Checkbox';
import PrimaryButton from '@/components/ui/PrimaryButton';

const RED = "#c40000";

interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

interface WorkExperience {
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Education {
  degree: string;
  institution: string;
  location: string;
  graduationDate: string;
  gpa: string;
}

interface Achievement {
  title: string;
  issuer: string;
  date: string;
  description: string;
}

interface Project {
  name: string;
  role: string;
  techStack: string;
  date: string;
  description: string;
  link: string;
}

type ResumeInputFieldProps = {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  textColor: string;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  containerStyle?: any;
};

export default function ResumeFormScreen() {
  const { user } = useAuth();
  const textColor = useThemeColor({}, 'text');
  const { setGeneratedResumeData, setSelectedTemplateId: setContextSelectedTemplateId } = useResumeContext();
  const router = useRouter();
  const { step } = useLocalSearchParams();

  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  });

  const [targetRole, setTargetRole] = useState('');
  const [professionalSummary, setProfessionalSummary] = useState('');

  const [workExperience, setWorkExperience] = useState<WorkExperience[]>([
    {
      jobTitle: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      description: '',
    },
  ]);

  const [education, setEducation] = useState<Education[]>([
    {
      degree: '',
      institution: '',
      location: '',
      graduationDate: '',
      gpa: '',
    },
  ]);

  const [skills, setSkills] = useState<string[]>(['']);

  const [projects, setProjects] = useState<Project[]>([
    {
      name: '',
      role: '',
      techStack: '',
      date: '',
      description: '',
      link: '',
    },
  ]);

  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      title: '',
      issuer: '',
      date: '',
      description: '',
    },
  ]);

  const [hasWorkExperience, setHasWorkExperience] = useState(true);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [latestResume, setLatestResume] = useState<SavedResume | null>(null);
  const [loadingLatest, setLoadingLatest] = useState(false);

  const handlePickPhoto = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "Please allow access to your photos to upload an ID picture.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // 1x1 ratio
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  useEffect(() => {
    if (user?.uid) {
      loadHistory();
    }
  }, [user?.uid]);

  const loadHistory = async () => {
    if (!user?.uid) return;
    try {
      const resumes = await resumeService.getUserResumes(user.uid);
      if (resumes.length > 0) {
        // Sort by date manually since current service doesn't have orderBy index yet
        const sorted = resumes.sort((a, b) => {
          const dateA = a.createdAt?.seconds || 0;
          const dateB = b.createdAt?.seconds || 0;
          return dateB - dateA;
        });
        setLatestResume(sorted[0]);
      }
    } catch (error) {
      console.error('Error loading resume history:', error);
    }
  };

  const handleLoadLatest = () => {
    if (!latestResume) return;

    Alert.alert(
      "Load Latest Resume?",
      "This will overwrite your current input with data from your last saved resume.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Load",
          onPress: () => {
            const data = latestResume.userData;
            if (!data) {
              Alert.alert("Error", "No raw data found in this resume record.");
              return;
            }
            
            // Map saved userData back to form state
            setPersonalInfo(data.personalInfo || personalInfo);
            setTargetRole(data.targetRole || '');
            setProfessionalSummary(data.professionalSummary || '');
            setWorkExperience(data.workExperience?.length ? data.workExperience : workExperience);
            setEducation(data.education?.length ? data.education : education);
            setSkills(data.skills?.length ? data.skills : skills);
            setProjects(data.projects?.length ? data.projects : projects);
            setAchievements(data.achievements?.length ? data.achievements : achievements);
            setHasWorkExperience(!!data.workExperience?.length);
            setPhotoUri(data.photoUri || null);
            
            Alert.alert("Success", "Last resume data has been loaded.");
          }
        }
      ]
    );
  };

  const updatePersonalInfo = (field: keyof PersonalInfo, value: string) => {
    setPersonalInfo(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateWorkExperience = (index: number, field: keyof WorkExperience, value: string) => {
    const updated = [...workExperience];
    updated[index] = { ...updated[index], [field]: value };
    setWorkExperience(updated);
  };

  const addWorkExperience = () => {
    setWorkExperience([
      ...workExperience,
      {
        jobTitle: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        description: '',
      },
    ]);
  };

  const removeWorkExperience = (index: number) => {
    if (workExperience.length > 1) {
      setWorkExperience(workExperience.filter((_, i) => i !== index));
    }
  };

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    const updated = [...education];
    updated[index] = { ...updated[index], [field]: value };
    setEducation(updated);
  };

  const addEducation = () => {
    setEducation([
      ...education,
      {
        degree: '',
        institution: '',
        location: '',
        graduationDate: '',
        gpa: '',
      },
    ]);
  };

  const removeEducation = (index: number) => {
    if (education.length > 1) {
      setEducation(education.filter((_, i) => i !== index));
    }
  };

  const updateSkill = (index: number, value: string) => {
    const updated = [...skills];
    updated[index] = value;
    setSkills(updated);
  };

  const addSkill = () => {
    setSkills([...skills, '']);
  };

  const removeSkill = (index: number) => {
    if (skills.length > 1) {
      setSkills(skills.filter((_, i) => i !== index));
    }
  };

  const updateProject = (index: number, field: keyof Project, value: string) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], [field]: value };
    setProjects(updated);
  };

  const addProject = () => {
    setProjects([
      ...projects,
      {
        name: '',
        role: '',
        techStack: '',
        date: '',
        description: '',
        link: '',
      },
    ]);
  };

  const removeProject = (index: number) => {
    if (projects.length > 1) {
      setProjects(projects.filter((_, i) => i !== index));
    }
  };

  const updateAchievement = (index: number, field: keyof Achievement, value: string) => {
    const updated = [...achievements];
    updated[index] = { ...updated[index], [field]: value };
    setAchievements(updated);
  };

  const addAchievement = () => {
    setAchievements([
      ...achievements,
      {
        title: '',
        issuer: '',
        date: '',
        description: '',
      },
    ]);
  };

  const removeAchievement = (index: number) => {
    if (achievements.length > 1) {
      setAchievements(achievements.filter((_, i) => i !== index));
    }
  };

  const [templateRecommendations, setTemplateRecommendations] = useState<Array<{ id: string; reason: string }>>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [availableTemplates, setAvailableTemplates] = useState<ResumeTemplate[]>([]);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const templates = await resumeService.getTemplates();
        if (templates.length > 0) {
          // De-duplicate by ID to prevent key errors
          const uniqueTemplates = Array.from(new Map(templates.map(t => [t.id, t])).values());
          setAvailableTemplates(uniqueTemplates);
        } else {
          // Fallback to hardcoded if Firestore is empty (pre-migration)
          const { resumeTemplates } = require('@/components/resume/templates');
          setAvailableTemplates(resumeTemplates);
        }
      } catch (error) {
        console.error('Error fetching templates:', error);
        const { resumeTemplates } = require('@/components/resume/templates');
        setAvailableTemplates(resumeTemplates);
      }
    };
    fetchTemplates();
  }, []);

  const handleGenerateResume = async () => {
    const template = availableTemplates.find(t => t.id === selectedTemplateId);
    if (!template) return;
    setGenerating(true);
    const userData = {
      personalInfo,
      targetRole,
      professionalSummary,
      workExperience,
      education,
      projects,
      skills,
      achievements,
      photoUri,
    };
    try {
      const result = await generateResume(userData, template);
      setGeneratedResumeData(result);

      // Save to Firebase before redirecting
      if (user?.uid) {
        try {
          await resumeService.saveResume(user.uid, result, selectedTemplateId ?? 'classic', userData);
          console.log('Resume saved to Firestore from form');
        } catch (saveError) {
          console.error('Failed to save resume:', saveError);
          // We still redirect, but log the error
        }
      }

      router.push('/Account');
    } catch (error) {
      Alert.alert('Error', 'Failed to generate resume. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleBuildResume = async () => {
    setLoadingTemplates(true);

    const userData = {
      personalInfo,
      targetRole,
      professionalSummary,
      workExperience,
      education,
      projects,
      skills,
      achievements,
      photoUri,
    };
    const jobField = targetRole || professionalSummary || '';
    try {
      const recommendations = await getTemplateRecommendations(userData, jobField, availableTemplates);
      setTemplateRecommendations(recommendations);
      setShowRecommendations(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to get template recommendations.');
    } finally {
      setLoadingTemplates(false);
    }
  };

  useEffect(() => {
    if (step === 'templates') {
      handleBuildResume();
    }
  }, [step]);



  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <ScreenHeader
          title="Build Your Resume"
          subtitle="Fill out your information to create a professional resume"
          showBorder
        />
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <ThemedView style={styles.content}>

            {latestResume && !showRecommendations && (
              <TouchableOpacity
                style={styles.loadDataButton}
                onPress={handleLoadLatest}
                activeOpacity={0.7}
              >
                <View style={styles.loadDataContent}>
                  <Ionicons name="refresh-circle" size={24} color={RED} />
                  <View style={{ marginLeft: 12 }}>
                    <Text style={styles.loadDataTitle}>Load from last resume</Text>
                    <Text style={styles.loadDataSubtitle}>
                      Use data from "{latestResume.title}"
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>
            )}

            {showRecommendations && (
              <ThemedView style={styles.templatesContainer}>
                <View style={styles.templatesHeader}>
                  <ThemedText style={styles.templatesTitle}>Choose a Template</ThemedText>
                  <ThemedText style={styles.templatesSubtitle}>Based on your profile, we recommend these professional layouts.</ThemedText>
                </View>

                <View style={styles.templatesGrid}>
                  {availableTemplates.map((template) => {
                    const isSelected = selectedTemplateId === template.id;
                    const isRecommended = templateRecommendations.length > 0 && templateRecommendations[0].id === template.id;
                    
                    return (
                      <TouchableOpacity 
                        key={template.id} 
                        style={[styles.templateCard, isSelected && styles.templateCardSelected]}
                        onPress={() => setSelectedTemplateId(template.id)}
                        activeOpacity={0.9}
                      >
                        {isRecommended && (
                          <View style={styles.recommendedBadge}>
                            <Ionicons name="star" size={12} color="#fff" />
                            <Text style={styles.recommendedText}>Recommended</Text>
                          </View>
                        )}
                        <View style={styles.templateCardHeader}>
                          <View style={[styles.templateIconCircle, { backgroundColor: isSelected ? 'rgba(196, 0, 0, 0.1)' : '#f5f5f5' }]}>
                            <Ionicons 
                              name={template.id.includes('photo') ? 'person-circle' : 'document-text'} 
                              size={24} 
                              color={isSelected ? RED : '#666'} 
                            />
                          </View>
                          {isSelected && (
                            <View style={styles.selectedBadge}>
                              <Ionicons name="checkmark-circle" size={20} color={RED} />
                            </View>
                          )}
                        </View>

                        <Text style={styles.templateName}>{template.name}</Text>
                        <Text style={styles.templateDescription} numberOfLines={3}>{template.description}</Text>
                        
                        {isRecommended && templateRecommendations[0]?.reason && (
                          <View style={styles.recommendationReason}>
                            <Ionicons name="sparkles" size={12} color="#007AFF" />
                            <Text style={styles.recommendationText} numberOfLines={2}>{templateRecommendations[0].reason}</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View style={styles.templateActions}>
                  {selectedTemplateId && (
                    <TouchableOpacity
                      style={styles.generateButton}
                      onPress={handleGenerateResume}
                      disabled={generating}
                    >
                      <Text style={styles.generateButtonText}>
                        {generating ? 'Generating Resume...' : 'Generate My Resume'}
                      </Text>
                      {!generating && <Ionicons name="arrow-forward" size={20} color="#fff" />}
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={styles.backToFormButton}
                    onPress={() => setShowRecommendations(false)}
                  >
                    <Text style={styles.backToFormText}>Back to Edit Information</Text>
                  </TouchableOpacity>
                </View>
              </ThemedView>
            )}

            {!showRecommendations && (
              <>
                <ThemedView style={styles.sectionCard}>
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionIconTitle}>
                      <View style={[styles.iconCircle, { backgroundColor: 'rgba(196, 0, 0, 0.1)' }]}>
                        <Ionicons name="person" size={20} color={RED} />
                      </View>
                      <ThemedText style={styles.sectionTitle}>Personal Info</ThemedText>
                    </View>
                  </View>

                  <View style={styles.row}>
                    <InputField
                      placeholder="First Name"
                      value={personalInfo.firstName}
                      onChangeText={(value: string) => updatePersonalInfo('firstName', value)}
                      containerStyle={[styles.inputContainer, styles.halfInput]}
                      textColor={textColor}
                    />
                    <InputField
                      placeholder="Last Name"
                      value={personalInfo.lastName}
                      onChangeText={(value: string) => updatePersonalInfo('lastName', value)}
                      containerStyle={[styles.inputContainer, styles.halfInput]}
                      textColor={textColor}
                    />
                  </View>

                  <InputField
                    placeholder="Email Address"
                    value={personalInfo.email}
                    onChangeText={(value: string) => updatePersonalInfo('email', value)}
                    containerStyle={styles.inputContainer}
                    keyboardType="email-address"
                    textColor={textColor}
                  />

                  <InputField
                    placeholder="Phone Number"
                    value={personalInfo.phone}
                    onChangeText={(value: string) => updatePersonalInfo('phone', value)}
                    containerStyle={styles.inputContainer}
                    keyboardType="phone-pad"
                    textColor={textColor}
                  />

                  <InputField
                    placeholder="Street Address"
                    value={personalInfo.address}
                    onChangeText={(value: string) => updatePersonalInfo('address', value)}
                    containerStyle={styles.inputContainer}
                    textColor={textColor}
                  />

                  <View style={styles.row}>
                    <InputField
                      placeholder="City"
                      value={personalInfo.city}
                      onChangeText={(value: string) => updatePersonalInfo('city', value)}
                      containerStyle={[styles.inputContainer, styles.flexInput]}
                      textColor={textColor}
                    />
                    <InputField
                      placeholder="State"
                      value={personalInfo.state}
                      onChangeText={(value: string) => updatePersonalInfo('state', value)}
                      containerStyle={[styles.inputContainer, styles.quarterInput]}
                      textColor={textColor}
                    />
                    <InputField
                    placeholder="ZIP"
                    value={personalInfo.zipCode}
                    onChangeText={(value: string) => updatePersonalInfo('zipCode', value)}
                    containerStyle={[styles.inputContainer, styles.quarterInput]}
                    textColor={textColor}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <ThemedText style={{ fontSize: 16, fontWeight: '600', marginBottom: 8, color: textColor }}>
                    Target Job Title
                  </ThemedText>
                  <InputField
                    placeholder="e.g. Senior Software Engineer"
                    value={targetRole}
                    onChangeText={setTargetRole}
                    textColor={textColor}
                  />
                </View>
              </ThemedView>

                {/* Summary Section */}
                <ThemedView style={styles.sectionCard}>
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionIconTitle}>
                      <View style={[styles.iconCircle, { backgroundColor: 'rgba(196, 0, 0, 0.1)' }]}>
                        <Ionicons name="document-text" size={20} color={RED} />
                      </View>
                      <ThemedText style={styles.sectionTitle}>Summary</ThemedText>
                    </View>
                  </View>
                  <InputField
                    placeholder="Write a brief summary of your professional background and career objectives..."
                    value={professionalSummary}
                    onChangeText={(value: string) => setProfessionalSummary(value)}
                    containerStyle={styles.inputContainer}
                    multiline
                    numberOfLines={4}
                    textColor={textColor}
                  />
                </ThemedView>

                {/* Work Experience Section */}
                <ThemedView style={styles.sectionCard}>
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionIconTitle}>
                      <View style={[styles.iconCircle, { backgroundColor: 'rgba(196, 0, 0, 0.1)' }]}>
                        <Ionicons name="briefcase" size={20} color={RED} />
                      </View>
                      <ThemedText style={styles.sectionTitle}>Work Experience</ThemedText>
                    </View>
                  </View>

                  <Checkbox
                    checked={hasWorkExperience}
                    onPress={() => setHasWorkExperience(!hasWorkExperience)}
                    label="I have work experience"
                  />

                  {hasWorkExperience && (
                    <>
                      <View style={styles.sectionHeader}>
                        <ThemedText style={styles.subSectionTitle}>Experience Details</ThemedText>
                        <TouchableOpacity onPress={addWorkExperience} style={styles.addButton}>
                          <ThemedText style={styles.addButtonText}>+ Add</ThemedText>
                        </TouchableOpacity>
                      </View>

                      {workExperience.map((experience, index) => (
                        <View key={index} style={styles.experienceItem}>
                          <View style={styles.itemHeader}>
                            <ThemedText style={styles.itemNumber}>Experience {index + 1}</ThemedText>
                            {workExperience.length > 1 && (
                              <TouchableOpacity
                                onPress={() => removeWorkExperience(index)}
                                style={styles.removeButton}
                              >
                                <ThemedText style={styles.removeButtonText}>Remove</ThemedText>
                              </TouchableOpacity>
                            )}
                          </View>

                          <InputField
                            placeholder="Job Title"
                            value={experience.jobTitle}
                            onChangeText={(value: string) => updateWorkExperience(index, 'jobTitle', value)}
                            containerStyle={styles.inputContainer}
                            textColor={textColor}
                          />

                          <InputField
                            placeholder="Company Name"
                            value={experience.company}
                            onChangeText={(value: string) => updateWorkExperience(index, 'company', value)}
                            containerStyle={styles.inputContainer}
                            textColor={textColor}
                          />

                          <InputField
                            placeholder="Location (City, State)"
                            value={experience.location}
                            onChangeText={(value: string) => updateWorkExperience(index, 'location', value)}
                            containerStyle={styles.inputContainer}
                            textColor={textColor}
                          />

                          <View style={styles.row}>
                            <InputField
                              placeholder="Start Date (MM/YYYY)"
                              value={experience.startDate}
                              onChangeText={(value: string) => updateWorkExperience(index, 'startDate', value)}
                              containerStyle={[styles.inputContainer, styles.halfInput]}
                              textColor={textColor}
                            />
                            <InputField
                              placeholder="End Date (MM/YYYY)"
                              value={experience.endDate}
                              onChangeText={(value: string) => updateWorkExperience(index, 'endDate', value)}
                              containerStyle={[styles.inputContainer, styles.halfInput]}
                              textColor={textColor}
                            />
                          </View>

                          <InputField
                            placeholder="Job Description and Achievements..."
                            value={experience.description}
                            onChangeText={(value: string) => updateWorkExperience(index, 'description', value)}
                            containerStyle={styles.inputContainer}
                            multiline
                            numberOfLines={3}
                            textColor={textColor}
                          />
                        </View>
                      ))}
                    </>
                  )}
                </ThemedView>

                {/* Education Section */}
                <ThemedView style={styles.sectionCard}>
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionIconTitle}>
                      <View style={[styles.iconCircle, { backgroundColor: 'rgba(196, 0, 0, 0.1)' }]}>
                        <Ionicons name="school" size={20} color={RED} />
                      </View>
                      <ThemedText style={styles.sectionTitle}>Education</ThemedText>
                    </View>
                    <TouchableOpacity onPress={addEducation} style={styles.addButtonMinimal}>
                      <Ionicons name="add-circle" size={28} color={RED} />
                    </TouchableOpacity>
                  </View>

                  {education.map((edu, index) => (
                    <View key={index} style={styles.experienceItem}>
                      <View style={styles.itemHeader}>
                        <ThemedText style={styles.itemNumber}>Education {index + 1}</ThemedText>
                        {education.length > 1 && (
                          <TouchableOpacity
                            onPress={() => removeEducation(index)}
                            style={styles.removeButton}
                          >
                            <ThemedText style={styles.removeButtonText}>Remove</ThemedText>
                          </TouchableOpacity>
                        )}
                      </View>

                      <InputField
                        placeholder="Degree (e.g., Bachelor of Science in Computer Science)"
                        value={edu.degree}
                        onChangeText={(value: string) => updateEducation(index, 'degree', value)}
                        containerStyle={styles.inputContainer}
                        textColor={textColor}
                      />

                      <InputField
                        placeholder="Institution Name"
                        value={edu.institution}
                        onChangeText={(value: string) => updateEducation(index, 'institution', value)}
                        containerStyle={styles.inputContainer}
                        textColor={textColor}
                      />

                      <InputField
                        placeholder="Location (City, State)"
                        value={edu.location}
                        onChangeText={(value: string) => updateEducation(index, 'location', value)}
                        containerStyle={styles.inputContainer}
                        textColor={textColor}
                      />

                      <View style={styles.row}>
                        <InputField
                          placeholder="Graduation Date (MM/YYYY)"
                          value={edu.graduationDate}
                          onChangeText={(value: string) => updateEducation(index, 'graduationDate', value)}
                          containerStyle={[styles.inputContainer, styles.halfInput]}
                          textColor={textColor}
                        />
                        <InputField
                          placeholder="GPA (Optional)"
                          value={edu.gpa}
                          onChangeText={(value: string) => updateEducation(index, 'gpa', value)}
                          containerStyle={[styles.inputContainer, styles.halfInput]}
                          textColor={textColor}
                        />
                      </View>
                    </View>
                  ))}
                </ThemedView>

                {/* Skills */}
                <ThemedView style={styles.sectionCard}>
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionIconTitle}>
                      <View style={[styles.iconCircle, { backgroundColor: 'rgba(196, 0, 0, 0.1)' }]}>
                        <Ionicons name="construct" size={20} color={RED} />
                      </View>
                      <ThemedText style={styles.sectionTitle}>Skills</ThemedText>
                    </View>
                    <TouchableOpacity onPress={addSkill} style={styles.addButtonMinimal}>
                      <Ionicons name="add-circle" size={28} color={RED} />
                    </TouchableOpacity>
                  </View>

                  {skills.map((skill, index) => (
                    <View key={index} style={styles.skillItem}>
                      <InputField
                        placeholder={`Skill ${index + 1}`}
                        value={skill}
                        onChangeText={(value: string) => updateSkill(index, value)}
                        containerStyle={[styles.inputContainer, styles.flexInput]}
                        textColor={textColor}
                      />
                      {skills.length > 1 && (
                        <TouchableOpacity
                          onPress={() => removeSkill(index)}
                          style={styles.skillRemoveButton}
                        >
                          <ThemedText style={styles.removeButtonText}>×</ThemedText>
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                </ThemedView>

                {/* Achievements */}
                <ThemedView style={styles.sectionCard}>
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionIconTitle}>
                      <View style={[styles.iconCircle, { backgroundColor: 'rgba(196, 0, 0, 0.1)' }]}>
                        <Ionicons name="trophy" size={20} color={RED} />
                      </View>
                      <ThemedText style={styles.sectionTitle}>Achievements</ThemedText>
                    </View>
                    <TouchableOpacity onPress={addAchievement} style={styles.addButtonMinimal}>
                      <Ionicons name="add-circle" size={28} color={RED} />
                    </TouchableOpacity>
                  </View>

                  {achievements.map((achievement, index) => (
                    <View key={index} style={styles.experienceItem}>
                      <View style={styles.itemHeader}>
                        <ThemedText style={styles.itemNumber}>Achievement {index + 1}</ThemedText>
                        {achievements.length > 1 && (
                          <TouchableOpacity
                            onPress={() => removeAchievement(index)}
                            style={styles.removeButton}
                          >
                            <ThemedText style={styles.removeButtonText}>Remove</ThemedText>
                          </TouchableOpacity>
                        )}
                      </View>

                      <InputField
                        placeholder="Achievement/Certification Title"
                        value={achievement.title}
                        onChangeText={(value: string) => updateAchievement(index, 'title', value)}
                        containerStyle={styles.inputContainer}
                        textColor={textColor}
                      />

                      <InputField
                        placeholder="Issuing Organization"
                        value={achievement.issuer}
                        onChangeText={(value: string) => updateAchievement(index, 'issuer', value)}
                        containerStyle={styles.inputContainer}
                        textColor={textColor}
                      />

                      <InputField
                        placeholder="Date Earned (MM/YYYY)"
                        value={achievement.date}
                        onChangeText={(value: string) => updateAchievement(index, 'date', value)}
                        containerStyle={styles.inputContainer}
                        textColor={textColor}
                      />

                      <InputField
                        placeholder="Description (optional)"
                        value={achievement.description}
                        onChangeText={(value: string) => updateAchievement(index, 'description', value)}
                        containerStyle={styles.inputContainer}
                        multiline
                        numberOfLines={2}
                        textColor={textColor}
                      />
                    </View>
                  ))}
                </ThemedView>

                {/* Photo Upload */}
                <ThemedView style={styles.sectionCard}>
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionIconTitle}>
                      <View style={[styles.iconCircle, { backgroundColor: 'rgba(196, 0, 0, 0.1)' }]}>
                        <Ionicons name="camera" size={20} color={RED} />
                      </View>
                      <View>
                        <ThemedText style={styles.sectionTitle}>1x1 ID Photo (Optional)</ThemedText>
                        <ThemedText style={{ fontSize: 13, color: '#666', marginTop: 2 }}>Only used if you select a template with a photo.</ThemedText>
                      </View>
                    </View>
                  </View>
                  <View style={{ alignItems: 'center', marginVertical: 10 }}>
                    {photoUri ? (
                      <View style={{ position: 'relative' }}>
                        <Image source={{ uri: photoUri }} style={{ width: 120, height: 120, borderRadius: 12, borderWidth: 1, borderColor: '#ddd' }} />
                        <TouchableOpacity 
                          style={{ position: 'absolute', top: -10, right: -10, backgroundColor: 'white', borderRadius: 15 }}
                          onPress={() => setPhotoUri(null)}
                        >
                          <Ionicons name="close-circle" size={30} color={RED} />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity 
                        style={{ width: 120, height: 120, borderRadius: 12, backgroundColor: '#f5f5f5', borderWidth: 2, borderColor: '#ddd', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' }}
                        onPress={handlePickPhoto}
                      >
                        <Ionicons name="image-outline" size={40} color="#999" />
                        <Text style={{ fontSize: 13, color: '#666', marginTop: 8, fontWeight: '500' }}>Add Photo</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </ThemedView>

                {/* Build Resume Button */}
                <ThemedView style={styles.buttonContainer}>
                  <PrimaryButton
                    title="Build Resume"
                    onPress={handleBuildResume}
                    style={styles.primaryButton}
                  />
                </ThemedView>
              </>
            )}
          </ThemedView>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: RED,
    marginBottom: 8,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  sectionIconTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadDataButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(196, 0, 0, 0.2)',
    borderStyle: 'dashed',
  },
  loadDataContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadDataTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },
  loadDataSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  addButtonMinimal: {
    padding: 4,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#444',
  },
  templatesContainer: {
    paddingBottom: 40,
  },
  templatesHeader: {
    marginBottom: 24,
  },
  templatesTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  templatesSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  templatesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  templateCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 2,
    borderColor: '#f0f0f0',
    width: '48%', // roughly half width for 2 columns
    position: 'relative',
    overflow: 'hidden',
  },
  templateCardSelected: {
    borderColor: RED,
    backgroundColor: 'rgba(196, 0, 0, 0.02)',
  },
  recommendedBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomLeftRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    zIndex: 1,
  },
  recommendedText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  templateCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    marginTop: 8,
  },
  templateIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  templateName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  selectedBadge: {
    marginTop: 4,
  },
  templateDescription: {
    fontSize: 12,
    color: '#555',
    lineHeight: 16,
    marginBottom: 12,
  },
  recommendationReason: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f0f7ff',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
    marginTop: 'auto',
  },
  recommendationText: {
    fontSize: 10,
    color: '#007AFF',
    fontWeight: '600',
    flex: 1,
  },
  templateActions: {
    marginTop: 20,
    gap: 12,
  },
  generateButton: {
    backgroundColor: RED,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 10,
    shadowColor: RED,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  backToFormButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  backToFormText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  inputContainer: {
    marginBottom: 15,
  },
  textInput: {
    borderWidth: 2,
    borderColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#fafafa',
    color: '#333',
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  flexInput: {
    flex: 1,
  },
  quarterInput: {
    flex: 0.7,
  },
  addButton: {
    backgroundColor: RED,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: RED,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },
  experienceItem: {
    backgroundColor: '#f8f8f8',
    padding: 18,
    borderRadius: 12,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: RED,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  itemNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: RED,
  },
  removeButton: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  removeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  skillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  skillRemoveButton: {
    backgroundColor: '#ff6b6b',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    marginTop: 30,
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: RED,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: RED,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: RED,
    borderColor: RED,
  },
  checkboxText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
});