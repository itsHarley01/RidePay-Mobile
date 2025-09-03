import axiosInstance from "./axiosIntance";

export interface Promo {
  id?: string;
  name: string;
  effectType: "card" | "topup" | "bus";
  photo?: string | null;
  dateRange: boolean;
  startDate?: string;
  endDate?: string;
  weekDays?: string[];
  percentage: boolean;
  discount: number;
  createdAt?: string;
  updatedAt?: string;
}


// GET all Promos
export const getPromos = async (): Promise<Promo[]> => {
  const res = await axiosInstance.get("/promos");
  return res.data;
};