import React, { useState } from 'react';
import { resumeTemplates } from '@/components/resume/templates';
import { getTemplateRecommendations, generateResume } from '@/services/aiService';
import { useResumeContext } from '@/context/ResumeContext';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { resumeService } from '@/services/resumeService';

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { ThemedText } from '../../components/themed-text';
import { ThemedView } from '../../components/themed-view';
import { useThemeColor } from '../../hooks/use-theme-color';
import BackButton from '@/components/ui/BackButton';
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

  const handleGenerateResume = async () => {
    const template = resumeTemplates.find(t => t.id === selectedTemplateId);
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
    };
    try {
      const result = await generateResume(userData, template);
      setGeneratedResumeData(result);

      // Save to Firebase before redirecting
      if (user?.uid) {
        try {
          await resumeService.saveResume(user.uid, result, selectedTemplateId ?? 'classic');
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
    };
    const jobField = targetRole || professionalSummary || '';
    try {
      const recommendations = await getTemplateRecommendations(userData, jobField, resumeTemplates);
      setTemplateRecommendations(recommendations);
      setShowRecommendations(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to get template recommendations.');
    } finally {
      setLoadingTemplates(false);
    }
  };



  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <ThemedView style={styles.content}>
            <ScreenHeader
              title="Build Your Resume"
              subtitle="Fill out your information to create a professional resume"
            />

            {showRecommendations && (
              <ThemedView style={[styles.section, { backgroundColor: '#f7f7f7', borderRadius: 8, marginBottom: 24 }]}>
                <ThemedText style={[styles.sectionTitle, { marginBottom: 8 }]}>Recommended Templates</ThemedText>
                {templateRecommendations.map((rec) => {
                  const template = resumeTemplates.find(t => t.id === rec.id);
                  return template ? (
                    <View key={template.id} style={{ marginBottom: 16, borderWidth: 1, borderColor: selectedTemplateId === template.id ? '#007AFF' : '#ddd', borderRadius: 6, padding: 12, backgroundColor: selectedTemplateId === template.id ? '#e6f0ff' : '#fff' }}>
                      <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{template.name}</Text>
                      <Text style={{ color: '#555', marginBottom: 4 }}>{template.description}</Text>
                      <Text style={{ color: '#333', marginBottom: 4 }}>
                        Best for: {template.bestFor}
                      </Text>
                      <Text style={{ color: '#666', marginBottom: 8 }}>
                        Suitable fields: {template.jobFields.join(', ')}
                      </Text>
                      {template.tips.slice(0, 2).map((tip) => (
                        <Text key={tip} style={{ color: '#555', marginBottom: 2 }}>• {tip}</Text>
                      ))}
                      <Text style={{ fontStyle: 'italic', color: '#007AFF', marginBottom: 8 }}>{rec.reason}</Text>
                      <TouchableOpacity
                        style={{ backgroundColor: selectedTemplateId === template.id ? '#007AFF' : '#eee', padding: 8, borderRadius: 4 }}
                        onPress={() => setSelectedTemplateId(template.id)}
                      >
                        <Text style={{ color: selectedTemplateId === template.id ? '#fff' : '#007AFF', textAlign: 'center' }}>
                          {selectedTemplateId === template.id ? 'Selected' : 'Select this template'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : null;
                })}

                <TouchableOpacity
                  style={{ marginTop: 8, alignSelf: 'center' }}
                  onPress={() => setShowRecommendations(false)}
                >
                  <Text style={{ color: '#007AFF', textDecorationLine: 'underline' }}>Back to form</Text>
                </TouchableOpacity>

                {/* Resume Button */}
                {selectedTemplateId && (
                  <TouchableOpacity
                    style={{ marginTop: 20, backgroundColor: '#c40000', padding: 16, borderRadius: 10, alignItems: 'center' }}
                    onPress={handleGenerateResume}
                    disabled={generating}
                  >
                    <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>
                      {generating ? 'Generating...' : '✨ Generate Resume'}
                    </Text>
                  </TouchableOpacity>
                )}
              </ThemedView>
            )}

            {!showRecommendations && (
              <>
                <ThemedView style={styles.section}>
                  <ThemedText style={styles.sectionTitle}>Personal Information</ThemedText>

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
                <ThemedView style={styles.section}>
                  <ThemedText style={styles.sectionTitle}>Professional Summary</ThemedText>
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
                <ThemedView style={styles.section}>
                  <ThemedText style={styles.sectionTitle}>Work Experience</ThemedText>

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
                <ThemedView style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <ThemedText style={styles.sectionTitle}>Education</ThemedText>
                    <TouchableOpacity onPress={addEducation} style={styles.addButton}>
                      <ThemedText style={styles.addButtonText}>+ Add</ThemedText>
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
                <ThemedView style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <ThemedText style={styles.sectionTitle}>Skills</ThemedText>
                    <TouchableOpacity onPress={addSkill} style={styles.addButton}>
                      <ThemedText style={styles.addButtonText}>+ Add</ThemedText>
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
                <ThemedView style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <ThemedText style={[styles.sectionTitle, styles.achievementTitle]}>Achievements & Certifications</ThemedText>
                    <TouchableOpacity onPress={addAchievement} style={styles.addButton}>
                      <ThemedText style={styles.addButtonText}>+ Add</ThemedText>
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
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
    color: RED,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 30,
    color: '#555',
  },
  section: {
    marginBottom: 30,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
    color: RED,
  },
  achievementTitle: {
    flex: 1,
    marginRight: 10,
    marginBottom: 0,
  },
  subSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
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