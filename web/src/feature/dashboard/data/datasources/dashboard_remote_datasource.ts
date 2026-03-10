import axiosCustom from "@/core/util/axios_custom.ts";
import type { AxiosResponse } from "node_modules/axios/index.d.cts";

export async function fetchDashboardStats(): Promise<AxiosResponse<any>> {
    try {
        const response = await axiosCustom.get("/dashboard");
        return response;
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        throw error;
    }
}
