import { Client } from "./libs/misskey/client"
import { commandHandler } from "./commands"
import * as dotenv from "dotenv"

dotenv.config()

let options = {
  origin: "",
  token: "",
}

if (process.env.NODE_ENV === "development") {
  options = {
    origin: "https://m.c30.life",
    token: process.env.MI_TOKEN_MC30 ? process.env.MI_TOKEN_MC30 : "",
  }
} else {
  options = {
    origin: "https://misskey.art",
    token: process.env.MI_TOKEN_ART ? process.env.MI_TOKEN_ART : "",
  }
}

const client = new Client(options)

client.login(options.token)

client.useChannel("main").on("notification", (n) => {
  if (n.type === "mention") {
    const callText = n.note.text?.split("\n")
    if (!callText) return

    const command = {
      prompt: callText[0].split(" ")[1],
      args: callText.slice(1),
    }

    commandHandler({
      me: client.me,
      note: n.note,
      command,
    })
  }
})
