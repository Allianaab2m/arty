import { Bot } from "./user"
import { EventEmitter } from "events"
import { Channels, Connection, Stream } from "./stream"
import axios, { AxiosInstance } from "axios"
import { MiApiType } from "./types/misskey"

type ClientOptions = {
  debug: boolean
  cacheTime: number
}

type ClientParams = {
  token?: string
  origin: string
  me?: Bot
  options?: Partial<ClientOptions>
}

type ClientEventTypes = {
  "ready": [me: Bot]
}

class TypedEventEmitter<TEvents extends Record<string, any>> {
  private emitter = new EventEmitter()

  emit<TEventName extends keyof TEvents & string>(
    eventName: TEventName,
    ...eventArg: TEvents[TEventName]
  ) {
    this.emitter.emit(eventName, ...(eventArg as []))
  }

  on<TEventName extends keyof TEvents & string>(
    eventName: TEventName,
    handler: (...eventArg: TEvents[TEventName]) => void
  ) {
    this.emitter.on(eventName, handler as any)
  }

  off<TEventName extends keyof TEvents & string>(
    eventName: TEventName,
    handler: (...eventArg: TEvents[TEventName]) => void
  ) {
    this.emitter.off(eventName, handler as any)
  }
}

export class Client extends TypedEventEmitter<ClientEventTypes> {
  private token?: string
  public origin: string
  private axios: AxiosInstance
  public me: Bot | null
  private options?: Partial<ClientOptions>

  constructor(params: ClientParams) {
    super()

    this.origin = params.origin
    this.me = null
    this.token = params.token

    this.axios = axios.create({
      baseURL: `${this.origin}/api`,
      headers: {
        "Content-Type": "application/json",
      },
    })
    this.options = params.options
  }

  async login(token = this.token) {
    if (token) this.token = token
    if (!this.token) throw new Error("No token provided.")

    const data = await this.request("i")
    const me = new Bot(this, data)
    this.emit("ready", me)
    this.me = me
  }

  useChannel<C extends keyof Channels>(channel: C): Connection<Channels[C]> {
    if (!this.token) throw new Error("No token provided.")
    const stream = new Stream(this.origin, { token: this.token })
    const ch = stream.useChannel(channel)
    return ch
  }

  public request<
    E extends keyof MiApiType,
    P extends MiApiType[E]['req'],
  >(endpoint: E, params: P = {} as P): Promise<MiApiType[E]['res']> {
      const promise = new Promise((resolve, reject) => {
        this.axios.interceptors.response.use((res) => {
          console.log(res)
          resolve(res.data)
          return res
        }, (err) => {
          console.error(err)
          return reject(err)
        })

        this.axios.post(
          `${endpoint}`, 
          JSON.stringify({ ...params, i: this.token })
        )
      })
      return promise as any
    }
}

