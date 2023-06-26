import {
  createNote,
  MiApiCredential,
  userFollow,
  useStreamChannel,
} from './libs/misskey.ts'

let credential: MiApiCredential

if (Deno.env.get('DENO_ENV') === 'development') {
  credential = {
    origin: 'https://m.c30.life',
    token: Deno.env.get('MI_TOKEN_MC30') ?? '',
  }
} else {
  credential = {
    origin: 'https://misskey.art',
    token: Deno.env.get('MI_TOKEN_ART') ?? '',
  }
}

useStreamChannel(credential)('main').on('followed', async (user) => {
  await userFollow(credential, user)
})
