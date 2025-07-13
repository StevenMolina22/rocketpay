export interface Message {
  from: string;
  id: string;
  timestamp: string;
  type: string;
  text?: TextMessage;
  image?: ImageMessage;
}

export interface TextMessage {
  body: string;
}

export interface ImageMessage {
  caption?: string;
  mime_type: string;
  sha256: string;
  id: string;
}

export interface Contact {
  profile: {
    name: string;
  };
  wa_id: string;
}

export interface WebhookEntry {
  id: string;
  changes: Array<{
    value: {
      messaging_product: string;
      metadata: {
        display_phone_number: string;
        phone_number_id: string;
      };
      contacts?: Contact[];
      messages?: Message[];
      statuses?: Array<{
        id: string;
        status: string;
        timestamp: string;
        recipient_id: string;
        conversation?: {
          id: string;
          expiration_timestamp?: string;
          origin: {
            type: string;
          };
        };
        pricing?: {
          billable: boolean;
          pricing_model: string;
          category: string;
        };
      }>;
    };
    field: string;
  }>;
}

export interface WebhookPayload {
  object: string;
  entry: WebhookEntry[];
}

export interface OutboundTextMessage {
  messaging_product: string;
  recipient_type: string;
  to: string;
  type: string;
  text: {
    preview_url: boolean;
    body: string;
  };
}

export interface OutboundImageMessage {
  messaging_product: string;
  recipient_type: string;
  to: string;
  type: string;
  image: {
    link: string;
    caption?: string;
  };
}
