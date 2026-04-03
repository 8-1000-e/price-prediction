/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/place_bet.json`.
 */
export type PlaceBet = {
  "address": "GHMykEcU5yscha3qrP2matVt8M5iNbXsLPiD7TvsEDbg",
  "metadata": {
    "name": "placeBet",
    "version": "0.2.4",
    "spec": "0.1.0",
    "description": "Created with Bolt"
  },
  "instructions": [
    {
      "name": "boltExecute",
      "discriminator": [
        75,
        206,
        62,
        210,
        52,
        215,
        104,
        109
      ],
      "accounts": [
        {
          "name": "authority"
        }
      ],
      "args": [
        {
          "name": "args",
          "type": "bytes"
        }
      ],
      "returns": {
        "vec": "bytes"
      }
    },
    {
      "name": "execute",
      "docs": [
        "Place a bet on a price range for a future time window.",
        "Args: { \"amount\": <lamports>, \"multiplier\": <u16 x100>, \"priceTop\": <u64>, \"priceBottom\": <u64>, \"resolveAfter\": <unix timestamp i64> }",
        "",
        "TODO (Emile):",
        "1. Parse args from JSON (amount, multiplier, priceTop, priceBottom, resolveAfter)",
        "2. Validate: player.authority == signer (or session key authority)",
        "3. Validate: player.balance >= amount",
        "4. Validate: bet_state.count < MAX_BETS",
        "5. Validate: priceTop > priceBottom",
        "6. Validate: resolveAfter > Clock::get()?.unix_timestamp (bet must be in the future)",
        "7. Validate: multiplier > 100 (must be > x1.0)",
        "8. Deduct: player.balance -= amount",
        "9. Store bet in next empty slot:",
        "bet_state.amounts[i] = amount",
        "bet_state.multipliers[i] = multiplier",
        "bet_state.price_tops[i] = priceTop",
        "bet_state.price_bottoms[i] = priceBottom",
        "bet_state.resolve_after[i] = resolveAfter",
        "bet_state.statuses[i] = 1 (Pending)",
        "10. Increment: bet_state.count += 1, player.active_bets += 1",
        "11. Update: player.total_bet += amount"
      ],
      "discriminator": [
        130,
        221,
        242,
        154,
        13,
        193,
        189,
        29
      ],
      "accounts": [
        {
          "name": "playerAccount"
        },
        {
          "name": "betState"
        },
        {
          "name": "authority"
        }
      ],
      "args": [
        {
          "name": "args",
          "type": "bytes"
        }
      ],
      "returns": {
        "vec": "bytes"
      }
    }
  ],
  "accounts": [
    {
      "name": "betState",
      "discriminator": [
        143,
        61,
        238,
        62,
        232,
        157,
        101,
        185
      ]
    },
    {
      "name": "playerAccount",
      "discriminator": [
        224,
        184,
        224,
        50,
        98,
        72,
        48,
        236
      ]
    }
  ],
  "types": [
    {
      "name": "betState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "player",
            "docs": [
              "Wallet that owns these bets"
            ],
            "type": "pubkey"
          },
          {
            "name": "roundId",
            "docs": [
              "Round ID (incrementing, to separate rounds)"
            ],
            "type": "u32"
          },
          {
            "name": "amounts",
            "docs": [
              "Bet amount in lamports"
            ],
            "type": {
              "array": [
                "u64",
                20
              ]
            }
          },
          {
            "name": "multipliers",
            "docs": [
              "Multiplier x100 (e.g. 150 = x1.5, 300 = x3.0)"
            ],
            "type": {
              "array": [
                "u16",
                20
              ]
            }
          },
          {
            "name": "priceTops",
            "docs": [
              "Upper price bound (Pyth format, raw u64, 8 decimals)"
            ],
            "type": {
              "array": [
                "u64",
                20
              ]
            }
          },
          {
            "name": "priceBottoms",
            "docs": [
              "Lower price bound"
            ],
            "type": {
              "array": [
                "u64",
                20
              ]
            }
          },
          {
            "name": "resolveAfter",
            "docs": [
              "Timestamp after which this bet can be finalized as Lost"
            ],
            "type": {
              "array": [
                "i64",
                20
              ]
            }
          },
          {
            "name": "statuses",
            "docs": [
              "0 = Empty, 1 = Pending, 2 = Won, 3 = Lost"
            ],
            "type": {
              "array": [
                "u8",
                20
              ]
            }
          },
          {
            "name": "count",
            "docs": [
              "Number of bets placed this round"
            ],
            "type": "u8"
          },
          {
            "name": "boltMetadata",
            "type": {
              "defined": {
                "name": "boltMetadata"
              }
            }
          }
        ]
      }
    },
    {
      "name": "boltMetadata",
      "docs": [
        "Metadata for the component."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "playerAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "docs": [
              "Wallet that owns this account"
            ],
            "type": "pubkey"
          },
          {
            "name": "balance",
            "docs": [
              "SOL balance in lamports (deposited for betting)"
            ],
            "type": "u64"
          },
          {
            "name": "totalBet",
            "docs": [
              "Lifetime total bet in lamports"
            ],
            "type": "u64"
          },
          {
            "name": "totalWon",
            "docs": [
              "Lifetime total won in lamports"
            ],
            "type": "u64"
          },
          {
            "name": "activeBets",
            "docs": [
              "Number of active (pending) bets"
            ],
            "type": "u8"
          },
          {
            "name": "boltMetadata",
            "type": {
              "defined": {
                "name": "boltMetadata"
              }
            }
          }
        ]
      }
    }
  ]
};
