import { z } from "zod";
import * as dotenv from "dotenv";

dotenv.config();
const environmentVariables = z.object({
  PORT: z.string().default("3000"),
  SELF_URL: z.string().default("http://localhost:3000"),
  CLIENT_ID: z.string(),
  BOT_TOKEN: z.string(),
  CLIENT_SECRET: z.string(),
  PRODUCT_ID: z.string(),
  PRODUCT_NAME: z.string().default("some thing"),
});

export default environmentVariables.parse(process.env);
