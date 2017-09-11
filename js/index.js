const url = "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json"
const margin = {top: 100, right: 90, bottom: 20, left: 75}
let width = window.innerWidth*.85-margin.left-margin.right,
    height = window.innerHeight*.85-margin.top-margin.bottom;

let yearFormat=d3.timeParse("%Y")
let monthFormat=d3.timeParse("%m")
let monthParse = d3.timeFormat("%B")
const colorObj={
  2.7:"#5E4FA6",
  3.9:"#3586BE",
  5:"#65C2A5",
  6.1:"#AEDCA8",
  7.2:"#E6F49C",
  8.3:"#FFFDC4",
  9.4:"#FDE185",
  10.5:"#FFAE5A",
  11.6:"#F07046",
  12.7:"#D83C50",
  "default":"#9D0140"
}
const colorKey=[2.7,3.9,5,6.1,7.2,8.3,9.4,10.5,11.6,12.7]

let x = d3.scaleLinear()//x axis scale for d3 interpretation
    .range([0,width]);
let y = d3.scaleLinear()//y axis scale for d3 interpretation
    .range([0,height]);

let x2=d3.scaleTime()
    .rangeRound([0, width]);
let y2=d3.scaleTime()
    .range([0, height])
let xAxis = d3.axisBottom(x2)//xaxis display properties
    .ticks(10)
let yAxis = d3.axisLeft(y2)//yaxis display properties
    .tickFormat(monthParse);
let toolTipDiv = d3.select("body").append("div")//toolTip div definition, definition in css sheet would not work for me???
            .attr("class", "toolTip")
            .style("position", "absolute")
            .style("padding", "5px")
            .style("color", "darkgreen")
            .style("background-color", "white")
            .style("font-size", "18px")
            .style("border-radius", "3px")
            .style("text-align", "center")
            .style("visibility", "hidden");

let chart = d3.select(".chart")//main chart definition
    .attr("width", width + margin.left + margin.right)//margins added for axis
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.json(url,function(error,heatData){//use d3's own json capabilites to get data
  if (error) throw error;
  //restructure data to make it easier to extract needed info
  const baseTemp = heatData.baseTemperature
  let transposedHeat = heatData.monthlyVariance
  let xDataRange = d3.extent(transposedHeat, function(d) { return d.year})
  let yDataRange = d3.extent(transposedHeat, function(d) { return d.month})

  x.domain(xDataRange)
  y.domain(yDataRange)

  x2.domain(xDataRange.map((d)=>yearFormat(d)))
  y2.domain(yDataRange.map((d)=>monthFormat(d)))
  console.log(yDataRange.map((d)=>monthFormat(d)))
  let barHeight = height/(yDataRange[1]-yDataRange[0])
  let barWidth = width/(xDataRange[1]-xDataRange[0])

  //start drawing rectangles
  let rectGrouping = chart.selectAll("g")
      .data(transposedHeat)
      .enter().append("g")
      .attr("transform", function(d, i) { return "translate(" + x(d.year) + "," + (y(d.month)-barHeight)+ ")"; });
  rectGrouping.append("rect")
      .attr("width",barWidth)
      .attr("height",barHeight)
      .attr("fill",function(d){return getHeatColor(d.variance+baseTemp)})
      .on("mouseover", function(d) {//tool tip functionality
         toolTipDiv.html("<strong>" + d.year + " - " + monthParse(monthFormat(d.month)) +"<br/>" + (baseTemp+d.variance).toFixed(3)+" ℃" + "<br/>" + d.variance+" ℃")
           .style("left", (d3.event.pageX) + "px")
           .style("top", (d3.event.pageY+40) + "px")
           .style("visibility", "visible");
         })
       .on("mouseout", function(d) {
         toolTipDiv.style("visibility", "hidden");
         });

 chart.append("g")//add yaxis
     .attr("class", "xaxis")
     .attr("transform", "translate(0," + (height) + ")")
     .call(xAxis);
 chart.append("g")//add yaxis
     .attr("class", "yaxis")
     .attr("transform", "translate(0," + (-0.5*barHeight) + ")")
     .call(yAxis)

})

drawScale()
function drawScale(){
  let scaleColors = colorKey.map((key)=>colorObj[key]);
  scaleColors.push(colorObj["default"])
  let standardFontSize = Math.pow((Math.pow(width,2)+Math.pow(height,2)),0.5)*0.01
  console.log(standardFontSize)
  for (let i=0;i<scaleColors.length;i++){
      chart.append("rect")
        .attr("x",(width*1.02))
        .attr("y",((i*20)-(height*.09)))
        .attr("width",width*.03)
        .attr("height",20)
        .attr("fill",scaleColors[i])
  }
  for (let i=0;i<colorKey.length+1;i++){
      let txtval;
      if (i===colorKey.length){txtval=">" + colorKey[i-1]}
      else{txtval=colorKey[i]}
      chart.append("text")
        .attr("x",(width*1.06))
        .attr("y",((i*20)-(height*.065)))
        .attr("text-anchor", "left")
        .style("font-size", standardFontSize)
        .style("fill", "white")
        .text(txtval)
  }
chart.append("text")
  .attr("x",width*.5)
  .attr("y",-75)
  .attr("text-anchor", "middle")
  .style("font-size", standardFontSize*3)
  .style("fill", "white")
  .text("Monthly Global Land-Surface Temperature")
  .style("cursor","pointer")
  .on("click",function(){window.open(url,"_blank")})
}

function getHeatColor(temp) {
  for(let i=0;i<colorKey.length;i++){
      if (temp<colorKey[i]){return colorObj[colorKey[i]]}
  }

  return colorObj["default"];
}
