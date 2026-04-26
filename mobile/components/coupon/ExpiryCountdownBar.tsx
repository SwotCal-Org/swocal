import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Radius, Spacing, Swo, Type } from '@/constants/Colors';

type Variant = 'morning' | 'noon' | 'golden' | 'dusk';

const VARIANT: Record<Variant, { track: string; fill: string; left: string; right: string }> = {
  morning: { track: 'rgba(40,32,30,0.12)', fill: Swo.coralDeep, left: Swo.ink2, right: Swo.ink },
  noon: { track: 'rgba(50,40,0,0.2)', fill: Swo.ink, left: Swo.mustardDeep, right: Swo.ink2 },
  golden: { track: Swo.borderSoft, fill: Swo.sky, left: Swo.ink2, right: Swo.ink },
  dusk: { track: Swo.ink3, fill: Swo.coralDeep, left: Swo.ink4, right: Swo.paper },
};

const DEFAULT_WINDOW_MS = 48 * 60 * 60 * 1000;

function formatTimeLeft(remainingMs: number): string {
  if (remainingMs <= 0) return 'Expired';
  const h = Math.floor(remainingMs / 3_600_000);
  const m = Math.floor((remainingMs % 3_600_000) / 60_000);
  const s = Math.floor((remainingMs % 60_000) / 1000);
  if (h > 0) return `${h}h ${m}m left`;
  if (m > 0) return `${m}m ${s}s left`;
  return `${s}s left`;
}

type Snap = { fillRatio: number; rightLabel: string };

function computeSnapshot(
  expiresAt: string,
  createdAt: string | null | undefined,
  status: string
): Snap {
  if (!expiresAt.trim()) {
    return { fillRatio: 0, rightLabel: '' };
  }
  const end = new Date(expiresAt).getTime();
  const now = Date.now();
  const remaining = end - now;

  if (status === 'redeemed') {
    return { fillRatio: 0, rightLabel: 'Redeemed' };
  }
  if (status === 'expired') {
    return { fillRatio: 0, rightLabel: 'Expired' };
  }

  let start = createdAt
    ? new Date(createdAt).getTime()
    : end - DEFAULT_WINDOW_MS;
  if (Number.isNaN(start) || start >= end) {
    start = end - 60 * 60 * 1000;
  }
  if (now < start) {
    start = Math.min(start, end - 60_000);
  }
  const total = Math.max(1, end - start);

  if (remaining <= 0) {
    return { fillRatio: 0, rightLabel: 'Expired' };
  }
  return {
    fillRatio: Math.min(1, Math.max(0, remaining / total)),
    rightLabel: formatTimeLeft(remaining),
  };
}

type Props = {
  expiresAt: string | null | undefined;
  createdAt?: string | null;
  status: string;
  hint?: string;
  variant: Variant;
};

/** Live countdown + progress bar: time remaining in the offer window (created_at → expires_at). */
export function ExpiryCountdownBar({ expiresAt, createdAt, status, hint, variant }: Props) {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!expiresAt) return undefined;
    if (status === 'redeemed' || status === 'expired') return undefined;
    const id = setInterval(() => {
      setTick((n) => n + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [expiresAt, status]);

  if (!expiresAt) return null;

  const colors = VARIANT[variant];
  const snap = computeSnapshot(expiresAt, createdAt, status);

  return (
    <View style={styles.wrap}>
      <View style={styles.labelRow}>
        <Text style={[styles.caption, { color: colors.left }]}>Time left</Text>
        <Text style={[styles.value, { color: colors.right }]} numberOfLines={1}>
          {snap.rightLabel}
          {hint ? ` · ${hint}` : ''}
        </Text>
      </View>
      <View style={[styles.track, { backgroundColor: colors.track }]}>
        <View
          style={[
            styles.fill,
            { width: `${snap.fillRatio * 100}%`, backgroundColor: colors.fill },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignSelf: 'stretch', marginTop: Spacing.s2, gap: 6 },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.s2,
  },
  caption: { fontFamily: Type.bodySemi, fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase' },
  value: { fontFamily: Type.bodyMedium, fontSize: 13, flex: 1, textAlign: 'right' },
  track: {
    height: 6,
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: Radius.pill },
});
