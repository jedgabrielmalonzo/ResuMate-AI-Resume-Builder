import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '../themed-text';
import { ThemedView } from '../themed-view';
import BackButton from './BackButton';

const RED = "#c40000";

interface ScreenHeaderProps {
    title: string;
    subtitle?: string;
    onBackPress?: () => void;
    backLabel?: string;
}

export default function ScreenHeader({
    title,
    subtitle,
    onBackPress,
    backLabel = 'Back to Home'
}: ScreenHeaderProps) {
    return (
        <ThemedView style={styles.header}>
            <BackButton onPress={onBackPress} label={backLabel} style={styles.backButton} />
            <ThemedText style={styles.title}>{title}</ThemedText>
            {subtitle && (
                <ThemedText style={styles.subtitle}>
                    {subtitle}
                </ThemedText>
            )}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    header: {
        marginBottom: 20,
        backgroundColor: 'transparent',
    },
    backButton: {
        paddingHorizontal: 0,
        marginBottom: 8,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        textAlign: 'center',
        marginBottom: 8,
        color: RED,
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        opacity: 0.7,
        marginBottom: 10,
        color: '#555',
    },
});
