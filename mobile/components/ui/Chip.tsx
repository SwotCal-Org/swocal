import Ionicons from '@expo/vector-icons/Ionicons';
import { Platform, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { Radius, Shadow, Spacing, Swo, Type } from '@/constants/Colors';

type Variant = 'soft' | 'sticker' | 'mustard' | 'mint' | 'coral';

type Props = {
  label: string;
  variant?: Variant;
  style?: ViewStyle;
  /** Renders a vector icon instead of relying on emoji in the label (more reliable on simulators). */
  icon?: keyof typeof Ionicons.glyphMap;
  iconSize?: number;
};

const variantIconColor: Record<Variant, string> = {
  soft: Swo.ink2,
  sticker: Swo.ink,
  mustard: Swo.ink,
  mint: Swo.paper,
  coral: Swo.paper,
};

const EMOJI_OR_SYMBOL_RE = /[\u{1F300}-\u{1FAFF}\u2600-\u27BF\u2300-\u23FF\uFE0F]/u;

// Sticker chips have a thick black border + hard offset shadow — printed-zine feel.
export function Chip({ label, variant = 'soft', style, icon, iconSize = 14 }: Props) {
  const v = variantStyles[variant];
  const isSticker = variant !== 'soft';
  const hasEmojiOrSymbol = !icon && EMOJI_OR_SYMBOL_RE.test(label);
  return (
    <View
      style={[
        styles.base,
        v.container,
        isSticker && Shadow.stickerSoft,
        style,
        icon ? styles.withIcon : null,
      ]}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={iconSize}
          color={variantIconColor[variant]}
          style={styles.leadingIcon}
        />
      ) : null}
      <Text style={[styles.text, hasEmojiOrSymbol && styles.systemGlyphText, v.text]}>{label}</Text>
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
  withIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leadingIcon: { marginRight: 4 },
  text: {
    fontSize: 12,
    fontFamily: Type.bodySemi,
    letterSpacing: 0.2,
  },
  // iOS simulator can render tofu boxes when custom fonts are used with emoji/symbol glyphs.
  // Force the platform system font only for chip labels that include these glyphs.
  systemGlyphText: {
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif', default: undefined }),
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
