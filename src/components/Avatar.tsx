// src/components/Avatar.tsx
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: number;
  online?: boolean;
}

function getInitials(name?: string) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  const initials = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '');
  return initials.join('') || '?';
}

export default function Avatar({ uri, name, size = 48, online }: AvatarProps) {
  const dimensionStyle = { width: size, height: size, borderRadius: size / 2 };

  return (
    <View style={{ width: size, height: size }}>
      {uri ? (
        <Image source={{ uri }} style={[styles.image, dimensionStyle]} />
      ) : (
        <View style={[styles.placeholder, dimensionStyle]}>
          <Text style={[styles.initials, { fontSize: size * 0.38 }]}>{getInitials(name)}</Text>
        </View>
      )}
      {online !== undefined && (
        <View
          style={[
            styles.dot,
            {
              backgroundColor: online ? colors.online : colors.offline,
              width: size * 0.28,
              height: size * 0.28,
              borderRadius: (size * 0.28) / 2,
              right: 0,
              bottom: 0,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.surfaceAlt,
  },
  placeholder: {
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: colors.primary,
    fontWeight: '700',
  },
  dot: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: colors.white,
  },
});
