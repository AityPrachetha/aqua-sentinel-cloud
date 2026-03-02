const canvas = document.getElementById("grid");
const ctx = canvas.getContext("2d");

const GRID = 40;
const CELL = canvas.width / GRID;

let grid = [];
let robot = { x: 2, y: 2 };
let goal = { x: 35, y: 35 };

let path = [];
let animationIndex = 0;

// ================= INIT GRID =================
function initGrid() {
    
     grid = [];

    for (let i = 0; i < GRID; i++) {
        grid[i] = [];
        for (let j = 0; j < GRID; j++) {
            grid[i][j] = 0;   // Everything is free
        }
    }

    // Add random obstacles for demo
    for (let i = 0; i < 200; i++) {
        let x = Math.floor(Math.random() * GRID);
        let y = Math.floor(Math.random() * GRID);
        grid[x][y] = 1;
    }
}

// ================= CONVERT LAT/LON =================
function convert(lat, lon) {

    const originLat = 32.40;
    const originLon = -41.25;
    const scale = 200;

    let x = Math.floor((lon - originLon) * scale + GRID/2);
    let y = Math.floor((lat - originLat) * scale + GRID/2);

    return {
        x: Math.max(1, Math.min(GRID-2, x)),
        y: Math.max(1, Math.min(GRID-2, y))
    };
}

// ================= GENERATE PATH BUTTON =================
function generatePath() {

    initGrid();

    const startLat = parseFloat(document.getElementById("startLat").value);
    const startLon = parseFloat(document.getElementById("startLon").value);
    const goalLat  = parseFloat(document.getElementById("goalLat").value);
    const goalLon  = parseFloat(document.getElementById("goalLon").value);

    if (isNaN(startLat) || isNaN(startLon) || isNaN(goalLat) || isNaN(goalLon)) {
        alert("Please enter valid coordinates");
        return;
    }

    const startPos = convert(startLat, startLon);
    const goalPos  = convert(goalLat, goalLon);

    robot = startPos;
    goal  = goalPos;

    path = aStar(robot, goal);
    animationIndex = 0;

    displayWaypoints();
    draw();
}

// ================= A* =================
function heuristic(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function getNeighbors(node) {
    const dirs = [
    {x:1,y:0},{x:-1,y:0},
    {x:0,y:1},{x:0,y:-1},
    {x:1,y:1},{x:-1,y:-1},
    {x:1,y:-1},{x:-1,y:1}
];

    let neighbors = [];

    dirs.forEach(d => {
        let nx = node.x + d.x;
        let ny = node.y + d.y;

        if (nx >= 0 && nx < GRID &&
            ny >= 0 && ny < GRID &&
            grid[nx][ny] === 0) {
            neighbors.push({x:nx,y:ny});
        }
    });

    return neighbors;
}

function aStar(start, goal) {

    let open = [start];
    let cameFrom = {};
    let gScore = {};
    let fScore = {};

    gScore[`${start.x},${start.y}`] = 0;
    fScore[`${start.x},${start.y}`] = heuristic(start, goal);

    while (open.length > 0) {

        open.sort((a,b) =>
            fScore[`${a.x},${a.y}`] - fScore[`${b.x},${b.y}`]
        );

        let current = open.shift();

        if (current.x === goal.x &&
            current.y === goal.y) {

            let totalPath = [current];
            while (`${current.x},${current.y}` in cameFrom) {
                current = cameFrom[`${current.x},${current.y}`];
                totalPath.unshift(current);
            }
            return totalPath;
        }

        getNeighbors(current).forEach(neighbor => {

            let tentative =
                gScore[`${current.x},${current.y}`] + 1;

            let key = `${neighbor.x},${neighbor.y}`;

            if (!(key in gScore) ||
                tentative < gScore[key]) {

                cameFrom[key] = current;
                gScore[key] = tentative;
                fScore[key] =
                    tentative + heuristic(neighbor, goal);

                if (!open.find(n =>
                    n.x === neighbor.x &&
                    n.y === neighbor.y)) {
                    open.push(neighbor);
                }
            }
        });
    }

    return [];
}

// ================= DRAW =================
function draw() {

    ctx.clearRect(0,0,canvas.width,canvas.height);

    for (let x = 0; x < GRID; x++) {
    for (let y = 0; y < GRID; y++) {

        if (grid[x][y] === 1) {
            ctx.fillStyle = "#2d2d2d";  // building
        } else {
            ctx.fillStyle = "#0b2a3a";  // terrain
        }

        ctx.fillRect(x*CELL, y*CELL, CELL, CELL);

        // 👇 ADD GRID LINE HERE
        ctx.strokeStyle = "rgba(0,255,255,0.05)";
        ctx.strokeRect(x*CELL, y*CELL, CELL, CELL);
    }
}
    // Draw path
    ctx.strokeStyle = "#00ff88";
    ctx.lineWidth = 3;
    ctx.beginPath();

    if (path.length > 0) {
        ctx.moveTo(
            path[0].x*CELL + CELL/2,
            path[0].y*CELL + CELL/2
        );
    }

    for (let i=1; i<animationIndex; i++) {
        ctx.lineTo(
            path[i].x*CELL + CELL/2,
            path[i].y*CELL + CELL/2
        );
    }

    ctx.stroke();

    // Robot
    ctx.fillStyle = "cyan";
    ctx.beginPath();
    ctx.arc(
        robot.x*CELL + CELL/2,
        robot.y*CELL + CELL/2,
        6,0,Math.PI*2
    );
    ctx.fill();

    // Goal
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.arc(
        goal.x*CELL + CELL/2,
        goal.y*CELL + CELL/2,
        7,0,Math.PI*2
    );
    ctx.fill();
}

// ================= SIMULATE =================
function simulate() {

    if (path.length === 0) {
        document.getElementById("status").innerText = "Generate Path First";
        return;
    }

    animationIndex = 0;

    function animate() {

        if (animationIndex < path.length) {

            robot = path[animationIndex];
            animationIndex++;

            draw();

            setTimeout(animate, 30);  // Speed control
        }
        else {
            document.getElementById("status").innerText = "Destination Reached";
        }
    }

    animate();
}

// ================= RESET =================
function resetPath() {
    animationIndex = 0;
    draw();
}

// ================= INITIAL DRAW =================
initGrid();
draw();