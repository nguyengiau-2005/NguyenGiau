import axiosClient from './axiosClient';
import { CONFIG } from './config';

export interface SupportTicketPayload {
  subject: string;
  message: string;
  product_id?: number | string;
  user_contact?: string;
  metadata?: any;
}

const apiSupport = {
  /**
   * Create a support ticket on your backend.
   * NOTE: You should implement an endpoint on your server that accepts this payload
   * or change the URL below to match your Baserow / backend setup.
   */
  createSupportTicket: async (data: SupportTicketPayload) => {
    // If SUPPORT_TABLE_ID is configured, create a row in Baserow directly
    const tableId = (CONFIG as any).SUPPORT_TABLE_ID;
    if (tableId) {
      const payload: any = {
        Subject: data.subject,
        Message: data.message,
        'User Contact': data.user_contact || '',
        Status: 'Open'
      };

      // If a product id is provided and product table exists, send as link row
      if (data.product_id) {
        // Baserow expects link rows as array of row IDs
        payload.Product = [Number(data.product_id)];
      }

      const url = `/${tableId}/?user_field_names=true`;
      const res = await axiosClient.post(url, payload);
      return res.data;
    }

    // Fallback: generic endpoint (you can change this to your own backend)
    const url = '/support-requests/';
    const res = await axiosClient.post(url, data);
    return res.data;
  },

  /**
   * Optional: Generate AI answer using OpenAI if CONFIG.OPENAI_API_KEY is set.
   * Fallback: returns null so caller can use local heuristics.
   */
  generateAIAnswer: async (question: string, productSummary?: string): Promise<string | null> => {
    try {
      const key = (CONFIG as any).OPENAI_API_KEY || (process.env.OPENAI_API_KEY as string | undefined);
      if (!key) return null;

      const payload = {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a professional product advisor for an e-commerce shop. Answer concisely in Vietnamese unless user asks otherwise.' },
          { role: 'user', content: `Product summary: ${productSummary || 'N/A'}\nUser question: ${question}` }
        ],
        temperature: 0.2,
        max_tokens: 400
      };

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        console.warn('OpenAI returned', response.status);
        return null;
      }

      const data = await response.json();
      const text = data?.choices?.[0]?.message?.content;
      return text || null;
    } catch (err) {
      console.warn('AI answer error', err);
      return null;
    }
  }
};

export default apiSupport;
