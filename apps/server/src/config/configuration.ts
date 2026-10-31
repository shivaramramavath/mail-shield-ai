export default () => ({
  port: parseInt(process.env.PORT ?? '4000', 10),
  apiPrefix: process.env.API_PREFIX ?? 'api/v1',
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:3000',
  mongodbUri: process.env.MONGODB_URI,
  mlServiceUrl: process.env.ML_SERVICE_URL ?? 'http://127.0.0.1:8000',
  mlServiceTimeoutMs: parseInt(process.env.ML_SERVICE_TIMEOUT_MS ?? '15000', 10),
  groqApiKey: process.env.GROQ_API_KEY,
  groqModel: process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile',
  groqBaseUrl: process.env.GROQ_BASE_URL ?? 'https://api.groq.com/openai/v1',
  groqTimeoutMs: parseInt(process.env.GROQ_TIMEOUT_MS ?? '30000', 10),
});
