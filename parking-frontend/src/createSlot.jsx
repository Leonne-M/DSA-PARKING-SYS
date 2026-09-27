import { useState } from "react";

function CreateSlot({ onSlotCreated }) {

    const [slotName, setSlotName] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const createSlot = async (e) => {

        e.preventDefault();

        setMessage("");
        setError("");

        try {
            const response = await fetch(
                "http://127.0.0.1:5000/slots",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        slot_name: slotName
                    })
                }
            );
            const data = await response.json();
            if (!response.ok) {
                throw new Error(
                    data.error || "Failed to create slot"
                );
            }
            setMessage("Slot created successfully");
            setSlotName("");
            onSlotCreated();

        } catch (error) {

            setError(error.message);

        }
    };
    return (
        <div>
            <h2>Create Parking Slot</h2>
            <form onSubmit={createSlot}>
                <input
                    type="text"
                    placeholder="Enter slot name"
                    value={slotName}
                    onChange={(e) =>
                        setSlotName(e.target.value)
                    }
                    required
                />
                <button type="submit">
                    Create Slot
                </button>
            </form>

            {message && (
                <p>{message}</p>
            )}

            {error && (
                <p>Error: {error}</p>
            )}

        </div>
    );
}
export default CreateSlot;