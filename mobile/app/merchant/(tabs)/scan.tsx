import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, type BarcodeScanningResult, useCameraPermissions } from 'expo-camera';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Radius, Shadow, Spacing, Swo, Type } from '@/constants/Colors';

export default function MerchantScanTab() {
  const [permission, requestPermission] = useCameraPermissions();
  const [torchOn, setTorchOn] = useState(false);
  const [lastScanned, setLastScanned] = useState<BarcodeScanningResult | null>(null);

  function onScanned(result: BarcodeScanningResult) {
    if (lastScanned) return;
    setLastScanned(result);
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
                <Text style={styles.resultTitle}>Code detected</Text>
                <Text style={styles.resultValue} numberOfLines={2}>
                  {lastScanned.data}
                </Text>
                <Pressable
                  onPress={() => setLastScanned(null)}
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
