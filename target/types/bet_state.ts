/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/bet_state.json`.
 */
export type BetState = {
  "address": "EsczbhdFymbvhM723w9FP5R9kKKngpM2QFrGYKhHKK9p",
  "metadata": {
    "name": "betState",
    "version": "0.2.4",
    "spec": "0.1.0",
    "description": "Created with Bolt"
  },
  "instructions": [
    {
      "name": "delegate",
      "discriminator": [
        90,
        147,
        75,
        178,
        85,
        88,
        4,
        137
      ],
      "accounts": [
        {
          "name": "payer",
          "signer": true
        },
        {
          "name": "entity"
        },
        {
          "name": "account",
          "writable": true
        },
        {
          "name": "ownerProgram"
        },
        {
          "name": "buffer",
          "writable": true
        },
        {
          "name": "delegationRecord",
          "writable": true
        },
        {
          "name": "delegationMetadata",
          "writable": true
        },
        {
          "name": "delegationProgram"
        },
        {
          "name": "systemProgram"
        }
      ],
      "args": [
        {
          "name": "commitFrequencyMs",
          "type": "u32"
        },
        {
          "name": "validator",
          "type": {
            "option": "pubkey"
          }
        }
      ]
    },
    {
      "name": "destroy",
      "discriminator": [
        157,
        40,
        96,
        3,
        135,
        203,
        143,
        74
      ],
      "accounts": [
        {
          "name": "authority",
          "signer": true
        },
        {
          "name": "receiver",
          "writable": true
        },
        {
          "name": "entity"
        },
        {
          "name": "component",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": []
              },
              {
                "kind": "account",
                "path": "entity"
              }
            ]
          }
        },
        {
          "name": "componentProgramData"
        },
        {
          "name": "instructionSysvarAccount",
          "address": "Sysvar1nstructions1111111111111111111111111"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "data",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": []
              },
              {
                "kind": "account",
                "path": "entity"
              }
            ]
          }
        },
        {
          "name": "entity"
        },
        {
          "name": "authority"
        },
        {
          "name": "instructionSysvarAccount",
          "address": "Sysvar1nstructions1111111111111111111111111"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "processUndelegation",
      "discriminator": [
        196,
        28,
        41,
        206,
        48,
        37,
        51,
        167
      ],
      "accounts": [
        {
          "name": "delegatedAccount",
          "writable": true
        },
        {
          "name": "buffer"
        },
        {
          "name": "payer",
          "writable": true
        },
        {
          "name": "systemProgram"
        }
      ],
      "args": [
        {
          "name": "accountSeeds",
          "type": {
            "vec": "bytes"
          }
        }
      ]
    },
    {
      "name": "undelegate",
      "discriminator": [
        131,
        148,
        180,
        198,
        91,
        104,
        42,
        238
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "delegatedAccount",
          "writable": true
        },
        {
          "name": "magicContext",
          "writable": true,
          "address": "MagicContext1111111111111111111111111111111"
        },
        {
          "name": "magicProgram",
          "address": "Magic11111111111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "update",
      "discriminator": [
        219,
        200,
        88,
        176,
        158,
        63,
        253,
        127
      ],
      "accounts": [
        {
          "name": "boltComponent",
          "writable": true
        },
        {
          "name": "authority",
          "signer": true
        },
        {
          "name": "instructionSysvarAccount",
          "address": "Sysvar1nstructions1111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "data",
          "type": "bytes"
        }
      ]
    },
    {
      "name": "updateWithSession",
      "discriminator": [
        221,
        55,
        212,
        141,
        57,
        85,
        61,
        182
      ],
      "accounts": [
        {
          "name": "boltComponent",
          "writable": true
        },
        {
          "name": "authority",
          "signer": true
        },
        {
          "name": "instructionSysvarAccount",
          "address": "Sysvar1nstructions1111111111111111111111111"
        },
        {
          "name": "sessionToken"
        }
      ],
      "args": [
        {
          "name": "data",
          "type": "bytes"
        }
      ]
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
      "name": "entity",
      "discriminator": [
        46,
        157,
        161,
        161,
        254,
        46,
        79,
        24
      ]
    },
    {
      "name": "sessionToken",
      "discriminator": [
        233,
        4,
        115,
        14,
        46,
        21,
        1,
        15
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
      "name": "entity",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "sessionToken",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "targetProgram",
            "type": "pubkey"
          },
          {
            "name": "sessionSigner",
            "type": "pubkey"
          },
          {
            "name": "validUntil",
            "type": "i64"
          }
        ]
      }
    }
  ]
};
