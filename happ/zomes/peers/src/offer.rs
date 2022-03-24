use crate::peer_profile::PeerProfile;
use hdk::prelude::*;

#[derive(Debug, Serialize, Deserialize, SerializedBytes, Clone)]
pub struct OfferPayload {
    pub to: AgentPubKey,
    pub payload_type: String,
    pub sdp: String,
}
#[derive(Debug, Serialize, Deserialize, SerializedBytes, Clone)]

pub struct AnswerPayload {
    pub to: AgentPubKey,
    pub payload_type: String,
    pub sdp: String,
    pub from: AgentPubKey,
}

// Different kinds of signals available in our hApp
#[derive(Serialize, Deserialize, SerializedBytes, Debug)]
#[serde(tag = "signal_name", content = "signal_payload")]
pub enum OfferSignal {
    PeerJoined(PeerProfile),
    Offer(AnswerPayload),
    Answer(AnswerPayload),
}
