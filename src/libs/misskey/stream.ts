// Misskey-dev/misskey/packages/misskey-js/src/streaming.ts

import { EventEmitter } from "eventemitter3"
import ReconnectingWebSocket from "reconnecting-websocket"
import { Note } from "./note"
import { User } from "./user"

type AnyOf<T extends Record<any, any>> = T[keyof T]

export type Channels = {
	// main: {
	// 	params: null;
	// 	events: {
	// 		notification: (payload: Notification) => void;
	// 		mention: (payload: Note) => void;
	// 		reply: (payload: Note) => void;
	// 		renote: (payload: Note) => void;
	// 		follow: (payload: User) => void; // 自分が他人をフォローしたとき
	// 		followed: (payload: User) => void; // 他人が自分をフォローしたとき
	// 		unfollow: (payload: User) => void; // 自分が他人をフォロー解除したとき
	// 		meUpdated: (payload: MeDetailed) => void;
	// 		pageEvent: (payload: PageEvent) => void;
	// 		urlUploadFinished: (payload: { marker: string; file: DriveFile; }) => void;
	// 		readAllNotifications: () => void;
	// 		unreadNotification: (payload: Notification) => void;
	// 		unreadMention: (payload: Note['id']) => void;
	// 		readAllUnreadMentions: () => void;
	// 		unreadSpecifiedNote: (payload: Note['id']) => void;
	// 		readAllUnreadSpecifiedNotes: () => void;
	// 		readAllMessagingMessages: () => void;
	// 		messagingMessage: (payload: MessagingMessage) => void;
	// 		unreadMessagingMessage: (payload: MessagingMessage) => void;
	// 		readAllAntennas: () => void;
	// 		unreadAntenna: (payload: Antenna) => void;
	// 		readAllAnnouncements: () => void;
	// 		myTokenRegenerated: () => void;
	// 		reversiNoInvites: () => void;
	// 		signin: (payload: FIXME) => void;
	// 		registryUpdated: (payload: {
	// 			scope?: string[];
	// 			key: string;
	// 			value: any | null;
	// 		}) => void;
	// 		driveFileCreated: (payload: DriveFile) => void;
	// 		readAntenna: (payload: Antenna) => void;
	// 	};
	// 	receives: null;
	// };
	homeTimeline: {
		params: null;
		events: {
			note: (payload: Note) => void;
		};
		receives: null;
	};
	localTimeline: {
		params: null;
		events: {
			note: (payload: Note) => void;
		};
		receives: null;
	};
	hybridTimeline: {
		params: null;
		events: {
			note: (payload: Note) => void;
		};
		receives: null;
	};
	globalTimeline: {
		params: null;
		events: {
			note: (payload: Note) => void;
		};
		receives: null;
	};
	// messaging: {
	// 	params: {
	// 		otherparty?: User['id'] | null;
	// 		group?: UserGroup['id'] | null;
	// 	};
	// 	events: {
	// 		message: (payload: MessagingMessage) => void;
	// 		deleted: (payload: MessagingMessage['id']) => void;
	// 		read: (payload: MessagingMessage['id'][]) => void;
	// 		typers: (payload: User[]) => void;
	// 	};
	// 	receives: {
	// 		read: {
	// 			id: MessagingMessage['id'];
	// 		};
	// 	};
	// };
	// serverStats: {
	// 	params: null;
	// 	events: {
	// 		stats: (payload: FIXME) => void;
	// 	};
	// 	receives: {
	// 		requestLog: {
	// 			id: string | number;
	// 			length: number;
	// 		};
	// 	};
	// };
	// queueStats: {
	// 	params: null;
	// 	events: {
	// 		stats: (payload: FIXME) => void;
	// 	};
	// 	receives: {
	// 		requestLog: {
	// 			id: string | number;
	// 			length: number;
	// 		};
	// 	};
	// };
};

export type NoteUpdatedEvent = {
	id: Note['id'];
	type: 'reacted';
	body: {
		reaction: string;
		userId: User['id'];
	};
} | {
	id: Note['id'];
	type: 'unreacted';
	body: {
		reaction: string;
		userId: User['id'];
	};
} | {
	id: Note['id'];
	type: 'deleted';
	body: {
		deletedAt: string;
	}
} | {
	id: Note['id'];
	type: 'pollVoted';
	body: {
		choice: number;
		userId: User['id'];
	}
}

