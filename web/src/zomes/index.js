import { HolochainClient } from "@holochain-open-dev/cell-client";
import { APP_PORT, MAIN_APP_ID } from '../holochainConfig'

export async function getClient({callback}) {
  const client = await setupClient();
  const { unsubscribe } = client.addSignalHandler(callback);
  const cellId = client.appInfo.cell_data[0].cell_id;
  return {client, cellId, unsubscribe};
}

async function setupClient() {
  const client = await HolochainClient.connect(
    `ws://localhost:${APP_PORT}`,
    MAIN_APP_ID
  );
  return client;
}
  
export function handleSignal({ data }) {
  console.log('handleSignal', data)
  const signal = {
    type: data.payload.signal_payload.payload_type,
    sdp: data.payload.signal_payload.sdp,
  }
  const signalName = data.payload.signal_name
  const to = data.payload.signal_payload.to
  const from = data.payload.signal_payload  .from

  return { signal, signalName, to, from }
}