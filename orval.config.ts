import "dotenv/config";

import { defineConfig } from "orval";

const swaggerUrl =
  process.env.ORVAL_SWAGGER_URL ??
  "https://localhost:7025/swagger/v1/swagger.json";

export default defineConfig({
  demo: {
    input: {
      target: swaggerUrl,
    },
    output: {
      mode: "single",
      target: "./src/api/generated/demo.ts",
      schemas: "./src/api/model",
      client: "fetch",
      clean: true,
      prettier: false,
    },
  },
});
