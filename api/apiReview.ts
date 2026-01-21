import axiosClient from './axiosClient';
import { CONFIG } from './config';

export interface CreateReviewPayload {
  product_id?: number;
  order_id?: number;
  user_id?: number;
  rating: number;
  comment?: string;
  images?: string[]; // array of uploaded image urls or filenames
  quantity?: number; // number of items purchased
}

export interface ReviewData {
  id: number;
  Rating?: string | number;
  Comment?: string;
  Image?: any[]; // could be string[] or file objects depending on table
  Quantity?: number;
  created_at?: string;
  User?: any[];
}

const getReviewUrl = () => {
  const id = (CONFIG as any).REVIEW_TABLE_ID;
  if (!id) throw new Error('REVIEW_TABLE_ID not set in config');
  return `/${id}/?user_field_names=true`;
};

const apiReview = {
  createReview: async (data: CreateReviewPayload) => {
    try {
      const url = getReviewUrl();
      const payload: any = {
        // include several variants of common field names to match user's Baserow schema
        Rating: data.rating,
        rating: data.rating,
        Comment: data.comment || '',
        comment: data.comment || '',
      };
      if (data.product_id) {
        payload['Product'] = [data.product_id];
        payload['product'] = [data.product_id];
      }
      if (data.order_id) {
        payload['Order'] = [data.order_id];
        payload['order'] = [data.order_id];
      }
      if (data.user_id) {
        payload['User'] = [data.user_id];
        payload['user'] = [data.user_id];
      }

      // Images: Baserow file fields often accept an array of filenames (returned by uploadFile).
      if (data.images && data.images.length > 0) {
        // common field names used: 'image' (singular) or 'Images'
        payload['Images'] = data.images;
        payload['image'] = data.images;
      }

      // Quantity: some tables may have typo 'quatity' — include both
      if (data.quantity !== undefined) {
        payload['Quantity'] = data.quantity;
        payload['quatity'] = data.quantity;
        payload['quantity'] = data.quantity;
      }

      const res = await axiosClient.post(url, payload);
      return res.data;
    } catch (err) {
      console.warn('Could not create review, missing REVIEW_TABLE_ID or error', err);
      return null;
    }
  },

  getReviewsByProductId: async (productId: number) => {
    try {
      const url = getReviewUrl();
      const filterParams = encodeURIComponent(JSON.stringify({
        filter_type: 'AND',
        filters: [
          {
            type: 'link_row_has',
            field: 'Product',
            value: productId.toString()
          }
        ]
      }));
      const response = await axiosClient.get(`${url}&filters=${filterParams}`);
      return response.data as { count: number; results: ReviewData[] };
    } catch (err) {
      console.warn('Could not fetch reviews', err);
      return { count: 0, results: [] };
    }
  }
};

export default apiReview;
