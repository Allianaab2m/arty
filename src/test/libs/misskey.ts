import { assertEquals } from 'std/testing/asserts.ts'
import * as mf from 'mf'

Deno.test('test #1', async () => {
  mf.install()
  mf.mock('GET@/blog', (_req, params) => {
    return new Response('externalCallA', {
      status: 200,
    })
  })

  const res = await fetch('https://example.com/blog')
  const text = await res.text()

  assertEquals(text, 'externalCallA')
  mf.uninstall()
})
