import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Radius, Shadow, Spacing, Swo, Type } from '@/constants/Colors';

export default function MerchantOffersTab() {
  const [tone, setTone] = useState<'conservative' | 'balanced' | 'aggressive'>('balanced');
  const [weatherBoost, setWeatherBoost] = useState(true);
  const [localIntentOnly, setLocalIntentOnly] = useState(true);
  const [instructions, setInstructions] = useState(
    'Keep copy short, warm, and specific to local context. Avoid generic urgency language.'
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Offers</Text>
        <Text style={styles.body}>Control how AI generates and targets your coupons.</Text>

        <View style={styles.aiCard}>
          <Text style={styles.aiTitle}>AI coupon controls</Text>
          <Text style={styles.aiBody}>
            Tune coupon copy, discount aggressiveness, and targeting behavior for this business.
          </Text>

          <View style={styles.controlGroup}>
            <Text style={styles.controlLabel}>Discount strategy</Text>
            <View style={styles.segment}>
              <Pill
                label="Conservative"
                active={tone === 'conservative'}
                onPress={() => setTone('conservative')}
              />
              <Pill label="Balanced" active={tone === 'balanced'} onPress={() => setTone('balanced')} />
              <Pill
                label="Aggressive"
                active={tone === 'aggressive'}
                onPress={() => setTone('aggressive')}
              />
            </View>
          </View>

          <ToggleRow
            label="Weather-aware offers"
            hint="Boost rainy/cold-day campaigns automatically."
            enabled={weatherBoost}
            onToggle={() => setWeatherBoost((v) => !v)}
          />
          <ToggleRow
            label="Intent-only targeting"
            hint="Prioritize users with strong swipe intent similarity."
            enabled={localIntentOnly}
            onToggle={() => setLocalIntentOnly((v) => !v)}
          />

          <View style={styles.instructionsWrap}>
            <Text style={styles.controlLabel}>Custom AI instructions</Text>
            <TextInput
              value={instructions}
              onChangeText={setInstructions}
              multiline
              textAlignVertical="top"
              placeholder="Example: Prioritize lunch offers on weekdays and avoid discounts over 25%."
              placeholderTextColor={Swo.ink3}
              style={styles.instructionsInput}
            />
            <View style={styles.instructionsActions}>
              <Pressable style={({ pressed }) => [styles.secondaryBtn, pressed && { opacity: 0.75 }]}>
                <Text style={styles.secondaryBtnText}>Reset</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.primaryBtn, pressed && { transform: [{ scale: 0.98 }] }]}
              >
                <Text style={styles.primaryBtnText}>Save instructions</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Pill({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.pill, active && styles.pillActive, pressed && !active && { opacity: 0.75 }]}
    >
      <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
    </Pressable>
  );
}

function ToggleRow({
  label,
  hint,
  enabled,
  onToggle,
}: {
  label: string;
  hint: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleCopy}>
        <Text style={styles.toggleLabel}>{label}</Text>
        <Text style={styles.toggleHint}>{hint}</Text>
      </View>
      <Pressable
        onPress={onToggle}
        style={({ pressed }) => [styles.switch, enabled && styles.switchOn, pressed && { opacity: 0.75 }]}
      >
        <View style={[styles.switchKnob, enabled && styles.switchKnobOn]} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Swo.cream },
  scroll: { padding: Spacing.s6, gap: Spacing.s3 },
  title: { fontFamily: Type.displayBlack, fontSize: 34, lineHeight: 38, color: Swo.ink },
  body: { fontFamily: Type.body, fontSize: 14, color: Swo.ink2, marginBottom: Spacing.s2 },
  aiCard: {
    backgroundColor: Swo.paper,
    borderRadius: Radius.r5,
    borderWidth: 2,
    borderColor: Swo.ink,
    padding: Spacing.s5,
    gap: Spacing.s3,
    ...Shadow.sticker,
  },
  aiTitle: { fontFamily: Type.displaySemi, fontSize: 24, color: Swo.ink, letterSpacing: -0.3 },
  aiBody: { fontFamily: Type.body, fontSize: 14, color: Swo.ink2, lineHeight: 21 },
  controlGroup: { gap: Spacing.s2 },
  controlLabel: {
    fontFamily: Type.bodyBold,
    fontSize: 11,
    color: Swo.coralDeep,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  segment: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.s2,
  },
  pill: {
    borderWidth: 1.5,
    borderColor: Swo.ink3,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.s3,
    paddingVertical: 8,
    backgroundColor: Swo.paper,
  },
  pillActive: {
    backgroundColor: Swo.mustard,
    borderColor: Swo.ink,
  },
  pillText: { fontFamily: Type.bodySemi, fontSize: 13, color: Swo.ink2 },
  pillTextActive: { color: Swo.ink },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.s3,
    borderTopWidth: 1,
    borderTopColor: Swo.borderSoft,
    paddingTop: Spacing.s3,
  },
  toggleCopy: { flex: 1, gap: 2 },
  toggleLabel: { fontFamily: Type.displaySemi, fontSize: 16, color: Swo.ink },
  toggleHint: { fontFamily: Type.body, fontSize: 13, color: Swo.ink2, lineHeight: 19 },
  switch: {
    width: 52,
    height: 32,
    borderRadius: Radius.pill,
    backgroundColor: Swo.creamDeep,
    borderWidth: 1.5,
    borderColor: Swo.borderSoft,
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  switchOn: {
    backgroundColor: Swo.mustardSoft,
    borderColor: Swo.ink,
  },
  switchKnob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Swo.paper,
  },
  switchKnobOn: {
    marginLeft: 22,
    backgroundColor: Swo.mustard,
  },
  instructionsWrap: { gap: Spacing.s2 },
  instructionsInput: {
    minHeight: 116,
    borderWidth: 1.5,
    borderColor: Swo.borderSoft,
    borderRadius: Radius.r3,
    backgroundColor: Swo.paper,
    color: Swo.ink,
    fontFamily: Type.body,
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: Spacing.s3,
    paddingVertical: Spacing.s3,
  },
  instructionsActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.s2,
  },
  secondaryBtn: {
    minHeight: 42,
    borderRadius: Radius.r3,
    borderWidth: 1.5,
    borderColor: Swo.ink3,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.s4,
  },
  secondaryBtnText: { fontFamily: Type.bodySemi, fontSize: 14, color: Swo.ink2 },
  primaryBtn: {
    minHeight: 42,
    borderRadius: Radius.r3,
    borderWidth: 2,
    borderColor: Swo.ink,
    backgroundColor: Swo.mustard,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.s4,
  },
  primaryBtnText: { fontFamily: Type.bodySemi, fontSize: 14, color: Swo.ink },
});
