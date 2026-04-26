import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import * as Location from 'expo-location';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Chip } from '@/components/ui/Chip';
import { Radius, Shadow, Spacing, Swo, Type } from '@/constants/Colors';
import { supabase } from '@/lib/supabase/client';

type Coupon = {
  headline: string;
  discount: number;
  expires: string;
  status: 'active' | 'redeemed';
};

type Place = {
  id: string;
  name: string;
  address: string;
  rating: number;
  reviewCount: number;
  category: string;
  categoryEmoji: string;
  photoBg: string;
  photoEmoji: string;
  photoUrl?: string | null;
  distanceM: number;
  lat: number;
  lng: number;
  coupon?: Coupon;
};

// Stuttgart coordinates around Marktplatz / Schillerplatz.
const PLACES: Place[] = [
  {
    id: '1',
    name: 'Café Mayer',
    address: 'Marktplatz 4, Stuttgart',
    rating: 4.8,
    reviewCount: 312,
    category: 'Coffee',
    categoryEmoji: '☕',
    photoBg: Swo.coralSoft,
    photoEmoji: '☕',
    distanceM: 200,
    lat: 48.7765,
    lng: 9.1773,
    coupon: {
      headline: 'Oat flat white, on the house',
      discount: 100,
      expires: 'Today, 13:47',
      status: 'active',
    },
  },
  {
    id: '2',
    name: 'Bäckerei Anna',
    address: 'Königstraße 18, Stuttgart',
    rating: 4.6,
    reviewCount: 198,
    category: 'Bakery',
    categoryEmoji: '🥐',
    photoBg: Swo.mustardSoft,
    photoEmoji: '🥐',
    distanceM: 90,
    lat: 48.7787,
    lng: 9.1795,
    coupon: {
      headline: 'Two croissants for one',
      discount: 50,
      expires: 'Today, 11:30',
      status: 'active',
    },
  },
  {
    id: '3',
    name: 'Konditorei Nest',
    address: 'Schillerplatz 3, Stuttgart',
    rating: 4.7,
    reviewCount: 156,
    category: 'Cake',
    categoryEmoji: '🍰',
    photoBg: Swo.mintSoft,
    photoEmoji: '🍰',
    distanceM: 850,
    lat: 48.7758,
    lng: 9.1820,
    coupon: {
      headline: 'Slice of cherry tart',
      discount: 30,
      expires: 'Yesterday',
      status: 'redeemed',
    },
  },
  // Non-coupon places — show as regular shop cards on tap.
  {
    id: '4',
    name: 'Weinstube Klink',
    address: 'Bohnenviertel 12, Stuttgart',
    rating: 4.5,
    reviewCount: 87,
    category: 'Wine bar',
    categoryEmoji: '🍷',
    photoBg: Swo.plumSoft,
    photoEmoji: '🍷',
    distanceM: 340,
    lat: 48.7741,
    lng: 9.1812,
  },
  {
    id: '5',
    name: 'Eisdiele Sole',
    address: 'Marienstraße 8, Stuttgart',
    rating: 4.9,
    reviewCount: 421,
    category: 'Gelato',
    categoryEmoji: '🍨',
    photoBg: Swo.skySoft,
    photoEmoji: '🍨',
    distanceM: 410,
    lat: 48.7728,
    lng: 9.1769,
  },
];

const STUTTGART_REGION = {
  latitude: 48.7770,
  longitude: 9.1795,
  latitudeDelta: 0.012,
  longitudeDelta: 0.012,
};

// Cream-tinted Google Maps style (Android). Apple Maps on iOS uses mutedStandard.
const SWOCAL_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: Swo.cream }] },
  { elementType: 'labels.text.fill', stylers: [{ color: Swo.ink2 }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: Swo.cream }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.neighborhood', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: Swo.mintSoft }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: Swo.mintDeep }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: Swo.paper }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: Swo.ink3 }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: Swo.creamDeep }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: Swo.mustardSoft }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: Swo.mustard }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: Swo.skySoft }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: Swo.sky }] },
];

const CREAM_CLEAR = 'rgba(251, 245, 234, 0)';

type PermStatus = 'unknown' | 'granted' | 'denied';
type CouponRecord = {
  id: string;
  google_place_id: string;
  business_name: string;
  business_address: string | null;
  business_category: string | null;
  headline: string;
  discount_percent: number;
  expires_at: string;
  status: 'active' | 'redeemed';
};

const DEV_GOOGLE_PLACES_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? process.env.GOOGLE_MAPS_API_KEY ?? '';
const GOOGLE_INCLUDED_TYPES = [
  'restaurant',
  'cafe',
  'bakery',
  'bar',
  'beauty_salon',
  'spa',
  'gym',
  'clothing_store',
  'shopping_mall',
  'supermarket',
  'store',
] as const;

