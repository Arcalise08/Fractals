import Triangle from "./pages/Sierpinskis Triangle";
import "bootstrap/dist/css/bootstrap.min.css";

const App = () => {
  return (
    <div 
      style={{width:"100vw", height:"100vh", 
      overflow:"hidden", margin:0}}>
      <Triangle/>
    </div>
  );
}

export default App;
