#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype,
    token, Address, Env, Symbol,
};

#[contracttype]
pub enum DataKey {
    Admin,
    PayrollContract,
}

#[contract]
pub struct PaymentContract;

#[contractimpl]
impl PaymentContract {
    pub fn initialize(env: Env, admin: Address, payroll_contract: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::PayrollContract, &payroll_contract);
    }

    /// Execute a single salary payment
    pub fn pay_employee(
        env: Env,
        caller: Address,
        token_address: Address,
        recipient: Address,
        amount: i128,
    ) {
        caller.require_auth();
        Self::require_admin(&env, &caller);

        let token_client = token::Client::new(&env, &token_address);
        token_client.transfer(&caller, &recipient, &amount);

        env.events().publish(
            (Symbol::new(&env, "payment"), recipient.clone()),
            (token_address, amount),
        );
    }

    /// Bulk pay multiple employees
    pub fn bulk_pay(
        env: Env,
        caller: Address,
        token_address: Address,
        recipients: soroban_sdk::Vec<Address>,
        amounts: soroban_sdk::Vec<i128>,
    ) {
        caller.require_auth();
        Self::require_admin(&env, &caller);

        if recipients.len() != amounts.len() {
            panic!("recipients and amounts length mismatch");
        }

        let token_client = token::Client::new(&env, &token_address);
        for i in 0..recipients.len() {
            let recipient = recipients.get(i).unwrap();
            let amount = amounts.get(i).unwrap();
            token_client.transfer(&caller, &recipient, &amount);
        }
    }

    fn require_admin(env: &Env, caller: &Address) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).expect("not initialized");
        if *caller != admin {
            panic!("unauthorized");
        }
    }
}
