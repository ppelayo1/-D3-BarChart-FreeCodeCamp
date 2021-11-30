//constants
const URL = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json';

const CONSTANTS = {
    URL:URL,
    SVG_WRAPPER_ID:'#graphWrapper',
    HEIGHT:400,
    WIDTH:900,
    LEFT_PADDING:60, //the ammount of padding from the left of the graph
    TOP_PADDING:50, //Amount of padding from the top of the graph
    RIGHT_PADDING:30, //The amount of padding from the right of the graph
    BOTTOM_PADDING:20 //The amount of padding from the bottom of the graph
};

function main (data){
    //make the http request
    let inputData = Object.assign({},data);
    console.log(data);
    
    
    //build the toolTip
    buildToolTip();
    
    //build the graph
    buildGraph(inputData);
    
    //Display more info text
    moreInfoText(data.display_url);
    
    
};

(function makeHttpRequest(){
    let url = CONSTANTS.URL;
    let data = '';
    let xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function (){
        if(this.readyState == 4 && this.status == 200){
            data = xhttp.responseText;
            main(JSON.parse(data));
        }
    }

    xhttp.open('GET',url,true);
    xhttp.send();
    
    
}());

function moreInfoText(url){
    let x = 450;
    let y = CONSTANTS.HEIGHT;
    
    d3.select('svg')
        .append('text')
        .text('More Information:  ')
        .attr('x',x)
        .attr('y',y)
        .attr('id','moreInfo')
        .append('a')
        .html(url)
        .attr('href',url)
        .style('fill','blue')
        .attr('target','_blank')
}

//builds a toolTip, places a div on the body
function buildToolTip(){
    d3.select('body')
    .append('div')
    .attr('id','tooltip')
    .style('opacity',0);
}

function buildGraph(data){
    let inputData = Object.assign({},data);
    
    //build the svg element
    d3.select('#graphWrapper')
        .append('svg')
        .attr('width',CONSTANTS.WIDTH)
        .attr('height',CONSTANTS.HEIGHT);
    
    let svg= d3.select('svg');
    let dataSet = inputData.data;      //The dataset of the date and GDP value
   
    let scales = buildScales(dataSet); //Get an object of the scales
    
    //Build the axis
    buildAxis(scales);
    
    //Build the bars
    buildBars(scales,dataSet);
}

//Builds the scales and returns them as an Object
function buildScales(data){
    
    let years = [];                 //Holds the years as an integer in the array, used to build the X Axis
    
    //populate array with integer of years
    for(let i = 0; i < data.length;i++){
        years.push(Number.parseInt(data[i][0].slice(0,4)));
    }

    //build the scales    
    let yScaleData = d3.scaleLinear();              //data Scale
    yScaleData.domain([0,d3.max(data,d=>d[1])]);
    yScaleData.range([0,CONSTANTS.HEIGHT - CONSTANTS.TOP_PADDING]);
    
    let yScaleAxis = d3.scaleLinear();           //Axis Scale
    yScaleAxis.domain([d3.max(data,d=>d[1]) , 0]);
    yScaleAxis.range([0,CONSTANTS.HEIGHT - CONSTANTS.TOP_PADDING]);
    
    let xScaleData = d3.scaleTime();             //data Scale
    xScaleData.domain([new Date(getYear(data[0][0]),0), new Date(getYear(data[data.length-1][0]),0)])
    xScaleData.range([CONSTANTS.LEFT_PADDING,CONSTANTS.WIDTH - CONSTANTS.RIGHT_PADDING]);
    xScaleData.ticks(d3.timeYear.every(1));
    
    let xScaleAxis = d3.scaleLinear();             //Axis Scale
    xScaleAxis.domain([getYear(data[0][0]),getYear(data[data.length-1][0])]);
    xScaleAxis.range([CONSTANTS.LEFT_PADDING,CONSTANTS.WIDTH - CONSTANTS.RIGHT_PADDING]);
    
    return {
        yScaleData:yScaleData,
        yScaleAxis:yScaleAxis,
        xScaleData:xScaleData,
        xScaleAxis:xScaleAxis
    };
}

function buildAxis(scales){
    let svg= d3.select('svg');
    let xAxis = d3.axisBottom(scales.xScaleData);
    let yAxis = d3.axisLeft(scales.yScaleAxis);
    let bottomPadding = 20;
    
    svg.append('g')
    .attr('id','x-axis')
    .attr('transform','translate(0,'+ (CONSTANTS.HEIGHT - bottomPadding - CONSTANTS.BOTTOM_PADDING) + ')')
    .call(xAxis);
    
    svg.append('g')
    .attr('id','y-axis')
    .attr('transform','translate('+ CONSTANTS.LEFT_PADDING +','+(CONSTANTS.TOP_PADDING - bottomPadding - CONSTANTS.BOTTOM_PADDING) +')')
    .call(yAxis);
}

function buildBars(scales,dataSet){
    let svg= d3.select('svg');
    let bottomPadding = -20;

    svg.selectAll('rect')
        .data(dataSet)
        .enter()
        .append('rect')
        .attr('x',(d,i)=> scales.xScaleData(new Date(getYear(dataSet[i][0]),getMonth(dataSet[i][0]),1)))
        .attr('y',d=> bottomPadding + CONSTANTS.HEIGHT - scales.yScaleData(d[1]) - CONSTANTS.BOTTOM_PADDING)
        .attr('width',5)
        .attr('height',d=>scales.yScaleData(d[1]))
        .attr('class','bar')
        .attr('data-date',d=>d[0])
        .attr('data-gdp',d=>d[1])
        .on('mouseover',addToolTip)
        .on('mouseout',removeToolTip)
}

//helper functions
//returns the year as an integer
function getYear(dataDate){
    let year = dataDate.slice(0,4);
    year = Number.parseInt(year);
    
    return year;
}

//returns month as an integer --note 0 is january -- 
//return month-1 as integer
function getMonth(dateData){
    let month = dateData.slice(5,7);
    month = Number.parseInt(month);
    month--;
    
    return month;
}
//adds the tool tip
function addToolTip(d){
    let toolTip = d3.select('#tooltip');
    let xPos = d3.event.clientX;
    let yPos = d3.event.clientY;
    let leftPadding = 20;
  
    toolTip.style('opacity',0.75);
    toolTip.html('$' + d[1] + '<br>' + d[0]);
    toolTip.style('left',d3.touches);
    toolTip.style('left',xPos + leftPadding + 'px');
    toolTip.style('top',yPos + 'px');
    toolTip.attr('data-date',d[0]);
}
//removes the tool tip
function removeToolTip(){
    let toolTip = d3.select('#tooltip');
    toolTip.style('opacity',0);
}
