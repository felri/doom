use crate::{
    join_code::{create_room_code_anchor, get_room_code_anchor},
    offer::{OfferSignal, OfferPayload, AnswerPayload},
};
use hdk::prelude::*;

pub const PEER_LINK_TAG: &str = "PEER";

/// This is a Rust structure which represents an actual
/// Holochain entry that stores user's profile for the specific room
/// First we derive just a Rust struct, and then we apply hdk_entry
/// macro to it, which generates code to impelement Holochain entry.
/// id defines how this entry would be called, while visibility defines
/// where an entry will be stored. We plan to store it on DHT, so we
/// go with the "public" value
/// `#[derive(Clone)]` is needed to implement a Rust trait to allow
/// deep copies of the Rust struct, which would come in handy when we
/// want to use.
#[hdk_entry(id = "peer_profile", visibility = "public")]
#[derive(Clone)]
pub struct PeerProfile {
    pub to: AgentPubKey,
    pub nickname: String,
}

/// Struct to receive user input from the UI when user
/// wants to join the room.
/// Note that there are more traits implemented: we need those
/// to be able to send this struct via our zome API
#[derive(Clone, Debug, Serialize, Deserialize, SerializedBytes)]
pub struct JoinRoomInfo {
    pub roomcode: String,
    pub nickname: String,
}

/// Creates a PeerProfile instance, commits it as a Holochain entry
/// and returns a hash value of this entry
pub fn create_and_hash_entry_peer_profile(nickname: String) -> ExternResult<EntryHash> {
    // Retrieve info about an agent who is currently executing this code
    // For every instance of the app this would produce different results.
    let agent = agent_info()?;
    // Print some debug output into the logs, you'll see it when running
    // integration tests / app in conductor
    // Note the `{:?}` thing: this is what you write when you need to print
    // a Rust struct that implements the Debug trait. For things that implement
    // Display trait (like nickname here of String type) simple `{}` would do.
    debug!(
        "create_and_hash_entry_peer_profile | nickname: {}, agent {:?}",
        nickname,
        agent.clone()
    );
    // Instantiate a Rust struct to store this data
    let peer_profile = PeerProfile {
        // Beware: this is bad design for real apps, because:
        // 1/ initial_pubkey is linked to app itself, so no roaming profile
        // 2/ lost if app is reinstalled (= that would be basically a new user)
        to: agent.agent_initial_pubkey,
        nickname,
    };
    // Commit the Rust struct instance to DHT
    // This is where actual write to DHT happens.
    // Note: this fn isn't idempotent! If someone would try to commit the
    // same peer_profile multiple times, every time a Header about entry creation
    // would be created. Since the data is the same, it wouldn't affect it
    // and since our app logic doesn't look for these headers, it wouldn't
    // break the app.
    create_entry(&peer_profile)?;
    debug!("create_and_hash_entry_peer_profile | profile created, hashing");
    // Calculate a hash value of the entry we just written to DHT:
    // that would be essentially ID of that piece of information.
    // And since there's no ; in the end, this is what we return from current fn
    hash_entry(&peer_profile)
}

/// Creates user's profile for the room and registers this user as one of the room peers
/// Notice how we packed all input parameters in a single struct: this is a requirement
/// for our function to be exposed as zome API. And even though this particular fn isn't
/// exposed (there's a wrapper for it in lib.rs that is), it's easier for them to have the
/// same signature. Also it's nice to be able to read about all datatypes that cross the API
/// as those would need to be defined as structs.
///
/*
When you create an anchor with the function return a EntryHash. Once you
know the entry_hash of an anchor it is best to use the get_anchor(entry_hash) fn to retrieve
this anchor, when you need it. In the case of the devcamp room, we have a little problem.
Peers share the room_code via chat or voice or video... That means that the peer who
initiated the room, the room leader, knows the entry_hash of the room code, but peers that
want to join the room do not. Other peers need to be able to find the same anchor if they
want to join the room. Of course the room leader could communicate the entry hash, but that
is not as convenient as passing the much shorter room code.
So for other peers that do not have the room code the problem exists in finding out the
entry hash of the anchor while they only have room code.

There are 2 approaches you can take to solve this problem, each with it own benefits.
1/ Other peers can take the room_code and calculate the hash, without actually creating
    a anchor in the DHT (with the same entry hash, but a different header hash). Like we do
    in peer_profile::get_room_code_anchor
Benefits: less DHT operations, no extra header in the DHT
Downside: calculating the entry_hash and fetching the anchor with this hash via 'get_anchor',
            does not guarantee that anchor will be found at the point in time that you start
            searching it. Even if you have a entry_hash of entry that absolutely, 100% exists.
            It does not guarantee it can be found in your part of the DHT, yet. Eventually it
            will be.The downside is you to need poll until you find the anchor. This how you
            could calculate a entry hash:
    let path: Path = (&Anchor {
            anchor_type: ROOM_CODES_ANCHOR.into(),
            anchor_text: Some(room_code),
        })
        .into();
    let anchor_hash = path.path_entry_hash()
2/ The other way is for the other peers to create the same anchor. Which we do here by calling
peer_profile::create_room_code_anchor. The anchor entry will be
created again. It will add a header and a entry to the DHT. But since the entry has the same
entry_hash it will already be stored.
Benefit: entry is added to your source chain before being sent to the DHT, so it is
immediately available. No polling needed
Downside: More DHT ops, extra header in the DHT
*/
pub fn join_room_with_code(input: JoinRoomInfo) -> ExternResult<EntryHash> {
    // Another example of logs output with a different priority level
    info!("join_room_with_code | input: {:#?}", input);
    // input will be partially consumed by create_room_code_anchor below, so we're
    // making it's full copy in input_for_signal to be used later
    let input_for_signal = input.clone();
    // Create an anchor for the room code provided in input
    let anchor = create_room_code_anchor(input.roomcode)?;
    debug!("join_room_with_code | anchor created {:?}", &anchor);
    // Create peer's profile. So far it isn't connected to anything,
    // just a combination of nickname & pub key
    let peer_profile_entry_hash = create_and_hash_entry_peer_profile(input.nickname)?;
    debug!(
        "join_room_with_code | profile entry hash {:?}",
        &peer_profile_entry_hash
    );
    // Create a uni-directional link from the anchor (base) to
    // the peer's profile (target) with a tag value of PEER_LINK_TAG
    // Having a tag value for the link helps to keep data scheme organized
    create_link(
        anchor.clone().into(),
        peer_profile_entry_hash.into(),
        LinkTag::new(String::from(PEER_LINK_TAG)),
    )?;
    debug!("join_room_with_code | link created");
    send_signal_peer_joined(input_for_signal)?;
    // Return entry hash of the anchor wrapped in ExternResult::Ok variant
    Ok(anchor)
}

