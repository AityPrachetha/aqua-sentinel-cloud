const canvas = document.getElementById("slam");
const ctx = canvas.getContext("2d");

/* ===============================
GRID SETTINGS
=============================== */

const GRID = 160;
const CELL = canvas.width / GRID;

/* ===============================
MAP MEMORY
=============================== */

let explored = new Set();
let fixedObstacles = [];

let robot = {x:80,y:80};
let origin=null;

/* ===============================
REALISTIC TERRAIN GENERATOR
=============================== */

function generateTerrain(){

 for(let i=0;i<500;i++){

   const x=Math.floor(Math.random()*GRID);
   const y=Math.floor(Math.random()*GRID);

   fixedObstacles.push({x,y});
 }
}

generateTerrain();

/* ===============================
GPS → GRID CONVERSION
=============================== */

const METERS=111000;
const SCALE=0.25;

function gpsToGrid(lat,lon){

 if(!origin)
   origin={lat,lon};

 let dx=(lon-origin.lon)*METERS;
 let dy=(lat-origin.lat)*METERS;

 dx*=SCALE;
 dy*=SCALE;

 return{
  x:Math.floor(GRID/2+dx),
  y:Math.floor(GRID/2-dy)
 };
}

/* ===============================
REAL ROBOT MOTION (ARGO)
=============================== */

async function updateRobot(){

 const res=await fetch("/argo");
 const d=await res.json();

 const g=gpsToGrid(d.lat,d.lon);

 robot.x+= (g.x-robot.x)*0.2;
 robot.y+= (g.y-robot.y)*0.2;

 sonarScan();
}

/* ===============================
SONAR SCAN
=============================== */

function sonarScan(){

 const radius=8;

 for(let dx=-radius;dx<=radius;dx++){
  for(let dy=-radius;dy<=radius;dy++){

   const x=Math.floor(robot.x+dx);
   const y=Math.floor(robot.y+dy);

   explored.add(`${x},${y}`);
  }
 }
}

/* ===============================
DRAW MAP
=============================== */

function draw(){

 ctx.fillStyle="#021018";
 ctx.fillRect(0,0,canvas.width,canvas.height);

 /* explored */
 explored.forEach(c=>{
   const [x,y]=c.split(",");

   ctx.fillStyle="#083642";
   ctx.fillRect(
     x*CELL,
     y*CELL,
     CELL,
     CELL
   );
 });

 /* obstacles FIXED */
 ctx.fillStyle="red";

 fixedObstacles.forEach(o=>{
   ctx.fillRect(
     o.x*CELL,
     o.y*CELL,
     CELL,
     CELL
   );
 });

 /* robot */
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
ROBOT RADAR RING
=============================== */

function drawRadarRing(){

 ctx.strokeStyle="cyan";
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
=============================== */

function updateStats(){

 document.getElementById("mapped")
 .innerText=explored.size;

 document.getElementById("obstacles")
 .innerText=fixedObstacles.length;

 const coverage=
 (explored.size/(GRID*GRID))*100;

 document.getElementById("coverage")
 .innerText=coverage.toFixed(2)+"%";
}

/* ===============================
MAIN LOOP
=============================== */

setInterval(updateRobot,1200);

function loop(){
 draw();
 requestAnimationFrame(loop);
}

loop();