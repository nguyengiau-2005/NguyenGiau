import axios from 'axios';

const BASE_URL = 'https://provinces.open-api.vn/api';

export const vnLocationApi = {
  getProvinces: () => axios.get(`${BASE_URL}/p/`),
  getDistricts: (provinceCode: number) => axios.get(`${BASE_URL}/p/${provinceCode}?depth=2`),
  getWards: (districtCode: number) => axios.get(`${BASE_URL}/d/${districtCode}?depth=2`),
};