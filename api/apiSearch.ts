import { BaserowResponse, ProductData } from './apiProduct';
import axiosClient from './axiosClient';

const apiSearch = {
  /**
   * Upload an image (multipart/form-data) and receive product matches from backend.
   * Backend should accept `file` field and return BaserowResponse<ProductData> or similar.
   */
  searchByImage: async (file: { uri: string; name?: string; type?: string }): Promise<BaserowResponse<ProductData>> => {
    const form = new FormData();
    // @ts-ignore - React Native FormData file
    form.append('file', {
      uri: file.uri,
      name: file.name || 'photo.jpg',
      type: file.type || 'image/jpeg'
    });

    const response = await axiosClient.post('/search/image', form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    return response.data;
  }
};

export default apiSearch;
