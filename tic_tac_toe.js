function TreeNode(state) {
    this.state = state;
    this.score = null;
    this.children = [];
    this.i = -1;
    this.j = -1;
}

function TicTacToe() {

    this.$squares = null;
    this.$turn = null;
    this.turn = true; // true if users turn
    this.board = []; // 1 - user; 0 - computer;
    this.gameOver = false;

    this.init = function() {
        this.cacheDom();
        this.bindEvents();
        this.board = this.newBoard();
        // this.board[0][0] = 0;
        // this.board[0][1] = 0;
        // this.board[0][2] = 1;
        // this.board[1][1] = 1;
        // this.board[2][0] = 0;
        // this.board[2][1] = 1;
        this.drawBoard(this.board);
    };

    this.cacheDom = function() {
        this.$squares = $('.square');
        this.$turn = $('.turn');
    };

    this.bindEvents = function() {
        this.$squares.on('click', this.didClickSquare);
    };

    this.newBoard = function() {
        var matrix = [];
        for(var i = 0; i < 3; i++) {
            var row = [];
            for(var j = 0; j < 3; j++) {
                row.push(null);
            }
            matrix.push(row);
        }
        return matrix;
    };

    // Draws only when the next move if from the user
    this.drawBoard = function(board) {
        for(var i = 0; i < 3; i++) {
            for(var j = 0; j < 3; j++) {
                if(board[i][j] == 1) {
                    this.userCheck($(this.$squares[3*i + j]));
                } else if(board[i][j] == 0) {
                    this.computerCheck($(this.$squares[3*i + j]));
                }
            }
        }
    };

    this.cloneBoard = function(board) {
        var cl = this.newBoard();
        for(var i = 0; i < board.length; i++) {
            for(var j = 0; j < board[0].length; j++) {
                cl[i][j] = board[i][j];
            }
        }
        return cl;
    };

    this.printBoard = function(b) {
        var str = "";
        for(var i = 0; i < 3; i++) {
            str += this.printableChar(b[i][0]) + " " + this.printableChar(b[i][1]) + " " + this.printableChar(b[i][2]) + "\n";
        }
        console.log(str);
    };

    this.printableChar = function(c) {
        return c == null ? '-' : c;
    };

    this.getSuccessors = function(board, t) {
        var pl = this.player(t);
        var successors = [];
        for(var i = 0; i < board.length; i++) {
            for(var j = 0; j < board[0].length; j++) {
                if(board[i][j] == null) {
                    var s = this.cloneBoard(board);
                    s[i][j] = pl;
                    successors.push([s, i, j]);
                }
            }
        }
        return successors;
    };

    this.didClickSquare = function(e) {
        if(this.gameOver || !this.turn) { return; }
        var $target = $(e.target);
        var row = $target.data('row');
        var column = $target.data('column');
        var $square = $target;
        this.board[row][column] = this.player(this.turn);
        this.userCheck($square);
        this.switchTurnSpan();
        this.switchTurn();
        this.checkGameOver();
        this.computerTurn();
    }.bind(this);

    this.computerTurn = function() {
        if(this.gameOver || this.turn) { return; }
        var node = this.minimax(this.board);
        this.board[node.i][node.j] = this.player(this.turn);
        var index = node.i*3 + node.j;
        this.computerCheck($(this.$squares[index]));
        this.switchTurnSpan();
        this.checkGameOver();
        this.switchTurn();
    };

    this.scoreState = function(state) {
        for(var i = 0; i < 3; i++) {
            // Horizontal
            if(state[i][0] != null && state[i][0] == state[i][1] && state[i][1] == state[i][2]) {
                return state[i][0] == 1 ? 1 : -1;
            }
            // Vertical
            if(state[0][i] != null && state[0][i] == state[1][i] && state[1][i] == state[2][i]) {
                return state[0][i] == 1 ? 1 : -1;
            }
        }
        // Diagonal Top Left - Bottom Right
        if(state[0][0] != null && state[0][0] == state[1][1] && state[1][1] == state[2][2]) {
            return state[0][0] == 1 ? 1 : -1;
        }
        // Diagonal Top Right - Bottom Left
        if(state[0][2] != null && state[0][2] == state[1][1] && state[1][1] == state[2][0]) {
            return state[0][2] == 1 ? 1 : -1;
        }
        return 0;
    };

    this.minimax = function(state, t) {

        var depth = 2;
        var root = new TreeNode(this.cloneBoard(state));

        var v = 2; // Min
        this.xValue(root, t, depth, v, Math.min, Math.max);

        for(var i = 0; i < root.children.length; i++) {
            if(root.children[i].score == root.score) {
                return root.children[i];
            }
        }

        // Just to prevent null pointer
        return root.children[0];

    };

    this.xValue = function(node, t, depth, v, f, o) {

        var score = this.scoreState(node.state);
        if(depth == 0 || score != 0) {
            node.score = score;
            return score;
        }

        // TODO Needs improvement
        var successors = this.getSuccessors(node.state, t);
        for(var i = 0; i < successors.length; i++) {
            var tn = new TreeNode(successors[i][0]);
            tn.i = successors[i][1];
            tn.j = successors[i][2];
            node.children.push(tn);
        }

        node.score = v;
        for(var i = 0; i < successors.length; i++) {
            var curr = node.children[i];
            node.score = f(node.score, this.xValue(curr, !t, depth-1, -v, o, f));
        }

        return node.score

    };

    this.userCheck = function(elem) {
        this.markWith(elem, 'x');
    };

    this.computerCheck = function(elem) {
        this.markWith(elem, 'o');
    };

    this.markWith = function(elem, symbol) {
        $(elem).css('background-image', "url('" + symbol + ".png')");
    };

    // true if users
    this.switchTurnSpan = function() {
        if(this.turn) {
            this.$turn.text("Computer's turn");
        } else {
            this.$turn.text("Your turn");
        }
    };

    this.switchTurn = function() {
        this.turn = !this.turn;
    };

    this.player = function(t) {
        return t ? 1 : 0;
    };

    this.isGameOver = function(board) {
        return this.scoreState(board) != 0;
    };

    this.hasRoom = function(board) {
        for(var i = 0; i < 3; i++) {
            for(var j = 0; j < 3; j++) {
                if(board[i][j] == null) {
                    return true;
                }
            }
        }
        return false;
    };

    this.checkGameOver = function() {
        this.gameOver = this.isGameOver(this.board);
        if(this.gameOver) {
            this.setGameOverSpan();
        } else {
            if(!this.hasRoom(this.board)) { //Tie
                this.gameOver = true;
                this.setTieSpan();
            }
        }
    };

    this.setGameOverSpan = function() {
        this.$turn.text('Game Over!');
    };

    this.setTieSpan = function() {
        this.$turn.text("It's a Tie!");
    };

}

$(function() {
    var ticTac = new TicTacToe();
    ticTac.init();
});
