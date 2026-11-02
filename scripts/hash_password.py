#!/usr/bin/env python3
"""
Mono Time - Admin Password Hasher (Python)
Prompts for a password in terminal, generates a secure bcrypt hash,
and prints the configuration line for .env.

Usage:
    python scripts/hash_password.py
"""

import sys
import getpass
import bcrypt

def main():
    try:
        if sys.stdin.isatty():
            password = getpass.getpass("Enter admin password to hash: ")
        else:
            password = sys.stdin.readline().strip()
    except Exception:
        password = input("Enter admin password to hash: ")

    if not password.strip():
        print("Error: Password cannot be empty.")
        return

    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password.strip().encode("utf-8"), salt).decode("utf-8")

    print("\n--- Paste this into your .env file ---")
    print(f"ADMIN_PASSWORD_HASH={hashed}")
    print("-------------------------------------\n")

if __name__ == "__main__":
    main()
