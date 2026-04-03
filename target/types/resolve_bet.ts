/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/resolve_bet.json`.
 */
export type ResolveBet = {
  "address": "E9RNH5oXdKBad3LqTSfKiE3cigPjVvcuWC4gygzCmyZP",
  "metadata": {
    "name": "resolveBet",
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
        "Resolve pending bets by reading the Pyth Lazer SOL/USD price.",
        "Called frequently (~200ms) by the frontend or a crank.",
        "Anyone can call this — no authority check needed.",
        "",
        "The Pyth price PDA must be passed as remaining_accounts[0].",
        "PDA seeds: [\"price_feed\", \"pyth-lazer\", \"6\"] with program ORACLE_PROGRAM",
        "",
        "TODO (Emile):",
        "1. Read remaining_accounts[0] (Pyth price PDA)",
        "2. Extract price: u64 at offset 73, little-endian (raw, 8 decimals)",
        "3. Get current timestamp: Clock::get()?.unix_timestamp",
        "4. Loop through bet_state.statuses[0..count]:",
        "- Skip if status != 1 (Pending)",
        "- If price >= price_bottoms[i] && price < price_tops[i]:",
        "→ status = 2 (Won)",
        "→ player.balance += amounts[i] * multipliers[i] / 100",
        "→ player.total_won += amounts[i] * multipliers[i] / 100",
        "→ player.active_bets -= 1",
        "- Else if timestamp > resolve_after[i]:",
        "→ status = 3 (Lost)",
        "→ player.active_bets -= 1",
        "(amount already deducted at place_bet time, nothing to refund)"
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
