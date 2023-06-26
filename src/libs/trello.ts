import ky from 'https://esm.sh/ky@0.33.3'
import 'std/dotenv/load.ts'
import { CreateCardParams, LiteBoard } from './trello_type.ts'

export const useKy = () => {
  const API_KEY = Deno.env.get('TRELLO_API_KEY')
  const API_TOKEN = Deno.env.get('TRELLO_API_TOKEN')
  if (!API_KEY || !API_TOKEN) {
    if (!API_KEY && !API_TOKEN) {
      throw new Error('[Trello]: TRELLO_API_KEY and TRELLO_API_TOKEN undefined')
    } else if (!API_KEY) {
      throw new Error('[Trello]: TRELLO_API_KEY undefined')
    } else if (!API_TOKEN) {
      throw new Error('[Trello]: TRELLO_API_TOKEN undefined')
    }
  }

  return ky.create({
    prefixUrl: 'https://api.trello.com/1/',
    searchParams: {
      key: API_KEY,
      token: API_TOKEN,
    },
  })
}

export const getBoards = async <T extends Array<keyof LiteBoard> = []>(
  ...fields: T
) => {
  return await useKy().extend({
    searchParams: {
      fields: fields.toString(),
      lists: 'open',
    },
  }).get('members/me/boards').json<
    LiteBoard<T[number]>[]
  >()
}

/* export const getBoardFromName = async (name: string) => {
  console.log(await getBoards('name', 'lists'))
  const liteBoard = (await getBoards('name', 'lists')).find((b) =>
    b.name === name
  )
  if (!liteBoard) return null

  return liteBoard
} */

// export const getCards = async <T extends Array<keyof Card> = []>(
//   boardName: string,
//   cardFields: T,
// ) => {
//   const board = await getBoardFromName(boardName)
//   if (!board) return null
//
//   return (await useKy().extend({
//     searchParams: {
//       lists: 'open',
//       cards: 'open',
//       card_fields: cardFields.toString(),
//     },
//   }).get(`boards/${board.id}`).json<
//     Board<keyof Board, T[number]>
//   >()).cards
// }

export const createCards = async (
  getBoards: (
    ...args: Array<keyof LiteBoard>
  ) => Promise<LiteBoard<Array<keyof LiteBoard>[number]>[]>,
  params: CreateCardParams,
) => {
  const { name, desc, boardName, listName } = params
  const board = (await getBoards('name', 'lists')).find((b) =>
    b.name === boardName
  )
  if (!board) throw new Error(`[Trello] Board ${boardName} not found.`)

  const list = board.lists.find((l) => l.name === listName)
  if (!list) throw new Error(`[Trello] List ${listName} not found.`)

  await useKy().extend({
    searchParams: {
      name,
      desc,
      idList: list.id,
    },
  }).post('cards')
}

export const trello = { createCards, getBoards, useKy }
