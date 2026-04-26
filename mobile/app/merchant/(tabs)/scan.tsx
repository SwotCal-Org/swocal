import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, type BarcodeScanningResult, useCameraPermissions } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Radius, Shadow, Spacing, Swo, Type } from '@/constants/Colors';

type ParsedCouponPayload = {
  v?: number;
  type?: string;
  token?: string;
  offer_id?: string;
  merchant?: string | null;
  category?: string | null;
  discount_percent?: number | null;
  status?: string;
  expires_at?: string | null;
  issued_at?: string;
};

type LocalScanEntry = {
  id: string;
  scannedAt: string;
  raw: string;
  parsed: ParsedCouponPayload | null;
  accepted: boolean;
};

const SCAN_HISTORY_KEY = 'merchant_scan_history_v1';

export default function MerchantScanTab() {
  const [permission, requestPermission] = useCameraPermissions();
  const [torchOn, setTorchOn] = useState(false);
  const [lastScanned, setLastScanned] = useState<BarcodeScanningResult | null>(null);
  const [parsedPayload, setParsedPayload] = useState<ParsedCouponPayload | null>(null);
  const [history, setHistory] = useState<LocalScanEntry[]>([]);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    void loadHistory();
  }, []);

  async function loadHistory() {
    try {
      const raw = await AsyncStorage.getItem(SCAN_HISTORY_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as LocalScanEntry[];
      if (Array.isArray(parsed)) setHistory(parsed);
    } catch {
      // ignore local history read issues
    }
  }

  async function persistHistory(next: LocalScanEntry[]) {
    try {
      await AsyncStorage.setItem(SCAN_HISTORY_KEY, JSON.stringify(next));
      setSaveError(null);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save locally');
    }
  }

  function normalizePayload(data: string): ParsedCouponPayload {
    try {
      const parsed = JSON.parse(data) as unknown;
      if (!parsed || typeof parsed !== 'object') {
        return { type: 'swocal_coupon', token: data, status: 'active' };
      }
      const payload = parsed as ParsedCouponPayload;
      return {
        ...payload,
        type: payload.type ?? 'swocal_coupon',
        token: payload.token ?? data,
      };
    } catch {
      return { type: 'swocal_coupon', token: data, status: 'active' };
    }
  }

  function onScanned(result: BarcodeScanningResult) {
    if (lastScanned) return;
    setLastScanned(result);
    const parsed = normalizePayload(result.data);
    setParsedPayload(parsed);
    const entry: LocalScanEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      scannedAt: new Date().toISOString(),
      raw: result.data,
      parsed,
      accepted: true,
    };
    const next = [entry, ...history].slice(0, 30);
    setHistory(next);
    void persistHistory(next);
  }

  if (!permission) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.centerBox}>
          <Text style={styles.title}>Preparing camera…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.wrap}>
          <View style={styles.qrCard}>
            <Text style={styles.qrEmoji}>📷</Text>
            <Text style={styles.title}>Camera access needed</Text>
            <Text style={styles.body}>
              Allow camera access to scan customer QR offers and redeem at checkout.
            </Text>
            <Pressable
              onPress={requestPermission}
              style={({ pressed }) => [styles.primaryBtn, pressed && { transform: [{ scale: 0.98 }] }]}
            >
              <Text style={styles.primaryBtnText}>Allow camera</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.cameraWrap}>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          enableTorch={torchOn}
          onBarcodeScanned={onScanned}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        />

        <View style={styles.overlay}>
          <View style={styles.headerRow}>
            <Text style={styles.scanTitle}>Scan offer QR</Text>
            <Pressable
              onPress={() => setTorchOn((v) => !v)}
              style={({ pressed }) => [
                styles.flashBtn,
                torchOn && styles.flashBtnOn,
                pressed && { opacity: 0.8 },
              ]}
            >
              <Ionicons name={torchOn ? 'flash' : 'flash-off'} size={18} color={Swo.ink} />
              <Text style={styles.flashBtnText}>{torchOn ? 'Flash on' : 'Flash off'}</Text>
            </Pressable>
          </View>

          <View style={styles.scanFrameWrap}>
            <View style={styles.scanFrame} />
          </View>

          <View style={styles.bottomCard}>
            {lastScanned ? (
              <>
                <Text style={styles.resultTitle}>Ticket accepted</Text>
                <View style={styles.payloadBlock}>
                  <Text style={styles.payloadTitle}>Scanned payload</Text>
                  <Text style={styles.resultValue}>Type: {parsedPayload?.type ?? 'swocal_coupon'}</Text>
                  <Text style={styles.resultValue}>Token: {parsedPayload?.token ?? '-'}</Text>
                  <Text style={styles.resultValue}>Offer ID: {parsedPayload?.offer_id ?? '-'}</Text>
                  <Text style={styles.resultValue}>Merchant: {parsedPayload?.merchant ?? '-'}</Text>
                  <Text style={styles.resultValue}>
                    Discount: {parsedPayload?.discount_percent != null ? `${parsedPayload.discount_percent}%` : '-'}
                  </Text>
                </View>
                {saveError ? <Text style={styles.errorText}>Local save error: {saveError}</Text> : null}
                <Pressable
                  onPress={() => {
                    setLastScanned(null);
                    setParsedPayload(null);
                  }}
                  style={({ pressed }) => [styles.primaryBtn, pressed && { transform: [{ scale: 0.98 }] }]}
                >
                  <Text style={styles.primaryBtnText}>Scan another</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={styles.body}>Center the QR inside the frame to validate and redeem instantly.</Text>
              </>
            )}
          </View>

          <View style={styles.historyCard}>
            <Text style={styles.historyTitle}>Recent local scans ({history.length})</Text>
            {history.length === 0 ? (
              <Text style={styles.historyEmpty}>No scans yet.</Text>
            ) : (
              <ScrollView style={styles.historyList} contentContainerStyle={styles.historyListContent}>
                {history.slice(0, 6).map((item) => (
                  <View key={item.id} style={styles.historyRow}>
                    <Text style={styles.historyWhen}>{new Date(item.scannedAt).toLocaleTimeString()}</Text>
                    <Text style={styles.historyText} numberOfLines={1}>
                      {item.accepted ? 'Accepted · ' : ''}
                      {item.parsed?.merchant ?? item.parsed?.token ?? item.raw}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Swo.cream },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.s6,
  },
  wrap: { flex: 1, padding: Spacing.s6, justifyContent: 'center' },
  cameraWrap: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    paddingHorizontal: Spacing.s5,
    paddingTop: Spacing.s4,
    paddingBottom: Spacing.s5,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(20, 14, 10, 0.3)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.s2,
  },
  scanTitle: {
    fontFamily: Type.displayBlack,
    fontSize: 30,
    lineHeight: 34,
    color: Swo.paper,
    letterSpacing: -0.4,
  },
  flashBtn: {
    minHeight: 38,
    borderRadius: Radius.r3,
    backgroundColor: Swo.paper,
    borderWidth: 1.5,
    borderColor: Swo.ink,
    paddingHorizontal: Spacing.s3,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  flashBtnOn: {
    backgroundColor: Swo.mustard,
  },
  flashBtnText: {
    fontFamily: Type.bodySemi,
    fontSize: 13,
    color: Swo.ink,
  },
  scanFrameWrap: {
    alignItems: 'center',
  },
  scanFrame: {
    width: 240,
    height: 240,
    borderRadius: Radius.r4,
    borderWidth: 3,
    borderColor: Swo.mustard,
    backgroundColor: 'transparent',
  },
  bottomCard: {
    backgroundColor: Swo.paper,
    borderRadius: Radius.r5,
    borderWidth: 2,
    borderColor: Swo.ink,
    padding: Spacing.s5,
    alignItems: 'center',
    gap: Spacing.s2,
    ...Shadow.sticker,
  },
  qrCard: {
    backgroundColor: Swo.paper,
    borderRadius: Radius.r5,
    borderWidth: 2,
    borderColor: Swo.ink,
    padding: Spacing.s6,
    alignItems: 'center',
    gap: Spacing.s2,
    ...Shadow.sticker,
  },
  qrEmoji: { fontSize: 56 },
  title: { fontFamily: Type.displayBlack, fontSize: 32, lineHeight: 36, color: Swo.ink, textAlign: 'center' },
  body: { fontFamily: Type.body, fontSize: 14, color: Swo.ink2, lineHeight: 21, textAlign: 'center' },
  resultTitle: {
    fontFamily: Type.displaySemi,
    fontSize: 20,
    color: Swo.ink,
  },
  resultValue: {
    fontFamily: Type.body,
    fontSize: 13,
    color: Swo.ink2,
    textAlign: 'center',
  },
  payloadBlock: {
    width: '100%',
    borderRadius: Radius.r3,
    borderWidth: 1,
    borderColor: Swo.borderSoft,
    padding: Spacing.s3,
    gap: 4,
    backgroundColor: Swo.shell,
  },
  payloadTitle: {
    fontFamily: Type.bodyBold,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: Swo.ink3,
  },
  errorText: { fontFamily: Type.bodyMedium, fontSize: 12, color: Swo.danger, textAlign: 'center' },
  historyCard: {
    backgroundColor: Swo.paper,
    borderRadius: Radius.r4,
    borderWidth: 1.5,
    borderColor: Swo.ink,
    padding: Spacing.s3,
    gap: Spacing.s2,
    ...Shadow.s1,
  },
  historyTitle: { fontFamily: Type.bodySemi, fontSize: 13, color: Swo.ink },
  historyEmpty: { fontFamily: Type.body, fontSize: 12, color: Swo.ink3 },
  historyList: { maxHeight: 120 },
  historyListContent: { gap: 6 },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.s2,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: Swo.borderSoft,
  },
  historyWhen: { width: 64, fontFamily: Type.bodyMedium, fontSize: 11, color: Swo.ink3 },
  historyText: { flex: 1, fontFamily: Type.body, fontSize: 12, color: Swo.ink2 },
  primaryBtn: {
    marginTop: Spacing.s1,
    minHeight: 44,
    borderRadius: Radius.r3,
    borderWidth: 2,
    borderColor: Swo.ink,
    backgroundColor: Swo.mustard,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.s4,
  },
  primaryBtnText: {
    fontFamily: Type.bodySemi,
    fontSize: 14,
    color: Swo.ink,
  },
});
