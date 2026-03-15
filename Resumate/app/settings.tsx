import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    SafeAreaView,
    Alert,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { Ionicons } from '@expo/vector-icons';

const RED = '#c40000';

export default function SettingsScreen() {
    const router = useRouter();
    const { logout, user } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
            router.replace('/auth/login');
        } catch (error) {
            Alert.alert('Error', 'Failed to sign out. Please try again.');
        }
    };

    const SettingItem = ({ icon, label, onPress, value }: { icon: string; label: string; onPress: () => void; value?: string }) => (
        <TouchableOpacity style={styles.settingItem} onPress={onPress}>
            <View style={styles.settingLeft}>
                <View style={styles.iconContainer}>
                    <Ionicons name={icon as any} size={20} color={RED} />
                </View>
                <Text style={styles.settingLabel}>{label}</Text>
            </View>
            <View style={styles.settingRight}>
                {value && <Text style={styles.settingValue}>{value}</Text>}
                <Ionicons name="chevron-forward" size={18} color="#adb5bd" />
            </View>
        </TouchableOpacity>
    );

    const SectionTitle = ({ title }: { title: string }) => (
        <Text style={styles.sectionTitle}>{title}</Text>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar barStyle="dark-content" />

            <View style={styles.headerPadding}>
                <ScreenHeader title="Settings" />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Profile Summary */}
                <View style={styles.profileSummary}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>
                            {user?.displayName ? user.displayName.split(' ').map(n => n[0]).join('') : user?.email?.[0]?.toUpperCase() || 'U'}
                        </Text>
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.profileName}>{user?.displayName || 'User'}</Text>
                        <Text style={styles.profileEmail}>{user?.email}</Text>
                    </View>
                </View>

                {/* Preferences Section */}
                <View style={styles.section}>
                    <SectionTitle title="Preferences" />
                    <SettingItem
                        icon="color-palette-outline"
                        label="Theme"
                        value="Light"
                        onPress={() => Alert.alert('Theme', 'Dark mode is coming soon!')}
                    />
                    <SettingItem
                        icon="notifications-outline"
                        label="Notifications"
                        onPress={() => Alert.alert('Notifications', 'Notification settings coming soon!')}
                    />
                    <SettingItem
                        icon="language-outline"
                        label="Language"
                        value="English"
                        onPress={() => { }}
                    />
                </View>

                {/* Support Section */}
                <View style={styles.section}>
                    <SectionTitle title="Support & Info" />
                    <SettingItem
                        icon="shield-checkmark-outline"
                        label="Privacy Policy"
                        onPress={() => { }}
                    />
                    <SettingItem
                        icon="document-text-outline"
                        label="Terms of Service"
                        onPress={() => { }}
                    />
                    <SettingItem
                        icon="information-circle-outline"
                        label="About Resumate"
                        value="v1.0.0"
                        onPress={() => { }}
                    />
                </View>

                {/* Danger Zone */}
                <View style={styles.section}>
                    <SectionTitle title="Account" />
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Ionicons name="log-out-outline" size={20} color="#fff" />
                        <Text style={styles.logoutText}>Log Out</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    headerPadding: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
        backgroundColor: 'white',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    profileSummary: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 16,
        marginTop: 10,
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    avatarContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: RED,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    avatarText: {
        color: 'white',
        fontSize: 22,
        fontWeight: 'bold',
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#212529',
    },
    profileEmail: {
        fontSize: 14,
        color: '#6c757d',
        marginTop: 2,
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#adb5bd',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 10,
        marginLeft: 5,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#fff5f5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    settingLabel: {
        fontSize: 16,
        color: '#343a40',
        fontWeight: '500',
    },
    settingRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingValue: {
        fontSize: 14,
        color: '#6c757d',
        marginRight: 8,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#dc3545',
        padding: 16,
        borderRadius: 12,
        marginTop: 5,
        gap: 10,
    },
    logoutText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
