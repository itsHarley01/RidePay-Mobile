// components/TransactionItem.tsx
import { useTheme } from '@/context/ThemeContext';
import { darkColors, lightColors } from '@/theme/colors';
import { Text, View } from 'react-native';

export default function TransactionItem({
  title,
  body,
  date,
  amount,
}: {
  title: string;
  body: string;
  date: string;
  amount: string;
}) {

  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;

  return (
    <View className="mb-4">
      <Text style={{ color: colors.subtext }} className="text-sm font-semibold">{title}</Text>
      <View className="flex-row justify-between">
        <Text style={{ color: colors.text }} className="text-base ">{body}</Text>
        <Text style={{ color: colors.text }} className="text-base ">{amount}</Text>
      </View>
      <Text style={{ color: colors.text }} className="text-xs ">{date}</Text>
    </View>
  );
}
