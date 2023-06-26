import { api as MiApi, Endpoints, Stream } from 'misskey-js'

type OmitStrict<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

type NoteType = 'note' | 'renote' | 'quotedRenote'
type CreateNoteReq = Endpoints['notes/create']['req']

// type Note = Endpoints['notes/show']['res']
type User = Endpoints['i']['res']

export type MiApiCredential = Readonly<{
  origin: string
  token: string
}>

export const miApiInit = (credential: MiApiCredential) => {
  return new MiApi.APIClient({
    origin: credential.origin,
    credential: credential.token,
  })
}

// Misskey API
export const createNote = async <T extends NoteType = 'note'>(
  credential: MiApiCredential,
  options: T extends 'note' ?
      & OmitStrict<CreateNoteReq, 'renoteId' | 'replyId'>
      & Required<Pick<CreateNoteReq, 'text'>>
    : T extends 'renote' ?
        & OmitStrict<CreateNoteReq, 'text' | 'cw' | 'replyId'>
        & Required<Pick<CreateNoteReq, 'renoteId'>>
    : T extends 'quotedRenote' ?
        & OmitStrict<CreateNoteReq, 'replyId'>
        & Required<Pick<CreateNoteReq, 'renoteId' | 'text'>>
    : never,
) => {
  const client = miApiInit(credential)
  const res = await client.request('notes/create', options)
  return res.createdNote
}

export const createReply = async (
  credential: MiApiCredential,
  replyId: string,
  options?: OmitStrict<CreateNoteReq, 'replyId'>,
) => {
  const client = miApiInit(credential)
  const res = await client.request('notes/create', { replyId, ...options })
  return res.createdNote
}

export const userFollow = async (credential: MiApiCredential, user: User) => {
  const client = miApiInit(credential)
  await client.request('following/create', { userId: user.id })
}

// Stream API
export const useStreamChannel = (
  credential: MiApiCredential,
) => {
  const { origin, token } = credential
  const stream = new Stream(origin, { token })
  return stream.useChannel
}
