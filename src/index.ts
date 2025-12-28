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

  const tmpDir = mkdtempSync(join(tmpdir(), 'tlc-'))

  try {
    const tlaPath = join(tmpDir, tlaFile.name)
    const cfgPath = join(tmpDir, cfgFile.name)

    writeFileSync(tlaPath, Buffer.from(await tlaFile.arrayBuffer()))
    writeFileSync(cfgPath, Buffer.from(await cfgFile.arrayBuffer()))

    return streamText(c, async (stream) => {
      // Execute TLC checker
      // Using 5GB heap and G1GC for the 6144MB container
      const child = spawn('java', [
        '-Xmx5G',
        '-XX:+UseG1GC',
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

      child.stdout.on('data', (data) => {
        stream.write(data.toString())
      })

      child.stderr.on('data', (data) => {
        stream.write(data.toString())
      })

      const exitCode = await new Promise((resolve) => {
        child.on('close', resolve)
      })

      await stream.writeln(`\nProcess exited with code ${exitCode}`)
      
      // Cleanup temp directory after streaming is done
      try {
        rmSync(tmpDir, { recursive: true, force: true })
      } catch (e) {
        console.error('Failed to cleanup temp directory', e)
      }
    })

  } catch (error: any) {
    // Cleanup if setup fails before streaming starts
    try {
      rmSync(tmpDir, { recursive: true, force: true })
    } catch (e) {}
    return c.text(`Error starting TLC: ${error.message}`, 500)
  }
})

export default app