export default function CouponsScreen() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const isWide = width >= 600;

  const [view, setView] = useState<'list' | 'map'>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [permission, setPermission] = useState<PermStatus>('unknown');
  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  const [mapPlaces, setMapPlaces] = useState<Place[]>(PLACES);
  const [couponRows, setCouponRows] = useState<CouponRecord[]>([]);
  const [mapError, setMapError] = useState<string | null>(null);
  const mapRef = useRef<MapView>(null);

  const mapCouponByPlaceId = useMemo(() => {
    const map = new Map<string, CouponRecord>();
    for (const row of couponRows) {
      if (!map.has(row.google_place_id)) map.set(row.google_place_id, row);
    }
    return map;
  }, [couponRows]);

  const mapPlacesWithCoupons = useMemo(
    () =>
      mapPlaces.map((place) => {
        const row = mapCouponByPlaceId.get(place.id);
        if (!row) return place;
        return {
          ...place,
          coupon: {
            headline: row.headline,
            discount: row.discount_percent,
            expires: formatExpiry(row.expires_at),
            status: row.status,
          },
        } satisfies Place;
      }),
    [mapCouponByPlaceId, mapPlaces]
  );

  const couponPlaces = useMemo(
    () =>
      couponRows.map((row) => {
        const mapped = mapPlaces.find((p) => p.id === row.google_place_id);
        const category = row.business_category ?? mapped?.category ?? 'Local business';
        const emoji = mapped?.photoEmoji ?? categoryEmoji(category);
        return {
          id: `coupon-${row.id}`,
          name: row.business_name || mapped?.name || 'Local business',
          address: row.business_address ?? mapped?.address ?? 'Nearby',
          rating: mapped?.rating ?? 4.5,
          reviewCount: mapped?.reviewCount ?? 0,
          category,
          categoryEmoji: mapped?.categoryEmoji ?? emoji,
          photoBg: mapped?.photoBg ?? photoBgByCategory(category),
          photoEmoji: emoji,
          distanceM: mapped?.distanceM ?? 0,
          lat: mapped?.lat ?? STUTTGART_REGION.latitude,
          lng: mapped?.lng ?? STUTTGART_REGION.longitude,
          coupon: {
            headline: row.headline,
            discount: row.discount_percent,
            expires: formatExpiry(row.expires_at),
            status: row.status,
          },
        } satisfies Place;
      }),
    [couponRows, mapPlaces]
  );

  const active = couponPlaces.filter((p) => p.coupon!.status === 'active');
  const past = couponPlaces.filter((p) => p.coupon!.status === 'redeemed');
  const selected = selectedId ? mapPlacesWithCoupons.find((p) => p.id === selectedId) ?? null : null;

  useEffect(() => {
    loadCoupons();
  }, []);

  // When user switches to the map, check permission and recenter (or prompt).
  useEffect(() => {
    if (view !== 'map') return;
    let cancelled = false;
    (async () => {
      const current = await Location.getForegroundPermissionsAsync();
      if (cancelled) return;
      if (current.status === 'granted') {
        setPermission('granted');
        const coords = await recenterToUser();
        if (coords) {
          await loadNearbyMapPlaces(coords.latitude, coords.longitude);
        } else {
          await loadNearbyMapPlaces(STUTTGART_REGION.latitude, STUTTGART_REGION.longitude);
        }
      } else {
        setPermission(current.status === 'denied' ? 'denied' : 'unknown');
        await loadNearbyMapPlaces(STUTTGART_REGION.latitude, STUTTGART_REGION.longitude);
        setPermissionModalOpen(true);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  async function recenterToUser() {
    try {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      mapRef.current?.animateCamera(
        {
          center: { latitude: loc.coords.latitude, longitude: loc.coords.longitude },
          zoom: 16,
          pitch: 0,
          heading: 0,
        },
        { duration: 700 }
      );
      return { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
    } catch {
      // Silently ignore — user keeps the default Stuttgart view.
      return null;
    }
  }

  async function loadNearbyMapPlaces(lat: number, lng: number) {
    if (!DEV_GOOGLE_PLACES_KEY) {
      setMapError('Missing EXPO_PUBLIC_GOOGLE_MAPS_API_KEY');
      return;
    }
    try {
      const res = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Goog-Api-Key': DEV_GOOGLE_PLACES_KEY,
          'X-Goog-FieldMask':
            'places.id,places.displayName,places.formattedAddress,places.location,places.types,places.rating,places.userRatingCount,places.photos',
        },
        body: JSON.stringify({
          maxResultCount: 20,
          includedTypes: GOOGLE_INCLUDED_TYPES,
          locationRestriction: {
            circle: {
              center: { latitude: lat, longitude: lng },
              radius: 3000,
            },
          },
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        setMapError(`Places API ${res.status}: ${text.slice(0, 140)}`);
        return;
      }
      const payload = (await res.json()) as {
        places?: Array<{
          id?: string;
          displayName?: { text?: string };
          formattedAddress?: string;
          location?: { latitude?: number; longitude?: number };
          types?: string[];
          rating?: number;
          userRatingCount?: number;
          photos?: Array<{ name?: string }>;
        }>;
      };
      const nextPlaces: Place[] = [];
      for (const p of payload.places ?? []) {
        const placeLat = p.location?.latitude;
        const placeLng = p.location?.longitude;
        if (!p.id || !p.displayName?.text || !Number.isFinite(placeLat) || !Number.isFinite(placeLng)) {
          continue;
        }
        const category = p.types?.[0] ? p.types[0].replace(/_/g, ' ') : 'Local business';
        const emoji = categoryEmoji(category);
        nextPlaces.push({
          id: p.id,
          name: p.displayName.text,
          address: p.formattedAddress ?? 'Nearby',
          rating: Number.isFinite(p.rating) ? Number(p.rating) : 4.5,
          reviewCount: Number.isFinite(p.userRatingCount) ? Number(p.userRatingCount) : 0,
          category,
          categoryEmoji: emoji,
          photoBg: photoBgByCategory(category),
          photoEmoji: emoji,
          photoUrl: toGooglePlacePhotoUrl(p.photos?.[0]?.name),
          distanceM: distanceMeters(lat, lng, Number(placeLat), Number(placeLng)),
          lat: Number(placeLat),
          lng: Number(placeLng),
        });
      }
      if (nextPlaces.length > 0) {
        setMapError(null);
        setMapPlaces(nextPlaces);
        mapRef.current?.fitToCoordinates(
          nextPlaces.map((p) => ({ latitude: p.lat, longitude: p.lng })),
          {
            edgePadding: { top: 120, right: 80, bottom: 220, left: 80 },
            animated: true,
          }
        );
      } else {
        setMapError('No nearby places returned for this area.');
      }
    } catch (err) {
      setMapError(err instanceof Error ? err.message : 'Failed to load nearby places');
    }
  }

  async function loadCoupons() {
    const sb = supabase as any;
    const { data, error } = await sb
      .from('store_coupons')
      .select(
        'id,google_place_id,business_name,business_address,business_category,headline,discount_percent,expires_at,status'
      )
      .order('created_at', { ascending: false });
    if (error) return;
    setCouponRows((data ?? []) as CouponRecord[]);
  }

  async function requestPermission() {
    const res = await Location.requestForegroundPermissionsAsync();
    if (res.status === 'granted') {
      setPermission('granted');
      setPermissionModalOpen(false);
      const coords = await recenterToUser();
      if (coords) await loadNearbyMapPlaces(coords.latitude, coords.longitude);
    } else {
      setPermission('denied');
    }
  }

  function handleLocatePress() {
    if (permission === 'granted') {
      recenterToUser();
    } else {
      setPermissionModalOpen(true);
    }
  }

  return (
    <View style={styles.root}>
      {view === 'map' && (
        <View style={StyleSheet.absoluteFill}>
          <CouponMap
            mapRef={mapRef}
            places={mapPlacesWithCoupons}
            selectedId={selectedId}
            onSelectPlace={setSelectedId}
            showsUserDot={permission === 'granted'}
          />
        </View>
      )}

      {/* Top chrome — solid cream behind notch/header/segment, then a soft fade. */}
      <View style={styles.chromeWrap} pointerEvents="box-none">
        <View style={[styles.chromeSolid, { paddingTop: insets.top }]}>
          <View style={[styles.chromeInner, isWide && styles.chromeWide]}>
            <View style={styles.header}>
              <Text style={styles.eyebrow}>Your coupons</Text>
              <Text style={styles.title}>Saved for the right moment</Text>
            </View>
            <View style={styles.segment}>
              <SegmentBtn label="List" active={view === 'list'} onPress={() => setView('list')} />
              <SegmentBtn label="Map" active={view === 'map'} onPress={() => setView('map')} />
            </View>
          </View>
        </View>
        <LinearGradient
          colors={[Swo.cream, CREAM_CLEAR]}
          style={styles.chromeFade}
          pointerEvents="none"
        />
      </View>

      {view === 'list' && (
        <ScrollView
          style={styles.listScroll}
          contentContainerStyle={[
            styles.listContent,
            isWide && styles.listContentWide,
            { paddingBottom: tabBarHeight + Spacing.s6 },
          ]}
        >
          <Text style={styles.section}>Ready to redeem · {active.length}</Text>
          <View style={styles.list}>
            {active.length === 0 ? (
              <EmptyState />
            ) : (
              active.map((p) => <CouponRow key={p.id} place={p} />)
            )}
          </View>

          {past.length > 0 && (
            <>
              <Text style={[styles.section, styles.sectionMt]}>Used</Text>
              <View style={styles.list}>
                {past.map((p) => (
                  <CouponRow key={p.id} place={p} />
                ))}
              </View>
            </>
          )}
        </ScrollView>
      )}

      {/* Map overlays — recenter button + selected place card. */}
      {view === 'map' && (
        <>
          {/* Cream-tinted strip covering the Apple Maps logo at bottom-left.
              MapKit doesn't expose a prop to hide it, so we mask it. */}
          {Platform.OS === 'ios' && (
            <View
              pointerEvents="none"
              style={[styles.appleLogoCover, { bottom: tabBarHeight }]}
            />
          )}

          <Pressable
            onPress={handleLocatePress}
            accessibilityRole="button"
            accessibilityLabel="Center on my location"
            style={({ pressed }) => [
              styles.locateBtn,
              {
                bottom: Math.max(insets.bottom, Spacing.s3),
                right: Spacing.s5,
              },
              pressed && { transform: [{ scale: 0.94 }] },
            ]}
          >
            <Text style={styles.locateBtnIcon}>📍</Text>
          </Pressable>

          {mapError ? (
            <View
              style={[
                styles.mapErrorCard,
                {
                  bottom: selected ? tabBarHeight + 210 : tabBarHeight + 92,
                },
              ]}
            >
              <View style={styles.mapErrorHeader}>
                <Text style={styles.mapErrorTitle}>Nearby load failed</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Hide map error"
                  onPress={() => setMapError(null)}
                  style={({ pressed }) => [styles.mapErrorClose, pressed && { opacity: 0.7 }]}
                >
                  <Text style={styles.mapErrorCloseText}>×</Text>
                </Pressable>
              </View>
              <Text selectable style={styles.mapErrorText}>
                {mapError}
              </Text>
            </View>
          ) : null}

          {selected && (
            <View
              style={[
                styles.placeCardWrap,
                { bottom: tabBarHeight + Spacing.s4 },
                isWide && styles.placeCardWide,
              ]}
            >
              {selected.coupon ? (
                <CouponPlaceCard place={selected} onClose={() => setSelectedId(null)} />
              ) : (
                <ShopPlaceCard place={selected} onClose={() => setSelectedId(null)} />
              )}
            </View>
          )}
        </>
      )}

      <LocationPermissionModal
        visible={permissionModalOpen}
        denied={permission === 'denied'}
        onAllow={requestPermission}
        onClose={() => setPermissionModalOpen(false)}
      />
    </View>
  );
}

function categoryEmoji(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes('coffee') || lower.includes('cafe')) return '☕';
  if (lower.includes('restaurant') || lower.includes('food')) return '🍽️';
  if (lower.includes('bakery')) return '🥐';
  if (lower.includes('bar') || lower.includes('pub')) return '🍸';
  if (lower.includes('beauty') || lower.includes('spa')) return '💅';
  if (lower.includes('fitness') || lower.includes('gym')) return '🏋️';
  if (lower.includes('fashion') || lower.includes('retail') || lower.includes('store')) return '🛍️';
  if (lower.includes('entertain')) return '🎭';
  if (lower.includes('grocery') || lower.includes('market')) return '🛒';
  return '🏪';
}

function photoBgByCategory(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes('coffee') || lower.includes('cafe')) return Swo.coralSoft;
  if (lower.includes('beauty') || lower.includes('spa')) return Swo.plumSoft;
  if (lower.includes('fitness')) return Swo.mintSoft;
  if (lower.includes('fashion') || lower.includes('retail')) return Swo.mustardSoft;
  if (lower.includes('entertain')) return Swo.skySoft;
  return Swo.creamDeep;
}

function distanceMeters(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(6371000 * c);
}

function formatExpiry(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Soon';
  const now = Date.now();
  const diffMs = date.getTime() - now;
  if (diffMs <= 0) return 'Expired';
  const hours = Math.round(diffMs / 36e5);
  if (hours < 24) return `In ${Math.max(hours, 1)}h`;
  const days = Math.round(hours / 24);
  return `In ${days}d`;
}

function toGooglePlacePhotoUrl(photoName?: string) {
  if (!photoName || !DEV_GOOGLE_PLACES_KEY) return null;
  return `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=420&maxWidthPx=900&key=${DEV_GOOGLE_PLACES_KEY}`;
}

// ─── Segmented control ───────────────────────────────────────────────────────

function SegmentBtn({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={({ pressed }) => [
        styles.segmentBtn,
        active && styles.segmentBtnActive,
        pressed && !active && { opacity: 0.7 },
      ]}
    >
      <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{label}</Text>
    </Pressable>
  );
}

// ─── Map ─────────────────────────────────────────────────────────────────────

function CouponMap({
  mapRef,
  places,
  selectedId,
  onSelectPlace,
  showsUserDot,
}: {
  mapRef: React.RefObject<MapView | null>;
  places: Place[];
  selectedId: string | null;
  onSelectPlace: (id: string | null) => void;
  showsUserDot: boolean;
}) {
  if (Platform.OS === 'web') {
    return (
      <View style={[StyleSheet.absoluteFill, styles.mapWebFallback]}>
        <Text style={styles.mapEmoji}>🗺️</Text>
        <Text style={styles.mapTitle}>Map preview is mobile-only</Text>
        <Text style={styles.mapBody}>Open on iOS or Android to see the map.</Text>
      </View>
    );
  }

  return (
    <MapView
      ref={mapRef}
      style={StyleSheet.absoluteFill}
      provider={PROVIDER_GOOGLE}
      initialRegion={STUTTGART_REGION}
      userInterfaceStyle="light"
      mapType="standard"
      customMapStyle={SWOCAL_MAP_STYLE}
      legalLabelInsets={{ bottom: -100, right: -100, top: 0, left: 0 }}
      showsUserLocation={showsUserDot}
      showsMyLocationButton={false}
      showsCompass={false}
      showsPointsOfInterest={false}
      showsBuildings={false}
      showsTraffic={false}
      showsIndoors={false}
      toolbarEnabled={false}
      pitchEnabled={false}
      rotateEnabled={false}
      onPress={() => onSelectPlace(null)}
    >
      {places.map((p) => (
        <Marker
          key={p.id}
          coordinate={{ latitude: p.lat, longitude: p.lng }}
          anchor={{ x: 0.5, y: 1 }}
          tracksViewChanges
          onPress={(e) => {
            e.stopPropagation();
            onSelectPlace(p.id);
          }}
        >
          <StickerPin
            emoji={p.photoEmoji}
            kind={p.coupon ? (p.coupon.status === 'redeemed' ? 'redeemed' : 'active') : 'plain'}
            selected={selectedId === p.id}
          />
        </Marker>
      ))}
    </MapView>
  );
}

function StickerPin({
  emoji,
  kind,
  selected,
}: {
  emoji: string;
  kind: 'active' | 'redeemed' | 'plain';
  selected: boolean;
}) {
  const bubbleStyle =
    kind === 'active'
      ? styles.pinBubbleActive
      : kind === 'redeemed'
      ? styles.pinBubbleRedeemed
      : styles.pinBubblePlain;
  const tailColor =
    kind === 'active' ? Swo.ink : kind === 'redeemed' ? Swo.ink3 : Swo.ink2;
  return (
    <View style={[styles.pinWrap, selected && styles.pinWrapSelected]}>
      <View style={[styles.pinBubble, bubbleStyle]}>
        <Text style={styles.pinEmoji}>{emoji}</Text>
      </View>
      <View style={[styles.pinTail, { borderTopColor: tailColor }]} />
    </View>
  );
}

// ─── Place cards (open on marker tap) ────────────────────────────────────────

function CouponPlaceCard({ place, onClose }: { place: Place; onClose: () => void }) {
  const c = place.coupon!;
  const redeemed = c.status === 'redeemed';
  return (
    <View style={[styles.placeCard, styles.placeCardCoupon, redeemed && { opacity: 0.85 }]}>
      <CardCover place={place} />
      <CardHeader place={place} onClose={onClose} />
      <View style={styles.couponDivider} />
      <View style={styles.couponMetaRow}>
        <Chip
          label={redeemed ? 'Redeemed' : `${c.discount}% off`}
          variant={redeemed ? 'mint' : 'mustard'}
        />
        <Chip label={`⏱ ${c.expires}`} variant="soft" />
      </View>
      <Text style={styles.couponHeadline}>{c.headline}</Text>
      <Pressable
        accessibilityRole="button"
        disabled={redeemed}
        style={({ pressed }) => [
          styles.primaryBtn,
          redeemed && styles.primaryBtnDisabled,
          pressed && !redeemed && { transform: [{ scale: 0.98 }] },
        ]}
      >
        <Text style={styles.primaryBtnText}>
          {redeemed ? 'Already used' : 'Redeem coupon'}
        </Text>
      </Pressable>
    </View>
  );
}

function ShopPlaceCard({ place, onClose }: { place: Place; onClose: () => void }) {
  return (
    <View style={styles.placeCard}>
      <CardCover place={place} />
      <CardHeader place={place} onClose={onClose} />
      <View style={styles.shopMetaRow}>
        <Chip label={`${place.categoryEmoji}  ${place.category}`} variant="soft" />
        <Chip label={`📍 ${place.distanceM}m`} variant="soft" />
      </View>
    </View>
  );
}

function CardCover({ place }: { place: Place }) {
  if (place.photoUrl) {
    return <Image source={{ uri: place.photoUrl }} style={styles.cardCoverImage} resizeMode="cover" />;
  }
  return (
    <View style={[styles.cardCoverFallback, { backgroundColor: place.photoBg }]}>
      <Text style={styles.cardCoverFallbackEmoji}>{place.photoEmoji}</Text>
    </View>
  );
}

function CardHeader({ place, onClose }: { place: Place; onClose: () => void }) {
  return (
    <View style={styles.cardHeader}>
      <View style={[styles.cardThumb, { backgroundColor: place.photoBg }]}>
        <Text style={styles.cardThumbEmoji}>{place.photoEmoji}</Text>
      </View>
      <View style={styles.cardHeaderText}>
        <Text style={styles.cardName} numberOfLines={1}>
          {place.name}
        </Text>
        <Text style={styles.cardAddress} numberOfLines={1}>
          {place.address}
        </Text>
        <View style={styles.ratingRow}>
          <Text style={styles.ratingStar}>★</Text>
          <Text style={styles.ratingValue}>{place.rating.toFixed(1)}</Text>
          <Text style={styles.ratingCount}>({place.reviewCount})</Text>
        </View>
      </View>
      <Pressable
        onPress={onClose}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel="Close"
        style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.6 }]}
      >
        <Text style={styles.closeBtnText}>✕</Text>
      </Pressable>
    </View>
  );
}

