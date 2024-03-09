import './App.css';
import {Outlet} from "react-router-dom";
import {Header} from "@/components/Header.tsx";


function App() {
  return (
    <div className={'container'}>
      <Header/>
      <Outlet/>
    </div>
  );
}

export default App;
