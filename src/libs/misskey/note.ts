import { Client } from "./client"
import { User } from "./user"

type MiFile = Record<string, any>
type Channel = Record<string, any>
type Reaction = Record<string, any>
type Poll = Record<string, any>

type NoteParams = {
  id: string
  createdAt: string
  deletedAt?: string | null
  text?: string | null
  cw?: string | null
  userId: string
  user: User
  replyId?: string | null
  renoteId?: string | null
  reply?: Note | null
  renote?: Note | null
  isHidden: boolean
  visibility: "public" | "home" | "followers" | "specified"
  visibleUserIds?: string[] | null
  fileIds?: string[] | null
  files?: MiFile[] | null
  mentions?: string[] | null
  tags?: string[] | null
  poll?: Poll | null
  channelId?: string | null
  channel?: Channel | null
  localOnly: boolean
  reactionAcceptance: string | null
  reactions?: Reaction | null
  renoteCount: number
  repliesCount: number
  uri: string
  url: string
  myreaction?: Reaction | null
}

export class Note {
  public id: string
  public createdAt: string
  public deletedAt?: string | null = null
  public text?: string | null = null
  public cw?: string | null = null
  public userId: string
  public user: User
  public replyId?: string | null = null
  public renoteId?: string | null = null
  public reply?: Note | null = null
  public renote?: Note | null = null
  public isHidden = false
  public visibility?: "public" | "home" | "followers" | "specified"
  public mentions?: string[] | null = null
  public visibleUserIds?: string[] | null
  public fileIds?: string[] | null = null
  public files?: MiFile[] | null = null
  public tags?: string[] | null
  public poll?: Poll | null = null
  public channelId?: string | null = null
  public channel?: Channel | null = null
  public localOnly = false
  public reactionAcceptance: string | null = null
  public reactions?: Reaction | null = null
  public renoteCount: number
  public repliesCount: number
  public uri: string
  public url: string
  public myreaction?: Reaction | null = null

  constructor (params: NoteParams) {
    this.id = params.id
    this.createdAt = params.createdAt
    this.userId = params.userId
    this.user = params.user
    this.isHidden = params.isHidden
    this.visibility = params.visibility
    this.renoteCount = params.renoteCount
    this.repliesCount = params.repliesCount
    this.uri = params.uri
    this.url = params.url
  }

  async reaction(client: Client, reaction: string) {
    await client.request("notes/reactions/create", {
      noteId: this.id,
      reaction
    })
  }
}
