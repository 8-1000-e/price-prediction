/// Stack-only JSON parsers for BOLT ECS args.
/// BOLT SDK sends args as JSON text: {"key":123,"other":456}
/// No serde, no heap — just byte scanning.

/// Parse a u64 value from JSON bytes by key name.
/// Example: parse_json_u64(b'{"amount":5000}', b"amount") → 5000
pub fn parse_json_u64(json: &[u8], key: &[u8]) -> u64 {
    let mut i = 0;
    while i + key.len() + 3 < json.len() {
        if json[i] == b'"'
            && i + 1 + key.len() + 1 < json.len()
            && &json[i + 1..i + 1 + key.len()] == key
            && json[i + 1 + key.len()] == b'"'
            && json[i + 2 + key.len()] == b':'
        {
            let mut j = i + 3 + key.len();
            while j < json.len() && json[j] == b' ' { j += 1; }
            let mut val: u64 = 0;
            while j < json.len() && json[j].is_ascii_digit() {
                val = val * 10 + (json[j] - b'0') as u64;
                j += 1;
            }
            return val;
        }
        i += 1;
    }
    0
}

/// Parse an i64 value from JSON bytes by key name (supports negative).
/// Example: parse_json_i64(b'{"x":-100}', b"x") → -100
pub fn parse_json_i64(json: &[u8], key: &[u8]) -> i64 {
    let mut i = 0;
    while i + key.len() + 3 < json.len() {
        if json[i] == b'"'
            && i + 1 + key.len() + 1 < json.len()
            && &json[i + 1..i + 1 + key.len()] == key
            && json[i + 1 + key.len()] == b'"'
            && json[i + 2 + key.len()] == b':'
        {
            let mut j = i + 3 + key.len();
            while j < json.len() && json[j] == b' ' { j += 1; }
            let neg = j < json.len() && json[j] == b'-';
            if neg { j += 1; }
            let mut val: i64 = 0;
            while j < json.len() && json[j].is_ascii_digit() {
                val = val * 10 + (json[j] - b'0') as i64;
                j += 1;
            }
            return if neg { -val } else { val };
        }
        i += 1;
    }
    0
}

/// Parse a u16 value from JSON bytes by key name.
pub fn parse_json_u16(json: &[u8], key: &[u8]) -> u16 {
    parse_json_u64(json, key) as u16
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_u64() {
        let json = b"{\"amount\":5000,\"other\":42}";
        assert_eq!(parse_json_u64(json, b"amount"), 5000);
        assert_eq!(parse_json_u64(json, b"other"), 42);
        assert_eq!(parse_json_u64(json, b"missing"), 0);
    }

    #[test]
    fn test_parse_i64() {
        let json = b"{\"x\":-100,\"y\":200}";
        assert_eq!(parse_json_i64(json, b"x"), -100);
        assert_eq!(parse_json_i64(json, b"y"), 200);
    }

    #[test]
    fn test_parse_u16() {
        let json = b"{\"multiplier\":150}";
        assert_eq!(parse_json_u16(json, b"multiplier"), 150);
    }
}
