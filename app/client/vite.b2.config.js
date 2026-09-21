import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// Skillcase B2 runs as its own dev server on its own port. Same source tree,
// separate entry — so localhost:5181 is the B2 product and nothing else, while
// the A1 app keeps 5173 untouched.
export default defineConfig({
  root: "b2app",
  // Audio for Hören and the interviewer clips lives in the shared public folder.
  publicDir: path.resolve(process.cwd(), "public"),
  plugins: [react()],
  server: { port: 5181, strictPort: true },
  build: { outDir: path.resolve(process.cwd(), "dist-b2"), emptyOutDir: true },
});
