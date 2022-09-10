
function getimage(gl, url){
    var img = url;
    var image = new Image();
    
    const tex = gl.createTexture();
    image.onload = function() {
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB,gl.RGB, gl.UNSIGNED_BYTE,
            image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.bindTexture(gl.TEXTURE_2D, null);
    }
    
    image.src = url;

    return tex;

}
const canvas = document.getElementById("glCanvas");
const gl = canvas.getContext('webgl');
const shader_program_wave = init_shader(gl, vs, wave_fs);
const shader_program = init_shader(gl, vs, fs);

var time = 0.0;
var vbo = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vbo);

gl.useProgram(shader_program_wave);
var vp = gl.getAttribLocation(shader_program_wave, 'aVertexPosition');
var cnt_pos = gl.getUniformLocation(shader_program_wave, 'cnt');
var m_pos = gl.getUniformLocation(shader_program_wave, "m_pos");
var mouse_down = gl.getUniformLocation(shader_program_wave, "mouse_down");
var preframe = gl.getUniformLocation(shader_program_wave, "preFrame");
var clear_pos = gl.getUniformLocation(shader_program_wave, "clear");
gl.uniform1i(preframe, 0);


gl.useProgram(shader_program);
var vp = gl.getAttribLocation(shader_program, 'aVertexPosition');
var waveframe = gl.getUniformLocation(shader_program, "wave");
var background_image = gl.getUniformLocation(shader_program, "image");
gl.uniform1i(waveframe, 0);
gl.uniform1i(background_image, 1);

const frame = [
    -1.0, -1.0,
    1.0, -1.0, 
    -1.0, 1.0, 
    1.0, 1.0
];
gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array(frame),
    gl.STATIC_DRAW);

gl.vertexAttribPointer(
        vp,
        2,
        gl.FLOAT,
        false,
        0,
        0);
gl.enableVertexAttribArray(
        vp
);
var scene_scalex = 2.0;
var scene_scaley = 2.0;
var scene_centerx = 0.0;
var scene_centery = 0.0;
var is_mouse_dowm = false;
var px = 0.5;
var py = 0.5;
var mouse_downf = 0.0;
var clear = 1.0;

var texturebuffers = [];

type = gl.getExtension('OES_texture_float') == null? gl.UNSIGNED_BYTE: gl.FLOAT;

const btex = getimage(gl, "../img/stones.png");

for (let i = 0; i < 2; i++){
    texturebuffers.push(gl.createTexture());
    gl.bindTexture(gl.TEXTURE_2D, texturebuffers[i]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 512, 512, 0, gl.RGB, type, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
    gl.bindTexture(gl.TEXTURE_2D, null);
    
}

var buffer_id = 0;

var wave_buffer = gl.createFramebuffer();

function draw(){
    gl.useProgram(shader_program_wave);
    gl.uniform1f(cnt_pos, time);
    gl.uniform2f(m_pos, px, py);
    gl.uniform1f(mouse_down, mouse_downf);
    
    gl.uniform1f(clear_pos, clear);
    
    clear = 0.0;
    time++;
    gl.bindFramebuffer(gl.FRAMEBUFFER, wave_buffer);
    gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texturebuffers[1-buffer_id]);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texturebuffers[buffer_id], 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.useProgram(shader_program);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texturebuffers[buffer_id]);
    gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, btex);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(draw);
    buffer_id = 1 - buffer_id;
    
}

function use_shader(){
    time = 0;
    const shader_program = reload_shader(gl);
    vp = gl.getAttribLocation(shader_program, 'aVertexPosition');
    cnt_pos = gl.getUniformLocation(shader_program, 'cnt');
    scale_loc = gl.getUniformLocation(shader_program, "scale");
    center_loc = gl.getUniformLocation(shader_program, "center");
    gl.useProgram(shader_program);
}

canvas.addEventListener("mousedown", function(e){
    if(e.button == 0){
        is_mouse_dowm = true;
        px = e.offsetX / 512.0 ;
        py = (1.0 - e.offsetY / 512.0);
        mouse_downf = 1.0;
    }
});
canvas.addEventListener("mouseup", function(e){
    if(e.button == 0){
        is_mouse_dowm = !is_mouse_dowm;
        mouse_downf = 0.0;
    }
});
canvas.addEventListener("mousemove", function(e){
    if(e.button == 0 && is_mouse_dowm == true){
        px = e.offsetX / 512.0 ;
        py = (1.0 - e.offsetY / 512.0);
    }
});

requestAnimationFrame(draw);

