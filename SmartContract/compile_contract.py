from solcx import compile_source, install_solc, set_solc_version
import json
import os

try:
    install_solc("0.8.20")
    set_solc_version("0.8.20")
except Exception as e:
    print(f"Error installing or setting Solidity compiler: {e}")
    exit(1)

# Path to the Solidity file
contract_file = "AuthContract.sol"
if not os.path.exists(contract_file):
    print(f"Error: {contract_file} not found in the current directory.")
    exit(1)

# Read the Solidity source code
try:
    with open(contract_file, "r") as file:
        contract_source = file.read()
except Exception as e:
    print(f"Error reading {contract_file}: {e}")
    exit(1)

# Compile the source code
try:
    compiled_sol = compile_source(contract_source, output_values=["abi", "bin"])
except Exception as e:
    print(f"Compilation error: {e}")
    exit(1)

# Extract the contract interface and bytecode
contract_name = "<stdin>:AuthContract"
if contract_name not in compiled_sol:
    print(f"Error: Contract '{contract_name}' not found in compiled output.")
    print("Available contracts:", list(compiled_sol.keys()))
    exit(1)

contract_interface = compiled_sol[contract_name]["abi"]
contract_bytecode = compiled_sol[contract_name]["bin"]

# Save ABI and bytecode to files
try:
    with open("AuthContract_abi.json", "w") as abi_file:
        json.dump(contract_interface, abi_file, indent=2)
    with open("AuthContract_bytecode.txt", "w") as bytecode_file:
        bytecode_file.write(contract_bytecode)
    print("Compilation successful. ABI and bytecode saved.")
except Exception as e:
    print(f"Error saving files: {e}")
    exit(1)