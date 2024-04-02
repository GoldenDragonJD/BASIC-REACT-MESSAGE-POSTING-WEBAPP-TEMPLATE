class Player {
    constructor(name) {
        this.name = name;
        this.highScore = 0;
        this.history = [];
    }

    updateScore(newScore) {
        this.history.push(newScore);
        if (this.highScore < newScore) {
            console.log(`${newScore}! A new high score for ${this.name}`);
            this.highScore = newScore;
        }
    }
}

const player = new Player("Tyler");

// player.updateScore(4);
// player.updateScore(3);
// player.updateScore(16);
// player.updateScore(15);

let value = 1;
value = 2;

const value2 = [];

value2.push(2);

// console.log(player.history);
