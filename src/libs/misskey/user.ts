import { Client } from "./client"
import { Note } from "./note"

export type UserParams = {
  id: string
  name: string
  username: string
  host: string | null
  avatarUrl: string | null
  avatarBlurhash: string | null
  isAdmin: boolean
  isModerator: boolean
  isBot: boolean
  isCat: boolean
  onlineStatus: "unknown" | "online" | "active" | "offline" | null
}

// UserLite
export class User {
  public readonly client: Client
  public id: string
  public name: string
  public username: string
  public host: string | null
  public avatarUrl: string | null = null
  public isModerator = false
  public isBot = false
  public isCat = false
  public onlineStatus: "unknown" | "online" | "active" | "offline" | null = null

  constructor(client: Client, params: UserParams) {
    this.client = client

    this.id = params.id
    this.name = params.name
    this.username = params.username
    this.host = params.host
    this.avatarUrl = params.avatarUrl
    this.isModerator = params.isModerator
    this.isBot = params.isBot
    this.isCat = params.isCat
    this.onlineStatus = params.onlineStatus
  }

  async send(message: string) {
    await this.client.request("notes/create", {
      visibility: "specified",
      visibleUserIds: [this.id],
      text: "@" + this.username + "\n\n" + message,
    })
  }
}

export class Bot extends User {
  constructor(client: Client, params: UserParams) {
    super(client, params)
  }

  async note(message: string): Promise<Note> {
    const note = await this.client.request("notes/create", {
      // TODO: Will change client options
      visibility: "home",
      visibleUserIds: [],
      text: message,
    })
    return note.createdNote
  }

  async renote(noteId: string): Promise<void> {
    await this.client.request("notes/create", {
      renoteId: noteId,
    })
  }

  async quoteRenote(noteId: string, quoteMessage: string): Promise<void> {
    await this.client.request("notes/create", {
      text: quoteMessage,
      renoteId: noteId,
    })
  }

  async reply(noteId: string, message: string): Promise<void> {
    await this.client.request("notes/create", {
      replyId: noteId,
      text: message,
    })
  }

  async notePoll(pollItems: string[], message: string): Promise<void> {
    console.log("Not implemented")
  }
}
