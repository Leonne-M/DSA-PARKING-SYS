import { useState } from "react";

function RegisterVehicle({ onVehicleRegistered }) {
    const [vehicleRegistration, setVehicleRegistration] =
        useState("");
    const [phoneNumber, setPhoneNumber] =
        useState("");
    const [vehicleType, setVehicleType] =
        useState("");
    const [message, setMessage] =
        useState("");
    const [error, setError] =
        useState("");
    const registerVehicle = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        try {
            const response = await fetch(
                "http://127.0.0.1:5000/vehicles",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        vehicle_registration:
                            vehicleRegistration,
                        phone_number:
                            phoneNumber,
                        vehicle_type:
                            vehicleType
                    })
                }
            );
            const data =
                await response.json();
            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Failed to register vehicle"
                );

            }
            setMessage(
                `Vehicle registered successfully. Assigned slot: ${data.slot_name}`
            );
            setVehicleRegistration("");
            setPhoneNumber("");
            setVehicleType("");
            onVehicleRegistered();
        } catch (error) {
            setError(error.message);
        }
    };
    return (
        <div>
            <h2>Register Vehicle</h2>
            <form onSubmit={registerVehicle}>

                <div>
                    <label>
                        Vehicle Registration:
                    </label>
                    <input
                        type="text"
                        value={
                            vehicleRegistration
                        }
                        onChange={(e) =>
                            setVehicleRegistration(
                                e.target.value
                            )
                        }
                        placeholder="e.g. KBX 111Z"
                        required
                    />

                </div>
                <div>
                    <label>
                        Phone Number:
                    </label>
                    <input
                        type="text"
                        value={phoneNumber}
                        onChange={(e) =>
                            setPhoneNumber(
                                e.target.value
                            )
                        }

                        placeholder="e.g. 0712345678"
                        required
                    />
                </div>
                <div>
                    <label>
                        Vehicle Type:
                    </label>
                    <select
                        value={vehicleType}

                        onChange={(e) =>
                            setVehicleType(
                                e.target.value
                            )
                        }
                        required
                    >
                        <option value="">
                            Select vehicle type
                        </option>
                        <option value="Car">
                            Car
                        </option>
                        <option value="Motorcycle">
                            Motorcycle
                        </option>
                        <option value="Van">
                            Van
                        </option>
                        <option value="Truck">
                            Truck
                        </option>
                    </select>
                </div>
                <button type="submit">
                    Register Vehicle
                </button>
            </form>
            {message && (
                <p className="success">
                    {message}
                </p>
            )}
            {error && (
                <p className="error">
                    Error: {error}
                </p>
            )}
        </div>
    );
}
export default RegisterVehicle;