import { Alert, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedCard } from '@/components/ThemedCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';
import { Category } from '@/constants/types';
import { usePreferredTheme } from '@/hooks/preferred-theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import * as db from '@/lib/database';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';


import { IconSymbol } from '@/components/ui/icon-symbol';
import { supabase } from '@/lib/supabase';

export default function SettingsScreen() {
  const { mode, setMode } = usePreferredTheme();
  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');
  const errorColor = useThemeColor({}, 'error');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const surfaceColor = useThemeColor({}, 'surface');
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await db.loadCategories();
      setCategories(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      await db.addCategory(newCategoryName.trim());
      setNewCategoryName('');
      loadCategories();
      Alert.alert('Success', 'Category added');
    } catch (e) {
      Alert.alert('Error', 'Failed to add category');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const performDelete = async () => {
      try {
        await db.deleteCategory(id);
        loadCategories();
      } catch (e) {
        Alert.alert('Error', 'Failed to delete');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Delete Category? Are you sure?')) {
        performDelete();
      }
    } else {
      Alert.alert('Delete Category', 'Are you sure?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: performDelete,
        },
      ]);
    }
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <ThemedText type="title" style={{ fontFamily: Fonts.rounded }}>Settings</ThemedText>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>APPEARANCE</ThemedText>
        </View>

        <ThemedCard style={styles.optionCard} elevated={false}>
          <TouchableOpacity
            style={[styles.optionRow, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: borderColor + '20' }]}
            onPress={() => setMode('light')}
          >
            <View style={styles.optionInfo}>
              <View style={[styles.optionIcon, { backgroundColor: '#FDB81315' }]}>
                <ThemedText style={{ fontSize: 16 }}>☀️</ThemedText>
              </View>
              <ThemedText style={styles.optionText}>Light Mode</ThemedText>
            </View>
            <View style={[styles.radio, mode === 'light' && { borderColor: tintColor }]}>
              {mode === 'light' && <View style={[styles.radioInner, { backgroundColor: tintColor }]} />}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionRow, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: borderColor + '20' }]}
            onPress={() => setMode('dark')}
          >
            <View style={styles.optionInfo}>
              <View style={[styles.optionIcon, { backgroundColor: '#2D343615' }]}>
                <ThemedText style={{ fontSize: 16 }}>🌙</ThemedText>
              </View>
              <ThemedText style={styles.optionText}>Dark Mode</ThemedText>
            </View>
            <View style={[styles.radio, mode === 'dark' && { borderColor: tintColor }]}>
              {mode === 'dark' && <View style={[styles.radioInner, { backgroundColor: tintColor }]} />}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => setMode('system')}
          >
            <View style={styles.optionInfo}>
              <View style={[styles.optionIcon, { backgroundColor: tintColor + '15' }]}>
                <ThemedText style={{ fontSize: 16 }}>⚙️</ThemedText>
              </View>
              <ThemedText style={styles.optionText}>System Default</ThemedText>
            </View>
            <View style={[styles.radio, mode === 'system' && { borderColor: tintColor }]}>
              {mode === 'system' && <View style={[styles.radioInner, { backgroundColor: tintColor }]} />}
            </View>
          </TouchableOpacity>
        </ThemedCard>

        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>CUSTOM CATEGORIES</ThemedText>
        </View>

        <ThemedCard style={styles.categoryCard} elevated={false}>
          <View style={[styles.addCategoryRow, { backgroundColor: surfaceColor }]}>
            <TextInput
              style={[styles.categoryInput, { color: textColor }]}
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              placeholder="Enter category name"
              placeholderTextColor={textSecondary}
            />
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: tintColor }]}
              onPress={handleAddCategory}
            >
              <ThemedText style={{ color: '#fff', fontWeight: '700' }}>Add</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.categoriesList}>
            {categories.map((cat, index) => (
              <View
                key={cat.id}
                style={[
                  styles.categoryRow,
                  index !== categories.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: borderColor + '20' }
                ]}
              >
                <ThemedText style={styles.categoryLabel}>{cat.name}</ThemedText>
                <TouchableOpacity
                  onPress={() => handleDeleteCategory(cat.id)}
                  style={styles.deleteBtn}
                >
                  <ThemedText style={{ color: errorColor, fontWeight: '600', fontSize: 13 }}>Remove</ThemedText>
                </TouchableOpacity>
              </View>
            ))}

            {categories.length === 0 && (
              <View style={styles.emptyState}>
                <ThemedText style={{ color: textSecondary, fontSize: 13 }}>No custom categories yet</ThemedText>
              </View>
            )}
          </View>
        </ThemedCard>

        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>ACCOUNT</ThemedText>
        </View>

        <ThemedCard style={styles.optionCard} elevated={false}>
          <TouchableOpacity
            style={styles.optionRow}
            onPress={async () => {
              const { error } = await supabase.auth.signOut();
              if (error) Alert.alert('Error', error.message);
            }}
          >
            <View style={styles.optionInfo}>
              <View style={[styles.optionIcon, { backgroundColor: errorColor + '15' }]}>
                <ThemedText style={{ fontSize: 16 }}>🚪</ThemedText>
              </View>
              <ThemedText style={[styles.optionText, { color: errorColor }]}>Sign Out</ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={16} color={textSecondary + '40'} />
          </TouchableOpacity>
        </ThemedCard>

        <View style={styles.footer}>
          <ThemedText style={styles.versionText}>LogTracker v2.0.0</ThemedText>
          <ThemedText style={styles.creditsText}>Designed for visual excellence</ThemedText>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  sectionHeader: {
    paddingHorizontal: 24,
    marginTop: 32,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    opacity: 0.5,
  },
  optionCard: {
    marginHorizontal: 24,
    padding: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    overflow: 'hidden',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  optionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    fontSize: 15,
    fontWeight: '600',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  categoryCard: {
    marginHorizontal: 24,
    padding: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  addCategoryRow: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 6,
    marginBottom: 20,
  },
  categoryInput: {
    flex: 1,
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: '500',
  },
  addButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  categoriesList: {
    gap: 4,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  categoryLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  deleteBtn: {
    padding: 4,
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  footer: {
    marginTop: 48,
    alignItems: 'center',
    gap: 4,
  },
  versionText: {
    fontSize: 13,
    fontWeight: '700',
    opacity: 0.3,
  },
  creditsText: {
    fontSize: 11,
    fontWeight: '500',
    opacity: 0.2,
  }
});

