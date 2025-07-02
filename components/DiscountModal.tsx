// app/components/ModalMessage.tsx
import { useTheme } from '@/context/ThemeContext';
import { darkColors, lightColors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

interface ModalMessageProps {
  visible: boolean;
  onClose: () => void;
  onPrimaryAction?: () => void;
  title: string;
  message: string;
  primaryButtonText?: string;
}

export default function ModalMessage({
  visible,
  onClose,
  onPrimaryAction,
  title,
  message,
  primaryButtonText = 'OK',
}: ModalMessageProps) {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View className="flex-1 justify-center items-center bg-black/50 px-4">
        <View style={{ backgroundColor: colors.placeholder }} className=" elevation-lg rounded-xl w-[90%] h-[50%]">
          {/* Close Button */}
          <TouchableOpacity
            onPress={onClose}
            className="absolute top-5 right-5 z-10"
          >
            <Ionicons name="close" size={28} color={colors.subtext} />
          </TouchableOpacity>

          {/* Modal Content */}
          <View className="flex-1 justify-center items-center px-4 my-auto">
            <Text style={{ color: colors.text }} className="text-6xl font-bold mb-4 text-center">Oops!</Text>
            <Text style={{ color: colors.text }} className="text-2xl font-bold mb-2 text-center">{title}</Text>
            <Text style={{ color: colors.text }} className="text-base mb-6 text-center">{message}</Text>

            {onPrimaryAction && (
              <TouchableOpacity
                onPress={onPrimaryAction}
                className="bg-[#0c2340] p-3 rounded-xl items-center w-full absolute bottom-1 mb-10"
              >
                <Text className="text-yellow-400 font-semibold text-lg">{primaryButtonText}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}
