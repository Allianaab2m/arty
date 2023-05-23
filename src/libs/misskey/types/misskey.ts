type NoParams = Record<string, never>

type TODO = Record<any, any>

import type { User, UserParams } from "../user"
import type { Note } from "../note"

export type MiApiType = {
  "i": {
    req: NoParams,
    res: UserParams
  }
  "notes/create": {
    req: {
      visibility?: "public" | "home" | "followers" | "specified",
      visibleUserIds?: string[],
      cw?: string | null,
      localOnly?: boolean,
      reactionAcceptance?: null | "likeOnly" | "likeOnlyForRemote",
      noExtractMentions?: boolean,
      noExtractHashtags?: boolean,
      noExtractEmojis?: boolean,
      replyId?: string | null,
      renoteId?: string | null
      channelId?: string | null,
      text?: string | null,
      fileIds?: string[],
      mediaIds?: string[],
      poll?: object | null
    },
    res: {
      createdNote: Note
    }
  }
  "notes/reactions/create": {
    req: {
      noteId: string,
      reaction: string
    },
    res: NoParams
  }
}
