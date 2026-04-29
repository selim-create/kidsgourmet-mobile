import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Avatar } from '../ui/Avatar';
import type { Author } from '../../lib/types';

interface AuthorBoxProps {
  author: Author;
}

const AVATAR_SIZE = 64;
const AVATAR_BORDER_WIDTH = 3;

export function AuthorBox({ author }: AuthorBoxProps) {
  const handleAuthorPress = () => {
    router.push(`/authors/${author.id}`);
  };

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.avatarWrapper}>
          <Avatar uri={author.avatar_url} name={author.name} size={AVATAR_SIZE} />
        </View>
        <View style={styles.info}>
          <TouchableOpacity onPress={handleAuthorPress} activeOpacity={0.7} style={styles.nameRow}>
            <Text style={styles.name}>{author.name}</Text>
            {author.is_expert && (
              <View style={styles.expertBadge}>
                <Ionicons name="shield-checkmark" size={10} color="#16A34A" />
                <Text style={styles.expertBadgeText}>Uzman</Text>
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.bio} numberOfLines={4}>
            {author.bio || 'Çocuk sağlığı ve gelişimi üzerine içerikler üretiyor.'}
          </Text>
          <TouchableOpacity onPress={handleAuthorPress} activeOpacity={0.7}>
            <Text style={styles.allPostsText}>Tüm Yazıları →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    borderRadius: 24,
    padding: 16,
    marginVertical: 24,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  avatarWrapper: {
    borderRadius: AVATAR_SIZE / 2 + AVATAR_BORDER_WIDTH,
    borderWidth: AVATAR_BORDER_WIDTH,
    borderColor: '#fff',
    alignSelf: 'flex-start',
    overflow: 'hidden',
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  expertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#DCFCE7',
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  expertBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#16A34A',
  },
  bio: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
    marginTop: 4,
  },
  allPostsText: {
    color: '#F97316',
    fontWeight: '700',
    fontSize: 13,
    marginTop: 8,
  },
});
