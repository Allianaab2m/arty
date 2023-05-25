import { Note } from "../libs/misskey/note"
import { Bot } from "../libs/misskey/user"
import { contact } from "./contact"

// TODO: Fix them
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Kuroshiro from "kuroshiro"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import KuromojiAnalyzer from "kuroshiro-analyzer-kuromoji"
import { match, P } from "ts-pattern"

type Command = {
  prompt: string
  args?: string[]
}

const multipleIncludes = (
  text: string,
  pattern: string | string[],
  conditions: "and" | "or" = "or"
) => {
  if (typeof pattern === "string") {
    return text.includes(pattern)
  }

  if (conditions === "and") {
    for (const word of pattern) {
      if (!text.includes(word)) {
        return false
      }
    }
    return true
  } else {
    for (const word of pattern) {
      if (text.includes(word)) {
        return true
      }
    }
    return false
  }
}

const kuroshiro = new Kuroshiro()

let kuroshiroInited = false

type params = {
  me: Bot | null
  note: Note
  command: Command
}

export const commandHandler = async ({ me, note, command }: params) => {
  if (!me) throw new Error("Bot is not logged in.")
  if (note.user.isBot) return console.log("Bot. skipped.")

  if(!kuroshiroInited) {
    await kuroshiro.init(new KuromojiAnalyzer()).then(() => {
      kuroshiroInited = true
    })
  }

  console.log("commandHandler called")
  console.log("me", me)
  console.log("note", note)
  console.log("command", command)

  const romajiPrompt: string = await kuroshiro.convert(command.prompt, {
    to: "romaji",
    mode: "normal",
    romajiSystem: "passport",
  })

  console.log("romajiPrompt", romajiPrompt)

  match(romajiPrompt)
    .with(
      P.when(v => multipleIncludes(v, ["konnichiwa", "konnichiha", "hello"])), 
      async () => me.reply(note.id, `こんにちは，${note.user.name}さん!`)
    )
    .with(
      P.when(v => multipleIncludes(v, ["toiawase", "contact"])),
      async () => await contact(me, note)
    )
    .otherwise(() => console.log("no match"))
}
