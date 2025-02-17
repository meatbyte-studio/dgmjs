#!/usr/bin/env node

import { WebSocketServer } from "ws";
import http from "http";
import * as map from "lib0/map";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { nanoid } from "nanoid";

const generateUniquePassword = () => {
  return nanoid();
};

dotenv.config({ path: "./.env" });

const wsReadyStateConnecting = 0;
const wsReadyStateOpen = 1;
const wsReadyStateClosing = 2; // eslint-disable-line
const wsReadyStateClosed = 3; // eslint-disable-line

const pingTimeout = 30000;

const wss = new WebSocketServer({ noServer: true });

const port = process.env.PORT || 4444;
const staticFilesPath = process.env.DIST_DIR || "./dist";
const signalingUrls = process.env.SIGNALING_URLS || ["*"];
const signalingPassword =
  process.env.SIGNALING_PASSWORD || generateUniquePassword();

const server = http.createServer((request, response) => {
  let url = request.url.split("?")[0].split("#")[0];

  if (url === "/config.json") {
    const config = {
      signalingUrls: signalingUrls.split(",").map((url) => url.trim()),
      signalingPassword: signalingPassword,
    };
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify(config));
    return;
  }

  const filePath = path.join(staticFilesPath, url === "/" ? "index.html" : url);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      response.writeHead(404, { "Content-Type": "text/plain" });
      response.end("Not Found");
    } else {
      response.writeHead(200, { "Content-Type": getContentType(filePath) });
      response.end(data);
    }
  });
});

const getContentType = (filePath) => {
  const extname = path.extname(filePath);
  switch (extname) {
    case ".html":
      return "text/html";
    case ".js":
      return "text/javascript";
    case ".css":
      return "text/css";
    case ".json":
      return "application/json";
    case ".png":
      return "image/png";
    case ".jpg":
      return "image/jpg";
    case ".gif":
      return "image/gif";
    case ".svg":
      return "image/svg+xml";
    case ".ttf":
      return "font/ttf";
    default:
      return "application/octet-stream";
  }
};

/**
 * Map froms topic-name to set of subscribed clients.
 * @type {Map<string, Set<any>>}
 */
const topics = new Map();

/**
 * @param {any} conn
 * @param {object} message
 */
const send = (conn, message) => {
  if (
    conn.readyState !== wsReadyStateConnecting &&
    conn.readyState !== wsReadyStateOpen
  ) {
    conn.close();
  }
  try {
    conn.send(JSON.stringify(message));
  } catch (e) {
    conn.close();
  }
};

/**
 * Setup a new client
 * @param {any} conn
 */
const onconnection = (conn) => {
  /**
   * @type {Set<string>}
   */
  const subscribedTopics = new Set();
  let closed = false;
  // Check if connection is still alive
  let pongReceived = true;
  const pingInterval = setInterval(() => {
    if (!pongReceived) {
      conn.close();
      clearInterval(pingInterval);
    } else {
      pongReceived = false;
      try {
        conn.ping();
      } catch (e) {
        conn.close();
      }
    }
  }, pingTimeout);
  conn.on("pong", () => {
    pongReceived = true;
  });
  conn.on("close", () => {
    subscribedTopics.forEach((topicName) => {
      const subs = topics.get(topicName) || new Set();
      subs.delete(conn);
      if (subs.size === 0) {
        topics.delete(topicName);
      }
    });
    subscribedTopics.clear();
    closed = true;
  });
  conn.on(
    "message",
    /** @param {object} message */ (message) => {
      if (typeof message === "string" || message instanceof Buffer) {
        message = JSON.parse(message);
      }
      if (message && message.type && !closed) {
        switch (message.type) {
          case "subscribe":
            /** @type {Array<string>} */ (message.topics || []).forEach(
              (topicName) => {
                if (typeof topicName === "string") {
                  // add conn to topic
                  const topic = map.setIfUndefined(
                    topics,
                    topicName,
                    () => new Set()
                  );
                  topic.add(conn);
                  // add topic to conn
                  subscribedTopics.add(topicName);
                }
              }
            );
            break;
          case "unsubscribe":
            /** @type {Array<string>} */ (message.topics || []).forEach(
              (topicName) => {
                const subs = topics.get(topicName);
                if (subs) {
                  subs.delete(conn);
                }
              }
            );
            break;
          case "publish":
            if (message.topic) {
              const receivers = topics.get(message.topic);
              if (receivers) {
                message.clients = receivers.size;
                receivers.forEach((receiver) => send(receiver, message));
              }
            }
            break;
          case "ping":
            send(conn, { type: "pong" });
        }
      }
    }
  );
};
wss.on("connection", onconnection);

server.on("upgrade", (request, socket, head) => {
  // You may check auth of request here..
  /**
   * @param {any} ws
   */
  const handleAuth = (ws) => {
    wss.emit("connection", ws, request);
  };
  wss.handleUpgrade(request, socket, head, handleAuth);
});

server.listen(port);

console.log(`Draw web app server running on localhost:${port}`);
