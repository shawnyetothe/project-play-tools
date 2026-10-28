import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests",
  timeout: 30000,
  use: { baseURL: "http://127.0.0.1:47241" },
  webServer: {
    command: "python3 -m http.server 47241 --directory out --bind 127.0.0.1",
    port: 47241,
    reuseExistingServer: true,
  },
});
