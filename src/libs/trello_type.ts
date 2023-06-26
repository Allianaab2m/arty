export type LiteBoard<T extends keyof LiteBoard = 'name' | 'url' | 'lists'> =
  Pick<{
    name: string
    id: string
    url: string
    lists: List[]
  }, T | 'id'>

export type Board<
  T extends keyof Board =
    | 'name'
    | 'desc'
    | 'closed'
    | 'pinned'
    | 'url'
    | 'shortUrl'
    | 'labelNames'
    | 'lists'
    | 'cards',
  U extends keyof Card = keyof Card,
> = Pick<{
  id: string
  name: string
  desc: string
  closed: boolean
  pinned: boolean
  url: string
  shortUrl: string
  labelNames: {
    green: '確認済'
    yellow: '相談したい'
    red: '緊急'
    blue: '仮完了 確認お願いします'
  }
  lists: List[]
  cards: Card<U>[]
}, T | 'id'>

export type Card<
  T extends keyof Card =
    | 'closed'
    | 'dueComplete'
    | 'dateLastActivity'
    | 'desc'
    | 'due'
    | 'idBoard'
    | 'idChecklists'
    | 'idList'
    | 'idLabels'
    | 'idMembers'
    | 'idMembersVoted'
    | 'idShort'
    | 'labels'
    | 'name'
    | 'pos'
    | 'shortLink'
    | 'shortUrl'
    | 'start'
    | 'subscribed'
    | 'url'
    | 'address'
    | 'locationName',
> = Pick<{
  id: string
  closed: boolean
  dueComplete: boolean
  dateLastActivity: string
  desc: string
  due: string | null
  idBoard: string
  idChecklists: string[]
  idList: string
  idLabels: string[]
  idMembers: string[]
  idMembersVoted: string[]
  idShort: number
  labels: Label[]
  name: string
  pos: number
  shortLink: string
  shortUrl: string
  start: string
  subscribed: boolean
  url: string
  address: string
  locationName: string
}, T | 'id'>

type Label = {
  id: string
  idBoard: string
  name: string
  color: string
}

type List = {
  id: string
  name: string
  closed: boolean
  idBoard: string
  pos: number
  subscribed: boolean
  softLimit: null
  status: null
}

type BoardName = '通報' | '問い合わせ'

export type CreateCardParams = {
  boardName: BoardName
  name: string
  desc: string
  listName: `新規${BoardName}`
}
