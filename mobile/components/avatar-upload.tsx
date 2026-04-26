import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Radius, Shadow, Spacing, Swo, Type } from '@/constants/Colors';
import { deleteImage, uploadImage } from '@/services/upload';
import { updateMyAvatar } from '@/services/profile';

type Props = {
  /** Current avatar URL, or null if not set. */
  value: string | null;
  /** Called with the new URL after a successful upload, or null on remove. */
  onChange: (url: string | null) => void;
  /** Single character fallback shown when no avatar is set. */
  fallback: string;
  size?: number;
};

export function AvatarUpload({ value, onChange, fallback, size = 84 }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pickAndUpload() {
    setError(null);
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setError('We need photo library access to set your avatar.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (result.canceled) return;

    setBusy(true);
    try {
      const previous = value;
      const asset = result.assets[0];
      const url = await uploadImage({
        bucket: 'avatars',
        subpath: 'me',
        uri: asset.uri,
        mimeType: asset.mimeType,
      });
      await updateMyAvatar(url);
      onChange(url);
      if (previous) deleteImage('avatars', previous).catch(() => {});
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const radius = size / 2;

  return (
    <View style={styles.wrap}>
      <Pressable onPress={pickAndUpload} disabled={busy} style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}>
        <View
          style={[
            styles.avatar,
            { width: size, height: size, borderRadius: radius },
          ]}
        >
          {value ? (
            <Image source={{ uri: value }} style={{ width: size, height: size, borderRadius: radius }} />
          ) : (
            <Text style={[styles.fallback, { fontSize: size * 0.42 }]}>{fallback}</Text>
          )}
          {busy && (
            <View style={[styles.spinner, { borderRadius: radius }]}>
              <ActivityIndicator color={Swo.ink} />
            </View>
          )}
        </View>
        <View style={styles.editBadge}>
          <Text style={styles.editBadgeText}>Edit</Text>
        </View>
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: Spacing.s2 },
  avatar: {
    backgroundColor: Swo.mustard,
    borderWidth: 2,
    borderColor: Swo.ink,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...Shadow.stickerSoft,
  },
  fallback: { color: Swo.ink, fontFamily: Type.displayBlack },
  spinner: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(251, 245, 234, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: Swo.coral,
    paddingHorizontal: Spacing.s2,
    paddingVertical: 2,
    borderRadius: Radius.pill,
    borderWidth: 2,
    borderColor: Swo.ink,
  },
  editBadgeText: {
    fontFamily: Type.bodyBold,
    fontSize: 10,
    color: Swo.paper,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  error: { color: Swo.danger, fontSize: 12, fontFamily: Type.bodyMedium, textAlign: 'center', maxWidth: 220 },
});