// ─── Location permission modal ───────────────────────────────────────────────

function LocationPermissionModal({
  visible,
  denied,
  onAllow,
  onClose,
}: {
  visible: boolean;
  denied: boolean;
  onAllow: () => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
          <View style={styles.modalIconWrap}>
            <Text style={styles.modalIconEmoji}>📍</Text>
          </View>
          <Text style={styles.modalTitle}>
            {denied ? 'Location is off' : 'Find deals near you'}
          </Text>
          <Text style={styles.modalBody}>
            {denied
              ? 'Open Settings to allow location access — without it we can’t show how close each coupon is.'
              : 'Allow location so we can show coupons and shops within walking distance, and center the map on you.'}
          </Text>
          <View style={styles.modalActions}>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [styles.modalGhost, pressed && { opacity: 0.7 }]}
            >
              <Text style={styles.modalGhostText}>Not now</Text>
            </Pressable>
            <Pressable
              onPress={onAllow}
              style={({ pressed }) => [
                styles.modalPrimary,
                pressed && { transform: [{ scale: 0.98 }] },
              ]}
            >
              <Text style={styles.modalPrimaryText}>
                {denied ? 'Try again' : 'Allow location'}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── List view rows ──────────────────────────────────────────────────────────

function CouponRow({ place }: { place: Place }) {
  const c = place.coupon!;
  const redeemed = c.status === 'redeemed';
  return (
    <View style={[styles.card, redeemed && styles.cardRedeemed]}>
      <View style={[styles.thumb, { backgroundColor: place.photoBg }]}>
        <Text style={styles.thumbEmoji}>{place.photoEmoji}</Text>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.metaRow}>
          <Chip
            label={redeemed ? 'Redeemed' : `${c.discount}% off`}
            variant={redeemed ? 'mint' : 'mustard'}
          />
          <Chip label={`⏱ ${c.expires}`} variant="soft" />
          <Chip label={`📍 ${place.distanceM}m`} variant="soft" />
        </View>
        <Text style={styles.headline} numberOfLines={2}>
          {c.headline}
        </Text>
        <Text style={styles.merchant}>{place.name}</Text>
      </View>
    </View>
  );
}

