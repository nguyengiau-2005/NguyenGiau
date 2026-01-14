import { BaserowResponse } from './apiProduct';
import axiosClient from './axiosClient';
import { CONFIG } from './config';

// --- Types & Interfaces ---
export interface SizeData {
    id: number;
    order: string;
    milion: string;
    Notes: string;
    Product: { id: number }[];
    Active: boolean;
}

export type SizeResponse = BaserowResponse<SizeData>;

// --- API Endpoints ---
/**
 * LƯU Ý: Vì BASEROW_BASE_URL đã có sẵn đường dẫn đến tận chữ "/table/"
 * Nên ở đây ta KHÔNG để dấu "/" ở đầu chuỗi.
 */
const getSizesUrl = () => `${CONFIG.SIZE_TABLE_ID}/?user_field_names=true`;
const getSizeByIdUrl = (id: number) => `${CONFIG.SIZE_TABLE_ID}/${id}/?user_field_names=true`;

const apiSize = {
    async getAll(): Promise<SizeResponse> {
        // Gọi trực tiếp ID bảng vì baseURL đã lo phần tiền tố
        const res = await axiosClient.get(getSizesUrl());
        return res.data;
    },

    async getById(id: number): Promise<SizeData> {
        const res = await axiosClient.get(getSizeByIdUrl(id));
        return res.data;
    },

    async getActiveSizes(): Promise<SizeData[]> {
        const data = await apiSize.getAll();
        // Thêm kiểm tra data.results để tránh lỗi nếu API trả về trống
        return (data.results || []).filter((item) => item.Active === true);
    },

    async create(data: Partial<SizeData>): Promise<SizeData> {
        const res = await axiosClient.post(getSizesUrl(), data);
        return res.data;
    },

    async update(id: number, data: Partial<SizeData>): Promise<SizeData> {
        const res = await axiosClient.patch(getSizeByIdUrl(id), data);
        return res.data;
    },

    async delete(id: number): Promise<void> {
        await axiosClient.delete(getSizeByIdUrl(id));
    },
    // Thêm hàm này vào đối tượng apiSize trong file @/api/apiSize.ts
    async getSizesByProductId(productId: number | string): Promise<SizeData[]> {
        try {
            const res = await axiosClient.get(
                `${CONFIG.SIZE_TABLE_ID}/?user_field_names=true` +
                `&filter__Product__link_row_has=${productId}` +
                `&filter__Active__equal=true` +
                `&order_by=milion`
            );

            return res.data.results || [];
        } catch (error) {
            console.error("Lỗi lấy size theo product:", error);
            return [];
        }
    }
};

export default apiSize;