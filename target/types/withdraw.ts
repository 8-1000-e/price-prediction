/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/withdraw.json`.
 */
export type Withdraw = {
  "address": "9vinxaUTJMi9P9tdGnwNg4NgVitarkY1jenvWh5btVso",
  "metadata": {
    "name": "withdraw",
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
        "Withdraw SOL from the player's betting balance back to their wallet.",
        "Args: { \"amount\": <lamports u64> }",
        "",
        "TODO (Emile):",
        "1. Parse \"amount\" from JSON args",
        "2. Validate: player.authority == signer",
        "3. Validate: player.balance >= amount",
        "4. Validate: player.active_bets == 0 (can't withdraw with pending bets)",
        "5. Deduct: player.balance -= amount",
        "6. Transfer SOL from PlayerAccount PDA → signer wallet",
        "(CPI to system program, or direct lamport manipulation)"
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
