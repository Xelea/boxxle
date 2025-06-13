const GRID_WIDTH = 50;
const GRID_HEIGHT = 25;
const fps = 10
const keys = {
    37: 'left',
    39: 'right',
    38: 'up',
    40: 'down'
}

import { Levels } from './level.js'; // Import the level array data from level.js

let levelIndex = 0; // The index of the level to load
let selectedLevel = Levels[levelIndex]; // Select the level data based on the levelIndex
let initialLevel = selectedLevel.map(row => [...row]); // Create a deep copy of the selected level to reset later
const gameboard = document.getElementById('gameboard'); // Select the gameboard element from the HTML


const hasPlayer = selectedLevel.some(row => row.includes(3) || row.includes(5)); // Check if the selected level contains a player (3) or a player on goal (5)
if (!hasPlayer) { // Check if there is a player in the selected level
    alert("Error : no player found in this level !");
    if (levelIndex < Levels.length - 1) {
        alert("Loading next level...");
        selectedLevel = Levels[levelIndex+1]; // Load the next level if available
    } else {
        alert("No more levels available, resetting to the first level.");
        selectedLevel = Levels[0]; // Reset to the first level if no player is found and all levels are exhausted
    }
}

const nbRows = selectedLevel.length;
const nbCollumns = selectedLevel[0].length;
gameboard.style.gridTemplateRows = `repeat(${nbRows}, 1fr)`;
gameboard.style.gridTemplateColumns = `repeat(${nbCollumns}, 1fr)`;

const draw = () => {
    gameboard.innerHTML = ''; // Clear the gameboard to make sure there is no duplicate content
    selectedLevel.forEach((row, rowIndex) => {
        row.forEach((cell, cellIndex) => {
            const div = document.createElement('div'); // Create a new div for each cell
            div.classList.add('cell'); // Add a class to the div for styling

            div.style.gridRowStart = rowIndex + 1; // Set the row start position
            div.style.gridColumnStart = cellIndex + 1; // Set the column start position

            switch (cell) {
                case 0 : div.classList.add('cell-empty'); break; // Empty cell
                case 1 : div.classList.add('cell-wall'); break; // Wall cell
                case 2 : div.classList.add('cell-box'); break; // Box cell
                case 3 : div.classList.add('cell-player'); break; // Player cell
                case 4 : div.classList.add('cell-goal'); break; // Goal cell
                case 5 : div.classList.add('cell-goal', 'cell-player'); break; // Goal with player cell
                case 6 : div.classList.add('cell-goal', 'cell-box'); break; // Goal with box cell
            }

            gameboard.appendChild(div); // Append the div to the gameboard
        });
    });
    requestAnimationFrame(draw); // Call draw again for the next frame
}

document.addEventListener('keydown', handleKeyDown); // Add an event listener for keydown events

function handleKeyDown(event) {
    event.preventDefault();

    let playerPosition = null;
    selectedLevel.forEach((row, rowIndex) => {
        row.forEach((cell, cellIndex) => {
            if (cell === 3 || cell === 5) { 
                playerPosition = [rowIndex, cellIndex];
            }
        });
    });

    if (!playerPosition) return;

    let directions;
    switch (event.keyCode) {
        case 37: directions = [0, -1]; break;
        case 38: directions = [-1, 0]; break;
        case 39: directions = [0, 1]; break;
        case 40: directions = [1, 0]; break;
        default: return;
    }

    const [posY, posX] = playerPosition;
    const [dirY, dirX] = directions;
    const newY = posY + dirY;
    const newX = posX + dirX;
    const nextCell = selectedLevel[newY]?.[newX];

    if (nextCell === undefined || nextCell === 1) return;

    if (nextCell === 0 || nextCell === 4) {
        selectedLevel[posY][posX] = (selectedLevel[posY][posX] === 5) ? 4 : 0;
        selectedLevel[newY][newX] = (nextCell === 4) ? 5 : 3;
        return;
    }

    if (nextCell === 2 || nextCell === 6) {
        const boxNewY = newY + dirY;
        const boxNewX = newX + dirX;
        const boxNextCell = selectedLevel[boxNewY]?.[boxNewX];

        if (boxNextCell === 0 || boxNextCell === 4) {
            selectedLevel[boxNewY][boxNewX] = (boxNextCell === 4) ? 6 : 2;
            selectedLevel[newY][newX] = (nextCell === 6) ? 5 : 3;
            selectedLevel[posY][posX] = (selectedLevel[posY][posX] === 5) ? 4 : 0;
        }
    }

    if (checkVictory()) {
        if (levelIndex < Levels.length - 1) {
            alert("congratulations, you completed the level! Loading next level...");
            loadLevel(levelIndex + 1); // Load the next level if available
        }else {
            alert("congratulations, you completed the last level! Resetting to the first level...");
            loadLevel(0); // Reset to the first level if no more levels are available
        }
    }
}

document.getElementById('resetBtn').addEventListener('click', () => {
    loadLevel(levelIndex);
});

function checkVictory() {
    for (let rowIndex = 0; rowIndex < selectedLevel.length; rowIndex++) {
        for (let cellIndex = 0; cellIndex < selectedLevel[rowIndex].length; cellIndex++) {
            if (initialLevel[rowIndex][cellIndex] === 4 && selectedLevel[rowIndex][cellIndex] !== 6) {
                return false;
            }
        }
    }
    return true;
}

function loadLevel(index) {
    levelIndex = index;
    selectedLevel = Levels[levelIndex].map(row => [...row]);
    initialLevel = Levels[levelIndex].map(row => [...row]);
}

draw(); // Initial draw call to render the gameboard