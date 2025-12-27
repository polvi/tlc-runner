import { Container, getRandom } from "@cloudflare/containers";

const INSTANCE_COUNT = 3;

export interface Env {
  BACKEND: any;
}

export class Backend extends Container {
  defaultPort = 3000;
  sleepAfter = "2m";
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const id = env.BACKEND.idFromName("default")
    const stub = env.BACKEND.get(id)
    return stub.fetch(request)
  },
};
