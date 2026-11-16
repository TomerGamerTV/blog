// Runs at the end of `pnpm build`: copies dist/ into the tomergamertv.com deploy folder as /blog and deploys the site.
// Site folder defaults to ../tomergamertv.com/deploy (override with SITE_DEPLOY_DIR). Skip with SKIP_PUBLISH=1.
import { execSync } from 'node:child_process'
import { cpSync, existsSync, rmSync } from 'node:fs'
import { join, resolve } from 'node:path'

const site = resolve(process.env.SITE_DEPLOY_DIR || '../tomergamertv.com/deploy')
const dist = resolve('dist')

if (process.env.SKIP_PUBLISH) {
  console.log('publish-site: SKIP_PUBLISH set, not deploying')
  process.exit(0)
}
if (!existsSync(join(site, 'cloudflare.config.ts'))) {
  console.log(`publish-site: no site deploy folder at ${site}, built only`)
  process.exit(0)
}
if (!existsSync(join(dist, 'index.html'))) {
  console.error('publish-site: dist/index.html missing, build failed?')
  process.exit(1)
}

const target = join(site, 'public', 'blog')
rmSync(target, { recursive: true, force: true }) // deleted posts disappear from the site too
cpSync(dist, target, { recursive: true })
rmSync(join(target, 'robots.txt'), { force: true }) // the site root has its own robots.txt
console.log(`publish-site: copied dist/ to ${target}`)

execSync('cf deploy public --message "Blog build"', { cwd: site, stdio: 'inherit', shell: true })
