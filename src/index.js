import fs from 'mz/fs'
import path from 'path'
import http from 'http'
import { spawnSync } from 'child_process'

import createHandler from 'github-webhook-handler'

const secret = process.env.GITHUB_WEBHOOK_SECRET
const handler = createHandler({ path: '/gh-webhook', secret: secret })

http.createServer((req, res) => {
  handler(req, res, (err) => {
    console.log(err)
    res.statusCode = 404
    res.end('Not found')
  })
})
.listen(3333)

handler.on('push', async (event) => {
  console.log(`\n${new Date()}`)

  const { payload } = event
  const { ref } = payload
  const { name, clone_url } = event.payload.repository // eslint-disable-line
  const { HOME } = process.env
  const pathToRepo = path.join(HOME, name)

  if (ref !== 'refs/heads/master') {
    return
  }

  try {
    await fs.stat(pathToRepo)
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.log(err)
      return
    }

    spawnSync('git', ['clone', clone_url], { //eslint-disable-line
      cwd: HOME,
      stdio: 'inherit'
    })
  }

  spawnSync(path.join(__dirname, '..', 'update.sh'), [pathToRepo], {
    stdio: 'inherit'
  })
})

handler.on('error', (err) => {
  console.log(err)
})

process.on('unhandledRejection', (reason) => {
  console.log(reason)
})
