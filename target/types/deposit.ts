/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/deposit.json`.
 */
export type Deposit = {
  "address": "4KWeTKZBP1mvqhaB1rPTMTEsUyAirwE8qJdWhN7HipUz",
  "metadata": {
    "name": "deposit",
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
        "Deposit SOL into the player's betting balance.",
        "Args: { \"amount\": <lamports u64> }",
        "",
        "TODO (Emile):",
        "1. Parse \"amount\" from JSON args",
        "2. Transfer SOL from signer → PlayerAccount PDA (via CPI or lamport transfer)",
        "3. Increment player.balance += amount",
        "4. If first deposit, set player.authority = signer",
        "5. Validate: authority must match signer (if already set)"
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
