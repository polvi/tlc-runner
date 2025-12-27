This project is a container that provides an API gateway for running TLA+ TLC checker. It takes a multipart form upload of a .tla file and associated .cfg and returns the output from the TLC command. It is build in Hono and shells out to java to run the TLC checker. The post returns the output of the TLC command. 

It is packaged as a Docker container, which is intended to be ran on Cloudflare's container platform.


```txt
bun install
bun run dev
```

```txt
bun run deploy
```

[For generating/synchronizing types based on your Worker configuration run](https://developers.cloudflare.com/workers/wrangler/commands/#types):


```txt
bun run cf-typegen
```

Pass the `CloudflareBindings` as generics when instantiation `Hono`:

```ts
// src/index.ts
const app = new Hono<{ Bindings: CloudflareBindings }>()
```
