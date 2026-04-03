use bolt_lang::*;
use player_account::PlayerAccount;

declare_id!("4KWeTKZBP1mvqhaB1rPTMTEsUyAirwE8qJdWhN7HipUz");

#[system]
pub mod deposit {
    /// Deposit SOL into the player's betting balance.
    /// Args: { "amount": <lamports u64> }
    ///
    /// TODO (Emile):
    /// 1. Parse "amount" from JSON args
    /// 2. Transfer SOL from signer → PlayerAccount PDA (via CPI or lamport transfer)
    /// 3. Increment player.balance += amount
    /// 4. If first deposit, set player.authority = signer
    /// 5. Validate: authority must match signer (if already set)
    pub fn execute(ctx: Context<Components>, _args: Vec<u8>) -> Result<Components> {
        // TODO: implement
        Ok(ctx.accounts)
    }

    #[system_input]
    pub struct Components {
        pub player_account: PlayerAccount,
    }
}
