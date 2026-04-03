use bolt_lang::*;
use player_account::PlayerAccount;
use bet_state::BetState;

declare_id!("E9RNH5oXdKBad3LqTSfKiE3cigPjVvcuWC4gygzCmyZP");

/// Pyth Lazer oracle program on MagicBlock ER
/// const ORACLE_PROGRAM: &str = "PriCems5tHihc6UDXDjzjeawomAwBduWMGAi8ZUjppd";
/// Price sits at byte offset 73 in the oracle account, as BigUint64 LE
const PRICE_OFFSET: usize = 73;

#[system]
pub mod resolve_bet {
    /// Resolve pending bets by reading the Pyth Lazer SOL/USD price.
    /// Called frequently (~200ms) by the frontend or a crank.
    /// Anyone can call this — no authority check needed.
    ///
    /// The Pyth price PDA must be passed as remaining_accounts[0].
    /// PDA seeds: ["price_feed", "pyth-lazer", "6"] with program ORACLE_PROGRAM
    ///
    /// TODO (Emile):
    /// 1. Read remaining_accounts[0] (Pyth price PDA)
    /// 2. Extract price: u64 at offset 73, little-endian (raw, 8 decimals)
    /// 3. Get current timestamp: Clock::get()?.unix_timestamp
    /// 4. Loop through bet_state.statuses[0..count]:
    ///    - Skip if status != 1 (Pending)
    ///    - If price >= price_bottoms[i] && price < price_tops[i]:
    ///        → status = 2 (Won)
    ///        → player.balance += amounts[i] * multipliers[i] / 100
    ///        → player.total_won += amounts[i] * multipliers[i] / 100
    ///        → player.active_bets -= 1
    ///    - Else if timestamp > resolve_after[i]:
    ///        → status = 3 (Lost)
    ///        → player.active_bets -= 1
    ///        (amount already deducted at place_bet time, nothing to refund)
    pub fn execute(ctx: Context<Components>, _args: Vec<u8>) -> Result<Components> {
        // TODO: implement
        Ok(ctx.accounts)
    }

    #[system_input]
    pub struct Components {
        pub player_account: PlayerAccount,
        pub bet_state: BetState,
    }
}
