use bolt_lang::*;
use player_account::PlayerAccount;

declare_id!("9vinxaUTJMi9P9tdGnwNg4NgVitarkY1jenvWh5btVso");

#[system]
pub mod withdraw {
    /// Withdraw SOL from the player's betting balance back to their wallet.
    /// Args: { "amount": <lamports u64> }
    ///
    /// TODO (Emile):
    /// 1. Parse "amount" from JSON args
    /// 2. Validate: player.authority == signer
    /// 3. Validate: player.balance >= amount
    /// 4. Validate: player.active_bets == 0 (can't withdraw with pending bets)
    /// 5. Deduct: player.balance -= amount
    /// 6. Transfer SOL from PlayerAccount PDA → signer wallet
    ///    (CPI to system program, or direct lamport manipulation)
    pub fn execute(ctx: Context<Components>, _args: Vec<u8>) -> Result<Components> {
        // TODO: implement
        Ok(ctx.accounts)
    }

    #[system_input]
    pub struct Components {
        pub player_account: PlayerAccount,
    }
}
