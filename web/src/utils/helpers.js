export const makeId = (length) => {
  let result = ''
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

export async function getMedia() {
  let stream = null
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    })
    return stream
  } catch (err) {
    if (err.name === 'NotAllowedError') {
      return {
        error: 'You need to allow access to your camera and microphone.',
      }
    } else if (err.name === 'NotFoundError') {
      return {
        error: 'No camera found',
      }
    } else if (err.name === 'NotReadableError') {
      return {
        error: 'Camera is not readable',
      }
    } else if (err.name === 'OverconstrainedError') {
      return {
        error: 'Camera is overconstrained',
      }
    } else if (err.name === 'SecurityError') {
      return {
        error: 'Camera is not allowed',
      }
    } else if (err.name === 'TypeError') {
      return {
        error: 'Camera is not allowed',
      }
    }
  }
}

export function formatIncomingSignal({ data }) {
  console.log('handleIncomingSignal', data)
  const signal = {
    type: data.payload.signal_payload.payload_type,
    sdp: data.payload.signal_payload.sdp,
  }
  const signalName = data.payload.signal_name
  const to = data.payload.signal_payload.to
  const from = data.payload.signal_payload  .from

  return { signal, signalName, to, from }
}