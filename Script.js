var extensionName = "Sankey"; 
var Sankey_Path = Qva.Remote + "?public=only&name=Extensions/" + extensionName +"/";
function extension_Init()
{
	// Use QlikView's method of loading other files needed by an extension. These files should be added to your extension .zip file (.qar)
	if (typeof jQuery == 'undefined') {
	    Qva.LoadScript(Sankey_Path + 'jquery.js', extension_Done);
	}
	else {
	    extension_Done();
	}        
    
    //If more than one script is needed you can nest the calls to get them loaded in the correct order
    Qva.LoadScript(Sankey_Path + "d3.min.js", function() {
    Qva.LoadScript(Sankey_Path + "d3.sankey.js", extension_Done);
    });

}
if (Qva.Mgr.mySelect == undefined) {
    Qva.Mgr.mySelect = function (owner, elem, name, prefix) {
        if (!Qva.MgrSplit(this, name, prefix)) return;
        owner.AddManager(this);
        this.Element = elem;
        this.ByValue = true;
 
        elem.binderid = owner.binderid;
        elem.Name = this.Name;
 
        elem.onchange = Qva.Mgr.mySelect.OnChange;
        elem.onclick = Qva.CancelBubble;
    }
    Qva.Mgr.mySelect.OnChange = function () {
        var binder = Qva.GetBinder(this.binderid);
        if (!binder.Enabled) return;
        if (this.selectedIndex < 0) return;
        var opt = this.options[this.selectedIndex];
        binder.Set(this.Name, 'text', opt.value, true);
    }
    Qva.Mgr.mySelect.prototype.Paint = function (mode, node) {
        this.Touched = true;
        var element = this.Element;
        var currentValue = node.getAttribute("value");
        if (currentValue == null) currentValue = "";
        var optlen = element.options.length;
        element.disabled = mode != 'e';
        //element.value = currentValue;
        for (var ix = 0; ix < optlen; ++ix) {
            if (element.options[ix].value === currentValue) {
                element.selectedIndex = ix;
            }
        }
        element.style.display = Qva.MgrGetDisplayFromMode(this, mode);
 
    }
}
function extension_Done(){
	//Add extension
	Qva.AddExtension('Sankey-BGL', function(){
		//Load a CSS style sheet
		Qva.LoadCSS(Sankey_Path + "style.css");
		var _this = this;
		//get first text box
		var text1 = _this.Layout.Text0.text.toString();
		//get check box value
		var checkbox1 = _this.Layout.Text1.text.toString();
		var select = _this.Layout.Text2.text.toString();
		//add a unique name to the extension in order to prevent conflicts with other extensions.
		//basically, take the object ID and add it to a DIV
		var divName = _this.Layout.ObjectId.replace("\\", "_");
		if(_this.Element.children.length == 0) {//if this div doesn't already exist, create a unique div with the divName
			var ui = document.createElement("div");
			ui.setAttribute("id", divName);
			_this.Element.appendChild(ui);
		} else {
			//if it does exist, empty the div so we can fill it again
			$("#" + divName).empty();
		}
		//create a variable to put the html into
		var html = "";
		//set a variable to the dataset to make things easier 
		var td = _this.Data;
		//add the text variables to the html variable
		html += "Text1: " + text1 + "<br /> checkbox1 value: " + checkbox1 + "<br />Data Length: " + td.Rows.length + " rows<br />SELECT " + select + "<br />";
		//loop through the data set and add the values to the html variable
		for(var rowIx = 0; rowIx < td.Rows.length; rowIx++) {
			//set the current row to a variable
			var row = td.Rows[rowIx];
			//get the value of the first item in the dataset row
			var val1 = row[0].text;
			//get the value of the second item in the dataset row
			var val2 = row[1].text;
			//get the value of the measurement in the dataset row
			var m = row[2].text;
			//add those values to the html variable
			html += "value 1: " + val1 + " value 2: " + val2 + " expression value: " + m + "<br />";
		}
		//html = "<img src='https://dl.dropbox.com/u/24965329/deal_slide.gif'/>"; 
		//insert the html from the html variable into the extension.
	    $("#" + divName).html(html);


//****************************************************************************************************************
//Extension code here	
//****************************************************************************************************************

const units = 'clients';
const margin = {top: 10, right: 10, bottom: 10, left: 10};
const width = 960 - margin.left - margin.right;
const height = 300 - margin.top - margin.bottom;
var checkbox1 = _this.Layout.Text0.text.toString();

// zero decimal places
const formatNumber = d3.format(',.0f');
var format = function(d) {
    return formatNumber(d) ;
};
/*const format = d => '${formatNumber(d)} ${units}';*/
var color = d3.scale.category20();
/*const color = d3.scaleOrdinal()
  .domain([
    'All referred patients',
    'First consult outpatient clinic',
    'OR-receipt',
    'Start surgery',
    // 'No OR-receipt',
    // 'No emergency',
    // 'No surgery',
    'Emergency'
  ])
  .range([
    '#90eb9d',
    '#f9d057',
    '#f29e2e',
    '#00ccbc',
    '#d7191c'
  ]);*/

var svg = d3.select('#chart')
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "chart")

// append the svg canvas to the page
/*const svg = d3.select('#chart').append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
    .attr('transform', 'translate(${margin.left},${margin.top})');
*/
// set the sankey diagram properties
const sankey = d3.sankey()
  .nodeWidth(12)
  .nodePadding(10)
  .size([width, height]);

const path = sankey.link();

// append a defs (for definition) element to your SVG
const defs = svg.append('defs');

// load the data
for (var f = 0; f < _this.Data.Rows.length; f++) {
    var row = _this.Data.Rows[f];
    var source = row[0].text;
    var destination = row[1].text;
    var size = row[2].text;

    var node = {
        "source": source,
        "target": destination,
        "value": size
    };
    data.push(node);
}

/*d3.json('data.json', (error, graph) => {
  console.log('graph', graph);
  sankey
    .nodes(graph.nodes)
    .links(graph.links)
    .layout(13); // any value > 13 breaks the link gradient*/
 
  // add in the links
  const link = svg.append('g').selectAll('.link')
    .data(graph.links)
    .enter().append('path')
      .attr('class', 'link')
      .attr('d', path)
    .style("stroke-width", function(d) {
        return Math.max(1, d.dy);
    })
      .style('fill', 'none')
      .style('stroke-opacity', 0.18)
    .sort(function(a, b) {
        return b.dy - a.dy;
    });
 /*     .on('mouseover', function() {
        d3.select(this).style('stroke-opacity', 0.5);
      })
      .on('mouseout', function() {
        d3.select(this).style('stroke-opacity', 0.2);
      })
*/
  // add the link titles
 link.append("title")
    .text(function(d) {
        return d.source.name + " ->" + d.target.name + "\n" + format(d.value);
    }); 
  // add in the nodes
var node = svg.append("g").selectAll(".node")
    .data(output.nodes)
    .enter().append("g")
    .attr("class", "node")
	.on("click",onclick)
    .attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")";
    })

	
    .call(d3.behavior.drag()
        .origin(function(d) {
            return d;
        })
        .on("dragstart", function() {
            this.parentNode.appendChild(this);
        })
        .on("drag", dragmove)); 
  // add the rectangles for the nodes
