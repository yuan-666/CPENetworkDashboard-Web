import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { downloads } from '@/content'
import { platformAdviceMap } from '@/utils/platform'

const origin = 'https://cpe.yuan6.cn'
const edgeSource = readFileSync(resolve('edge/index.js'), 'utf8')

function edgeWithStoredRelease(release) {
  const stored = release
    ? JSON.stringify({ version: 2, releases: { android: { stable: release } } })
    : ''
  return new Function('EdgeKV', edgeSource.replace('export default', 'return'))(
    class {
      async get(key) {
        return key === 'updates' ? stored : ''
      }
    }
  )
}

async function checkUpdate(edge, version, code) {
  const response = await edge.fetch(
    new Request(
      `${origin}/api/updates/check?platform=android&version=${version}&versionCode=${code}`
    )
  )
  expect(response.status).toBe(200)
  return response.json()
}

describe('Android 3.7.1 release delivery', () => {
  it('offers the new package to old clients and no update to current clients', async () => {
    const edge = edgeWithStoredRelease()
    const old = await checkUpdate(edge, '3.7.0', 14)
    expect(old.updateAvailable).toBe(true)
    expect(old.latest).toMatchObject({ version: '3.7.1', versionCode: 15 })
    expect((await checkUpdate(edge, '3.7.1', 15)).updateAvailable).toBe(false)
  })

  it('migrates stale Android KV releases and preserves future releases', async () => {
    for (const [version, code] of [
      ['3.6.5', 12],
      ['3.7.0', 14],
    ]) {
      const oldEdge = edgeWithStoredRelease({ version, versionCode: code })
      expect((await checkUpdate(oldEdge, version, code)).latest).toMatchObject({
        version: '3.7.1',
        versionCode: 15,
      })
    }
    const futureEdge = edgeWithStoredRelease({ version: '3.8.0', versionCode: 16 })
    expect((await checkUpdate(futureEdge, '3.7.1', 15)).latest.version).toBe('3.8.0')
  })

  it('serves matching website and app chunks that reconstruct the verified APK', async () => {
    const edge = edgeWithStoredRelease()
    const { latest } = await checkUpdate(edge, '3.6.5', 12)
    const download = latest.download
    const website = downloads.find((item) => item.id === platformAdviceMap.android.primaryId)
    expect(download.mode).toBe('chunked')
    expect(download.fileId).toBe(website.id)
    expect(download.fileName).toBe(website.fileName)
    expect(download.checksum).toBe(website.checksum)
    expect(download.chunkBytes).toEqual(website.chunkBytes)
    expect(download.chunks.map((chunk) => chunk.href)).toEqual(website.chunks)

    const hash = createHash('sha256')
    let size = 0
    for (const [index, chunk] of download.chunks.entries()) {
      expect(chunk.index).toBe(index)
      const request = new Request(chunk.url)
      let href = new URL(request.url).pathname
      if (chunk.index === 0) {
        const response = await edge.fetch(request)
        expect(response.status).toBe(302)
        href = new URL(response.headers.get('location')).pathname
      } else {
        expect(new URL(chunk.url).searchParams.has('part')).toBe(false)
      }
      expect(decodeURIComponent(href)).toBe(chunk.href)
      const bytes = readFileSync(resolve('public', `.${decodeURIComponent(href)}`))
      expect(bytes.length).toBe(chunk.bytes)
      expect(bytes.length).toBeLessThanOrEqual(20 * 1024 * 1024)
      hash.update(bytes)
      size += bytes.length
    }
    expect(size).toBe(31813361)
    expect(hash.digest('hex')).toBe(download.checksum)
    expect(readFileSync(resolve('public/downloads/checksums.txt'), 'utf8')).toContain(
      `${download.checksum}  ${download.fileName}`
    )
  })

  it('keeps desktop releases on 3.5.3 and only offers Android 3.6.5 or later', async () => {
    const edge = edgeWithStoredRelease()
    const response = await edge.fetch(new Request(`${origin}/api/updates/latest`))
    const { releases } = await response.json()
    expect(releases.windows.stable.version).toBe('3.5.3')
    expect(releases.macos.stable.version).toBe('3.5.3')
    expect(
      downloads.filter((item) => item.platform === 'Android').map((item) => item.version)
    ).toEqual(['3.7.1', '3.6.5'])
    expect(existsSync(resolve('public/downloads/CPENetworkDashboard V3.6.5.apk'))).toBe(true)
  })

  it('rejects retired Android downloads and removes their APK files', async () => {
    const edge = edgeWithStoredRelease()
    for (const [id, fileName] of [
      ['android-3.7.0', 'chunks/android-3.7.0'],
      ['android-3.5.3', 'CPEPlusPlus-v3.5.3.apk'],
      ['android-3.5', 'CPEPlusPlus-v3.5-legacy-release.apk'],
    ]) {
      const response = await edge.fetch(new Request(`${origin}/api/download?file=${id}`))
      expect(response.status).toBe(404)
      expect(existsSync(resolve('public/downloads', fileName))).toBe(false)
    }
  })
})
