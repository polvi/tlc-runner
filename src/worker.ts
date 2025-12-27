import { Container, getRandom } from "@cloudflare/containers";

const INSTANCE_COUNT = 3;

export class Backend extends Container {
  defaultPort = 3000;
  sleepAfter = "2m";
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const containerInstance = await getRandom(env.BACKEND, INSTANCE_COUNT);
    return containerInstance.fetch(request);
  },
};