export function urlQuery(obj: Record<string, string | number | boolean | undefined>): string {
	const params = Object.entries(obj)
		.filter(([, v]) => Array.isArray(v) ? v.length : v !== undefined)
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		.reduce((a, [k, v]) => (a[k] = v!, a), {} as Record<string, string | number | boolean>);

	return Object.entries(params)
		.map((e) => `${e[0]}=${encodeURIComponent(e[1])}`)
		.join('&');
}


export type BroadcastEvents = {
	noteUpdated: (payload: NoteUpdatedEvent) => void;
};

type StreamEvents = {
  _connected_: void
  _disconnected_: void
} & BroadcastEvents

export class Stream extends EventEmitter<StreamEvents> {
  private stream: ReconnectingWebSocket
  public state: "initializing" | "reconnecting" | "connected" = "initializing"
  private sharedConnectionPools: Pool[] = []
  private sharedConnections: SharedConnection[] = []
  private nonSharedConnections: NonSharedConnection[] = []
  private idCounter = 0

  constructor(origin: string, user: { token: string } | null, options?: {
    WebSocket?: any
  }) {
    super()

    this.genId = this.genId.bind(this)
    this.useChannel = this.useChannel.bind(this)
    this.useSharedConnection = this.useSharedConnection.bind(this)
    this.removeSharedConnection = this.removeSharedConnection.bind(this)
    this.removeSharedConnectionPool = this.removeSharedConnectionPool.bind(this)
    this.connectToChannel = this.connectToChannel.bind(this)
    this.disconnectToChannel = this.disconnectToChannel.bind(this)
    this.onOpen = this.onOpen.bind(this)
    this.onClose = this.onClose.bind(this)
    this.onMessage = this.onMessage.bind(this)
    this.send = this.send.bind(this)
    this.close = this.close.bind(this)
    
    options = options ?? {}

    const query = urlQuery({
      i: user?.token,
      _t: Date.now()
    })

    const wsOrigin = origin.replace("http://", "ws://").replace("https://", "wss://")

    this.stream = new ReconnectingWebSocket(`${wsOrigin}/streaming?${query}`, [], {
      minReconnectionDelay: 1,
      WebSocket: require("ws")
    })
    this.stream.addEventListener("open", this.onOpen)
    this.stream.addEventListener("close", this.onClose)
    this.stream.addEventListener("message", this.onMessage)
  }

  private genId(): string {
    return (++this.idCounter).toString()
  }

  public useChannel<C extends keyof Channels>(channel: C, params?: Channels[C]['params'], name?: string): Connection<Channels[C]> {
    if (params) {
      return this.connectToChannel(channel, params)
    } else {
      return this.useSharedConnection(channel, name)
    }
  }

  private useSharedConnection<C extends keyof Channels>(channel: C, name?: string): SharedConnection<Channels[C]> {
    let pool = this.sharedConnectionPools.find(p => p.channel === channel)

    if (pool == null) {
      pool = new Pool(this, channel, this.genId())
      this.sharedConnectionPools.push(pool)
    }

    const connection = new SharedConnection(this, channel, pool, name)
    this.sharedConnections.push(connection)
    return connection
  }

  public removeSharedConnection(connection: SharedConnection): void {
    this.sharedConnections = this.sharedConnections.filter(c => c !== connection)
  }

  public removeSharedConnectionPool(pool: Pool): void {
    this.sharedConnectionPools = this.sharedConnectionPools.filter(p => p !== pool)
  }

  private connectToChannel<C extends keyof Channels>(channel: C, params: Channels[C]['params']): NonSharedConnection<Channels[C]> {
    const connection = new NonSharedConnection(this, channel, this.genId(), params)
    this.nonSharedConnections.push(connection)
    return connection
  }

  public disconnectToChannel(connection: NonSharedConnection): void {
    this.nonSharedConnections = this.nonSharedConnections.filter(c => c !== connection)
  }

  private onOpen(): void {
    const isReconnect = this.state === "reconnecting"

    this.state = "connected"
    this.emit("_connected_")

    if (isReconnect) {
      for (const p of this.sharedConnectionPools) p.connect()
      for (const c of this.nonSharedConnections) c.connect()
    }
  }

  private onClose(): void {
    if (this.state === "connected") {
      this.state = "reconnecting"
      this.emit("_disconnected_")
    }
  }