function EmptyState() {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyEmoji}>🌤</Text>
      <Text style={styles.emptyTitle}>Nothing saved yet.</Text>
      <Text style={styles.emptyBody}>
        Right-swiped offers will live here, ready to redeem at the merchant.
      </Text>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Swo.cream },

  // Chrome
  chromeWrap: {},
  chromeSolid: { backgroundColor: Swo.cream },
  chromeInner: {
    paddingHorizontal: Spacing.s6,
    paddingTop: Spacing.s2,
    paddingBottom: Spacing.s4,
    gap: Spacing.s4,
  },
  chromeWide: { maxWidth: 720, alignSelf: 'center', width: '100%' },
  chromeFade: { height: Spacing.s8 },

  header: { gap: Spacing.s2 },
  eyebrow: {
    fontFamily: Type.bodySemi,
    fontSize: 12,
    color: Swo.coralDeep,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: Type.displayBlack,
    fontSize: 30,
    lineHeight: 34,
    color: Swo.ink,
    letterSpacing: -0.5,
  },

  segment: {
    flexDirection: 'row',
    backgroundColor: Swo.shell,
    borderRadius: Radius.r3,
    padding: 4,
    gap: 4,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Radius.r2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentBtnActive: {
    backgroundColor: Swo.mustard,
    borderWidth: 1.5,
    borderColor: Swo.ink,
    ...Shadow.s1,
  },
  segmentText: { fontFamily: Type.bodySemi, fontSize: 14, color: Swo.ink3 },
  segmentTextActive: { color: Swo.ink },

  // List view
  listScroll: { flex: 1 },
  listContent: {
    paddingHorizontal: Spacing.s6,
    paddingTop: Spacing.s2,
    gap: Spacing.s4,
  },
  listContentWide: {
    paddingHorizontal: Spacing.s9,
    maxWidth: 720,
    alignSelf: 'center',
    width: '100%',
  },

  mapWebFallback: {
    backgroundColor: Swo.skySoft,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.s2,
    padding: Spacing.s5,
  },
  mapEmoji: { fontSize: 44 },
  mapTitle: { fontFamily: Type.displaySemi, fontSize: 18, color: Swo.ink },
  mapBody: { fontFamily: Type.body, fontSize: 13, color: Swo.ink2, textAlign: 'center' },
  mapErrorCard: {
    position: 'absolute',
    left: Spacing.s5,
    right: Spacing.s5,
    borderRadius: Radius.r4,
    borderWidth: 2,
    borderColor: Swo.ink,
    backgroundColor: Swo.paper,
    paddingHorizontal: Spacing.s4,
    paddingVertical: Spacing.s3,
    gap: Spacing.s2,
    ...Shadow.sticker,
  },
  mapErrorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mapErrorTitle: {
    fontFamily: Type.bodyBold,
    fontSize: 12,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: Swo.coralDeep,
  },
  mapErrorClose: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Swo.ink,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Swo.cream,
  },
  mapErrorCloseText: { fontFamily: Type.bodyBold, fontSize: 14, color: Swo.ink },
  mapErrorText: { fontFamily: Type.bodyMedium, fontSize: 12, color: Swo.danger, lineHeight: 17 },

  // Sticker pin
  pinWrap: { alignItems: 'center' },
  pinWrapSelected: { transform: [{ scale: 1.12 }] },
  pinBubble: {
    width: 40,
    height: 40,
    borderRadius: Radius.r2,
    borderWidth: 2,
    borderColor: Swo.ink,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sticker,
  },
  pinBubbleActive: { backgroundColor: Swo.mustard },
  pinBubbleRedeemed: { backgroundColor: Swo.paper, opacity: 0.85 },
  pinBubblePlain: { backgroundColor: Swo.paper },
  pinEmoji: { fontSize: 20 },
  pinTail: {
    width: 0,
    height: 0,
    marginTop: -2,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 9,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },

  // Cream patch sized roughly to match the Apple Maps "Maps" credit.
  appleLogoCover: {
    position: 'absolute',
    left: 0,
    width: 110,
    height: 24,
    backgroundColor: Swo.cream,
  },

  // Locate button (floating bottom-right on the map)
  locateBtn: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: Radius.r3,
    backgroundColor: Swo.paper,
    borderWidth: 1.5,
    borderColor: Swo.ink,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sticker,
  },
  locateBtnIcon: { fontSize: 22 },

  // Place card (bottom of map)
  placeCardWrap: {
    position: 'absolute',
    left: Spacing.s5,
    right: Spacing.s5,
  },
  placeCardWide: { maxWidth: 480, alignSelf: 'center' },
  placeCard: {
    backgroundColor: Swo.paper,
    borderRadius: Radius.r4,
    borderWidth: 1,
    borderColor: Swo.borderSoft,
    padding: Spacing.s4,
    gap: Spacing.s3,
    ...Shadow.s3,
  },
  cardCoverImage: {
    width: '100%',
    height: 132,
    borderRadius: Radius.r3,
    borderWidth: 1,
    borderColor: Swo.borderSoft,
    backgroundColor: Swo.shell,
  },
  cardCoverFallback: {
    width: '100%',
    height: 132,
    borderRadius: Radius.r3,
    borderWidth: 1,
    borderColor: Swo.borderSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardCoverFallbackEmoji: { fontSize: 46, opacity: 0.92 },
  placeCardCoupon: {
    borderWidth: 2,
    borderColor: Swo.ink,
    backgroundColor: Swo.mustardSoft,
    ...Shadow.sticker,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.s3,
  },
  cardThumb: {
    width: 56,
    height: 56,
    borderRadius: Radius.r3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardThumbEmoji: { fontSize: 28, opacity: 0.85 },
  cardHeaderText: { flex: 1, gap: 2 },
  cardName: { fontFamily: Type.displaySemi, fontSize: 17, color: Swo.ink, letterSpacing: -0.2 },
  cardAddress: { fontFamily: Type.body, fontSize: 13, color: Swo.ink3 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  ratingStar: { fontSize: 13, color: Swo.mustardDeep },
  ratingValue: { fontFamily: Type.bodySemi, fontSize: 13, color: Swo.ink },
  ratingCount: { fontFamily: Type.body, fontSize: 12, color: Swo.ink3 },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: { fontSize: 14, color: Swo.ink2, fontFamily: Type.bodySemi },

  couponDivider: {
    height: 1,
    backgroundColor: Swo.ink,
    opacity: 0.18,
    marginVertical: 2,
  },
  couponMetaRow: { flexDirection: 'row', gap: Spacing.s2, flexWrap: 'wrap' },
  couponHeadline: {
    fontFamily: Type.display,
    fontSize: 18,
    lineHeight: 22,
    color: Swo.ink,
    letterSpacing: -0.2,
  },
  shopMetaRow: { flexDirection: 'row', gap: Spacing.s2, flexWrap: 'wrap' },

  primaryBtn: {
    minHeight: 46,
    borderRadius: Radius.r3,
    backgroundColor: Swo.mustard,
    borderWidth: 2,
    borderColor: Swo.ink,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.s4,
  },
  primaryBtnDisabled: { opacity: 0.55 },
  primaryBtnText: { fontFamily: Type.bodySemi, fontSize: 15, color: Swo.ink },
  secondaryBtn: {
    minHeight: 46,
    borderRadius: Radius.r3,
    backgroundColor: Swo.paper,
    borderWidth: 1.5,
    borderColor: Swo.ink,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.s4,
  },
  secondaryBtnText: { fontFamily: Type.bodySemi, fontSize: 15, color: Swo.ink },

  // Permission modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(42, 31, 26, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.s6,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: Swo.paper,
    borderRadius: Radius.r5,
    borderWidth: 2,
    borderColor: Swo.ink,
    padding: Spacing.s6,
    gap: Spacing.s3,
    alignItems: 'center',
    ...Shadow.sticker,
  },
  modalIconWrap: {
    width: 72,
    height: 72,
    borderRadius: Radius.r4,
    backgroundColor: Swo.mustardSoft,
    borderWidth: 2,
    borderColor: Swo.ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.s2,
    ...Shadow.sticker,
  },
  modalIconEmoji: { fontSize: 36 },
  modalTitle: {
    fontFamily: Type.displayBlack,
    fontSize: 22,
    lineHeight: 26,
    color: Swo.ink,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  modalBody: {
    fontFamily: Type.body,
    fontSize: 14,
    lineHeight: 20,
    color: Swo.ink2,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.s3,
    marginTop: Spacing.s2,
    width: '100%',
  },
  modalGhost: {
    flex: 1,
    minHeight: 48,
    borderRadius: Radius.r3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalGhostText: { fontFamily: Type.bodySemi, fontSize: 15, color: Swo.ink3 },
  modalPrimary: {
    flex: 1.4,
    minHeight: 48,
    borderRadius: Radius.r3,
    backgroundColor: Swo.mustard,
    borderWidth: 2,
    borderColor: Swo.ink,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.s4,
  },
  modalPrimaryText: { fontFamily: Type.bodySemi, fontSize: 15, color: Swo.ink },

  // List sections + cards
  section: {
    fontFamily: Type.bodySemi,
    fontSize: 13,
    color: Swo.ink2,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginTop: Spacing.s2,
  },
  sectionMt: { marginTop: Spacing.s5 },
  list: { gap: Spacing.s3 },
  card: {
    flexDirection: 'row',
    backgroundColor: Swo.paper,
    borderRadius: Radius.r4,
    borderWidth: 1,
    borderColor: Swo.borderSoft,
    overflow: 'hidden',
    ...Shadow.s1,
  },
  cardRedeemed: { opacity: 0.7 },
  thumb: { width: 96, alignItems: 'center', justifyContent: 'center' },
  thumbEmoji: { fontSize: 40, opacity: 0.85 },
  cardBody: { flex: 1, padding: Spacing.s4, gap: Spacing.s2 },
  metaRow: { flexDirection: 'row', gap: Spacing.s2, flexWrap: 'wrap' },
  headline: {
    fontFamily: Type.display,
    fontSize: 17,
    lineHeight: 22,
    color: Swo.ink,
    letterSpacing: -0.1,
  },
  merchant: { fontFamily: Type.bodyMedium, fontSize: 13, color: Swo.ink3 },

  empty: {
    alignItems: 'center',
    padding: Spacing.s8,
    gap: Spacing.s3,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Swo.ink4,
    borderRadius: Radius.r4,
  },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontFamily: Type.displaySemi, fontSize: 20, color: Swo.ink },
  emptyBody: {
    fontFamily: Type.body,
    fontSize: 14,
    color: Swo.ink2,
    textAlign: 'center',
    lineHeight: 20,
  },
});
