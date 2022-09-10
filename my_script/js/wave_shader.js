var vs = `
attribute vec4 aVertexPosition;
precision highp float;
void main() { 
	gl_Position = aVertexPosition;
}
`;

var wave_fs = `
precision highp float;
uniform float cnt;
uniform vec2 m_pos;
uniform float mouse_down;
uniform sampler2D preFrame;
uniform float clear;
vec2 wave_shader(vec2 uv){
	float offset = 1.0 / 512.0;
	vec4 d0 = texture2D(preFrame, uv);// * 2.0 - 1.0;

	vec4 d1 = texture2D(preFrame, uv + vec2(0.0, 1.0) * offset) ;//* 2.0 - 1.0;
	vec4 d2 = texture2D(preFrame, uv + vec2(1.0, 0.0) * offset);// * 2.0 - 1.0;
	vec4 d3 = texture2D(preFrame, uv + vec2(0.0, -1.0) * offset);// * 2.0 - 1.0;
	vec4 d4 = texture2D(preFrame, uv + vec2(-1.0, 0.0) * offset) ;//* 2.0 - 1.0;
	float d = length(gl_FragCoord.xy - 512.0 * m_pos);
	d = mouse_down * smoothstep(4.5, 0.5, d);
	//d *= sin(1.0 * cnt / 60.0 * 8.0) * 0.5;
	d += 2.0 * d0.x - d0.y + 0.5*(d1.x + d2.x + d3.x + d4.x - 4.0 * d0.x);
	d *= 0.999;
	return vec2(d, d0.x) * (1.0 - clear);
}
void main(){
    vec2 c = wave_shader(gl_FragCoord.xy/512.0);
    
	  gl_FragColor = vec4(vec3(c.x, c.y,0), 1.0);
}
`;

var fs = `
precision highp float;
uniform sampler2D wave;
uniform sampler2D image;
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
    float c = texture2D(wave, gl_FragCoord.xy/512.0).x;
    float cx = texture2D(wave, gl_FragCoord.xy/512.0 + vec2(1.0, 0.0) / 512.0).x;
    float cy = texture2D(wave, gl_FragCoord.xy/512.0 + vec2(0.0, 1.0) / 512.0).x;
    vec2 n = vec2(cx - c, cy - c);
    vec2 v = gl_FragCoord.xy/512.0 + 0.5 * n;
    vec3 col = texture2D(image, v).rgb;
    gl_FragColor = vec4(col, 1.0);
    //int r = mod(int(v.x), 2);
	//int b = mod(int(v.y), 2);
	//r = xor(r, b);
	//gl_FragColor = vec4(r, r, 1.0, 1.0);
}
`;

function reload_shader(gl){
    vs = document.getElementById('vertex shader').value;
    fs = document.getElementById('fragment shader').value;
    return init_shader(gl);
}

function init_shader(gl, vshader, fshader){
    const vertex_shader = shader_load(gl, gl.VERTEX_SHADER, vshader);
    const frag_shader = shader_load(gl, gl.FRAGMENT_SHADER, fshader);

    const p = gl.createProgram();
    gl.attachShader(p, vertex_shader);
    gl.attachShader(p, frag_shader);
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return p;
}
function shader_load(gl, type, source){
    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);

    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}