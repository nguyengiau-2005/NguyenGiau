import { ProductData } from './apiProduct';

// Mock function for image search - replace with actual API call
export const searchByImage = async (imageData: { uri: string; name?: string; type?: string }): Promise<{ results: ProductData[] }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mock response - return some sample products
  // In real implementation, send image to backend for processing
  const mockResults: ProductData[] = [
    {
      id: 1,
      order: '1',
      name: 'BLEMISH - Mụn Control',
      slug: 'blemish-mun-control',
      category_id: [{ id: 1, value: 'Skincare' }],
      brand: 'Some Brand',
      description: 'Kem điều trị mụn, làm dịu da.',
      ingredients: 'Ingredients here',
      image: [], // Add image data if needed
      rating: '4.7',
      price: '180000',
      discount: '15',
      is_bestseller: true,
      tags: ['acne', 'treatment'],
      product_sizes: [],
      created_on: new Date().toISOString(),
      updated_on: new Date().toISOString(),
    },
    // Add more mock products as needed
  ];

  return { results: mockResults };
};

export default {
  searchByImage,
};