#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short,
    Address, Env, Map, Symbol, Vec,
};

#[contracttype]
#[derive(Clone)]
pub struct EmployeeRecord {
    pub wallet: Address,
    pub salary: i128,
    pub token: Symbol,
    pub active: bool,
}

#[contracttype]
pub enum DataKey {
    Admin,
    Employee(Address),
    EmployeeList,
}

#[contract]
pub struct PayrollContract;

#[contractimpl]
impl PayrollContract {
    /// Initialize contract with admin address
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        let empty: Vec<Address> = Vec::new(&env);
        env.storage().instance().set(&DataKey::EmployeeList, &empty);
    }

    /// Add or update an employee record
    pub fn add_employee(
        env: Env,
        caller: Address,
        employee_id: Address,
        wallet: Address,
        salary: i128,
        token: Symbol,
    ) {
        caller.require_auth();
        Self::require_admin(&env, &caller);

        let record = EmployeeRecord { wallet: wallet.clone(), salary, token, active: true };
        env.storage().instance().set(&DataKey::Employee(employee_id.clone()), &record);

        let mut list: Vec<Address> = env.storage().instance()
            .get(&DataKey::EmployeeList)
            .unwrap_or(Vec::new(&env));
        if !list.contains(&employee_id) {
            list.push_back(employee_id);
            env.storage().instance().set(&DataKey::EmployeeList, &list);
        }
    }

    /// Remove an employee
    pub fn remove_employee(env: Env, caller: Address, employee_id: Address) {
        caller.require_auth();
        Self::require_admin(&env, &caller);
        env.storage().instance().remove(&DataKey::Employee(employee_id));
    }

    /// Get employee record
    pub fn get_employee(env: Env, employee_id: Address) -> Option<EmployeeRecord> {
        env.storage().instance().get(&DataKey::Employee(employee_id))
    }

    /// Get all employee addresses
    pub fn get_employees(env: Env) -> Vec<Address> {
        env.storage().instance()
            .get(&DataKey::EmployeeList)
            .unwrap_or(Vec::new(&env))
    }

    fn require_admin(env: &Env, caller: &Address) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).expect("not initialized");
        if *caller != admin {
            panic!("unauthorized");
        }
    }
}
