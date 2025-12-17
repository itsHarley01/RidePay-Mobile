import { db } from "@/firebase/firebase";
import { get, ref } from "firebase/database";

/* ======================================================
   TYPES
====================================================== */

export type PointPin = {
  lat: number;
  long: number;
};

export type SingleLocationPin = {
  id: string;
  name: string;
  lat: number;
  long: number;
  address?: string;
  type: "busStop" | "station";
};

export type RouteLocation = {
  id: string;
  name: string;
  type: "route";
  pins: PointPin[];
};

/* ======================================================
   FETCH BUS STOPS
   Node: setup_locations/busStops
====================================================== */

export const fetchBusStops = async (): Promise<SingleLocationPin[]> => {
  try {
    const snapshot = await get(ref(db, "setup_locations/busStops"));

    if (!snapshot.exists()) return [];

    const data = snapshot.val();

    return Object.entries<any>(data).map(([id, value]) => ({
      id,
      name: value.name,
      lat: value.lat,
      long: value.long,
      address: value.address,
      type: "busStop",
    }));
  } catch (error) {
    console.error("🔥 Failed to fetch bus stops:", error);
    return [];
  }
};

/* ======================================================
   FETCH STATIONS
   Node: station_location
====================================================== */

export const fetchStations = async (): Promise<SingleLocationPin[]> => {
  try {
    const snapshot = await get(ref(db, "station-location"));

    if (!snapshot.exists()) return [];

    const data = snapshot.val();

    return Object.entries<any>(data).map(([id, value]) => ({
      id,
      name: value.name,
      lat: value.lat,
      long: value.long,
      address: value.address,
      type: "station",
    }));
  } catch (error) {
    console.error("🔥 Failed to fetch stations:", error);
    return [];
  }
};

/* ======================================================
   FETCH BUS ROUTES (MULTI-PIN)
   Node: setup_locations/busRoutes/(uid)/pins/{0,1,2...}
====================================================== */

export const fetchBusRoutes = async (): Promise<RouteLocation[]> => {
  try {
    const snapshot = await get(ref(db, "setup_locations/busRoutes"));

    if (!snapshot.exists()) return [];

    const data = snapshot.val();

    return Object.entries<any>(data).map(([id, route]) => {
      const pins: PointPin[] = route.pins
        ? Object.values<any>(route.pins).map((pin) => ({
            lat: pin.lat,
            long: pin.long,
          }))
        : [];

      return {
        id,
        name: route.name,
        type: "route",
        pins,
      };
    });
  } catch (error) {
    console.error("🔥 Failed to fetch bus routes:", error);
    return [];
  }
};

/* ======================================================
   FETCH ALL LOCATIONS (OPTIONAL HELPER)
====================================================== */

export const fetchAllLocations = async () => {
  const [busStops, stations, routes] = await Promise.all([
    fetchBusStops(),
    fetchStations(),
    fetchBusRoutes(),
  ]);

  return {
    busStops,
    stations,
    routes,
  };
};
