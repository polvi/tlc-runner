import { Hono } from 'hono'
import { exec } from 'node:child_process'
import { writeFileSync, mkdtempSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { promisify } from 'node:util'

const execPromise = promisify(exec)
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

    // Execute TLC checker synchronously (non-streaming)
    // Using 5GB heap and G1GC for the 6144MB container
    const command = [
      'java',
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
    ].join(' ')

    try {
      const { stdout, stderr } = await execPromise(command, {
        cwd: tmpDir,
        maxBuffer: 10 * 1024 * 1024 // 10MB buffer for output
      })
      
      return c.text(stdout + stderr)
    } catch (execError: any) {
      // TLC often exits with non-zero codes if errors are found in the model
      // We still want to return the output in those cases
      return c.text((execError.stdout || '') + (execError.stderr || '') + `\nProcess exited with error: ${execError.message}`)
    }

  } catch (error: any) {
    return c.text(`Error running TLC: ${error.message}`, 500)
  } finally {
    try {
      rmSync(tmpDir, { recursive: true, force: true })
    } catch (e) {
      console.error('Failed to cleanup temp directory', e)
    }
  }
})

export default app
