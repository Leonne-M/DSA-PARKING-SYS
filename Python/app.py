from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from datetime import datetime

import setup

database = "database.db"

app = Flask(__name__)
CORS(app)


def get_db():
    conn = sqlite3.connect(database)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


@app.route("/slots", methods=["POST"])
def create_slots():
    data = request.get_json()
    slot_name = data.get("slot_name")
    if not slot_name:
        return jsonify({
            "error": "slot_name is required"
        }), 400

    conn = get_db()

    try:
        conn.execute(
            "INSERT INTO slots(slot_name) VALUES(?)",
            (slot_name,)
        )
        conn.commit()
        return jsonify({
            "message": "Successfully created a slot"
        }), 201

    except sqlite3.IntegrityError as e:

        return jsonify({
            "error": str(e)
        }), 400

    finally:
        conn.close()


@app.route("/getslots", methods=["GET"])
def get_slots():

    conn = get_db()

    try:
        rows = conn.execute(
            "SELECT * FROM slots"
        ).fetchall()

        slots = [dict(row) for row in rows]

        return jsonify(slots), 200

    finally:
        conn.close()


@app.route("/slots_UPD/<int:id>", methods=["PUT"])
def upd_slots(id):

    data = request.get_json()

    status = data.get("status")

    if not status:
        return jsonify({
            "error": "status is required"
        }), 400

    status = status.lower()

    if status not in ["available", "occupied"]:
        return jsonify({
            "error": "Wrong value input"
        }), 400

    conn = get_db()

    try:

        cursor = conn.execute(
            """
            UPDATE slots
            SET status=?
            WHERE slot_id=?
            """,
            (status, id)
        )

        if cursor.rowcount == 0:
            return jsonify({
                "error": "Slot not found"
            }), 404

        conn.commit()

        return jsonify({
            "message": "Successfully updated slot status"
        }), 200

    finally:
        conn.close()

@app.route("/vehicles", methods=["POST"])
def create_vehicles():

    data = request.get_json()

    vehicle_reg = data.get("vehicle_registration")
    phone_number = data.get("phone_number")
    vehicle_type = data.get("vehicle_type")

    if not vehicle_reg or not phone_number or not vehicle_type:
        return jsonify({
            "error": "vehicle_registration, phone_number and vehicle_type are required"
        }), 400

    conn = get_db()

    try:

        conn.execute(
            """
            INSERT INTO vehicle
            (vehicle_registration, phone_number, vehicle_type)
            VALUES (?, ?, ?)
            """,
            (vehicle_reg, phone_number, vehicle_type)
        )

        slot = conn.execute(
            """
            SELECT slot_name
            FROM slots
            WHERE status = 'available'
            LIMIT 1
            """
        ).fetchone()

        if slot is None:
            conn.rollback()

            return jsonify({
                "error": "No available parking slots"
            }), 400

        slot_name = slot["slot_name"]

        # Occupy the slot
        conn.execute(
            """
            UPDATE slots
            SET status='occupied'
            WHERE slot_name=?
            """,
            (slot_name,)
        )

        entry_time = datetime.now().strftime(
            "%Y-%m-%d %H:%M:%S"
        )

        conn.execute(
            """
            INSERT INTO sessions
            (vehicle_registration, slot_name, entry_time)
            VALUES (?, ?, ?)
            """,
            (vehicle_reg, slot_name, entry_time)
        )

        conn.commit()

        return jsonify({
            "message": "Successfully created vehicle and parking session",
            "vehicle_registration": vehicle_reg,
            "slot_name": slot_name,
            "entry_time": entry_time
        }), 201

    except sqlite3.IntegrityError as e:

        conn.rollback()

        return jsonify({
            "error": str(e)
        }), 400

    finally:
        conn.close()
@app.route("/sessions", methods=["GET"])
def get_sessions():
    conn = get_db()
    try:
        rows = conn.execute("""
            SELECT
                sessions.session_id,
                sessions.vehicle_registration,
                sessions.slot_name,
                sessions.entry_time,
                sessions.exit_time,
                vehicle.vehicle_type,
                vehicle.phone_number
            FROM sessions

            LEFT JOIN vehicle
            ON sessions.vehicle_registration =
               vehicle.vehicle_registration

            ORDER BY sessions.session_id DESC
        """).fetchall()
        sessions = [
            dict(row)
            for row in rows
        ]
        return jsonify(sessions), 200
    finally:
        conn.close()

