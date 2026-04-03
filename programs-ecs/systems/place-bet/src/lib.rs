use bolt_lang::*;
use player_account::PlayerAccount;
use bet_state::BetState;

declare_id!("GHMykEcU5yscha3qrP2matVt8M5iNbXsLPiD7TvsEDbg");

#[system]
pub mod place_bet {
    /// Place a bet on a price range for a future time window.
    /// Args: { "amount": <lamports>, "multiplier": <u16 x100>, "priceTop": <u64>, "priceBottom": <u64>, "resolveAfter": <unix timestamp i64> }
    ///
    /// TODO (Emile):
    /// 1. Parse args from JSON (amount, multiplier, priceTop, priceBottom, resolveAfter)
    /// 2. Validate: player.authority == signer (or session key authority)
    /// 3. Validate: player.balance >= amount
    /// 4. Validate: bet_state.count < MAX_BETS
    /// 5. Validate: priceTop > priceBottom
    /// 6. Validate: resolveAfter > Clock::get()?.unix_timestamp (bet must be in the future)
    /// 7. Validate: multiplier > 100 (must be > x1.0)
    /// 8. Deduct: player.balance -= amount
    /// 9. Store bet in next empty slot:
    ///    bet_state.amounts[i] = amount
    ///    bet_state.multipliers[i] = multiplier
    ///    bet_state.price_tops[i] = priceTop
    ///    bet_state.price_bottoms[i] = priceBottom
    ///    bet_state.resolve_after[i] = resolveAfter
    ///    bet_state.statuses[i] = 1 (Pending)
    /// 10. Increment: bet_state.count += 1, player.active_bets += 1
    /// 11. Update: player.total_bet += amount
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
