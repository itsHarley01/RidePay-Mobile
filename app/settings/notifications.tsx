import SettingTemplate from '@/components/SettingTemplate';
import { useTheme } from '@/context/ThemeContext';
import { darkColors, lightColors } from '@/theme/colors';
import { View, Text, Switch, Platform } from 'react-native';
import { useState } from 'react';
import { Picker } from '@react-native-picker/picker';

export default function NotificationScreen() {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [muteDuration, setMuteDuration] = useState('0');
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [promoEnabled, setPromoEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const accentColor = '#6366F1';

  const muteOptions = [
    { label: 'Do not mute', value: '0' },
    { label: '1 minute', value: '1' },
    { label: '5 minutes', value: '5' },
    { label: '15 minutes', value: '15' },
    { label: '1 hour', value: '60' },
    { label: '8 hours', value: '480' },
    { label: '1 day', value: '1440' },
  ];

  const renderSwitch = (
    label: string,
    value: boolean,
    setValue: (val: boolean) => void,
    showBorder = true
  ) => (
    <View
      className={`flex-row justify-between items-center px-4 py-4 ${
        showBorder ? 'border-b border-gray-200 dark:border-gray-700' : ''
      }`}
    >
      <Text
        className="text-base"
        style={{ color: colors.text, fontWeight: '500' }}
      >
        {label}
      </Text>
      <Switch
        value={value}
        onValueChange={setValue}
        trackColor={{ false: '#d1d5db', true: `${accentColor}66` }}
        thumbColor={Platform.OS === 'android' ? (value ? accentColor : '#ccc') : undefined}
        ios_backgroundColor="#d1d5db"
      />
    </View>
  );

  return (
    <SettingTemplate title="Notification Settings">
      <View
        className="p-4"
        style={{
          backgroundColor: colors.secondaryBackground,
          borderRadius: 20,
          shadowColor: theme === 'dark' ? '#000' : '#ccc',
          shadowOpacity: 0.15,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 2 },
          elevation: 4,
        }}
      >
        <View
          style={{
            backgroundColor: theme === 'dark' ? '#1E1E24' : '#F8FAFC',
            borderRadius: 16,
            borderWidth: 1,
            borderColor: theme === 'dark' ? '#2F2F3A' : '#E2E8F0',
            overflow: 'hidden',
          }}
        >
          {/* Master Toggle */}
          {renderSwitch('Enable Notifications', notificationsEnabled, setNotificationsEnabled)}

          {/* Mute Section */}
          <View className="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
            <Text
              className="text-base mb-2"
              style={{ color: colors.text, fontWeight: '500' }}
            >
              Mute Notifications
            </Text>
            <View
              style={{
                backgroundColor: theme === 'dark' ? '#2D2D33' : '#EDF2F7',
                borderRadius: 8,
              }}
            >
              <Picker
                selectedValue={muteDuration}
                onValueChange={(value) => setMuteDuration(value)}
                dropdownIconColor={colors.text}
                style={{
                  color: colors.text,
                  height: Platform.OS === 'android' ? 60 : undefined,
                  fontSize: 16,
                }}
              >
                {muteOptions.map((option) => (
                  <Picker.Item key={option.value} label={option.label} value={option.value} />
                ))}
              </Picker>
            </View>

            {muteDuration !== '0' && (
              <Text className="text-sm mt-2" style={{ color: accentColor }}>
                Muted for {muteOptions.find((o) => o.value === muteDuration)?.label}
              </Text>
            )}
          </View>

          {/* Other Notification Toggles */}
          {renderSwitch('Push Notifications', pushEnabled, setPushEnabled)}
          {renderSwitch('Email Notifications', emailEnabled, setEmailEnabled)}
          {renderSwitch('SMS Notifications', smsEnabled, setSmsEnabled)}
          {renderSwitch('Promotional Messages', promoEnabled, setPromoEnabled)}
          {renderSwitch('Vibration', vibrationEnabled, setVibrationEnabled)}
          {renderSwitch('Sound', soundEnabled, setSoundEnabled, false)}
        </View>
      </View>
    </SettingTemplate>
  );
}
