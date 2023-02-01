 import React, { useState, useEffect } from 'react';
 import socketIOClient from "socket.io-client";
 import './BingoBoard.css';
 import { squarePhrases } from '../Phrases/Phrases';

 const BingoBoard = ({ columnsLength, rowsLength,joinRoomId }) => {
  
  const [squares, setSquares] = useState(generateCard(rowsLength, columnsLength, squarePhrases));
  const [winner, setWinner] = useState(null);
  const [roomId, setRoomId] = useState(joinRoomId);
  // server endpoint -local machine
  const endpoint = "http://localhost:8080"; 
  // server endpoint - after deployment - HEROKU URL
  // const endpoint = "https://bingo-multiplayer-app.herokuapp.com/"; 
  const socket = socketIOClient(endpoint);
  const [rows, setRows] = useState(rowsLength);
  const [columns, setColumns] = useState(columnsLength);
  const [selectedSquares, setSelectedSquares] = useState(generateMidpoint());
  const [winningType,setWinningType] = useState(null);
  const [selectedWinningPattern, setSelectedWinningPattern] = useState([]);

  // different bingo card is generated for multiplayers with unique pharses at each square
  function generateCard(rowsLength, columnsLength, squarePhrases) {
    let card = [];
    let usedPhrases = new Set();//used to store unique phrase values
    const middleIndex = Math.floor(rowsLength / 2) * columnsLength + Math.floor(columnsLength / 2);//2*5+2=12
    let phraseCount = squarePhrases.length;
    for (let i = 0; i < rowsLength * columnsLength; i++) {
        if (i === middleIndex) {
          card.push("Free Slot");
        } else {
          let randomIndex = Math.floor(Math.random() * phraseCount);//0-24
          while (usedPhrases.has(randomIndex)) {//if usedPhrases has randomIndex
            randomIndex = Math.floor(Math.random() * phraseCount);
          }
          card.push(squarePhrases[randomIndex]);
          usedPhrases.add(randomIndex);
        }
    }
    return card;
  }
  
  function generateMidpoint() {
        let midpoint = [Math.floor(squares.length / 2)];
        let genertedMidpoint=[{[midpoint]:'Free Slot'}]//{[12]:'Free Slot'}
        return genertedMidpoint;
  }

useEffect(() => {
    socket.emit("joinRoom", { roomId });
  }, []);

useEffect(() => {
    checkForWinner();
  }, [selectedSquares]);


const handleSquareClick = (square, index) => {
  let newSelectedSquares;
  let middleIndex = Math.floor(squares.length / 2);

  if (index === middleIndex) {
      // check if index is the middle index
       newSelectedSquares = [...selectedSquares, { [index]: square }];
     }
  else{
      // Check if the square has already been selected
      const alreadySelected = selectedSquares.findIndex(selectedIndex => Object.keys(selectedIndex)[0] === index.toString()) !== -1;

      if (alreadySelected) {
        // If it's already selected, remove it from the array
        newSelectedSquares = selectedSquares.filter(selectedIndex => Object.keys(selectedIndex)[0] !== index.toString());
      } else {
        // If it's not already selected, add it to the array
        newSelectedSquares = [...selectedSquares, { [index]: square }];
      }
  }

  checkForWinner();
  socket.emit("squareClicked", { selectedSquares: newSelectedSquares, roomId });
  setSelectedSquares(newSelectedSquares);
};//end of handleSquareClick

  
// listening to socket events from the server
  socket.on("joinRoom", (data)=>{ setRoomId(data.roomId) });
  socket.on("squareClicked", (data) => {
   
    // here we check selectedPhrases from the othe other players and update the state of selectedSquares
    let squarePhrases =  data.selectedSquares.map(object => Object.values(object));

    let squarePhrasesFlat = squarePhrases.flat();//return the array of phrases
    let finalSquares=[];
    squarePhrasesFlat.map((item) =>
    {
      let index = squares.indexOf(item);
      finalSquares=[...finalSquares,{[index]:squares[index]}]
      return finalSquares;
    }
   )
    setSelectedSquares(finalSquares);
    checkForWinner();
  });

const checkForWinner = () => {
    
    let winner = null;
    let winningPatterns = [];
    let winningType = null;
    
    // generate horizontal winning patterns   
    for (let i = 0; i < rows; i++) {
      let startIndex = i * columns;
      winningPatterns.push(Array.from({length: columns}, (_, k) => startIndex + k));
    }
  
    // generate vertical winning patterns
    for (let i = 0; i < columns; i++) {
      winningPatterns.push(Array.from({length: rows}, (_, k) => i + k * columns));//k is the index of the array
      }

    // generate diagonal winning patterns
    let diagonal1 = [];
    let diagonal2 = [];
    for (let i = 0; i < squares.length; i += (columns + 1)) {
        diagonal1.push(i);//[0,6,12,18,24]
    }
    for (let i = columns-1; i <= squares.length - columns + 1; i += (columns - 1)) {
        diagonal2.push(i);//[4,8,12,16,20]
    }

    winningPatterns.push(diagonal1);
    winningPatterns.push(diagonal2);

// check if any of the winning patterns are selected
  
  let selectedSquaresSet = new Set(selectedSquares.map(square => Number(Object.keys(square))));
  
  let selectedWinningPatternArr = [];
  for (let i = 0; i < winningPatterns.length; i++) {
    let winningIndexes = winningPatterns[i];
  
    if (winningIndexes.every(val => selectedSquaresSet.has(val))) {
      winner = " 🏆 Bingo at! ";
      setWinner(winner);
      winningType = "horizontal  🎉";
      if (i >= rows) {
        winningType = i < rows + columns ? "vertical  🎉" : "diagonal  🎉";
      }
      setWinningType(winningType);
      selectedWinningPatternArr.push(winningIndexes);
 
    }
   
  }
    setSelectedWinningPattern(selectedWinningPatternArr);
    setWinner(winner);
    return winner;
}

return (
  <> 
      <div className="grid-container" 
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
      }}
      >
      {squares.map((square, i) => {
        let className = "";
        if (selectedSquares.some(obj => Object.values(obj).includes(square))) {
          className = "selected";
        }
        if (selectedWinningPattern.some(pattern => pattern.includes(i))) {
          className += " winner";
        }
        return (
          <div key={i} onClick={() => handleSquareClick(square, i)} className={className}>
            {square}
          </div>
        );
      })}
      </div>

  </>
);

}

export default BingoBoard;