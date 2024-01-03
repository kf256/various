class GoL {
    constructor(data, fixedSize = false) {
        switch (Object.prototype.toString.call(data)) {
            case "[object Array]": {
                if (Object.prototype.toString.call(data[0]) != "[object Array]") throw "Data type not supported";
                this.height = data.length;
                this.width = data[0].length;
                this.data = JSON.parse(JSON.stringify(data));
                for (let y = 0; y < this.height; y++) {
                    for (let x = 0; x < this.width; x++) {
                        this.data[y][x] = Boolean(this.data[y][x]);
                    }
                }
                break;
            }
            case "[object String]": {
                this.importRLE(data);
                break;
            }
            case "[object Object]": {
                this.width = data.width;
                this.height = data.height;
                this.data = new Array(this.width).fill(false);
                this.data = new Array(this.height).fill(this.data);
                this.data = JSON.parse(JSON.stringify(this.data));
                break;
            }
            default: {
                throw "Data type not supported";
            }
        }
        this.fixedSize = fixedSize;
        if (!this.fizedSize) this.removeBorders();
    }
    importRLE(RLE) {
        let allLines = RLE.split(`\n`);
        let mainLines = [];
        for (let i = 0; i < allLines.length; i++) {
            if (allLines[i][0] != `#`) mainLines.push(allLines[i]);
        }
        let variablesLine = mainLines[0].split(`, `);
        let variables = {};
        for (let i = 0; i < variablesLine.length; i++) {
            let name = variablesLine[i].slice(0, variablesLine[i].indexOf(` `));
            let value = variablesLine[i].slice(name.length+3, variablesLine[i].length);
            variables[name] = value;
        }
        let ruleCorrect = false;
        if (variables.rule == undefined) ruleCorrect = true;
        if (variables.rule.toLowerCase == `b3/s23`) ruleCorrect = true;
        if (!ruleCorrect) throw "Rule must be b3/s23";
        this.width = variables.x*1;
        this.height = variables.y*1;
        this.data = new Array(this.width).fill(false);
        this.data = new Array(this.height).fill(this.data);
        this.data = JSON.parse(JSON.stringify(this.data));
        let dataAsRLEString = mainLines.slice(1, mainLines.length).join("");
        let i = 0;
        let position = 0;
        let number = 0;
        let numberlength = 0;
        for (let j = 0; j < dataAsRLEString.length; j++) {
            if (dataAsRLEString[j] == "!") return;
            if ("0123456789".indexOf(dataAsRLEString[j]) != -1) {
                number *= 10;
                number += dataAsRLEString[j]*1;
                numberlength++;
            } else {
                if (numberlength == 0) number = 1;
                if (dataAsRLEString[j] == "o") {
                    this.data[i].fill(true, position, position+number);
                } else if (dataAsRLEString[j] == "b") {
                    this.data[i].fill(false, position, position+number);
                } else if (dataAsRLEString[j] == "$") {
                    i += number;
                    position = 0;
                    number = 0;
                    numberlength = 0;
                    continue;
                } else throw `Unexpected "${dataAsRLEString[j]}"`;
                position += number;
                number = 0;
                numberlength = 0;
            }
        }
    }
    addBorders() {
        this.data.unshift(new Array(this.width).fill(false));
        this.data.push(new Array(this.width).fill(false));
        this.data.map(function(array) {array.unshift(false);array.push(false);});
        this.width += 2;
        this.height += 2;
    }
    removeBorders() {
        while (this.height > 0 && (this.data[0].indexOf(true) == -1)) {
            this.data.shift();
            this.height--;
        }
        while (this.height > 0 && (this.data[this.height-1].indexOf(true) == -1)) {
            this.data.pop();
            this.height--;
        }
        while (this.leftFree) this.removeLeft();
        while (this.rightFree) this.removeRight();

    }
    get leftFree() {
        if (this.width == 0) return false;
        for (let i = 0; i < this.height; i++) {
            if (this.data[i][0]) return false;
        }
        return true;
    }
    removeLeft() {
        if (this.width == 0) return;
        for (let i = 0; i < this.height; i++) this.data[i].shift();
        this.width--;
    }
    get rightFree() {
        if (this.width == 0) return false;
        for (let i = 0; i < this.height; i++) {
            if (this.data[i][this.width-1]) return false;
        }
        return true;
    }
    removeRight() {
        if (this.width == 0) return;
        for (let i = 0; i < this.height; i++) this.data[i].pop();
        this.width--;
    }
    log() {
        let text = "";
        for (let y = 0; y < this.height; y++) {
            if (y != 0) text += "\n";
            for (let x = 0; x < this.width; x++) {
                text += this.data[y][x] ? "██" : "  ";
            }
        }
        //console.clear();
        console.log(text);
    }
    nextGeneration() {
        if (!this.fizedSize) this.addBorders();
        let newData = new Array(this.width).fill(false);
        newData = new Array(this.height).fill(newData);
        newData = JSON.parse(JSON.stringify(newData));
        for (let y = 1; y < this.height-1; y++) {
            for (let x = 0; x < this.width; x++) {
                let n = 0;
                if (this.data[y-1][x-1]) n++;
                if (this.data[y-1][x  ]) n++;
                if (this.data[y-1][x+1]) n++;
                if (this.data[y  ][x+1]) n++;
                if (this.data[y+1][x+1]) n++;
                if (this.data[y+1][x  ]) n++;
                if (this.data[y+1][x-1]) n++;
                if (this.data[y  ][x-1]) n++;
                newData[y][x] = (n == 3) || ((n == 2) && this.data[y][x]);
            }
        }
        if (this.height > 1) {
            for (let y = 0; y < this.height; y += this.height-1) {
                for (let x = 0; x < this.width; x++) {
                    if (y == 0) {
                        let n = this.data[y][x-1]+this.data[y][x+1]+this.data[y+1][x-1]+this.data[y+1][x]+this.data[y+1][x+1];
                        newData[y][x] = (n == 3) || ((n == 2) && this.data[y][x]);
                    } else {
                        let n = this.data[y-1][x-1]+this.data[y-1][x]+this.data[y-1][x+1]+this.data[y][x-1]+this.data[y][x+1];
                        newData[y][x] = (n == 3) || ((n == 2) && this.data[y][x]);
                    }
                }
            }
        } else if (this.height == 1) {
            for (let x = 0; x < this.width; x++) {
                let n = this.data[y][x-1]+this.data[y][x+1];
                newData[y][x] = (n == 3) || ((n == 2) && this.data[y][x]);
            }
        }
        this.data = newData;
        if (!this.fizedSize) this.removeBorders();
    }
    findParent() {
        let pos = 0;
        let posX = 1;
        let posY = 1;
        let back = false;
        let parent = new GoL({width: this.width+4, height: this.height+4}, true);
        function updatePos() {
            if (parent.width-2 >= 4) {
                if (pos < (parent.height-2)*3) {
                    posX = pos%3+1;
                    posY = Math.floor(pos/3)+1;
                } else {
                    posX = Math.floor(pos/(parent.height-2))+1;
                    posY = pos%(parent.height-2)+1;
                }
            } else {
                posX = pos%(parent.width-2)+1;
                posY = Math.floor(pos/(parent.width-2))+1;
            }
        };
        function isDefined(x, y) {
            if (x == 0) return true;
            if (y == 0) return true;
            if (x == parent.width-1) return true;
            if (y == parent.height-1) return true;
            if (y > posY) return false;
            if (y < posY) return true;
            if (x > posX) return false;
            return true;
        };
        function getValue(x, y) {
            if (x < 0) return false;
            if (y < 0) return false;
            if (x >= parent.width) return false;
            if (y >= parent.height) return false;
            return parent.data[y][x];
        };
        function getNeighbors(x, y) {
            let min = 0;
            let max = 0;
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    if (dx == 0 && dy == 0) continue;
                    if (isDefined(x+dx, y+dy)) {
                        if (getValue(x+dx, y+dy)) {
                            min++;
                            max++;
                        }
                    } else max++;
                }
            }
            return [min, max];
        };
        function getResult(x, y) {
            let neighborRange = getNeighbors(x, y);
            let mayBe2 = neighborRange[0] <= 2 && neighborRange[1] >= 2;
            let mayBe3 = neighborRange[0] <= 3 && neighborRange[1] >= 3;
            let mayBe2or3 = mayBe2 || mayBe3;
            let mayBeSmaller2 = neighborRange[0] < 2;
            let mayBeSmaller3 = neighborRange[0] < 3;
            let mayBeBigger3 = neighborRange[1] > 3;
            let result = [false, false];
            if (isDefined(x, y)) {
                if (getValue(x, y)) {
                    if (mayBeSmaller2) result[0] = true;
                    if (mayBe2or3) result[1] = true;
                    if (mayBeBigger3) result[0] = true;
                } else {
                    if (mayBeSmaller3) result[0] = true;
                    if (mayBe3) result[1] = true;
                    if (mayBeBigger3) result[0] = true;
                }
            } else {
                if (mayBeSmaller3) result[0] = true;
                if (mayBe2or3) result[1] = true;
                if (mayBeBigger3) result[0] = true;
            }
            return result;
        };
        function resultOk(_this) {
            for (let y = posY-1; y <= posY+1; y++) {
                for (let x = posX-1; x <= posX+1; x++) {
                    let expectedResult;
                    if (x-2 < 0) expectedResult = false;
                    else if (y-2 < 0) expectedResult = false;
                    else if (x-2 >= _this.width) expectedResult = false;
                    else if (y-2 >= _this.height) expectedResult = false;
                    else expectedResult = _this.data[y-2][x-2];
                    if (getResult(x, y)[expectedResult ? 1 : 0] == false) return false;
                }
            }
            return true;
        };
        function bordersOk() {
            for (let x = 1; x < parent.width-1; x += parent.width-3) {
                let number = 0;
                for (let y = 1; y < parent.height-1; y++) {
                    if (getValue(x, y)) number++;
                    else number = 0;
                    if (number == 3) return false;
                }
            }
            for (let y = 1; y < parent.height-1; y += parent.height-3) {
                let number = 0;
                for (let x = 1; x < parent.width-1; x++) {
                    if (getValue(x, y)) number++;
                    else number = 0;
                    if (number == 3) return false;
                }
            }
            return true;
        };
        function next(_this) {
            updatePos();
            if (!back) {
                if (resultOk(_this) && bordersOk()) {
                    pos++;
                    if (pos == (parent.height-2)*(parent.width-2)) {
                        return true;
                    }
                    return false;
                } else {
                    if (!parent.data[posY][posX]) {
                        parent.data[posY][posX] = true;
                        return false;
                    } else {
                        parent.data[posY][posX] = false;
                        back = true;
                        pos--;
                        if (pos < 0) {
                            throw "Error: No solution!";
                        }
                        return false;
                    }
                }
            } else {
                if (!parent.data[posY][posX]) {
                    parent.data[posY][posX] = true;
                    back = false;
                    return false;
                } else {
                    parent.data[posY][posX] = false;
                    pos--;
                    if (pos < 0) {
                        throw "Error: No solution!";
                    }
                    return false;
                }
            }
        };
        while (true) {
            let returnValue = next(this);
            if (returnValue) {
                parent.removeBorders();
                return parent;
            }
        }
    }
    findParents(number) {
        let results = [this];
        for (let i = 0; i < number; i++) {
            results.push(results[i].findParent());
            results[i+1].log();
            console.log(JSON.parse(JSON.stringify(results[i+1].data)));
        }
        return results[number];
    }
    get RLE() {
        let RLE = `x = ${this.width}, y = ${this.height}, rule = b3/s23\n`;
        let elements = "";
        for (let y = 0; y < this.height; y++) {
            if (y != 0) elements += "$";
            for (let x = 0; x < this.width; x++) {
                if (this.data[y].indexOf(true, x) != -1) elements += this.data[y][x] ? "o" : "b";
            }
        }
        elements += "!";
        let strings = [];
        let number = 0;
        let element = null;
        for (let i = 0; i < elements.length; i++) {
            if (elements[i] == element) {
                number++;
            } else {
                if (i != 0) {
                    let string = "";
                    if (number != 1) {
                        string += number.toString();
                    }
                    string += element;
                    strings.push(string);
                }
                element = elements[i];
                number = 1;
            }
        }
        let string = "";
        if (number != 1) {
            string += number.toString();
        }
        string += element;
        strings.push(string);
        let length = 0;
        for (let i = 0; i < strings.length; i++) {
            if (length+strings[i].length <= 70) {
                RLE += strings[i];
                length += strings[i].length;
            } else {
                RLE += "\n";
                length = 0;
                RLE += strings[i];
            }
        }
        return RLE;
    }
    
    static characters5x5 = {
        "A": new GoL([
            [0,1,0],
            [1,0,1],
            [1,1,1],
            [1,0,1],
            [1,0,1]
        ]),
        "B": new GoL([
            [1,1,0],
            [1,0,1],
            [1,1,0],
            [1,0,1],
            [1,1,0]
        ]),
        "C": new GoL([
            [0,1,1,1],
            [1,0,0,0],
            [1,0,0,0],
            [1,0,0,0],
            [0,1,1,1]
        ]),
        "D": new GoL([
            [1,1,0],
            [1,0,1],
            [1,0,1],
            [1,0,1],
            [1,1,0]
        ]),
        "E": new GoL([
            [1,1,1],
            [1,0,0],
            [1,1,0],
            [1,0,0],
            [1,1,1]
        ]),
        "F": new GoL([
            [1,1,1],
            [1,0,0],
            [1,1,0],
            [1,0,0],
            [1,0,0]
        ]),
        "G": new GoL([
            [0,1,1,1],
            [1,0,0,0],
            [1,0,1,1],
            [1,0,0,1],
            [0,1,1,1]
        ]),
        "H": new GoL([
            [1,0,0,0,1],
            [1,0,0,0,1],
            [1,1,1,1,1],
            [1,0,0,0,1],
            [1,0,0,0,1]
        ]),
        "I": new GoL([
            [1],
            [1],
            [1],
            [1],
            [1]
        ]),
        "J": new GoL([
            [0,0,1],
            [0,0,1],
            [0,0,1],
            [0,0,1],
            [1,1,0]
        ]),
        "K": new GoL([
            [1,0,0,1],
            [1,0,1,0],
            [1,1,0,0],
            [1,0,1,0],
            [1,0,0,1]
        ]),
        "L": new GoL([
            [1,0,0,0],
            [1,0,0,0],
            [1,0,0,0],
            [1,0,0,0],
            [1,1,1,1]
        ]),
        "M": new GoL([
            [1,0,0,0,1],
            [1,1,0,1,1],
            [1,0,1,0,1],
            [1,0,0,0,1],
            [1,0,0,0,1]
        ]),
        "N": new GoL([
            [1,0,0,0,1],
            [1,1,0,0,1],
            [1,0,1,0,1],
            [1,0,0,1,1],
            [1,0,0,0,1]
        ]),
        "O": new GoL([
            [0,1,1,0],
            [1,0,0,1],
            [1,0,0,1],
            [1,0,0,1],
            [0,1,1,0]
        ]),
        "P": new GoL([
            [1,1,0],
            [1,0,1],
            [1,1,0],
            [1,0,0],
            [1,0,0]
        ]),
        "Q": new GoL([
            [0,1,1,1,0],
            [1,0,0,0,1],
            [1,0,0,0,1],
            [1,0,0,1,1],
            [0,1,1,1,1]
        ]),
        "R": new GoL([
            [1,1,0],
            [1,0,1],
            [1,1,0],
            [1,0,1],
            [1,0,1]
        ]),
        "S": new GoL([
            [1,1,1],
            [1,0,0],
            [1,1,1],
            [0,0,1],
            [1,1,1]
        ]),
        "T": new GoL([
            [1,1,1],
            [0,1,0],
            [0,1,0],
            [0,1,0],
            [0,1,0]
        ]),
        "U": new GoL([
            [1,0,0,1],
            [1,0,0,1],
            [1,0,0,1],
            [1,0,0,1],
            [0,1,1,0]
        ]),
        "V": new GoL([
            [1,0,0,0,1],
            [1,0,0,0,1],
            [0,1,0,1,0],
            [0,1,0,1,0],
            [0,0,1,0,0]
        ]),
        "W": new GoL([
            [1,0,0,0,1],
            [1,0,0,0,1],
            [1,0,1,0,1],
            [1,0,1,0,1],
            [0,1,0,1,0]
        ]),
        "X": new GoL([
            [1,0,0,0,1],
            [1,1,0,1,1],
            [0,1,1,1,0],
            [1,1,0,1,1],
            [1,0,0,0,1]
        ]),
        "Y": new GoL([
            [1,0,0,0,1],
            [0,1,0,1,0],
            [0,0,1,0,0],
            [0,0,1,0,0],
            [0,0,1,0,0]
        ]),
        "Z": new GoL([
            [1,1,1],
            [0,0,1],
            [0,1,0],
            [1,0,0],
            [1,1,1]
        ])
    };
}