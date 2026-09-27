import { useEffect, useState } from "react";

function Sessions({
    refreshTrigger,
    onSessionEnded
}) {

    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedSession, setSelectedSession] =
        useState(null);
    const [paymentDetails, setPaymentDetails] =
        useState(null);
    const getSessions = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await fetch(
                "http://127.0.0.1:5000/sessions"
            );
            const data = await response.json();
            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Failed to fetch sessions"
                );

            }
            setSessions(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);

        }
    };

    useEffect(() => {
        getSessions();

    }, [refreshTrigger]);
    const openPayment = async (session) => {
        try {
            setError("");
            const response = await fetch(
                `http://127.0.0.1:5000/session_payment/${session.session_id}`
            );
            const data = await response.json();
            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Failed to calculate payment"
                );
            }
            setSelectedSession(session);
            setPaymentDetails(data);
        } catch (error) {
            setError(error.message);
        }
    };

    const cancelPayment = () => {

        setSelectedSession(null);
        setPaymentDetails(null);

    };

    const confirmPayment = async () => {
        if (!selectedSession) {
            return;
        }
        try {

            setError("");
            const response = await fetch(
                `http://127.0.0.1:5000/session_upd/${selectedSession.session_id}`,
                {
                    method: "PUT"
                }
            );
            const data = await response.json();
            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Failed to confirm payment"
                );

            }
            setSelectedSession(null);
            setPaymentDetails(null);
            if (onSessionEnded) {
                onSessionEnded();
            }
            getSessions();
        } catch (error) {

            setError(error.message);
        }

    };
    if (loading) {
        return (
            <div>
                <h2>Parking Sessions</h2>
                <p>Loading sessions...</p>
            </div>
        );

    }


    return (
        <div>
            <h2>Parking Sessions</h2>
            {error && (
                <p className="error">
                    Error: {error}
                </p>
            )}

            {sessions.length === 0 ? (
                <p>
                    No parking sessions found.
                </p>

            ) : (
                <div className="table-container">
                    <table className="sessions-table">
                        <thead>
                            <tr>
                                <th>
                                    ID
                                </th>
                                <th>
                                    Vehicle
                                </th>
                                <th>
                                    Type
                                </th>
                                <th>
                                    Slot
                                </th>
                                <th>
                                    Entry Time
                                </th>
                                <th>
                                    Exit Time
                                </th>
                                <th>
                                    Status
                                </th>
                                <th>
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {sessions.map((session) => {
                                const occupied =
                                    session.exit_time === null;
                                return (
                                    <tr
                                        key={
                                            session.session_id
                                        }
                                    >
                                        <td>
                                            {
                                                session.session_id
                                            }
                                        </td>
                                        <td>
                                            {
                                                session.vehicle_registration
                                            }
                                        </td>
                                        <td>
                                            {
                                                session.vehicle_type ||
                                                "Vehicle"
                                            }
                                        </td>
                                        <td>
                                            {
                                                session.slot_name
                                            }
                                        </td>
                                        <td>
                                            {
                                                session.entry_time
                                            }
                                        </td>
                                        <td>

                                            {session.exit_time
                                                ? session.exit_time
                                                : "Still parked"}

                                        </td>
                                        <td>
                                            <span
                                                className={
                                                    occupied
                                                        ? "session-active"
                                                        : "session-completed"
                                                }
                                            >

                                                {occupied
                                                    ? "Active"
                                                    : "Completed"}

                                            </span>
                                        </td>
                                        <td>
                                            {occupied && (

                                                <button
                                                    className="end-session-button"
                                                    onClick={() =>
                                                        openPayment(
                                                            session
                                                        )
                                                    }
                                                >
                                                    End Session
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

            )}
            {selectedSession &&
                paymentDetails && (
                    <div className="modal-overlay">
                        <div className="payment-modal">
                            <h2>
                                Confirm Payment
                            </h2>
                            <p>
                                Review the parking
                                charges before ending
                                the session.
                            </p>
                            <hr />
                            <p>
                                <strong>
                                    Vehicle:
                                </strong>{" "}
                                {
                                    selectedSession.vehicle_registration
                                }
                            </p>
                            <p>
                                <strong>
                                    Slot:
                                </strong>{" "}
                                {
                                    selectedSession.slot_name
                                }
                            </p>
                            <p>
                                <strong>
                                    Entry:
                                </strong>{" "}
                                {
                                    paymentDetails.entry_time
                                }
                            </p>
                            <p>
                                <strong>
                                    Exit:
                                </strong>{" "}
                                {
                                    paymentDetails.exit_time
                                }
                            </p>
                            <p>
                                <strong>
                                    Duration:
                                </strong>{" "}
                                {
                                    paymentDetails.duration
                                }
                            </p>
                            <hr />
                            <p>
                                <strong>
                                    Rate:
                                </strong>{" "}
                                KSh{" "}
                                {Number(
                                    paymentDetails.rate
                                ).toFixed(2)}
                            </p>
                            <p>
                                <strong>
                                    VAT (
                                    {
                                        paymentDetails.vat_rate
                                    }%):
                                </strong>{" "}
                                KSh{" "}
                                {Number(
                                    paymentDetails.vat
                                ).toFixed(2)}
                            </p>
                            <h2 className="payment-total">
                                Total: KSh{" "}
                                {Number(
                                    paymentDetails.total
                                ).toFixed(2)}
                            </h2>
                            <div className="modal-buttons">
                                <button
                                    className="cancel-button"
                                    onClick={
                                        cancelPayment
                                    }
                                >
                                    Cancel
                                </button>
                                <button
                                    className="confirm-button"
                                    onClick={
                                        confirmPayment
                                    }
                                >
                                    Confirm Payment
                                </button>
                            </div>
                        </div>
                    </div>
                )}
        </div>
    );
}
export default Sessions;