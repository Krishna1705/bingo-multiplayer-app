
import BingoBoard from './components/BingoBoard/BingoBoard';

function App() {
  return (
    <div className="App">
       <BingoBoard rowsLength={5} columnsLength={5} joinRoomId={420} ></BingoBoard>
    </div>
  );
}

export default App;
