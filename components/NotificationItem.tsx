import { useTheme } from '@/context/ThemeContext';
import { darkColors, lightColors } from '@/theme/colors';
import type { ReactElement } from 'react';
import { Text, View } from 'react-native';

export default function NotificationItem({
  title,
  body,
  icon,
  date,
  status,
}: {
  title: string;
  body: string;
  icon: ReactElement;
  date: string;
  status: string;
}) {

  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;
  return (
    <View style={{ color: colors.text }} className=" border border-gray-200 rounded-xl p-4 mb-3 shadow-sm">
      <Text style={{ color: colors.subtext }} className="text-sm font-semibold mb-2">{title}</Text>

      <View className="flex-row items-start justify-between">
        <View className="flex-row flex-1">
          <View className="mr-3 mt-1">
            {icon}
          </View>
          <View className="flex-1">
            <Text style={{ color: colors.text }} className=" text-sm">{body}</Text>
            <Text style={{ color: colors.text }} className="text-xs mt-1">{date}</Text>
          </View>
        </View>

        <View className="ml-2 justify-center items-end">
          <Text style={{ color: colors.highlight }} className="text-xs font-medium ">{status}</Text>
        </View>
      </View>
    </View>
  );
}
