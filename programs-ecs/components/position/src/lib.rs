use bolt_lang::*;

declare_id!("G6skHEd5wk2ySXcT9ki2fQMHwW7BpgAwa8aXeRB2p19h");

#[component]
#[derive(Default)]
pub struct Position {
    pub x: i64,
    pub y: i64,
    pub z: i64,
    #[max_len(20)]
    pub description: String,
}