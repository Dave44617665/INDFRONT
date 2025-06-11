import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Dropdown = ({ 
  label, 
  placeholder, 
  value, 
  items = [], 
  onChange,
  disabled = false,
}) => {
  const [visible, setVisible] = useState(false);

  const selectedItem = items.find(item => item.value === value);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => {
        onChange(item.value);
        setVisible(false);
      }}
    >
      <Text style={[
        styles.itemText,
        item.value === value && styles.selectedItemText
      ]}>
        {item.label}
      </Text>
      {item.value === value && (
        <Ionicons name="checkmark" size={20} color="#4B6BFB" />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <TouchableOpacity
        style={[
          styles.button,
          disabled && styles.buttonDisabled
        ]}
        onPress={() => !disabled && setVisible(true)}
      >
        <Text style={[
          styles.buttonText,
          !selectedItem && styles.placeholderText
        ]}>
          {selectedItem ? selectedItem.label : placeholder}
        </Text>
        <Ionicons 
          name="chevron-down" 
          size={20} 
          color={disabled ? "#A1A1AA" : "#71727A"} 
        />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{label || 'Select an option'}</Text>
                  <TouchableOpacity 
                    onPress={() => setVisible(false)}
                    style={styles.closeButton}
                  >
                    <Ionicons name="close" size={24} color="#1A1C1E" />
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={items}
                  renderItem={renderItem}
                  keyExtractor={item => String(item.value)}
                  showsVerticalScrollIndicator={false}
                  ListEmptyComponent={
                    <Text style={styles.emptyText}>No options available</Text>
                  }
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1C1E',
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#F8F9FB',
    borderColor: '#E5E5EA',
  },
  buttonText: {
    fontSize: 16,
    color: '#1A1C1E',
  },
  placeholderText: {
    color: '#71727A',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1C1E',
  },
  closeButton: {
    padding: 4,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  itemText: {
    fontSize: 16,
    color: '#1A1C1E',
  },
  selectedItemText: {
    color: '#4B6BFB',
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 16,
    color: '#71727A',
    textAlign: 'center',
    padding: 16,
  },
});

export default Dropdown; 