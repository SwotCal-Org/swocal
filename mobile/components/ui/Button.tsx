import { ActivityIndicator, Pressable, StyleSheet, Text, type PressableProps } from 'react-native';
import { Brand } from '@/constants/Colors';

type Variant = 'primary' | 'secondary' | 'ghost';

type Props = Omit<PressableProps, 'style'> & {
  title: string;
  variant?: Variant;
  loading?: boolean;
};

export function Button({ title, variant = 'primary', loading, disabled, ...rest }: Props) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      {...rest}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant].container,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variantStyles[variant].text.color} />
      ) : (
        <Text style={[styles.text, variantStyles[variant].text]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  text: { fontSize: 16, fontWeight: '600', letterSpacing: 0.2 },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },
});

const variantStyles = {
  primary: {
    container: { backgroundColor: Brand.primary },
    text: { color: '#FFFFFF' },
  },
  secondary: {
    container: { backgroundColor: Brand.surface, borderWidth: 1, borderColor: Brand.border },
    text: { color: Brand.text },
  },
  ghost: {
    container: { backgroundColor: 'transparent' },
    text: { color: Brand.primary },
  },
} as const;
