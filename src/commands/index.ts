import { Note } from "../libs/misskey/note"
import { Bot } from "../libs/misskey/user"

// TODO: Fix them
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Kuroshiro from "kuroshiro"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import KuromojiAnalyzer from "kuroshiro-analyzer-kuromoji"
import { match } from "ts-pattern"

type Command = {
  prompt: string
  args?: string[]
}

const kuroshiro = new Kuroshiro()

type params = {
  me: Bot | null
  note: Note
  command: Command
}

export const commandHandler = async ({ me, note, command }: params) => {
  if (!me) throw new Error("Bot is not logged in.")

  await kuroshiro.init(new KuromojiAnalyzer())
  const romajiPrompt = await kuroshiro.convert(command.prompt, {
    to: "romaji",
    mode: "normal",
    romajiSystem: "passport",
  })
  if (note.user.id === me.id) return console.log("Wait. Its me.")
  match(romajiPrompt).with("konnichiha", () =>
    me.reply(note.id, `こんにちは，${note.user.username}さん！`)
  )
}
