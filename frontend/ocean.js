window.addEventListener("load", () => {

let time=[], temp=[], depth=[], pressure=[], salinity=[], density=[];
const MAX_POINTS = 20;

/* ========= METRIC ELEMENTS ========= */

const tempEl = document.getElementById("temp");
const pressureEl = document.getElementById("pressure");
const salinityEl = document.getElementById("salinity");
const densityEl = document.getElementById("density");
const currentEl = document.getElementById("current");
const depthEl = document.getElementById("depth");


/* ========= CHART CREATOR ========= */

function createChart(id,title,color,xLabel,yLabel,reverse=false){

const ctx=document.getElementById(id).getContext("2d");

return new Chart(ctx,{
type:"line",
data:{
labels:[],
datasets:[{
data:[],
borderColor:color,
backgroundColor:color+"22",
borderWidth:3,
pointRadius:3,
tension:.35,
fill:true
}]
},
options:{
responsive:true,
maintainAspectRatio:false,
plugins:{
legend:{display:false},
title:{display:true,text:title,color:"#00e5ff"}
},
scales:{
x:{title:{display:true,text:xLabel,color:"#fff"}},
y:{title:{display:true,text:yLabel,color:"#fff"},reverse:reverse}
}
}
});
}


/* ========= CREATE CHARTS ========= */

const depthTempChart=createChart(
"depthTempChart",
"Temperature vs Depth",
"yellow",
"Depth",
"Temp",
true
);

const pressureChart=createChart(
"pressureChart",
"Pressure vs Time",
"#00e5ff",
"Time",
"Pressure"
);

const salinityChart=createChart(
"salinityChart",
"Salinity vs Depth",
"#00e5ff",
"Depth",
"Salinity",
true
);

const densityChart=createChart(
"densityChart",
"Density vs Depth",
"#00ff88",
"Depth",
"Density",
true
);


/* ========= FETCH DATA ========= */

async function updateOcean(){

try{

const res=await fetch("/argo");
if(!res.ok) throw new Error("Server error");

const d=await res.json();
const now=new Date().toLocaleTimeString();

/* STORE */
time.push(now);
temp.push(d.temp);
depth.push(d.depth);
pressure.push(d.pressure);
salinity.push(d.salinity);
density.push(d.density);

/* LIMIT */
if(time.length>MAX_POINTS){
time.shift();
temp.shift();
depth.shift();
pressure.shift();
salinity.shift();
density.shift();
}

/* METRICS */
tempEl.innerText=d.temp.toFixed(2)+" °C";
pressureEl.innerText=d.pressure.toFixed(2)+" bar";
salinityEl.innerText=d.salinity.toFixed(2)+" PSU";
densityEl.innerText=d.density.toFixed(2)+" kg/m³";
currentEl.innerText=d.current.toFixed(2)+" m/s";
depthEl.innerText=d.depth.toFixed(0)+" m";

/* UPDATE CHARTS */

depthTempChart.data.labels=depth;
depthTempChart.data.datasets[0].data=temp;

pressureChart.data.labels=time;
pressureChart.data.datasets[0].data=pressure;

salinityChart.data.labels=depth;
salinityChart.data.datasets[0].data=salinity;

densityChart.data.labels=depth;
densityChart.data.datasets[0].data=density;

depthTempChart.update();
pressureChart.update();
salinityChart.update();
densityChart.update();

}catch(e){
console.error("ARGO ERROR:",e);
}

}

setInterval(updateOcean,2000);
updateOcean();

});