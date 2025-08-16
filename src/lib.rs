use solana_program::{account_info::{next_account_info, AccountInfo},
entrypoint::{ ProgramResult}, pubkey::Pubkey};
use solana_program::entrypoint;
use borsh::{BorshDeserialize, BorshSerialize};

entrypoint!(process_instruction);


#[derive(BorshSerialize, BorshDeserialize)]
struct OnChainData{
    count: u32
}
fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],

) -> ProgramResult{

    let mut iter = accounts.iter();

    let account1 = next_account_info(&mut iter)?;

    let counter_data = account1.data.borrow();

    let mut counter = OnChainData::try_from_slice(&counter_data)?;

    drop(counter_data);

    if counter.count == 0 {
        counter.count = 1;
 
    } else {
        counter.count = counter.count * 2;
    }

    counter.serialize(&mut *account1.data.borrow_mut())?;

    Ok(())

}