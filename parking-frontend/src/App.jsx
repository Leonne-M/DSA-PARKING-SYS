import { useState } from "react";

import Slots from "./slots";
import CreateSlot from "./createSlot";
import RegisterVehicle from "./Register";
import Sessions from "./sessions";
import "./App.css";
function App() {
    const [refreshData, setRefreshData] = useState(0);

    const refreshEverything = () => {
        setRefreshData((value) => value + 1);
    };

    return (
        <div className="app">
            <h1>Parking Management System</h1>
            <div className="section">
                <CreateSlot
                    onSlotCreated={refreshEverything}
                />
            </div>
            <div className="section">
                <Slots
                    refreshTrigger={refreshData}
                />
            </div>
            <div className="section">
                <RegisterVehicle
                    onVehicleRegistered={refreshEverything}
                />
            </div>
            <div className="section">
                <Sessions
                    refreshTrigger={refreshData}
                    onSessionEnded={refreshEverything}
                />
            </div>

        </div>
    );
}
export default App;

