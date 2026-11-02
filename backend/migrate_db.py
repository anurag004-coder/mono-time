import sqlite3
import os

def migrate_file(db_path):
    if not os.path.exists(db_path):
        return
    print(f"Migrating {db_path}...")
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    c.execute("PRAGMA table_info(checkout_orders)")
    cols = [col[1] for col in c.fetchall()]
    
    if "payment_method" not in cols:
        c.execute("ALTER TABLE checkout_orders ADD COLUMN payment_method VARCHAR DEFAULT 'card'")
        print(f"Added payment_method column to {db_path}")
    
    if "payment_details" not in cols:
        c.execute("ALTER TABLE checkout_orders ADD COLUMN payment_details JSON DEFAULT '{}'")
        print(f"Added payment_details column to {db_path}")
        
    c.execute("UPDATE products SET inStock = 0 WHERE id = 'oceanic-diver-pro'")
    conn.commit()
    conn.close()

def run():
    migrate_file('sales_agent.db')
    migrate_file('backend/sales_agent.db')
    print("Database migration finished.")

if __name__ == '__main__':
    run()

