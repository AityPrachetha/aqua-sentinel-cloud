const radar = document.getElementById("radar");
const ctx = radar.getContext("2d");
const R = radar.width/2;
const MAX_RANGE = 6000;
let sweep = 0;
// ================= ENVIRONMENT =================
async function updateEnvironment(){
 const res = await fetch("/argo");
 const d = await res.json();
 document.getElementById("lat").innerText = d.lat.toFixed(2)+"°";
 document.getElementById("lon").innerText = d.lon.toFixed(2)+"°";
 document.getElementById("depth").innerText = d.depth+" m";
 document.getElementById("temp").innerText = d.temp.toFixed(1)+" °C";
}
// ================= TARGET DATA =================
async function updateTargets(){
 const res = await fetch("/predict");
 const data = await res.json();
 document.getElementById("contactCount").innerText =
  data.length + " contacts";
 drawRadar(data);
}
// ================= RADAR DRAW =================
function drawRadar(data){
 ctx.clearRect(0,0,radar.width,radar.height);
 // background
 ctx.fillStyle="#020b12";
 ctx.beginPath();
 ctx.arc(R,R,R,0,Math.PI*2);
 ctx.fill();

 // rings
 ctx.strokeStyle="#044";
 ctx.lineWidth=1;
 for(let i=1;i<=4;i++){
  ctx.beginPath();
  ctx.arc(R,R,(R*i)/4,0,Math.PI*2);
  ctx.stroke();
 }
 // crosshair
 ctx.strokeStyle="#044";
 ctx.beginPath();
 ctx.moveTo(0,R);
 ctx.lineTo(radar.width,R);
 ctx.moveTo(R,0);
 ctx.lineTo(R,radar.height);
 ctx.stroke();

 // sweep
 sweep += 0.03;

 ctx.strokeStyle="#00ffaa";
 ctx.lineWidth=2;
 ctx.beginPath();
 ctx.moveTo(R,R);
 ctx.lineTo(
  R + Math.cos(sweep)*R,
  R + Math.sin(sweep)*R
 );
 ctx.stroke();


 // ROBOT CENTER
 ctx.fillStyle="yellow";
 ctx.beginPath();
 ctx.arc(R,R,6,0,Math.PI*2);
 ctx.fill();


 // TARGETS
 data.forEach(o=>{
  const dist = Math.sqrt(o.x*o.x + o.z*o.z);
  if(dist>MAX_RANGE) return;
  const x = R + (o.x/MAX_RANGE)*R;
  const y = R + (o.z/MAX_RANGE)*R;
  ctx.fillStyle =
   o.alert ? "orange" :
   o.status==="THREAT" ? "red" :
   "lime";

  ctx.beginPath();
  ctx.arc(x,y,4,0,Math.PI*2);
  ctx.fill();
 });

}
// ================= LOOPS =================
setInterval(updateTargets,1000);
setInterval(updateEnvironment,2000);
updateTargets();
updateEnvironment();