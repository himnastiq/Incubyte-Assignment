// Set test environment variables before any modules are loaded
process.env.MONGODB_URI = "mongodb://localhost:27017/test";
process.env.JWT_SECRET = "test-jwt-secret";
process.env.NODE_ENV = "test";
process.env.CLIENT_URL = "http://localhost:5173";
