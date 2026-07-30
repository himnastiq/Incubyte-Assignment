import app from "./app";
import { connectDB, env } from "./config";

async function start(): Promise<void> {
  await connectDB();

  app.listen(env.PORT, () => {
    console.info(`Server running on port ${env.PORT}`);
  });
}

start().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
