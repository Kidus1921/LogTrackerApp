import { ThemedCard } from '@/components/ThemedCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';
import { Category } from '@/constants/types';
import { useThemeColor } from '@/hooks/use-theme-color';
import * as db from '@/lib/database';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, TextInput, TouchableOpacity, View } from 'react-native';


export default function AddLogScreen() {
  const [type, setType] = useState<'purchase' | 'repair' | 'task'>('purchase');

  // Common fields
  const [itemName, setItemName] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Purchase fields
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [vendor, setVendor] = useState('');
  const [warrantyMonths, setWarrantyMonths] = useState('');

  // Repair fields
  const [issue, setIssue] = useState('');
  const [cost, setCost] = useState('');
  const [provider, setProvider] = useState('');
  const [status, setStatus] = useState(false);

  // Task fields
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [taskCategory, setTaskCategory] = useState<'Repair' | 'Maintenance' | 'Purchase Follow-up' | 'General'>('General');
  const [description, setDescription] = useState('');

  // Categories list
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await db.loadCategories();
      setCategories(data);
      if (data.length > 0 && !category) {
        setCategory(data[0].name);
      }
    } catch (e) {
      console.error('Failed to load categories', e);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
  };


  // Theme colors
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const surfaceColor = useThemeColor({}, 'surface');

  const onSubmit = async () => {
    if (!itemName.trim()) return Alert.alert('Required', 'Please enter a name');
    try {
      if (type === 'purchase') {
        await db.addPurchase({
          item_name: itemName.trim(),
          category: category || 'Other',
          price: price ? Number(price) : undefined,
          purchase_date: date.toISOString(),
          vendor: vendor.trim(),
          warranty_months: warrantyMonths ? Number(warrantyMonths) : undefined,
          notes: notes.trim(),
        });
        Alert.alert('✅ Success', 'Purchase saved successfully');
      } else if (type === 'repair') {
        await db.addRepair({
          item_name: itemName.trim(),
          issue: issue.trim() || 'Repair logged',
          cost: cost ? Number(cost) : undefined,
          repair_date: date.toISOString(),
          provider: provider.trim(),
          status: status ? 'completed' : 'pending',
          notes: notes.trim(),
        });
        Alert.alert('✅ Success', 'Repair saved successfully');
      } else {
        await db.addTask({
          title: itemName.trim(),
          description: description.trim(),
          due_date: date.toISOString(),
          priority: priority,
          category: taskCategory,
          status: 'pending',
          is_recurring: false,
          reminders_enabled: false,
        });
        Alert.alert('✅ Success', 'Task created successfully');
      }

      // clear
      setItemName('');
      setCategory('');
      setPrice('');
      setVendor('');
      setWarrantyMonths('');
      setNotes('');
      setIssue('');
      setCost('');
      setProvider('');
      setStatus(false);
      setDescription('');
      setPriority('Medium');
      setTaskCategory('General');
    } catch (e) {
      Alert.alert('Error', 'Failed to save. Please try again.');
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor }]}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <ThemedView style={styles.header}>
        <View style={styles.iconContainer}>
          <ThemedText style={styles.iconText}>
            {type === 'purchase' ? '🛒' : type === 'repair' ? '🔧' : '✅'}
          </ThemedText>
        </View>
        <ThemedText type="title" style={{ fontFamily: Fonts.rounded }}>
          Add New {type.charAt(0).toUpperCase() + type.slice(1)}
        </ThemedText>
      </ThemedView>

      {/* Segmented Type Toggle */}
      <ThemedCard style={styles.card}>
        <ThemedText style={[styles.label, { color: textSecondary }]}>Type</ThemedText>
        <View style={[styles.segmentedControl, { backgroundColor: surfaceColor }]}>
          <TouchableOpacity
            style={[
              styles.segment,
              type === 'purchase' && { backgroundColor: tintColor },
            ]}
            onPress={() => setType('purchase')}
          >
            <ThemedText
              style={[
                styles.segmentText,
                type === 'purchase' && styles.segmentTextActive,
              ]}
            >
              🛒 Purchase
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.segment,
              type === 'repair' && { backgroundColor: tintColor },
            ]}
            onPress={() => setType('repair')}
          >
            <ThemedText
              style={[
                styles.segmentText,
                type === 'repair' && styles.segmentTextActive,
              ]}
            >
              🔧 Repair
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.segment,
              type === 'task' && { backgroundColor: tintColor },
            ]}
            onPress={() => setType('task')}
          >
            <ThemedText
              style={[
                styles.segmentText,
                type === 'task' && styles.segmentTextActive,
              ]}
            >
              ✅ Task
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedCard>

      {/* Form Fields */}
      <ThemedCard style={styles.card}>
        <ThemedText style={[styles.label, { color: textSecondary }]}>
          {type === 'task' ? 'Task Title *' : 'Item Name *'}
        </ThemedText>
        <TextInput
          style={[styles.input, { borderColor, color: textColor, backgroundColor: surfaceColor }]}
          value={itemName}
          onChangeText={setItemName}
          placeholder={type === 'task' ? "e.g. Schedule AC maintenance" : "e.g. AC unit, Laptop, etc."}
          placeholderTextColor={textSecondary}
        />

        <ThemedText style={[styles.label, { color: textSecondary }]}>
          {type === 'task' ? 'Due Date' : 'Date'}
        </ThemedText>
        <TouchableOpacity
          style={[styles.input, { borderColor, backgroundColor: surfaceColor, justifyContent: 'center' }]}
          onPress={() => setShowDatePicker(true)}
        >
          <ThemedText style={{ color: textColor }}>
            {date.toLocaleDateString()}
          </ThemedText>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}


        {type === 'purchase' ? (
          <>
            <ThemedText style={[styles.label, { color: textSecondary }]}>Category</ThemedText>
            <View style={[styles.pickerContainer, { borderColor, backgroundColor: surfaceColor }]}>
              <Picker
                selectedValue={category}
                onValueChange={(itemValue) => setCategory(itemValue)}
                style={{ color: textColor }}
                dropdownIconColor={tintColor}
              >
                {categories.map((cat) => (
                  <Picker.Item key={cat.id} label={cat.name} value={cat.name} />
                ))}
                {categories.length === 0 && (
                  <Picker.Item label="Other" value="Other" />
                )}
              </Picker>
            </View>


            <ThemedText style={[styles.label, { color: textSecondary }]}>Price ($)</ThemedText>
            <TextInput
              style={[styles.input, { borderColor, color: textColor, backgroundColor: surfaceColor }]}
              value={price}
              onChangeText={setPrice}
              placeholder="199.99"
              keyboardType="numeric"
              placeholderTextColor={textSecondary}
            />

            <ThemedText style={[styles.label, { color: textSecondary }]}>Vendor</ThemedText>
            <TextInput
              style={[styles.input, { borderColor, color: textColor, backgroundColor: surfaceColor }]}
              value={vendor}
              onChangeText={setVendor}
              placeholder="Store or supplier name"
              placeholderTextColor={textSecondary}
            />

            <ThemedText style={[styles.label, { color: textSecondary }]}>Warranty (months)</ThemedText>
            <TextInput
              style={[styles.input, { borderColor, color: textColor, backgroundColor: surfaceColor }]}
              value={warrantyMonths}
              onChangeText={setWarrantyMonths}
              placeholder="12"
              keyboardType="numeric"
              placeholderTextColor={textSecondary}
            />
          </>
        ) : type === 'repair' ? (
          <>
            <ThemedText style={[styles.label, { color: textSecondary }]}>Issue</ThemedText>
            <TextInput
              style={[styles.input, { borderColor, color: textColor, backgroundColor: surfaceColor }]}
              value={issue}
              onChangeText={setIssue}
              placeholder="Describe the problem"
              placeholderTextColor={textSecondary}
            />

            <ThemedText style={[styles.label, { color: textSecondary }]}>Repair Cost ($)</ThemedText>
            <TextInput
              style={[styles.input, { borderColor, color: textColor, backgroundColor: surfaceColor }]}
              value={cost}
              onChangeText={setCost}
              placeholder="49.50"
              keyboardType="numeric"
              placeholderTextColor={textSecondary}
            />

            <ThemedText style={[styles.label, { color: textSecondary }]}>Service Provider</ThemedText>
            <TextInput
              style={[styles.input, { borderColor, color: textColor, backgroundColor: surfaceColor }]}
              value={provider}
              onChangeText={setProvider}
              placeholder="Repair service name"
              placeholderTextColor={textSecondary}
            />

            <View style={styles.switchRow}>
              <ThemedText style={styles.switchLabel}>Mark as Completed</ThemedText>
              <Switch
                value={status}
                onValueChange={setStatus}
                trackColor={{ false: borderColor, true: tintColor + '80' }}
                thumbColor={status ? tintColor : '#f4f3f4'}
              />
            </View>
          </>
        ) : (
          <>
            <ThemedText style={[styles.label, { color: textSecondary }]}>Priority</ThemedText>
            <View style={[styles.pickerContainer, { borderColor, backgroundColor: surfaceColor }]}>
              <Picker
                selectedValue={priority}
                onValueChange={(itemValue) => setPriority(itemValue as any)}
                style={{ color: textColor }}
                dropdownIconColor={tintColor}
              >
                <Picker.Item label="Low" value="Low" />
                <Picker.Item label="Medium" value="Medium" />
                <Picker.Item label="High" value="High" />
              </Picker>
            </View>

            <ThemedText style={[styles.label, { color: textSecondary }]}>Category</ThemedText>
            <View style={[styles.pickerContainer, { borderColor, backgroundColor: surfaceColor }]}>
              <Picker
                selectedValue={taskCategory}
                onValueChange={(itemValue) => setTaskCategory(itemValue as any)}
                style={{ color: textColor }}
                dropdownIconColor={tintColor}
              >
                <Picker.Item label="General" value="General" />
                <Picker.Item label="Repair" value="Repair" />
                <Picker.Item label="Maintenance" value="Maintenance" />
                <Picker.Item label="Purchase Follow-up" value="Purchase Follow-up" />
              </Picker>
            </View>

            <ThemedText style={[styles.label, { color: textSecondary }]}>Description</ThemedText>
            <TextInput
              style={[styles.input, styles.multiline, { borderColor, color: textColor, backgroundColor: surfaceColor }]}
              value={description}
              onChangeText={setDescription}
              placeholder="Add more details about the task..."
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              placeholderTextColor={textSecondary}
            />
          </>
        )}

        {(type === 'purchase' || type === 'repair') && (
          <>
            <ThemedText style={[styles.label, { color: textSecondary }]}>Notes (Optional)</ThemedText>
            <TextInput
              style={[styles.input, styles.multiline, { borderColor, color: textColor, backgroundColor: surfaceColor }]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add any additional details..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor={textSecondary}
            />
          </>
        )}
      </ThemedCard>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, { backgroundColor: tintColor }]}
        onPress={onSubmit}
        activeOpacity={0.8}
      >
        <ThemedText style={styles.submitButtonText}>
          {type === 'task' ? '✅ Create Task' : `💾 Save ${type.charAt(0).toUpperCase() + type.slice(1)}`}
        </ThemedText>
      </TouchableOpacity>

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 44,
    paddingBottom: 20,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#10B98120',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 28,
  },

  // Cards
  card: {
    marginBottom: 16,
    padding: 20,
  },

  // Segmented Control
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginTop: 8,
  },
  segment: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  segmentText: {
    fontSize: 15,
    fontWeight: '600',
    opacity: 0.6,
  },
  segmentTextActive: {
    color: '#fff',
    opacity: 1,
  },

  // Form
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    minHeight: 50,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
  },
  multiline: {
    minHeight: 100,
    paddingTop: 14,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
  },

  // Submit Button
  submitButton: {
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
