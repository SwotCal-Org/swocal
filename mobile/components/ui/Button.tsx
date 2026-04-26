import { ActivityIndicator, Pressable, StyleSheet, Text, View, type PressableProps } from 'react-native';
import { Radius, Shadow, Spacing, Swo, Type } from '@/constants/Colors';

type Variant = 'primary' | 'secondary' | 'ghost' | 'coral';
type Size = 'md' | 'lg';

type Props = Omit<PressableProps, 'style'> & {
  title: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
};

export function Button({ title, variant = 'primary', size = 'lg', loading, disabled, fullWidth = true, ...rest }: Props) {
  const isDisabled = disabled || loading;
  const v = variantStyles[variant];
  return (
    <View style={[fullWidth && { width: '100%' }, isDisabled && styles.disabled]}>
      <Pressable
        {...rest}
        disabled={isDisabled}
        style={({ pressed }) => [
          styles.base,
          size === 'md' && styles.md,
          v.container,
          variant !== 'ghost' && Shadow.s1,
          pressed && !isDisabled && styles.pressed,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={v.text.color} />
        ) : (
          <Text style={[styles.text, v.text]}>{title}</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 54,
    borderRadius: Radius.r3,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.s5,
    paddingVertical: Spacing.s3,
  },
  md: { minHeight: 44, paddingHorizontal: Spacing.s4 },
  text: {
    fontSize: 16,
    fontFamily: Type.bodySemi,
    letterSpacing: 0.1,
  },
  pressed: { transform: [{ scale: 0.97 }] },
  disabled: { opacity: 0.45 },
});

const variantStyles = {
  primary: {
    container: { backgroundColor: Swo.mustard, borderWidth: 2, borderColor: Swo.ink },
    text: { color: Swo.ink },
  },
  coral: {
    container: { backgroundColor: Swo.coral, borderWidth: 2, borderColor: Swo.ink },
    text: { color: Swo.paper },
  },
  secondary: {
    container: { backgroundColor: Swo.paper, borderWidth: 1, borderColor: Swo.borderSoft },
    text: { color: Swo.ink },
  },
  ghost: {
    container: { backgroundColor: 'transparent' },
    text: { color: Swo.coralDeep },
  },
} as const;
