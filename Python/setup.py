import sqlite3


conn=sqlite3.connect("database.db")
conn.execute("PRAGMA foreign_keys=ON")
c=conn.cursor()


c.execute("""CREATE TABLE IF NOT EXISTS 
slots(
slot_id INTEGER PRIMARY KEY AUTOINCREMENT,
slot_name TEXT NOT NULL UNIQUE,
status TEXT NOT NULL DEFAULT 'available'
 CHECK(status
 IN ('available','occupied')
 )
)

""")
c.execute("""CREATE TABLE IF NOT EXISTS 
vehicle(
vehicle_id INTEGER PRIMARY KEY AUTOINCREMENT,
vehicle_registration TEXT NOT NULL UNIQUE,
phone_number TEXT NOT NULL,
vehicle_type TEXT NOT NULL
)

""")
c.execute("""CREATE TABLE IF NOT EXISTS 
sessions(
session_id INTEGER PRIMARY KEY AUTOINCREMENT,
vehicle_registration TEXT NOT NULL,
slot_name TEXT NOT NULL,
entry_time TEXT NOT NULL,
exit_time TEXT,
FOREIGN KEY(vehicle_registration)
REFERENCES vehicle(vehicle_registration),
FOREIGN KEY(slot_name)
REFERENCES slots(slot_name)

)

""")
c.execute("""CREATE TABLE IF NOT EXISTS
rates(
rate_id INTEGER PRIMARY KEY AUTOINCREMENT,
duration INTEGER NOT NULL,
price REAL NOT NULL

)


""")

conn.commit()
conn.close()