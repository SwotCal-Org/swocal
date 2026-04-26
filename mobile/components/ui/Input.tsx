import { forwardRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { Radius, Spacing, Swo, Type } from '@/constants/Colors';

type Props = TextInputProps & {
  label?: string;
  error?: string | null;
};

export const Input = forwardRef<TextInput, Props>(function Input(
  { label, error, style, onFocus, onBlur, ...rest },
  ref
) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        ref={ref}
        placeholderTextColor={Swo.ink3}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        style={[
          styles.input,
          focused && styles.inputFocused,
          error ? styles.inputError : null,
          style,
        ]}
        {...rest}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { gap: Spacing.s2 },
  label: {
    fontSize: 13,
    color: Swo.ink2,
    fontFamily: Type.bodySemi,
    letterSpacing: 0.2,
  },
  input: {
    minHeight: 52,
    borderRadius: Radius.r3,
    borderWidth: 1.5,
    borderColor: Swo.borderSoft,
    paddingHorizontal: Spacing.s4,
    paddingVertical: Spacing.s3,
    fontSize: 16,
    color: Swo.ink,
    fontFamily: Type.body,
    backgroundColor: Swo.paper,
  },
  inputFocused: { borderColor: Swo.coral, borderWidth: 2 },
  inputError: { borderColor: Swo.danger, borderWidth: 2 },
  errorText: { fontSize: 12, color: Swo.danger, fontFamily: Type.bodyMedium },
});
