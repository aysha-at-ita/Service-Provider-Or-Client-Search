import type { Express, Request, Response } from "express";
import type { Server } from "http";
import { spawn, ChildProcess } from "child_process";
import http from "http";

let flaskProcess: ChildProcess | null = null;

function startFlaskServer(): Promise<void> {
  return new Promise((resolve) => {
    console.log("Starting Flask server on port 5001...");
    
    flaskProcess = spawn("python", ["app.py"], {
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env },
    });

    flaskProcess.stdout?.on("data", (data) => {
      console.log(`[flask] ${data.toString().trim()}`);
    });

    flaskProcess.stderr?.on("data", (data) => {
      const msg = data.toString().trim();
      console.log(`[flask] ${msg}`);
    });

    flaskProcess.on("error", (err) => {
      console.error("[flask] Failed to start:", err);
    });

    flaskProcess.on("exit", (code) => {
      console.log(`[flask] Process exited with code ${code}`);
      flaskProcess = null;
    });

    setTimeout(resolve, 2000);
  });
}

function proxyToFlask(req: Request, res: Response): void {
  const bodyData = req.body ? JSON.stringify(req.body) : "";
  
  const options: http.RequestOptions = {
    hostname: "localhost",
    port: 5001,
    path: req.originalUrl,
    method: req.method,
    headers: {
      "content-type": "application/json",
      "cookie": req.headers.cookie || "",
      "content-length": Buffer.byteLength(bodyData),
    },
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.status(proxyRes.statusCode || 500);
    
    const setCookie = proxyRes.headers["set-cookie"];
    if (setCookie) {
      res.setHeader("set-cookie", setCookie);
    }
    
    res.setHeader("content-type", proxyRes.headers["content-type"] || "application/json");
    
    proxyRes.pipe(res);
  });

  proxyReq.on("error", (err) => {
    console.error("[proxy] Error:", err.message);
    res.status(502).json({ message: "Flask server unavailable" });
  });

  if (bodyData) {
    proxyReq.write(bodyData);
  }

  proxyReq.end();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await startFlaskServer();

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", flask: flaskProcess !== null });
  });

  app.post("/api/auth/login", (req, res) => proxyToFlask(req, res));
  app.post("/api/auth/register", (req, res) => proxyToFlask(req, res));
  app.get("/api/auth/user", (req, res) => proxyToFlask(req, res));
  app.post("/api/logout", (req, res) => proxyToFlask(req, res));
  app.post("/api/search", (req, res) => proxyToFlask(req, res));
  app.get("/api/history", (req, res) => proxyToFlask(req, res));

  httpServer.on("close", () => {
    if (flaskProcess) {
      flaskProcess.kill();
    }
  });

  return httpServer;
}
