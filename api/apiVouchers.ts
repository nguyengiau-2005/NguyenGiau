import axiosClient from './axiosClient';
import { CONFIG } from './config';


// --- Types & Interfaces ---

/**
 * Cấu trúc dữ liệu File từ Baserow
 */
export interface BaserowFile {
    id: number;
    name: string;
    size: number;
    mime_type: string;
    is_marked_for_deletion: boolean;
    created_on: string;
    url: string;
}

/**
 * Cấu trúc dữ liệu Voucher
 */
export interface Voucher {
    id?: number;
    code: string;
    discount: string;
    minSpend: string;
    expiry: string;
    image: BaserowFile[] | null;
}

export interface VoucherResponse {
    vouchers: Voucher[];
}

// --- API Methods ---

const apiVoucher = {
    /**
     * Lấy danh sách vouchers
     */
    getVouchers: async (): Promise<Voucher[]> => {
        const response = await axiosClient.get<any>(`${CONFIG.VOUCHERS_TABLE_ID}/?user_field_names=true`);
        return response.data.results || [];
    },

    /**
     * Lấy voucher theo row ID
     */
    getVoucherById: async (rowId: number): Promise<Voucher | null> => {
        const response = await axiosClient.get<any>(`${CONFIG.VOUCHERS_TABLE_ID}/${rowId}/?user_field_names=true`);
        return response.data || null;
    },

    /**
     * Lấy voucher theo code
     */
    getVoucherByCode: async (code: string): Promise<Voucher | null> => {
        const response = await axiosClient.get<any>(`${CONFIG.VOUCHERS_TABLE_ID}/?user_field_names=true&search=${code}`);
        const results = response.data.results || [];
        return results.length > 0 ? results[0] : null;
    },

    /**
     * Áp dụng voucher vào giỏ hàng
     */
    applyVoucher: async (code: string): Promise<{ valid: boolean; message: string }> => {
        const voucher = await apiVoucher.getVoucherByCode(code);
        return {
            valid: voucher !== null,
            message: voucher ? `Voucher ${code} được áp dụng thành công` : `Voucher ${code} không hợp lệ`
        };
    },
};

export default apiVoucher;
