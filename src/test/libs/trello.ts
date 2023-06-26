import * as mf from 'mf'
import { trello as tr } from '../../libs/trello.ts'
import { Stub } from 'https://deno.land/x/rhum@v2.2.0/mod.ts'
import { assertRejects, assertThrows } from 'std/testing/asserts.ts'
import { returnsNext, stub } from 'std/testing/mock.ts'

Deno.test('useKy error', async (t) => {
  const envGetMock = stub(
    Deno.env,
    'get',
    returnsNext([
      undefined,
      'API_TOKEN',

      'API_KEY',
      undefined,

      undefined,
      undefined,
    ]),
  )
  await t.step('TRELLO_API_KEY', () => {
    assertThrows(() => tr.useKy(), Error, '[Trello]: TRELLO_API_KEY undefined')
  })
  await t.step('TRELLO_API_TOKEN', () => {
    assertThrows(
      () => tr.useKy(),
      Error,
      '[Trello]: TRELLO_API_TOKEN undefined',
    )
  })
  await t.step('all', () => {
    assertThrows(
      () => tr.useKy(),
      Error,
      '[Trello]: TRELLO_API_KEY and TRELLO_API_TOKEN undefined',
    )
  })

  envGetMock.restore()
})

Deno.test('createCard', async (t) => {
  mf.install()

  mf.mock('POST@/1/cards', () => {
    return new Response('', {
      status: 200,
    })
  })

  mf.mock('GET@/1/members/me/cards', () => {
    return new Response('', {
      status: 200,
    })
  })

  Stub(tr, 'getBoards', [{
    name: '通報',
    id: 'test1_id',
    lists: [
      {
        id: 'list_id',
        name: '新規通報',
        closed: false,
        idBoard: 'test1_id',
        pos: 1,
        subscribed: false,
        softLimit: null,
        status: null,
      },
    ],
  }])

  await t.step('listname not found', () => {
    assertRejects(async () => {
      await tr.createCards(tr.getBoards, {
        name: 'Foo',
        desc: 'Bar',
        boardName: '通報',
        listName: '新規問い合わせ',
      })
    }),
      Error,
      '[Trello] List 新規問い合わせ not found.'
  })

  mf.uninstall()
})
