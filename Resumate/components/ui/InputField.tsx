import React from 'react';
import { View, TextInput, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface InputFieldProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  textColor?: string;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  containerStyle?: ViewStyle | ViewStyle[];
  style?: TextStyle | TextStyle[];
  [key: string]: any;
}

export default function InputField({
  placeholder,
  value,
  onChangeText,
  textColor = '#333',
  multiline = false,
  numberOfLines = 1,
  keyboardType = 'default',
  containerStyle = {},
  style = {},
  ...props
}: InputFieldProps) {
  return (
    <View style={[styles.inputContainer, containerStyle]}>
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        style={[
          styles.textInput,
          { color: textColor },
          multiline && styles.multilineInput,
          style
        ]}
        multiline={multiline}
        numberOfLines={numberOfLines}
        keyboardType={keyboardType}
        placeholderTextColor="#999"
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
});
