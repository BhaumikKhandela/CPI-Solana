use solana_program::{account_info::{next_account_info, AccountInfo}, entrypoint::{ ProgramResult}, instruction::{AccountMeta, Instruction}, program::invoke, pubkey::Pubkey};
use solana_program::entrypoint;

entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let mut iter = accounts.iter();
    let data_account = next_account_info(&mut iter)?;
    let double_contract_address = next_account_info(&mut iter)?;

    let instruction = Instruction{
       program_id:  *double_contract_address.key,
       accounts: vec![AccountMeta{
        pubkey: *data_account.key,
        is_signer: false,
        is_writable: true
       }],
       data: instruction_data.to_vec(),

    };
    invoke(&instruction, &[data_account.clone()])?;

    Ok(())

}