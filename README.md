This project is a containerized API gateway for running the TLA+ TLC checker. It accepts multipart form uploads of `.tla` files and associated `.cfg` files, returning the output from the TLC command. The application is built with Hono and executes the TLC checker via a Java subprocess.

The runner is a Hono application located at `src/index.ts` that spawns the TLC Java runtime to perform the model checking. The container is deployed as part of Cloudflare's container platform; the orchestration logic for the worker is located at `src/worker.ts`. See `wrangler.toml` for configuration details.

```txt
bun install
bun run dev
curl -N -X POST http://localhost:8788/ -F "tla=@spec/Example.tla" -F "cfg=@spec/Example.cfg" 
```

```txt
bun run deploy
```
