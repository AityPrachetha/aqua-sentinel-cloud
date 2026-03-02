const canvas = document.getElementById("slam");
const ctx = canvas.getContext("2d");

/* ===============================
   GRID SETTINGS
================================*/

const GRID = 120;
const CELL = canvas.width / GRID;

let explored = new Set();
let fixedObstacles = [];

let origin = null;

/* ===============================
   ROBOT STATE
================================*/

let robot = {
 x: GRID/2,
 y: GRID/2
};

/* ===============================
   GPS → LOCAL GRID
================================*/

const METERS_PER_DEGREE = 111000;
const SCALE = 0.35;

function gpsToGrid(lat, lon){

 if(!origin){
   origin = {lat, lon};
 }

 let dx =
 (lon-origin.lon) *
 METERS_PER_DEGREE *
 Math.cos(lat*Math.PI/180);

 let dy =
 (lat-origin.lat) *
 METERS_PER_DEGREE;

 dx *= SCALE;
 dy *= SCALE;

 let gx = Math.floor(GRID/2 + dx);
 let gy = Math.floor(GRID/2 - dy);

 gx = Math.max(5,Math.min(GRID-5,gx));
 gy = Math.max(5,Math.min(GRID-5,gy));

 return {gx,gy};
}

/* ===============================
   LOAD REAL OBSTACLES
================================*/

async function loadObstacles(){

 const res = await fetch("/predict");
 const data = await res.json();

 fixedObstacles = data.map(o=>{

   return {
     gx: GRID/2 + Math.floor(o.x/20),
     gy: GRID/2 + Math.floor(o.z/20)
   };

 });
}

/* ===============================
   UPDATE ROBOT FROM ARGO
================================*/

async function updateRobot(){

 const res = await fetch("/argo");
 const d = await res.json();

 const g = gpsToGrid(d.lat,d.lon);

 robot.x = g.gx;
 robot.y = g.gy;

 exploreArea();

 if(fixedObstacles.length===0){
   loadObstacles();
 }
}

/* ===============================
   SLAM EXPLORATION
================================*/

function exploreArea(){

 for(let dx=-5;dx<=5;dx++){
  for(let dy=-5;dy<=5;dy++){

   const x = robot.x + dx;
   const y = robot.y + dy;

   explored.add(`${x},${y}`);
  }
 }
}

/* ===============================
   DRAW MAP
================================*/

function draw(){

 ctx.fillStyle="#021018";
 ctx.fillRect(0,0,canvas.width,canvas.height);

 /* explored */
 explored.forEach(c=>{
  const [x,y]=c.split(",");

  ctx.fillStyle="#0b3a46";
  ctx.fillRect(
   x*CELL,
   y*CELL,
   CELL,
   CELL
  );
 });

 /* FIXED THREATS */
 ctx.fillStyle="red";

 fixedObstacles.forEach(o=>{
  ctx.fillRect(
   o.gx*CELL,
   o.gy*CELL,
   CELL,
   CELL
  );
 });

 /* ROBOT */
 ctx.fillStyle="cyan";
 ctx.beginPath();
 ctx.arc(
  robot.x*CELL,
  robot.y*CELL,
  5,
  0,
  Math.PI*2
 );
 ctx.fill();

 drawRadarRing();

 updateStats();
}

/* ===============================
   ROBOT SONAR RING
================================*/

function drawRadarRing(){

 ctx.strokeStyle="rgba(0,255,255,0.4)";
 ctx.beginPath();
 ctx.arc(
  robot.x*CELL,
  robot.y*CELL,
  25,
  0,
  Math.PI*2
 );
 ctx.stroke();
}

/* ===============================
   STATS
================================*/

function updateStats(){

 document.getElementById("mapped")
 .innerText = explored.size;

 document.getElementById("obstacles")
 .innerText = fixedObstacles.length;

 const coverage =
 (explored.size/(GRID*GRID))*100;

 document.getElementById("coverage")
 .innerText =
 coverage.toFixed(2)+"%";
}

/* ===============================
   MAIN LOOP
================================*/

setInterval(updateRobot,1500);

function loop(){
 draw();
 requestAnimationFrame(loop);
}

loop();