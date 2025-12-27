import { Hono } from 'hono'
import { spawnSync } from 'node:child_process'
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

    // Execute TLC checker
    // Assumes tla2tools.jar is in the classpath or handled by the container environment
    const result = spawnSync('java', [
      '-cp', 
      '/usr/local/lib/tla2tools.jar', 
      'tlc2.TLC', 
      '-config', 
      cfgFile.name, 
      tlaFile.name
    ], {
      cwd: tmpDir,
      encoding: 'utf-8'
    })

    const output = result.stdout + result.stderr
    return c.text(output)

  } catch (error: any) {
    return c.text(`Error running TLC: ${error.message}`, 500)
  } finally {
    // Cleanup temporary files
    try {
      rmSync(tmpDir, { recursive: true, force: true })
    } catch (e) {
      console.error('Failed to cleanup temp directory', e)
    }
  }
})

export default app
