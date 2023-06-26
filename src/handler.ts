import { Endpoints } from 'misskey-js'
import { MiApiCredential, miApiInit } from './libs/misskey.ts'
import Kuroshiro from 'npm:kuroshiro'
import KuromojiAnalyzer from 'npm:kuroshiro-analyzer-kuromoji'

type Note = Endpoints['notes/show']['res']

interface HandledNote {
  command: string
  romajiedCommand: string
  args: string[]
  raw: {
    note: Note
    text: string
  }
}

class CommandHandlerError extends Error {}

const kuroshiro = new Kuroshiro()

let kuromojiInited = false

export const mentionHandler = async (
  note: Note,
): Promise<HandledNote> => {
  if (!note.text) throw new CommandHandlerError('note.text is null')
  if (!kuromojiInited) {
    await kuroshiro.init(new KuromojiAnalyzer()).then(() => {
      kuromojiInited = true
    })
  }

  // text = '@arty <command>\n\n<args>'
  const newLineSplitedText = note.text.split('\n') // ['@arty <command>', '', '<args>']
  const command = newLineSplitedText[0].split(' ')[1] // ['@arty', '<command>']
  const args = newLineSplitedText.slice(1) // ['<args>']

  const romajiedCommand: string = await kuroshiro.convert(command, {
    to: 'romaji',
    mode: 'normal',
    romajiSystem: 'passport',
  })

  return {
    command,
    romajiedCommand,
    args,
    raw: {
      note,
      text: note.text,
    },
  }
}

export const replyHandler = async (note: Note): Promise<HandledNote> => {
  if (!note.text) throw new CommandHandlerError('note.text is null')
  if (!kuromojiInited) {
    await kuroshiro.init(new KuromojiAnalyzer()).then(() => {
      kuromojiInited = true
    })
  }

  // const

  /* return {
    raw: {
      note,
      text: note.text,
    },
  } */
}
