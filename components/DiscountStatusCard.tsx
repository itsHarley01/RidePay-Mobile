import { useTheme } from "@/context/ThemeContext";
import { darkColors, lightColors } from "@/theme/colors";
import { FontAwesome5 } from "@expo/vector-icons";
import { Text, View } from "react-native";

interface DiscountStatusCardProps {
  status: "approved" | "pending" | "rejected";
  type?: string;       // e.g. "Student"
  percentage?: number; // e.g. 20
  expires?: string;    // e.g. "2025-05-01"
}

export default function DiscountStatusCard({
  status,
  type,
  percentage,
  expires,
}: DiscountStatusCardProps) {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;

  // Icon & color per status
  const statusConfig = {
    approved: { icon: "check-circle", color: "#22c55e", label: "Approved" },
    pending: { icon: "hourglass-half", color: "#facc15", label: "Pending" },
    rejected: { icon: "times-circle", color: "#ef4444", label: "Rejected" },
  };

  const { icon, color, label } = statusConfig[status];

  return (
    <View className="p-6 rounded-xl shadow-md mt-6"
      style={{ backgroundColor: colors.text }}
    >
      {/* Status Row */}
      <View className="flex-row items-center mb-4">
        <FontAwesome5 name={icon as any} size={22} color={color} />
        <Text className="ml-3 text-lg font-bold"
          style={{ color: colors.text }}
        >
          {label}
        </Text>
      </View>

      {/* Only show details if approved */}
      {status === "approved" && (
        <View>
          <Text className="text-base mb-1" style={{ color: colors.subtext }}>
            Discount Type:{" "}
            <Text className="font-bold" style={{ color: colors.text }}>
              {type ?? "N/A"}
            </Text>
          </Text>
          <Text className="text-base mb-1" style={{ color: colors.subtext }}>
            Percentage:{" "}
            <Text className="font-bold" style={{ color: colors.text }}>
              {percentage ?? 0}%
            </Text>
          </Text>
          <Text className="text-base" style={{ color: colors.subtext }}>
            Expires:{" "}
            <Text className="font-bold" style={{ color: colors.text }}>
              {expires ?? "—"}
            </Text>
          </Text>
        </View>
      )}

      {status === "pending" && (
        <Text style={{ color: colors.subtext }} className="text-base">
          Your discount application is being reviewed.
        </Text>
      )}

      {status === "rejected" && (
        <Text style={{ color: colors.subtext }} className="text-base">
          Unfortunately, your discount application was not approved.
        </Text>
      )}
    </View>
  );
}
