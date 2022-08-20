var vs = `
attribute vec4 aVertexPosition;
precision highp float;
varying highp vec2 p;
uniform vec2 scale;
uniform vec2 center;
void main() { 
	gl_Position = aVertexPosition;
    p = aVertexPosition.xy;
    p = scale * p + center;
}
`;

var fs = `
precision highp float;
varying highp vec2 p;
uniform int cnt;
uniform vec2 m_pos;
float t;
int mod(int a, int b){
    if(a < 0) a = -a;
    if(b < 0) b = -b;
    return a - a / b * b;
}
int xor(int a, int b){
    if(a == b) return 0;
    else return 1;
}
void main(){
    t = float(cnt) / 60.0;
    vec2 v = floor(p);
    int r = mod(int(v.x), 2);
    int b = mod(int(v.y), 2);
    r = xor(r, b);
    gl_FragColor = vec4(r, r, 1.0, 1.0);
}
`;

function reload_shader(gl){
    vs = document.getElementById('vertex shader').value;
    fs = document.getElementById('fragment shader').value;
    return init_shader(gl);
}

function init_shader(gl){
    const vertex_shader = shader_load(gl, gl.VERTEX_SHADER, vs);
    const frag_shader = shader_load(gl, gl.FRAGMENT_SHADER, fs);

    const p = gl.createProgram();
    gl.attachShader(p, vertex_shader);
    gl.attachShader(p, frag_shader);
    gl.linkProgram(p);

  // If creating the shader program failed, alert

    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return p;
}
function shader_load(gl, type, source){
    const shader = gl.createShader(type);

  // Send the source to the shader object

    gl.shaderSource(shader, source);

  // Compile the shader program

    gl.compileShader(shader);

  // See if it compiled successfully

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}