@app.route("/session_upd/<int:id>", methods=["PUT"])
def upd_session(id):

    conn = get_db()
    try:
        session = conn.execute(
            """
            SELECT *
            FROM sessions
            WHERE session_id=?
            """,
            (id,)
        ).fetchone()

        if session is None:
            return jsonify({
                "error": "Session not found"
            }), 404

        slot_name = session["slot_name"]
        entry_time = session["entry_time"]

        exit_time = datetime.now().strftime(
            "%Y-%m-%d %H:%M:%S"
        )

        conn.execute(
            """
            UPDATE slots
            SET status='available'
            WHERE slot_name=?
            """,
            (slot_name,)
        )

        conn.execute(
            """
            UPDATE sessions
            SET exit_time=?
            WHERE session_id=?
            """,
            (exit_time, id)
        )

        entry = datetime.strptime(
            entry_time,
            "%Y-%m-%d %H:%M:%S"
        )

        exit = datetime.strptime(
            exit_time,
            "%Y-%m-%d %H:%M:%S"
        )

        duration = exit - entry
        duration_seconds = int(
            duration.total_seconds()
        )

        conn.commit()
        return jsonify({
            "entry_time": entry_time,
            "exit_time": exit_time,
            "duration_seconds": duration_seconds,
            "message": "Successfully updated session"
        }), 200

    finally:
        conn.close()

@app.route("/rates", methods=["POST"])
def create_rates():

    data = request.get_json()

    duration = data.get("duration")
    price = data.get("price")

    if duration is None or price is None:
        return jsonify({
            "error": "duration and price are required"
        }), 400

    conn = get_db()

    try:
        conn.execute(
            """
            INSERT INTO rates(duration, price)
            VALUES (?, ?)
            """,
            (duration, price)
        )
        conn.commit()
        return jsonify({
            "message": "Successfully created a rate"
        }), 201

    except sqlite3.IntegrityError as e:

        return jsonify({
            "error": str(e)
        }), 400

    finally:
        conn.close()
@app.route("/session_payment/<int:id>", methods=["GET"])
def session_payment(id):
    conn = get_db()
    try:
        # Get the parking session
        session = conn.execute("""
            SELECT
                session_id,
                vehicle_registration,
                slot_name,
                entry_time,
                exit_time
            FROM sessions
            WHERE session_id = ?
        """, (id,)).fetchone()
        if session is None:
            return jsonify({
                "error": "Session not found"
            }), 404
        if session["exit_time"] is not None:
            return jsonify({
                "error": "This session has already ended"
            }), 400
        exit_time = datetime.now()
        entry_time = datetime.fromisoformat(
            session["entry_time"]
        )
        duration = exit_time - entry_time
        total_seconds = duration.total_seconds()
        total_minutes = total_seconds / 60
        if total_minutes <= 30:
            fee = 0
        elif total_minutes <= 120:
            fee = 50
        elif total_minutes <= 240:
            fee = 100
        elif total_minutes <= 360:
            fee = 300
        else:
            fee = 500
        total_seconds_int = int(total_seconds)
        hours = total_seconds_int // 3600
        minutes = (total_seconds_int % 3600) // 60
        if hours > 0:
            duration_text = f"{hours} hour(s) {minutes} minute(s)"
        else:
            duration_text = f"{minutes} minute(s)"
        return jsonify({
            "session_id": session["session_id"],
            "vehicle_registration":
                session["vehicle_registration"],
            "slot_name": session["slot_name"],
            "entry_time": session["entry_time"],
            "exit_time":
                exit_time.strftime("%Y-%m-%d %H:%M:%S"),
            "duration": duration_text,
            "total_minutes": round(total_minutes, 2),
            "fee": fee
        }), 200

    finally:
        conn.close()
if __name__ == "__main__":
    app.run(debug=True)
