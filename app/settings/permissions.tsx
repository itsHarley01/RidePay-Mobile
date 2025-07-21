import SettingTemplate from '@/components/SettingTemplate';
import { useTheme } from '@/context/ThemeContext';
import { darkColors, lightColors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  Modal,
  FlatList,
  Pressable,
} from 'react-native';

const permissionOptions = [
  { label: 'Allow all the time', value: 'always' },
  { label: 'Allow only while using the app', value: 'while_using' },
  { label: 'Ask every time', value: 'ask_every_time' },
  { label: "Don’t allow", value: 'denied' },
];

export default function PermissionsScreen() {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;

  const [locationPermission, setLocationPermission] = useState('while_using');
  const [cameraPermission, setCameraPermission] = useState('ask_every_time');
  const [modalVisible, setModalVisible] = useState(false);
  const [currentSetting, setCurrentSetting] = useState<'location' | 'camera'>('location');

  const getLabel = (value: string) => permissionOptions.find(o => o.value === value)?.label;

  const openModal = (setting: 'location' | 'camera') => {
    setCurrentSetting(setting);
    setModalVisible(true);
  };

  const selectOption = (value: string) => {
    if (currentSetting === 'location') setLocationPermission(value);
    else setCameraPermission(value);
    setModalVisible(false);
  };

  const renderDropdown = (
  label: string,
  value: string,
  icon: React.ReactNode,
  onPress: () => void
) => (
  <View style={{ marginBottom: 20 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
      {icon}
      <Text style={{ color: colors.text, fontSize: 16, marginLeft: 8 }}>{label}</Text>
    </View>
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: theme === 'dark' ? '#2b2b36' : '#fff',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme === 'dark' ? '#444' : '#ccc',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Text style={{ color: colors.text, fontSize: 15 }}>{getLabel(value)}</Text>
      <Ionicons name="chevron-down" size={18} color={colors.text} />
    </TouchableOpacity>
  </View>
);

  return (
    <SettingTemplate title="App Permissions">
      <View style={{ paddingHorizontal: 20, paddingBottom: 60 }}>
        <Text
          style={{
            color: colors.text,
            fontSize: 18,
            fontWeight: '600',
            marginBottom: 24,
            textAlign: 'center',
          }}
        >
          Manage what the app can access
        </Text>

        {renderDropdown(
          'Location Access',
          locationPermission,
          <Ionicons name="location-outline" size={20} color={colors.text} />,
          () => openModal('location')
        )}

        {renderDropdown(
          'Camera Access',
          cameraPermission,
          <Ionicons name="camera-outline" size={20} color={colors.text} />,
          () => openModal('camera')
        )}

        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <Pressable
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.5)',
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 30,
            }}
            onPress={() => setModalVisible(false)}
          >
            <View
              style={{
                backgroundColor: theme === 'dark' ? '#2b2b36' : '#fff',
                padding: 20,
                borderRadius: 10,
                width: '100%',
              }}
            >
              {permissionOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => selectOption(option.value)}
                  style={{
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderColor: theme === 'dark' ? '#444' : '#eee',
                  }}
                >
                  <Text style={{ color: colors.text, fontSize: 16 }}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Modal>
      </View>
    </SettingTemplate>
  );
}
