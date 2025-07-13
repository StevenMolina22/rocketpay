declare namespace NodeJS {
  interface ProcessEnv {
    // WhatsApp API Configuration
    WHATSAPP_ACCESS_TOKEN: string;
    WHATSAPP_PHONE_NUMBER_ID: string;
    WHATSAPP_WEBHOOK_VERIFY_TOKEN: string;
    WHATSAPP_BUSINESS_ACCOUNT_ID: string;
    
    // Stellar Network Configuration
    STELLAR_NETWORK: 'testnet' | 'mainnet';
    STELLAR_HORIZON_URL: string;
    STELLAR_SECRET_KEY: string;
    STELLAR_PUBLIC_KEY: string;
    
    // Server Configuration
    PORT: string;
    NODE_ENV: 'development' | 'production' | 'test';
    API_BASE_URL: string;
    
    // Database Configuration (if needed)
    DATABASE_URL?: string;
    REDIS_URL?: string;
    
    // Logging Configuration
    LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
    
    // Security Configuration
    JWT_SECRET?: string;
    WEBHOOK_SECRET?: string;
    
    // External Services
    CLOUDINARY_CLOUD_NAME?: string;
    CLOUDINARY_API_KEY?: string;
    CLOUDINARY_API_SECRET?: string;
    
    // Rate Limiting
    RATE_LIMIT_WINDOW_MS?: string;
    RATE_LIMIT_MAX_REQUESTS?: string;
    
    // Payment Configuration
    PAYMENT_TIMEOUT_MS?: string;
    MAX_PAYMENT_AMOUNT?: string;
    MIN_PAYMENT_AMOUNT?: string;
    
    // Feature Flags
    ENABLE_WEBHOOK_VALIDATION?: string;
    ENABLE_RATE_LIMITING?: string;
    ENABLE_PAYMENT_NOTIFICATIONS?: string;
  }
}

export {};
