from web3 import Web3
import json
from eth_account import Account
from dotenv import load_dotenv
import os

# Load environment variables (optional, keeping for consistency)
load_dotenv()
private_key = "53c0d3479b0f4c729620fa3a998554728989ccef97565a1cfded361fa57ab02a"
if not private_key:
    raise ValueError("Private key not found in .env file")

# Connect to Polygon Amoy
w3 = Web3(Web3.HTTPProvider("https://rpc-amoy.polygon.technology"))
if not w3.is_connected():
    raise ConnectionError("Failed to connect to Polygon Amoy RPC")

# Set up the account
account = Account.from_key(private_key)
print(f"Deploying from address: {account.address}")

# Check account balance
balance = w3.eth.get_balance(account.address)
print(f"Account balance: {w3.from_wei(balance, 'ether')} MATIC")

if balance < 100000000000000000:  # 0.1 MATIC in wei
    raise ValueError(f"Insufficient balance: {w3.from_wei(balance, 'ether')} MATIC. Need at least 0.1 MATIC.")

# Load compiled contract details
with open("AuthContract_abi.json", "r") as abi_file:
    contract_abi = json.load(abi_file)
with open("AuthContract_bytecode.txt", "r") as bytecode_file:
    contract_bytecode = bytecode_file.read()

# Create contract instance
AuthContract = w3.eth.contract(abi=contract_abi, bytecode=contract_bytecode)

# Build and send transaction
nonce = w3.eth.get_transaction_count(account.address)
tx = AuthContract.constructor().build_transaction({
    "from": account.address,
    "nonce": nonce,
    "gas": 2000000,  # Adjust gas limit if needed
    "gasPrice": w3.to_wei("50", "gwei"),  # Adjust gas price if needed
})

# Sign the transaction
signed_tx = w3.eth.account.sign_transaction(tx, private_key)

# Send the transaction
try:
    tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
    print(f"Transaction sent with hash: {tx_hash.hex()}")
except ValueError as e:
    print(f"Transaction failed: {e}")
    raise

# Wait for transaction receipt
tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
contract_address = tx_receipt.contractAddress
print(f"Contract deployed at address: {contract_address}")

# Save the contract address
with open("contract_address.txt", "w") as address_file:
    address_file.write(contract_address)