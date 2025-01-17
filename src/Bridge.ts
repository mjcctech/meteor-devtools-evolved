import { memoize, padStart } from 'lodash'
import { CRC32 } from '@/Utils/CRC32'
import { detectType } from '@/Pages/Panel/DDP/FilterConstants'
import prettyBytes from 'pretty-bytes'
import { PanelStore } from '@/Stores/PanelStore'
import { DateTime } from 'luxon'
import { StringUtils } from '@/Utils/StringUtils'

const getHash = memoize((content: string) =>
  padStart(new CRC32().update(content).digest(), 8, '0'),
)

export const syncSubscriptions = () =>
  Bridge.sendContentMessage({
    eventType: 'sync-subscriptions',
    data: null,
  })

export const syncStats = () =>
  Bridge.sendContentMessage({
    eventType: 'stats',
    data: null,
  })

export const Bridge = new (class {
  private handlers: Partial<Record<EventType, MessageHandler>> = {}

  register(eventType: EventType, handler: MessageHandler) {
    this.handlers[eventType] = handler
  }

  handle(message: Message<any>) {
    if (message.eventType in this.handlers) {
      const handler = this.handlers[message.eventType]

      if (handler) handler(message)
    }
  }

  sendContentMessage(message: Message<any>) {
    const payload: IMessagePayload<any> = {
      ...message,
      source: 'meteor-devtools-evolved',
    }

    if (chrome && chrome.devtools) {
      chrome.devtools.inspectedWindow.eval(
        `__meteor_devtools_evolved_receiveMessage(${JSON.stringify(payload)})`,
      )
    }
  }

  chrome() {
    const backgroundConnection = chrome.runtime.connect({
      name: 'panel',
    })

    backgroundConnection.postMessage({
      name: 'init',
      tabId: chrome.devtools.inspectedWindow.tabId,
    })

    backgroundConnection.onMessage.addListener((message: Message<any>) =>
      Bridge.handle(message),
    )
  }

  init() {
    console.log('Setting up bridge...')

    if (!chrome || !chrome.devtools) return

    this.chrome()

    syncStats()
  }
})()

Bridge.register('ddp-event', (message: Message<DDPLog>) => {
  const size = StringUtils.getSize(message.data.content)
  const hash = getHash(message.data.content)
  const parsedContent = JSON.parse(message.data.content)
  const filterType = detectType(parsedContent)

  const log = {
    ...message.data,
    parsedContent,
    timestampPretty: message.data.timestamp
      ? DateTime.fromMillis(message.data.timestamp).toFormat('HH:mm:ss.SSS')
      : '',
    timestampLong: message.data.timestamp
      ? DateTime.fromMillis(message.data.timestamp).toLocaleString(
          DateTime.DATETIME_FULL,
        )
      : '',
    size,
    sizePretty: prettyBytes(size),
    hash,
    filterType,
  }

  if (filterType === 'subscription') {
    syncSubscriptions()
  }

  PanelStore.ddpStore.pushItem(log)
})

Bridge.register(
  'minimongo-get-collections',
  (message: Message<RawCollections>) => {
    PanelStore.minimongoStore.setCollections(message.data)
  },
)

Bridge.register('sync-subscriptions', (message: Message<any>) => {
  PanelStore.syncSubscriptions(JSON.parse(message.data.subscriptions))
})

Bridge.register('stats', (message: Message<any>) => {
  console.log(message.data)

  PanelStore.setGitCommitHash(message.data.gitCommitHash)
})

Bridge.register('meteor-data-performance', (message: Message<CallData>) => {
  PanelStore.performanceStore.push(message.data)
})
