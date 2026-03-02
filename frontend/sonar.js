const canvas = document.getElementById("radar");
const ctx = canvas.getContext("2d");

const R = canvas.width/2;
let sweep=0;
let currentFilter="ALL";


// ================= FETCH DATA =================
async function getData(){
 const res=await fetch("/predict");
 const data=await res.json();
 drawRadar(data);
 updateList(data);
 updateCounts(data);
}


// ================= RADAR =================
function drawRadar(data){

 ctx.clearRect(0,0,canvas.width,canvas.height);

 // circle
 ctx.fillStyle="#03131c";
 ctx.beginPath();
 ctx.arc(R,R,R,0,Math.PI*2);
 ctx.fill();

 // rings
 ctx.strokeStyle="#0aa";
 for(let i=1;i<=3;i++){
  ctx.beginPath();
  ctx.arc(R,R,(R*i)/3,0,Math.PI*2);
  ctx.stroke();

  ctx.fillStyle="#0aa";
  ctx.fillText(i*100+"m",R+5,R-(R*i)/3);
 }

 // compass
 ctx.fillText("N",R-5,15);
 ctx.fillText("S",R-5,canvas.height-5);
 ctx.fillText("W",5,R);
 ctx.fillText("E",canvas.width-15,R);

 // sweep beam
 sweep+=0.02;
 const g=ctx.createRadialGradient(R,R,0,R,R,R);
 g.addColorStop(0,"rgba(0,255,255,.4)");
 g.addColorStop(1,"transparent");

 ctx.fillStyle=g;
 ctx.beginPath();
 ctx.moveTo(R,R);
 ctx.arc(R,R,R,sweep,sweep+.4);
 ctx.closePath();
 ctx.fill();

 // center robot
 ctx.fillStyle="yellow";
 ctx.beginPath();
 ctx.arc(R,R,6,0,Math.PI*2);
 ctx.fill();

 // contacts
 data.forEach(o=>{

  if(currentFilter!="ALL" && o.status!=currentFilter) return;

  const x=R+(o.x/6000)*R;
  const y=R+(o.z/6000)*R;

  ctx.fillStyle=
   o.status=="THREAT"?"red":
   o.status=="FRIENDLY"?"lime":
   o.status=="UNKNOWN"?"yellow":
   "gray";

  ctx.beginPath();
  ctx.arc(x,y,5,0,Math.PI*2);
  ctx.fill();
 });
}


// ================= CONTACT LIST =================
function updateList(data){

 const list=document.getElementById("list");
 list.innerHTML="";

 data.forEach(o=>{

  if(currentFilter!="ALL" && o.status!=currentFilter) return;

  const dist=Math.sqrt(o.x*o.x+o.z*o.z).toFixed(0);
  const angle=Math.atan2(o.x,o.z)*180/Math.PI|0;

  const div=document.createElement("div");

  div.className="glass glow rounded-xl p-4 flex justify-between";

  div.innerHTML=`
   <div>
    <div class="text-cyan-300 font-semibold">ID-${o.id}</div>
    <div class="text-xs text-cyan-500">
     ${angle}° • ${dist}m • ${(Math.random()*5).toFixed(1)}kn
    </div>
   </div>

   <div class="font-bold
    ${o.status=="THREAT"?"text-red-400":
      o.status=="FRIENDLY"?"text-green-400":
      o.status=="UNKNOWN"?"text-yellow-300":
      "text-gray-400"}">
    ${o.status}
   </div>
  `;

  list.appendChild(div);
 });
}


// ================= COUNTS =================
function updateCounts(data){

 const c={FRIENDLY:0,UNKNOWN:0,THREAT:0,OBSTACLE:0};

 data.forEach(o=>{
  if(c[o.status]!=undefined) c[o.status]++;
 });

 document.getElementById("cF").innerText=c.FRIENDLY;
 document.getElementById("cU").innerText=c.UNKNOWN;
 document.getElementById("cT").innerText=c.THREAT;
 document.getElementById("cO").innerText=c.OBSTACLE;
}


// ================= FILTER =================
document.querySelectorAll(".tab").forEach(btn=>{
 btn.onclick=()=>{
  currentFilter=btn.dataset.filter;
 };
});


// ================= LOOP =================
setInterval(getData,1000);
getData();