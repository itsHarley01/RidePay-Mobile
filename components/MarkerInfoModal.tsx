import { Entypo, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Dimensions, Text, TouchableOpacity, View } from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

type MarkerType = "topup" | "bus" | "route" | "terminal";

type BusDetails = {
  busId: string;
  busName: string;
  busUID: string;
  driver: string;
  numberOfSeats: number;
  licensePlate: string;
  assignedDevice: string | null;
  numberOfPassengers: number;
  device: {
    deviceId: string;
    deviceName: string;
    deviceUID: string;
    lat: number | null;
    long: number | null;
    speed: number;
  } | null;
};

export default function MarkerInfoModal({
  type,
  marker,
  onClose,
  distance,
  routeDetails,
  terminalDetails,
  busDetails,
}: {
  type: MarkerType;
  marker: {
    title: string;
    description?: string;
  };
  distance?: string;
  onClose: () => void;
  routeDetails?: {
    from: string;
    to: string;
    totalDistance: string;
    estimatedTime: string;
  };
  terminalDetails?: {
    terminalCode: string;
    location: string;
    description: string;
  };
  busDetails?: BusDetails;
}) {
  return (
    <View
      className="absolute bottom-0 mx-auto w-full flex-col bg-[#0A2A54] rounded-t-3xl px-6 pt-6 pb-8 z-20"
      style={{ height: SCREEN_HEIGHT * 0.35 }}
    >
      {/* Header */}
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-row items-center gap-2">
          {type === "topup" && (
            <FontAwesome5 name="money-bill-wave" size={20} color="white" />
          )}
          {type === "bus" && (
            <MaterialIcons name="directions-bus" size={24} color="white" />
          )}
          {type === "route" && (
            <FontAwesome5 name="route" size={20} color="white" />
          )}
          {type === "terminal" && (
            <FontAwesome5 name="building" size={20} color="white" />
          )}
          <Text className="text-white text-xl font-bold">
            {busDetails?.busName || marker.title}
          </Text>
        </View>

        <TouchableOpacity
          onPress={onClose}
          className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
        >
          <Entypo name="cross" size={23} color="gray" />
        </TouchableOpacity>
      </View>

      {/* Description */}
      {marker.description && (
        <Text className="text-gray-200 mb-1">{marker.description}</Text>
      )}
      {distance && (
        <Text className="text-gray-200 mb-3">
          Distance: {distance} Km
        </Text>
      )}

      {/* ================= BUS CONTENT ================= */}
      {type === "bus" && busDetails && (
        <View className="mt-2 space-y-2">
          <Text className="text-gray-300">
            Bus ID:{" "}
            <Text className="text-white font-semibold">
              {busDetails.busId}
            </Text>
          </Text>

          <Text className="text-gray-300">
            Driver:{" "}
            <Text className="text-white font-semibold">
              {busDetails.driver}
            </Text>
          </Text>

          <Text className="text-gray-300">
            License Plate:{" "}
            <Text className="text-white font-semibold">
              {busDetails.licensePlate}
            </Text>
          </Text>

          <Text className="text-gray-300">
            Seats:{" "}
            <Text className="text-white font-semibold">
              {busDetails.numberOfPassengers} /{" "}
              {busDetails.numberOfSeats}
            </Text>
          </Text>

          {busDetails.device && (
            <>
              <Text className="text-yellow-400 font-semibold">
                Speed:{" "}
                <Text className="text-white">
                  {busDetails.device.speed} km/h
                </Text>
              </Text>

              <Text className="text-gray-300">
                Location:{" "}
                <Text className="text-white font-semibold">
                  {busDetails.device.lat}, {busDetails.device.long}
                </Text>
              </Text>
            </>
          )}
        </View>
      )}

      {/* ================= ROUTE CONTENT ================= */}
      {type === "route" && routeDetails && (
        <View className="mt-2 space-y-2">
          <Text className="text-gray-300">
            From:{" "}
            <Text className="text-white font-semibold">
              {routeDetails.from}
            </Text>
          </Text>
          <Text className="text-gray-300">
            To:{" "}
            <Text className="text-white font-semibold">
              {routeDetails.to}
            </Text>
          </Text>
          <Text className="text-gray-300">
            Total Distance:{" "}
            <Text className="text-white font-semibold">
              {routeDetails.totalDistance} Km
            </Text>
          </Text>
          <Text className="text-gray-300">
            Estimated Time:{" "}
            <Text className="text-white font-semibold">
              {routeDetails.estimatedTime}
            </Text>
          </Text>
        </View>
      )}

      {/* ================= TERMINAL CONTENT ================= */}
      {type === "terminal" && terminalDetails && (
        <View className="mt-2 space-y-2">
          <Text className="text-gray-300">
            Terminal Code:{" "}
            <Text className="text-white font-semibold">
              {terminalDetails.terminalCode}
            </Text>
          </Text>
          <Text className="text-gray-300">
            Location:{" "}
            <Text className="text-white font-semibold">
              {terminalDetails.location}
            </Text>
          </Text>
          <Text className="text-gray-300">
            Description:{" "}
            <Text className="text-white font-semibold">
              {terminalDetails.description}
            </Text>
          </Text>
        </View>
      )}
    </View>
  );
}
