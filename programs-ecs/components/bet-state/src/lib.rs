use bolt_lang::*;

declare_id!("EsczbhdFymbvhM723w9FP5R9kKKngpM2QFrGYKhHKK9p");

/// Stores up to MAX_BETS per player per round.
/// Array approach (like CollectedCoins in CUBE3D) — one account, one delegation.

pub const MAX_BETS: usize = 20;

#[component(delegate)]
pub struct BetState {
    /// Wallet that owns these bets
    pub player: Pubkey,
    /// Round ID (incrementing, to separate rounds)
    pub round_id: u32,

    // ─── Per-bet arrays (parallel arrays, index = bet slot) ───
    /// Bet amount in lamports
    pub amounts: [u64; MAX_BETS],
    /// Multiplier x100 (e.g. 150 = x1.5, 300 = x3.0)
    pub multipliers: [u16; MAX_BETS],
    /// Upper price bound (Pyth format, raw u64, 8 decimals)
    pub price_tops: [u64; MAX_BETS],
    /// Lower price bound
    pub price_bottoms: [u64; MAX_BETS],
    /// Timestamp after which this bet can be finalized as Lost
    pub resolve_after: [i64; MAX_BETS],
    /// 0 = Empty, 1 = Pending, 2 = Won, 3 = Lost
    pub statuses: [u8; MAX_BETS],

    /// Number of bets placed this round
    pub count: u8,
}

impl Default for BetState {
    fn default() -> Self {
        Self {
            player: Pubkey::default(),
            round_id: 0,
            amounts: [0u64; MAX_BETS],
            multipliers: [0u16; MAX_BETS],
            price_tops: [0u64; MAX_BETS],
            price_bottoms: [0u64; MAX_BETS],
            resolve_after: [0i64; MAX_BETS],
            statuses: [0u8; MAX_BETS],
            count: 0,
            bolt_metadata: BoltMetadata::default(),
        }
    }
}
