import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { Radius, Shadow, Spacing, Swo, Type } from '@/constants/Colors';

type Variant = 'soft' | 'sticker' | 'mustard' | 'mint' | 'coral';

type Props = {
  label: string;
  variant?: Variant;
  style?: ViewStyle;
};

// Sticker chips have a thick black border + hard offset shadow — printed-zine feel.
export function Chip({ label, variant = 'soft', style }: Props) {
  const v = variantStyles[variant];
  const isSticker = variant !== 'soft';
  return (
    <View style={[styles.base, v.container, isSticker && Shadow.stickerSoft, style]}>
      <Text style={[styles.text, v.text]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: Spacing.s3,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontFamily: Type.bodySemi,
    letterSpacing: 0.2,
  },
});

const variantStyles = {
  soft: {
    container: { backgroundColor: Swo.creamDeep },
    text: { color: Swo.ink2 },
  },
  sticker: {
    container: { backgroundColor: Swo.paper, borderWidth: 2, borderColor: Swo.ink },
    text: { color: Swo.ink },
  },
  mustard: {
    container: { backgroundColor: Swo.mustard, borderWidth: 2, borderColor: Swo.ink },
    text: { color: Swo.ink },
  },
  mint: {
    container: { backgroundColor: Swo.mint, borderWidth: 2, borderColor: Swo.ink },
    text: { color: Swo.paper },
  },
  coral: {
    container: { backgroundColor: Swo.coral, borderWidth: 2, borderColor: Swo.ink },
    text: { color: Swo.paper },
  },
} as const;
