import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ConfigurationPage from "./CypherQueryTester/Configuration";
import CypherQueryTester from "./CypherQueryTester/CypherQueryTester";
import JsonImport from "./CypherQueryTester/JsonImport";
import Login from "./Auth/Login";
import Register from "./Auth/Register";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route path="/configuration" element={<ConfigurationPage />} />
                <Route path="/cypherquerytester" element={<CypherQueryTester />} />
                <Route path="/import-json" element={<JsonImport />} />
            </Routes>
        </Router>
    );
}

export default App;




