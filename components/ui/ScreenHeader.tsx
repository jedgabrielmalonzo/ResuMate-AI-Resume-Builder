import React from 'react';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '../themed-text';
import { ThemedView } from '../themed-view';

interface ScreenHeaderProps {
    title: string;
    subtitle?: string;
    backgroundColor?: string;
    showBorder?: boolean;
}

export default function ScreenHeader({
    title,
    subtitle,
    backgroundColor = 'transparent',
    showBorder = false
}: ScreenHeaderProps) {
    const insets = useSafeAreaInsets();
    
    return (
        <ThemedView style={[
            styles.container,
            backgroundColor !== 'transparent' ? { backgroundColor } : null,
            showBorder && styles.headerBorder
        ]}>
            <ThemedText style={styles.title}>{title}</ThemedText>
            {subtitle ? (
                <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
            ) : null}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 16,
        paddingBottom: 24,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#f1f3f5',
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1a1a2e',
        marginBottom: 8,
        letterSpacing: -0.5,
        textAlign: 'center',
        lineHeight: 32,
    },
    subtitle: {
        fontSize: 15,
        color: '#6c757d',
        textAlign: 'center',
        lineHeight: 22,
        fontWeight: '500',
    },
});
