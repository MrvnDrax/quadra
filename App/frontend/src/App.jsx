import "./App.css";
import { BrowserRouter as Router } from "react-router-dom";
import Appshell from "./components/Appshell";

function App() {
  return (
    <Router>
      <div>
        <Appshell />
      </div>
    </Router>
  );
}

export default App;