  private onMessage(message: { data: string }): void {
    const { type, body } = JSON.parse(message.data)

    if (type === "channel") {
      const id = body.id
      let connections: Connection[]

      connections = this.sharedConnections.filter(c => c.id === id)

      if (connections.length === 0) {
        const found = this.nonSharedConnections.find(c => c.id === id)
        if (found) connections = [found]
      }

      for (const c of connections) {
        c.emit(body.type, body.body)
        c.inCount++
      }
    } else {
      this.emit(type, body)
    }
  }

  public send(typeOrPayload: string): void
  public send(typeOrPayload: string, payload: any): void
  public send(typeOrPayload: Record<string, any> | any[]): void
  public send(typeOrPayload: string | Record<string, any> | any[], payload?: any): void {
    if (typeof typeOrPayload === "string") {
      this.stream.send(JSON.stringify({
        type: typeOrPayload,
        ...(payload === undefined ? {} : { body: payload })
      }))
      return
    }

    this.stream.send(JSON.stringify(typeOrPayload))
  }

  public close(): void {
    this.stream.close()
  }
}

class Pool {
  public channel: string
  public id: string
  protected stream: Stream
  public users = 0
  private disposeTimerId: any
  private isConnected = false

  constructor(stream: Stream, channel: string, id: string) {
    this.onStreamDisconnected = this.onStreamDisconnected.bind(this)
    this.inc = this.inc.bind(this)
    this.dec = this.dec.bind(this)
    this.connect = this.connect.bind(this)
    this.disconnect = this.disconnect.bind(this)

    this.channel = channel
    this.stream = stream
    this.id = id

    this.stream.on("_disconnected_", this.onStreamDisconnected)
  }

  private onStreamDisconnected() {
    this.isConnected = false
  }

  public inc(): void {
    if (this.users === 0 && !this.isConnected) {
      this.connect()
    }

    this.users++

    if (this.disposeTimerId) {
      clearTimeout(this.disposeTimerId)
      this.disposeTimerId = null
    }
  }

  public dec(): void {
    this.users--

    if (this.users === 0) {
      this.disposeTimerId = setTimeout(() => {
        this.disconnect()
      }, 3000)
    }
  }

  public connect(): void {
    if (this.isConnected) return
    this.isConnected = true
    this.stream.send("connect", {
      channel: this.channel,
      id: this.id
    })
  }

  public disconnect(): void {
    this.stream.off("_disconnected_", this.onStreamDisconnected)
    this.stream.send("disconnect", { id: this.id })
    this.stream.removeSharedConnectionPool(this)
  }
}

export abstract class Connection<Channel extends AnyOf<Channels> = any> extends EventEmitter<Channel['events']> {
  public channel: string
  protected stream: Stream
  public abstract id: string

  public name?: string
  public inCount = 0
  public outCount = 0

  constructor(stream: Stream, channel: string, name?:string) {
    super()
    this.send = this.send.bind(this)

    this.stream = stream
    this.channel = channel
    this.name = name
  }

  public send<T extends keyof Channel['receives']>(type: T, body: Channel['receives'][T]): void {
    this.stream.send('channel', {
      id: this.id,
      type,
      body
    })

    this.outCount++
  }

  public abstract dispose(): void
}

class SharedConnection<Channel extends AnyOf<Channels> = any> extends Connection<Channel> {
  private pool: Pool

  public get id(): string {
    return this.pool.id
  }

  constructor(stream: Stream, channel: string, pool: Pool, name?: string) {
    super(stream, channel, name)

    this.dispose = this.dispose.bind(this)

    this.pool = pool
    this.pool.inc()
  }

  public dispose(): void {
      this.pool.dec()
    this.removeAllListeners()
    this.stream.removeSharedConnection(this)
  }
}

class NonSharedConnection<Channel extends AnyOf<Channels> = any> extends Connection<Channel> {
  public id: string
  protected params: Channel['params']

  constructor(stream: Stream, channel: string, id: string, params: Channel['params']) {
    super(stream, channel)

    this.connect = this.connect.bind(this)
    this.dispose = this.dispose.bind(this)

    this.params = params
    this.id = id

    this.connect()
  }

  public connect(): void {
    this.stream.send('connect', {
      channel: this.channel,
      id: this.id,
      params: this.params
    })
  }

  public dispose(): void {
    this.removeAllListeners()
    this.stream.send("disconnect", { id: this.id })
    this.stream.disconnectToChannel(this)
  }
}
