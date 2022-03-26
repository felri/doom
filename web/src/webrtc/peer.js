import Peer from 'simple-peer'

const STUN_SERVERS = [
  { url: 'stun:stun.l.google.com:19302' },
  { url: 'stun:global.stun.twilio.com:3478?transport=udp' },
]

function createNewPeer({
  initiator,
  onError,
  onSignal,
  onConnect,
  onData,
  stream,
}) {
  const options = {
    initiator: initiator,
    trickle: false,
    config: {
      iceServers: STUN_SERVERS.map((f) => ({
        urls: f.url
      })),
    },
  }
  if (stream) options.stream = stream

  const peer = new Peer(options)
  // peer._debug = console.log
  peer.on('error', onError)
  peer.on('signal', onSignal)
  peer.on('connect', onConnect)
  peer.on('data', onData)
  return peer
}

export function addPeer({
  signal,
  from,
  stream = null,
  onError,
  onSignal,
  onConnect,
  onData,
  onStream,
}) {
  const options = {
    initiator: false,
    onError: onError,
    onSignal: (signal) => onSignal(signal, from, 'send_answer'),
    onConnect: onConnect,
    onData: onData,
    onStream: onStream,
  }
  if (stream) options.stream = stream

  const peer = createNewPeer(options)
  peer.signal(signal)
  return peer
}

export function createPeer({
  to,
  stream = null,
  onError,
  onSignal,
  onConnect,
  onData,
  onStream,
}) {
  const options = {
    initiator: true,
    onError: onError,
    onSignal: (signal) => onSignal(signal, to, 'send_offer'),
    onConnect: onConnect,
    onData: onData,
    onStream: onStream,
  }
  if (stream) options.stream = stream

  const peer = createNewPeer(options)
  return peer
}

export function answerPeer({ signal, from, peers }) {
  const { peer } = peers.find(
    (peer) => JSON.stringify(peer.to) == JSON.stringify(from)
  )
  peer.signal(signal)
}

export function stopBothVideoAndAudio(stream) {
  stream.getTracks().forEach(function (track) {
    if (track.readyState == 'live') {
      track.stop()
    }
  })
}

export function stopVideoOnly(stream) {
  stream.getTracks().forEach(function (track) {
    if (track.readyState == 'live' && track.kind === 'video') {
      track.stop()
    }
  })
}

export function stopAudioOnly(stream) {
  stream.getTracks().forEach(function (track) {
    if (track.readyState == 'live' && track.kind === 'audio') {
      track.stop()
    }
  })
}
