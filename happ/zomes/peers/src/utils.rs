use crate::{game_move::GameMove, game_session::PlayerStats};
use hdk::prelude::*;

/// Tries to do a DHT get to retrieve data for the entry_hash,
/// and if this get is successful and we get some element, tries
/// to convert this element into a type T and return the result
pub fn try_get_and_convert<T: TryFrom<Entry>>(
    entry_hash: EntryHash,
    get_options: GetOptions,
) -> ExternResult<T> {
    match get(entry_hash.clone(), get_options)? {
        Some(element) => try_from_element(element),
        None => Err(WasmError::Guest(format!(
            "There is no element at the hash {}",
            entry_hash
        ))),
    }
}

/// Attempts to get an element at the entry_hash and returns it
/// if the element exists
pub fn try_get_element(entry_hash: EntryHash, get_options: GetOptions) -> ExternResult<Element> {
    match get(entry_hash.clone(), get_options)? {
        Some(element) => Ok(element),
        None => Err(WasmError::Guest(format!(
            "There is no element at the hash {}",
            entry_hash
        ))),
    }
}

/// Tries to extract the entry from the element, and if the entry is there
/// tries to convert it to type T and return the result
pub fn try_from_element<T: TryFrom<Entry>>(element: Element) -> ExternResult<T> {
    match element.entry() {
        element::ElementEntry::Present(entry) => {
            T::try_from(entry.clone()).or(Err(WasmError::Guest(format!(
                "Couldn't convert Element entry {:?} into data type {}",
                entry,
                std::any::type_name::<T>()
            ))))
        }
        _ => Err(WasmError::Guest(format!(
            "Element {:?} does not have an entry",
            element
        ))),
    }
}

/// Generates PlayerStats instance with the state from the input game_moves
pub fn player_stats_from_moves(game_moves: Vec<GameMove>) -> PlayerStats {
    game_moves
        .into_iter()
        .map(|m| (m.owner.clone(), m.resource_amount))
        .collect::<PlayerStats>()
}

/// Retrieves holochain entry with a given hash and then
/// converts it into the struct of type O and returns it
pub fn must_get_entry_struct<O>(entry_hash: EntryHash) -> ExternResult<O>
where
    O: TryFrom<SerializedBytes, Error = SerializedBytesError>,
{
    let entry :HoloHashed<Entry> = must_get_entry(entry_hash.clone())?;
    match entry.into_content() {
        Entry::App(bytes) => match O::try_from(bytes.into()) {
            Ok(deserialized) => Ok(deserialized),
            Err(e) => Err(e.into()),
        },
        _ => Err(WasmError::Guest(                                                      
            "entry within must_get_entry_struct must be an Entry::App variant".to_string(),
        )),
    }
}
