import { useEffect, useState } from "react";
function Slots({ refreshTrigger }) {
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const getSlots = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                "http://127.0.0.1:5000/getslots"
            );
            if (!response.ok) {
                throw new Error(
                    "Failed to fetch slots"
                );
            }
            const data = await response.json();
            setSlots(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        getSlots();

    }, [refreshTrigger]);
    if (loading) {

        return (
            <div>
                <h2>Parking Slots</h2>
                <p className="loading">
                    Loading slots...
                </p>

            </div>
        );

    }
    if (error) {

        return (
            <div>
                <h2>Parking Slots</h2>
                <p className="error">
                    Error: {error}
                </p>

            </div>
        );

    }
    return (
        <div>

            <h2>Parking Slots</h2>

            {slots.length === 0 && (
                <p>
                    No parking slots found.
                </p>
            )}
            <div className="slots-grid">

                {slots.map((slot) => (
                    <div
                        key={slot.slot_id}
                        className={
                            `slot-box ${
                                slot.status === "available"
                                    ? "available"
                                    : "occupied"
                            }`
                        }
                    >
                        <div className="slot-number">
                            {slot.slot_name}
                        </div>
                        <div className="parking-symbol">    
                        </div>
                        <div className="slot-status">

                            {slot.status}
                        </div>
                    </div>

                ))}
            </div>
        </div>
    );
}
export default Slots;