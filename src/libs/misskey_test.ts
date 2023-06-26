import { assertEquals } from 'std/testing/asserts.ts'
import * as mf from 'mf'

Deno.test('test #1', () => {
  mf.install()
  mf.uninstall()
})
