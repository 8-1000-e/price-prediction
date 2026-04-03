use bolt_lang::*;

declare_id!("Hu5ojHizPZhfNhogv6bPUB8dukBpjpj9uzpkdNH79Dzq");

#[component(delegate)]
pub struct PlayerAccount {
    /// Wallet that owns this account
    pub authority: Pubkey,
    /// SOL balance in lamports (deposited for betting)
    pub balance: u64,
    /// Lifetime total bet in lamports
    pub total_bet: u64,
    /// Lifetime total won in lamports
    pub total_won: u64,
    /// Number of active (pending) bets
    pub active_bets: u8,
}

impl Default for PlayerAccount {
    fn default() -> Self {
        Self {
            authority: Pubkey::default(),
            balance: 0,
            total_bet: 0,
            total_won: 0,
            active_bets: 0,
            bolt_metadata: BoltMetadata::default(),
        }
    }
}
