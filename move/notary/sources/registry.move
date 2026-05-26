// move/notary/sources/registry.move
module notary::registry {
    use std::string::String;
    use sui::clock::{Self, Clock};
    use sui::event;

    // === Object ===

    public struct NotaryRecord has key, store {
        id: UID,
        blob_id: String,
        file_name: String,
        file_hash: String,
        file_size: u64,
        owner: address,
        timestamp: u64,
    }

    // === Event ===

    public struct DocumentRegistered has copy, drop {
        blob_id: String,
        file_hash: String,
        owner: address,
        timestamp: u64,
    }

    // === Errors ===

    const EEmptyBlobId: u64 = 1;
    const EEmptyFileHash: u64 = 2;
    const EEmptyFileName: u64 = 3;

    // === Function ===

    public fun register_document(
        blob_id: String,
        file_name: String,
        file_hash: String,
        file_size: u64,
        clock: &Clock,
        ctx: &mut TxContext,
    ): NotaryRecord {
        assert!(std::string::length(&blob_id) > 0, EEmptyBlobId);
        assert!(std::string::length(&file_hash) > 0, EEmptyFileHash);
        assert!(std::string::length(&file_name) > 0, EEmptyFileName);

        let owner = tx_context::sender(ctx);
        let timestamp = clock::timestamp_ms(clock);

        event::emit(DocumentRegistered {
            blob_id,
            file_hash,
            owner,
            timestamp,
        });

        NotaryRecord {
            id: object::new(ctx),
            blob_id,
            file_name,
            file_hash,
            file_size,
            owner,
            timestamp,
        }
    }
}