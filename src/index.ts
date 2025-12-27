import { Hono } from 'hono'
import { streamText } from 'hono/streaming'
import { spawn } from 'node:child_process'
import { writeFileSync, mkdtempSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

const app = new Hono()

app.get('/', (c) => {
  return c.text('TLA+ TLC Checker API Gateway is running.')
})

app.post('/', async (c) => {
  const body = await c.req.parseBody()
  
  const tlaFile = body['tla']
  const cfgFile = body['cfg']

  if (!(tlaFile instanceof File) || !(cfgFile instanceof File)) {
    return c.text('Missing .tla or .cfg file in multipart upload', 400)
  }

  // Create a temporary directory for the TLC run
  const tmpDir = mkdtempSync(join(tmpdir(), 'tlc-'))

  try {
    const tlaPath = join(tmpDir, tlaFile.name)
    const cfgPath = join(tmpDir, cfgFile.name)

    // Write uploaded files to disk
    writeFileSync(tlaPath, Buffer.from(await tlaFile.arrayBuffer()))
    writeFileSync(cfgPath, Buffer.from(await cfgFile.arrayBuffer()))

    return streamText(c, async (stream) => {
      // Execute TLC checker using spawn for streaming
      const child = spawn('java', [
        '-XX:+UseParallelGC',
        '-cp', 
        '/usr/local/lib/tla2tools.jar', 
        'tlc2.TLC', 
        '-terse',
        '-nowarning',
        '-config', 
        cfgFile.name, 
        tlaFile.name
      ], {
        cwd: tmpDir
      })

      // Stream stdout to the client
      child.stdout.on('data', (data) => {
        stream.write(data.toString())
      })

      // Stream stderr to the client
      child.stderr.on('data', (data) => {
        stream.write(data.toString())
      })

      // Handle client disconnect
      stream.onAbort(() => {
        child.kill()
      })

      // Wait for the process to complete
      await new Promise((resolve) => {
        child.on('close', (code) => {
          if (code !== 0 && code !== null) {
            stream.write(`\nProcess exited with code ${code}\n`)
          }
          resolve(null)
        })

        child.on('error', (err) => {
          stream.write(`\nError spawning TLC: ${err.message}\n`)
          resolve(null)
        })
      })

      // Cleanup temporary files after stream is finished
      try {
        rmSync(tmpDir, { recursive: true, force: true })
      } catch (e) {
        console.error('Failed to cleanup temp directory', e)
      }
    })

  } catch (error: any) {
    // If we fail before the stream starts, cleanup and return error
    try {
      rmSync(tmpDir, { recursive: true, force: true })
    } catch (e) {}
    return c.text(`Error initializing TLC: ${error.message}`, 500)
  }
})

export default app
