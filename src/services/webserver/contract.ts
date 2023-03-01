import http from "http";

export interface WebServer {
  start(): Promise<void>;
  setup(): Promise<http.Server>;
}