/// Sends a signal RoomSignal::PeerJoined that signals others that
/// new peer joined the room
fn send_signal_peer_joined(input: JoinRoomInfo) -> ExternResult<()> {
    // Create a PeerProfile instance that keeps peer's data
    // in a convenient form
    let p = PeerProfile {
        to: agent_info()?.agent_initial_pubkey,
        nickname: input.nickname,
    };
    // Encode peer's data into a signal (no actual signals are sent here!)
    let signal = ExternIO::encode(OfferSignal::PeerJoined(p))?;
    // Generate list of peers who would receive the signal
    let peers = get_peer_profiles_for_room_code(input.roomcode)?;
    let peer_hashes = peers
        .iter()
        .map(|p| p.to.clone())
        .collect::<Vec<_>>();
    let other_peers = others(peer_hashes)?;
    // Actually send the signal
    remote_signal(signal, other_peers)?;
    // Return empty Ok result: if we get to this line, things are working as expected
    Ok(())
}

/// Small helper fn to filter out all peers who are not the current agent
/// (the agent who is executing this fn right now)
fn others(peers: Vec<AgentPubKey>) -> Result<Vec<AgentPubKey>, WasmError> {
    let me = &agent_info()?.agent_initial_pubkey;
    let others: Vec<AgentPubKey> = peers.into_iter().filter(|p| p.ne(me)).collect();
    Ok(others)
}


pub fn send_offer(input: OfferPayload) -> ExternResult<()> {
    let aux = input.clone();
    let offer = AnswerPayload {
        from: agent_info()?.agent_initial_pubkey,
        payload_type: aux.payload_type,
        sdp: aux.sdp,
        to: aux.to,
    };
    let signal = ExternIO::encode(OfferSignal::Offer(offer.clone()))?;
    let peer_key = vec![input.to];
    remote_signal(signal, peer_key)?;
    Ok(())
}

pub fn send_answer(input: OfferPayload) -> ExternResult<()> {
    let aux = input.clone();
    let offer = AnswerPayload {
        from: agent_info()?.agent_initial_pubkey,
        payload_type: aux.payload_type,
        sdp: aux.sdp,
        to: aux.to,
    };
    let signal = ExternIO::encode(OfferSignal::Answer(offer.clone()))?;
    let peer_key = vec![input.to];
    remote_signal(signal, peer_key)?;
    Ok(())
}

/// Retrieves peer profiles that are linked to the anchor for the provided
/// short_unique_code.
pub fn get_peer_profiles_for_room_code(
    short_unique_code: String,
) -> ExternResult<Vec<PeerProfile>> {
    // Retrieve entry hash of our room code anchor
    let anchor = get_room_code_anchor(short_unique_code)?;
    debug!("anchor: {:?}", anchor);
    // Retrieve a set of links that have anchor as a base, with the tag PEER_LINK_TAG
    let links: Vec<Link> = get_links(anchor, Some(LinkTag::new(String::from(PEER_LINK_TAG))))?;
    debug!("links: {:#?}", links);
    // The following code isn't idiomatic Rust and could've been written
    // in a much more elegant & short way. But, that woudln't have been easy
    // to read for people unfamiliar with Rust, so here we go.
    // First, create a buffer vec for our results. Make it mutable so we
    // can add results one-by-one later
    let mut peers = vec![];
    // Iterate through all the links contained inside the link instance
    for link in links {
        debug!("link: {:?}", link);
        // Retrieve an element at the hash specified by link.target
        // No fancy retrieve options are applied, so we just go with GetOptions::default()
        let element: Element = get(link.target, GetOptions::default())?
            .ok_or(WasmError::Guest(String::from("Entry not found")))?;
        // Retrieve an Option with our entry inside. Since not all Elements can have
        // entry, their method `entry()` returns an Option which would be None in case
        // the corresponding Element is something different.
        let entry_option = element.entry().to_app_option()?;
        // Now try to unpack the option that we received and write an error to show
        // in case it turns out there's no entry
        let entry: PeerProfile = entry_option.ok_or(WasmError::Guest(
            "The targeted entry is not agent pubkey".into(),
        ))?;
        // Add this PeerProfile to our results vector
        peers.push(entry);
    }

    // wrap our vector into ExternResult and return
    Ok(peers)
}

// TODO: add validation for peer_profile to forbid nicknames with len == 0
