"use strict";
var canvas;
var gl;
var points = [];
var numTimesToSubdivide = 0;
var theta = 0;
var bufferId;

function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Initialize our data for the Sierpinski Gasket
    //
    // First, initialize the corners of our gasket with three points.
    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU
    bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, 8*Math.pow(3, 6), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
	
	// get the divider count from the web page
    //document.getElementById("slider").onchange = function(target) {
		//var target = event.target || event.srcElement;
		//numTimesToSubdivide =  parseFloat(event.target.value);
		//document.getElementById("numstep").innerHTML = numTimesToSubdivide;
		//render();
    //};
	
	// get the theta value from the web page	
	//document.getElementById("angle").onchange = function(target) {
		//var target = event.target || event.srcElement;
		//var angle_val = event.target.value;
		//document.getElementById("dispangle").innerHTML = angle_val;
		//theta = (Math.PI * angle_val)/180;     
        //render();
    //};

    render();
};

// apply the rotation to each vertex
function set_roate(vertex){
	var x_in = vertex[0];
	var y_in = vertex[1];
	// calculate the d value 
	var d = Math.sqrt((x_in * x_in) + (y_in * y_in));
	var x1 = 0;
	var y1 = 0;
	// calculate the required angles
	x1 = x_in * Math.cos(d*theta) - y_in * Math.sin(d*theta);
	y1 = x_in * Math.sin(d*theta) + y_in * Math.cos(d*theta);
	return [x1, y1];
}

function triangle( a, b, c )
{
	// call the rotate function  on each vertex and push the result to the array
	points.push(set_roate(a));
	points.push(set_roate(b));
	points.push(set_roate(c));
}

function divideTriangle( a, b, c, count )
{
    // check for end of recursion
    if ( count == 0 ) {
		
        triangle( a, b, c );
    }
    else {
        //bisect the sides
        var ab = mix( a, b, 0.5 );
        var ac = mix( a, c, 0.5 );
        var bc = mix( b, c, 0.5 );
		
		// decrement the count
        --count;

        // generate three new triangles
        divideTriangle( a, ab, ac, count );
        divideTriangle( c, ac, bc, count );
        divideTriangle( b, bc, ab, count );
        //divideTriangle( bc, ac, ab, count );
    }
}

function setTheta(val, id){
	document.getElementById(id).innerHTML = val;
	var radian = (Math.PI * val)/180;
	theta = radian;
	render();
}

function setDivide(value, id){
	document.getElementById(id).innerHTML = value;
	numTimesToSubdivide = value;
	render();
}

window.onload = init;

function render()
{
    // set the coordinates of the starting triangle
	var vertices = [
        vec2( -0.5, -0.5 ),
        vec2(  0.5,  -0.5 ),
        vec2(  0.0, 0.5 )
    ];
    points = [];
	// subdivide the triangle
    divideTriangle( vertices[0], vertices[1], vertices[2],
                    numTimesToSubdivide);

    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(points));
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
    points = [];
    //requestAnimFrame(render);
}
