
import './App.css';
import './Components/CustomerTable/customerTable.js'
import CustomerTable from './Components/CustomerTable/customerTable.js';
import '../node_modules/bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
function App() {
  return (
    <div className="App">
     <CustomerTable />
    </div>
  );
}

export default App;
