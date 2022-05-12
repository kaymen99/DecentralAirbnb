import { AddRental, Home, Rentals, Dashboard } from './pages'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

function App() {

    return (
        <div>
            <Router>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/rentals" element={<Rentals />} />
                    <Route path="/add-rental" element={<AddRental />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                </Routes>
            </Router>
        </div>
    );
}

export default App;
