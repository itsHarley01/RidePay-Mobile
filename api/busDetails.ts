import { get, ref } from "firebase/database";
import { db } from "../firebase/firebase";

/**
 * Get full bus details for a single bus
 */
export const getBusDetails = async (busId: string) => {
  try {
    const busRef = ref(db, `r1d3-py_bus/${busId}`);
    const busSnapshot = await get(busRef);

    if (!busSnapshot.exists()) return null;

    const busData = busSnapshot.val();

    // Get assigned device data
    let device = null;
    if (busData.assignedDevice) {
      const deviceRef = ref(db, `r1d3-py_devices/${busData.assignedDevice}`);
      const deviceSnapshot = await get(deviceRef);

      if (deviceSnapshot.exists()) {
        const d = deviceSnapshot.val();
        device = {
          deviceId: busData.assignedDevice,
          deviceName: d.deviceName || "",
          deviceUID: d.deviceUID || "",
          lat: d.lat ?? null,
          long: d.long ?? null,
          speed: d.speed ?? 0,
        };
      }
    }

    // Count passengers on this bus
    const passengersRef = ref(db, "p4zs3gr_usr_uu34");
    const passengersSnapshot = await get(passengersRef);

    let numberOfPassengers = 0;
    if (passengersSnapshot.exists()) {
      passengersSnapshot.forEach((childSnapshot) => {
        const passenger = childSnapshot.val();
        if (passenger.tapped && passenger.tapped.busId === busId) {
          numberOfPassengers++;
        }
      });
    }

    return {
      busId,
      busName: busData.busName || "",
      busUID: busData.busUID || "",
      driver: busData.driver || "",
      numberOfSeats: busData.numberOfSeats || 0,
      licensePlate: busData.licensePlate || "",
      assignedDevice: busData.assignedDevice || null,
      numberOfPassengers,
      device,
    };
  } catch (error) {
    console.error("Error fetching bus details:", error);
    throw error;
  }
};

/**
 * Get all buses with busId and latest lat/long if device assigned
 */
export const getAllBusesWithLocation = async () => {
  try {
    const busesRef = ref(db, "r1d3-py_bus");
    const busesSnapshot = await get(busesRef);

    if (!busesSnapshot.exists()) return [];

    const buses: Array<{
      busId: string;
      busName: string;
      lat: number | null;
      long: number | null;
    }> = [];

    for (const [busId, busData] of Object.entries<any>(busesSnapshot.val())) {
      let lat: number | null = null;
      let long: number | null = null;

      if (busData.assignedDevice) {
        const deviceRef = ref(db, `r1d3-py_devices/${busData.assignedDevice}`);
        const deviceSnapshot = await get(deviceRef);
        if (deviceSnapshot.exists()) {
          const d = deviceSnapshot.val();
          lat = d.lat ?? null;
          long = d.long ?? null;
        }
      }

      buses.push({
        busId,
        busName: busData.busName || "",
        lat,
        long,
      });
    }

    return buses;
  } catch (error) {
    console.error("Error fetching all buses with location:", error);
    throw error;
  }
};
