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
    // Get a random container instance from the pool
    const containerInstance = await getRandom(env.BACKEND, INSTANCE_COUNT);
    
    // Forward the request to the container. 
    // Cloudflare Workers will automatically stream the response body 
    // from the backend container to the client.
    return containerInstance.fetch(request);
  },
};
