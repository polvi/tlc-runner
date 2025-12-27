This project is a containerized API gateway for running the TLA+ TLC checker. It accepts multipart form uploads of `.tla` files and associated `.cfg` files, returning the output from the TLC command. The application is built with Hono and executes the TLC checker via a Java subprocess.

The runner is a Hono application located at `src/index.ts` that spawns the TLC Java runtime to perform the model checking. The container is deployed as part of Cloudflare's container platform; the orchestration logic for the worker is located at `src/worker.ts`. See `wrangler.toml` for configuration details.

To run locally:

```txt
bun install
bun run dev
```

To deploy:

```txt
bun run deploy
```

## Example output

From the root of the TLA [Examples](https://github.com/tlaplus/Examples) project:

```
% curl -N -X POST https://tlc-runner.<your-id>.workers.dev -F "tla=@specifications/MissionariesAndCannibals/MissionariesAndCannibals.tla" -F "cfg=@specifications/MissionariesAndCannibals/MissionariesAndCannibals.cfg"
TLC2 Version 2.20 of Day Month 20?? (rev: bb62e53)
Running breadth-first search Model-Checking with fp 45 and seed 1300901955714573101 with 1 worker on 1 cores with 5120MB heap and 64MB offheap memory [pid: 214] (Linux 6.12.57-cloudflare-firecracker-2025.11.1 amd64, Debian 21.0.9 x86_64, MSBDiskFPSet, DiskStateQueue).
Parsing file /tmp/tlc-nmyQ1h/MissionariesAndCannibals.tla
Parsing file /tmp/tlc-16419675245121135263/Integers.tla (jar:file:/usr/local/lib/tla2tools.jar!/tla2sany/StandardModules/Integers.tla)
Parsing file /tmp/tlc-16419675245121135263/FiniteSets.tla (jar:file:/usr/local/lib/tla2tools.jar!/tla2sany/StandardModules/FiniteSets.tla)
Parsing file /tmp/tlc-16419675245121135263/_TLCTrace.tla (jar:file:/usr/local/lib/tla2tools.jar!/tla2sany/StandardModules/_TLCTrace.tla)
Parsing file /tmp/tlc-16419675245121135263/Naturals.tla (jar:file:/usr/local/lib/tla2tools.jar!/tla2sany/StandardModules/Naturals.tla)
Parsing file /tmp/tlc-16419675245121135263/Sequences.tla (jar:file:/usr/local/lib/tla2tools.jar!/tla2sany/StandardModules/Sequences.tla)
Parsing file /tmp/tlc-16419675245121135263/TLC.tla (jar:file:/usr/local/lib/tla2tools.jar!/tla2sany/StandardModules/TLC.tla)
Parsing file /tmp/tlc-16419675245121135263/TLCExt.tla (jar:file:/usr/local/lib/tla2tools.jar!/tla2sany/StandardModules/TLCExt.tla)
Semantic processing of module Naturals
Semantic processing of module Integers
Semantic processing of module Sequences
Semantic processing of module FiniteSets
Semantic processing of module TLC
Semantic processing of module TLCExt
Semantic processing of module _TLCTrace
Semantic processing of module MissionariesAndCannibals
Linting of module TLCExt
Linting of module _TLCTrace
Linting of module MissionariesAndCannibals
Starting... (2025-12-27 23:33:28)
Computing initial states...
Finished computing initial states: 1 distinct state generated at 2025-12-27 23:33:29.
Error: Invariant Solution is violated.
Error: The behavior up to this point is:
State 1: <Initial predicate>
/\ bank_of_boat = "E"
/\ who_is_on_bank = [E |-> {m1, m2, m3, c1, c2, c3}, W |-> {}]

State 2: <Next line 188, col 9 to line 189, col 33 of module MissionariesAndCannibals>
/\ bank_of_boat = "W"
/\ who_is_on_bank = [E |-> {m2, m3, c2, c3}, W |-> {m1, c1}]

State 3: <Next line 188, col 9 to line 189, col 33 of module MissionariesAndCannibals>
/\ bank_of_boat = "E"
/\ who_is_on_bank = [E |-> {m1, m2, m3, c2, c3}, W |-> {c1}]

State 4: <Next line 188, col 9 to line 189, col 33 of module MissionariesAndCannibals>
/\ bank_of_boat = "W"
/\ who_is_on_bank = [E |-> {m1, m2, m3}, W |-> {c1, c2, c3}]

State 5: <Next line 188, col 9 to line 189, col 33 of module MissionariesAndCannibals>
/\ bank_of_boat = "E"
/\ who_is_on_bank = [E |-> {m1, m2, m3, c1}, W |-> {c2, c3}]

State 6: <Next line 188, col 9 to line 189, col 33 of module MissionariesAndCannibals>
/\ bank_of_boat = "W"
/\ who_is_on_bank = [E |-> {m3, c1}, W |-> {m1, m2, c2, c3}]

State 7: <Next line 188, col 9 to line 189, col 33 of module MissionariesAndCannibals>
/\ bank_of_boat = "E"
/\ who_is_on_bank = [E |-> {m1, m3, c1, c2}, W |-> {m2, c3}]

State 8: <Next line 188, col 9 to line 189, col 33 of module MissionariesAndCannibals>
/\ bank_of_boat = "W"
/\ who_is_on_bank = [E |-> {c1, c2}, W |-> {m1, m2, m3, c3}]

State 9: <Next line 188, col 9 to line 189, col 33 of module MissionariesAndCannibals>
/\ bank_of_boat = "E"
/\ who_is_on_bank = [E |-> {c1, c2, c3}, W |-> {m1, m2, m3}]

State 10: <Next line 188, col 9 to line 189, col 33 of module MissionariesAndCannibals>
/\ bank_of_boat = "W"
/\ who_is_on_bank = [E |-> {c3}, W |-> {m1, m2, m3, c1, c2}]

State 11: <Next line 188, col 9 to line 189, col 33 of module MissionariesAndCannibals>
/\ bank_of_boat = "E"
/\ who_is_on_bank = [E |-> {m1, c3}, W |-> {m2, m3, c1, c2}]

State 12: <Next line 188, col 9 to line 189, col 33 of module MissionariesAndCannibals>
/\ bank_of_boat = "W"
/\ who_is_on_bank = [E |-> {}, W |-> {m1, m2, m3, c1, c2, c3}]

225 states generated, 61 distinct states found, 11 states left on queue.
The depth of the complete state graph search is 12.
Finished in 02s at (2025-12-27 23:33:29)
Trace exploration spec path: ./MissionariesAndCannibals_TTrace_1766878407.tla

Process exited with code 12
```
