import { Bot } from "../libs/misskey/user"
import { Note } from "../libs/misskey/note"
import dialogue from "../dialogue"

export const contact = async (me: Bot, note: Note, args?: string[]) => {
  if (!args) {
    await me.reply(note.id, dialogue.error.argsError)
    return
  }
  if (note.visibility === "specified") {
    console.log("contact: Trello send")
    await me.reply(note.id, dialogue.contact.accept)
    return
  } else {
    await me.reply(note.id, dialogue.contact.notDirect)
    await note.user.send(dialogue.contact.directCallback)
    return
  }
}
