import { get, ref } from "firebase/database";
import { db } from "../firebase/firebase";

/**
 * Get full bus details including:
 * - bus info
 * - assigned device info
 * - number of passengers tapped in this bus
 */
export const getBusDetails = async (busId: string) => {
  try {
    /* ---------------- BUS DATA ---------------- */
    const busRef = ref(db, `r1d3-py_bus/${busId}`);
    const busSnapshot = await get(busRef);

    if (!busSnapshot.exists()) {
      return null;
    }

    const busData = busSnapshot.val();

    /* ---------------- DEVICE DATA ---------------- */
    let device = null;

    if (busData.assignedDevice) {
      const deviceRef = ref(
        db,
        `r1d3-py_devices/${busData.assignedDevice}`
      );
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

    /* ---------------- PASSENGER COUNT ---------------- */
    const passengersRef = ref(db, "p4zs3gr_usr_uu34");
    const passengersSnapshot = await get(passengersRef);

    let numberOfPassengers = 0;

    if (passengersSnapshot.exists()) {
      passengersSnapshot.forEach((childSnapshot) => {
        const passenger = childSnapshot.val();

        if (
          passenger.tapped &&
          passenger.tapped.busId === busId
        ) {
          numberOfPassengers++;
        }
      });
    }

    /* ---------------- FINAL OBJECT ---------------- */
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
    console.error("Error fetching full bus details:", error);
    throw error;
  }
};
