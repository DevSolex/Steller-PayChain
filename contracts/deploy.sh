# Build contracts
stellar contract build

# Deploy payroll contract (testnet)
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/paychain_payroll.wasm \
  --source <ADMIN_SECRET_KEY> \
  --network testnet

# Deploy payment contract (testnet)
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/paychain_payment.wasm \
  --source <ADMIN_SECRET_KEY> \
  --network testnet

# Initialize payroll contract
stellar contract invoke \
  --id <PAYROLL_CONTRACT_ID> \
  --source <ADMIN_SECRET_KEY> \
  --network testnet \
  -- initialize \
  --admin <ADMIN_PUBLIC_KEY>

# Initialize payment contract
stellar contract invoke \
  --id <PAYMENT_CONTRACT_ID> \
  --source <ADMIN_SECRET_KEY> \
  --network testnet \
  -- initialize \
  --admin <ADMIN_PUBLIC_KEY> \
  --payroll_contract <PAYROLL_CONTRACT_ID>
