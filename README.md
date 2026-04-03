# SOL Price Prediction

On-chain SOL/USD price prediction game built with **BOLT ECS** + **Ephemeral Rollups** (MagicBlock) + **Pyth Lazer** oracle.

## How it works

A live SOL/USD chart scrolls across a grid. Players bet on which cells the price will pass through. Correct predictions pay a multiplier based on risk (how far in the future the bet was placed).

## Stack

| Layer | Tech |
|-------|------|
| Oracle | Pyth Lazer on MagicBlock ER (SOL/USD, 50ms updates) |
| On-chain | BOLT ECS (extends Anchor) on Solana |
| Real-time | Ephemeral Rollups (gasless, ~50ms per tx) |
| Frontend | Next.js 16 + React 19 + Tailwind 4 |

## Architecture

```
L1 (Solana devnet):
  1. Create World + Player entity + components
  2. Deposit SOL → PlayerAccount balance
  3. Delegate components → ER
  4. Undelegate ← ER (to withdraw)

ER (gasless, ~50ms):
  - place_bet → deduct balance, store bet with price range + time window
  - resolve_bet → read Pyth Lazer PDA, check price vs range → Won/Lost
  - All via session key (no wallet popup per bet)
```

## Components (2)

### PlayerAccount
| Field | Type | Description |
|-------|------|-------------|
| authority | Pubkey | Wallet owner |
| balance | u64 | SOL in lamports (deposited for betting) |
| total_bet | u64 | Lifetime total wagered |
| total_won | u64 | Lifetime total won |
| active_bets | u8 | Number of pending bets |

### BetState
Array-based (up to 20 bets per round, parallel arrays):

| Field | Type | Description |
|-------|------|-------------|
| player | Pubkey | Bet owner |
| round_id | u32 | Round identifier |
| amounts[20] | u64 | Bet amount in lamports |
| multipliers[20] | u16 | Multiplier x100 (150 = x1.5) |
| price_tops[20] | u64 | Upper price bound (Pyth raw, 8 decimals) |
| price_bottoms[20] | u64 | Lower price bound |
| resolve_after[20] | i64 | Unix timestamp — bet expires after this |
| statuses[20] | u8 | 0=Empty, 1=Pending, 2=Won, 3=Lost |
| count | u8 | Number of bets this round |

## Systems (4)

| System | Components | Description |
|--------|-----------|-------------|
| deposit | PlayerAccount | Transfer SOL to player balance |
| place_bet | PlayerAccount, BetState | Validate + deduct balance + store bet |
| resolve_bet | PlayerAccount, BetState + Pyth PDA (remaining_account) | Read oracle price, resolve pending bets |
| withdraw | PlayerAccount | Transfer SOL back to wallet (no active bets) |

## Pyth Lazer Oracle

The SOL/USD price feed lives on the MagicBlock ER as a Solana account.

- **Program**: `PriCems5tHihc6UDXDjzjeawomAwBduWMGAi8ZUjppd`
- **PDA seeds**: `["price_feed", "pyth-lazer", "6"]` (6 = SOL/USD)
- **Price offset**: byte 73, uint64 LE, 8 decimal places
- **Update frequency**: ~50ms on ER
- **Same price as mainnet** (it's a real oracle feed, not devnet-specific)

## Multiplier System

Multiplier is based on how many columns remain between "now" and the bet's column at the time of placement:

- 1 col away → low risk → low multiplier
- 7 cols away → high risk → high multiplier

The multiplier is locked at bet placement time. Waiting doesn't change an existing bet's multiplier.

## Game Flow

```
1. Watch the live SOL chart scrolling across the grid
2. Click "Start" → configure bet amount → "GO"
3. First 3 columns show 30s of price history
4. 7 prediction columns (3s each) appear to the right
5. Click cells to place bets (locked with multiplier + amount)
6. Chart advances — resolve_bet called every ~200ms
7. Bets resolve: green (Won) or red (Lost)
8. Round summary: total staked, total won, net P&L
```

## Frontend

```
app/
├── page.tsx                    # Main page
├── components/
│   └── PredictionGrid.tsx      # Grid + chart + bets + game logic
├── hooks/
│   └── useSolPrice.ts          # Pyth Lazer WebSocket subscription
└── lib/
    └── (future: bolt-actions.ts, program-ids.ts)
```

## On-chain

```
programs-ecs/
├── components/
│   ├── player-account/         # Balance, authority, stats
│   └── bet-state/              # Array of bets (up to 20 per round)
└── systems/
    ├── deposit/                # SOL → balance
    ├── place-bet/              # Validate + store bet
    ├── resolve-bet/            # Read Pyth price + resolve
    └── withdraw/               # Balance → SOL
```

## Local Dev

```bash
# Frontend
npx next dev --webpack

# BOLT build
bolt build

# Deploy to surfpool
surfpool start --rpc-url 'https://devnet.helius-rpc.com/?api-key=YOUR_KEY'
anchor deploy --provider.cluster http://localhost:8899
```
