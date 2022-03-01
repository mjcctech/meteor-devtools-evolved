import { sendLogMessage } from '@/Browser/Inject'

type MessageCallback = (message: DDPLog) => void

const generateId = () => (Date.now() + Math.random()).toString(36)

const injectOutboundInterceptor = (callback: MessageCallback) => {
  const send = Meteor.remoteConnection._stream.send

  Meteor.remoteConnection._stream.send = function (...args) {
    send.apply(this, args)

    callback({
      id: generateId(),
      content: args[0],
      isOutbound: true,
      timestamp: Date.now(),
    })
  }
}

const injectInboundInterceptor = (callback: MessageCallback) => {
  Meteor.remoteConnection._stream.on('message', (...args) => {
    callback({
      id: generateId(),
      content: args[0],
      isInbound: true,
      timestamp: Date.now(),
    })
  })
}

export const DDPInjector = () => {
  injectOutboundInterceptor(sendLogMessage)
  injectInboundInterceptor(sendLogMessage)
}
