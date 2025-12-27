import { Container, getRandom } from "@cloudflare/containers";

const INSTANCE_COUNT = 3;

export interface Env {
  BACKEND: any;
}

export class Backend extends Container {
  defaultPort = 3000;
  sleepAfter = "15m";
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Use getRandom to correctly route to a Container instance
    const containerInstance = await getRandom(env.BACKEND, INSTANCE_COUNT);
    return containerInstance.fetch(request);
  },
};
