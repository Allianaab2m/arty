import { assertEquals } from 'std/testing/asserts.ts'
import * as mf from 'mf'

Deno.test('test #1', async () => {
  mf.install()
  mf.uninstall()
})
