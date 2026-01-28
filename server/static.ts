import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  console.log(`[static] Looking for build at: ${distPath}`);
  console.log(`[static] __dirname is: ${__dirname}`);
  
  if (!fs.existsSync(distPath)) {
    console.error(`[static] Build directory not found: ${distPath}`);
    console.log(`[static] Current directory contents:`, fs.readdirSync(process.cwd()));
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  console.log(`[static] Serving static files from: ${distPath}`);
  console.log(`[static] Contents:`, fs.readdirSync(distPath));

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