node.append("rect")
    .attr("height", function(d) {
        return d.dy;
    })
    .attr('width', sankey.nodeWidth())
    .style("fill", function(d) {
        return d.color = color(d.name.replace(/ .*/, ""));
    })
    .append("title")
    .text(function(d) {
        return d.name + "\n" + d.value;
    })
  // add in the title for the nodes
/*  node.append('text')
    .attr('x', -6)
    .attr('y', d => d.dy / 2)
    .attr('dy', '.35em')
    .attr('text-anchor', 'end')
    .attr('transform', null)
    .text(d => d.name)
    .filter(d => d.x < width / 2)
      .attr('x', 6 + sankey.nodeWidth())
      .attr('text-anchor', 'start');
*/
  // add gradient to links
  link.style('stroke', function(d, i)  {
    console.log('d from gradient stroke func', d);

    // make unique gradient ids  
    const gradientID = 'gradient${i}';

    const startColor = d.source.color;
    const stopColor = d.target.color;

    console.log('startColor', startColor);
    console.log('stopColor', stopColor);

    const linearGradient = defs.append('linearGradient')
        .attr('id', gradientID);

    linearGradient.selectAll('stop') 
      .data([                             
          {offset: '10%', color: startColor },      
          {offset: '90%', color: stopColor }    
        ])                  
      .enter().append('stop')
      .attr('offset', function(d) {
        console.log('d.offset', d.offset);
        return d.offset; 
      })   
      .attr('stop-color', function(d)  {
        console.log('d.color', d.color);
        return d.color;
      });

    return 'url(#${gradientID})';
  })
 
// the function for moving the nodes
  function dragmove(d) {
    d3.select(this).attr('transform', 
      'translate(${d.x = Math.max(0, Math.min(width - d.dx, d3.event.x))},${d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))})');
    sankey.relayout();
    link.attr('d', path);
  }
});		    
	    
	};

//Initiate extension
extension_Init();

