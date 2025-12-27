This project is a container that provides an API gateway for running TLA+ TLC checker. It takes a multipart form upload of a .tla file and associated .cfg and returns the output from the TLC command. It is build in Hono and shells out to java to run the TLC checker. The post returns the output of the TLC command. 

The runner itself is a Hono application at src/index.ts that spawns to the tlc java runtime to do the TLC checking. The container is executed as part of cloudflare's container platform, in which the worker code for that is at `src/worker.ts`. See `wrangler.toml` for configuration. 


```txt
bun install
bun run dev
curl -N -X POST http://localhost:8788/ -F "tla=@spec/Example.tla" -F "cfg=@spec/Example.cfg" 
```

```txt
bun run deploy
```
