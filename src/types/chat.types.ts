export type ChatStatus = 'open' | 'delivery_confirmed';

export interface Chat {
  id:         string;
  product_id: string;
  buyer_id:   string;
  seller_id:  string;
  status:     ChatStatus;
  created_at: Date;
  updated_at: Date;
}

export interface Message {
  id:         string;
  chat_id:    string;
  sender_id:  string;
  content:    string;
  created_at: Date;
}

export interface CreateMessageDTO {
  content: string;
}
