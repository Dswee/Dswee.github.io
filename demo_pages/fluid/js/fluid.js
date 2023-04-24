const canvas = document.getElementById("glCanvas");
const gl = canvas.getContext('webgl');
const shader_program_wave = init_shader(gl, vs, wave_fs);
const shader_program = init_shader(gl, vs, fs);
const color_shader = init_shader(gl, vs, color_fs);

var time = 0.0;
var vbo = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vbo);

gl.useProgram(shader_program_wave);
var vp = gl.getAttribLocation(shader_program_wave, 'aVertexPosition');
var cnt_pos = gl.getUniformLocation(shader_program_wave, 'cnt');
var m_pos = gl.getUniformLocation(shader_program_wave, "m_pos");
var pm_pos = gl.getUniformLocation(shader_program_wave, "pm_pos");
var mouse_down = gl.getUniformLocation(shader_program_wave, "mouse_down");
var preframe = gl.getUniformLocation(shader_program_wave, "preFrame");
var clear_pos = gl.getUniformLocation(shader_program_wave, "clear");
var vor_pos = gl.getUniformLocation(shader_program_wave, "vorticityThreshold");
var vel_pos = gl.getUniformLocation(shader_program_wave, "velocityThreshold");
var vis_pos = gl.getUniformLocation(shader_program_wave, "viscosityThreshold");
var pen_pos = gl.getUniformLocation(shader_program_wave, "pen_size");
var dt_pos = gl.getUniformLocation(shader_program_wave, "dt");
var efp_pos = gl.getUniformLocation(shader_program_wave, "efPos");
var efd_pos = gl.getUniformLocation(shader_program_wave, "efDirection");

gl.uniform1i(preframe, 0);

gl.useProgram(color_shader);
var vp = gl.getAttribLocation(color_shader, 'aVertexPosition');
var ff = gl.getUniformLocation(color_shader, "fluid");
var cnt_col = gl.getUniformLocation(color_shader, "cnt");
var col_mp = gl.getUniformLocation(color_shader, "m_pos");
var col_frame = gl.getUniformLocation(color_shader, "imaghe");
var color_mouse_down = gl.getUniformLocation(color_shader, "mouse_down");
var efpc_pos = gl.getUniformLocation(color_shader, "efPos");
gl.uniform1i(col_frame, 0);
gl.uniform1i(ff, 1);

gl.useProgram(shader_program);
var vp = gl.getAttribLocation(shader_program, 'aVertexPosition');
var waveframe = gl.getUniformLocation(shader_program, "wave");
var background_image = gl.getUniformLocation(shader_program, "image");
var cnt_pos2 = gl.getUniformLocation(shader_program, "cnt");
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
var px = 0;
var py = 0;
var ppx = 0.;
var ppy = 0.;
var mouse_downf = 0.0;
var clear = 1.0;

var penSize = 10;
var dt = 0.02;
var vel = 15;
var vis = 0.6;
var vor = 10;

var efPosx = 0.5;
var efPosy = 0.5;
var efVelx = 0.;
var efVely = 1.;


var texturebuffers = [];

type = gl.getExtension('OES_texture_float') == null? gl.UNSIGNED_BYTE: gl.FLOAT;
gl.getExtension('OES_texture_float_linear');

var btex = null;//gentex(gl, './js/cubetexture.png');

for (let i = 0; i < 2; i++){
    texturebuffers.push(gl.createTexture());
    gl.bindTexture(gl.TEXTURE_2D, texturebuffers[i]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,64,64,0 , gl.RGBA, gl.FLOAT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
    gl.bindTexture(gl.TEXTURE_2D, null);
    
}

var col_buffers = [];
for(let i = 0; i < 2; i++){
    col_buffers.push(gl.createTexture());
    gl.bindTexture(gl.TEXTURE_2D, col_buffers[i]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 512, 512,0 , gl.RGBA, gl.FLOAT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
    gl.bindTexture(gl.TEXTURE_2D, null);
}

var buffer_id = 0;
var color_id = 0;

var wave_buffer = gl.createFramebuffer();

function draw(){
    updateParameters();
    updateSourceParameters();
    gl.useProgram(shader_program_wave);
    gl.uniform1f(cnt_pos, time);
    gl.uniform2f(m_pos, px, py);
    gl.uniform2f(pm_pos, ppx, ppy);
    gl.uniform1f(mouse_down, mouse_downf);
    gl.uniform1f(clear_pos, clear);
    
    
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, wave_buffer);
    for(let i = 0; i < 32; ++i){
        gl.useProgram(shader_program_wave);
        gl.uniform1f(cnt_pos, time);
        gl.uniform2f(m_pos, px, py);
        gl.uniform2f(pm_pos, ppx, ppy);
        gl.uniform1f(mouse_down, mouse_downf);
        gl.uniform1f(clear_pos, clear);

        gl.uniform1f(dt_pos, dt);
        gl.uniform1f(pen_pos, penSize);
        gl.uniform1f(vel_pos, vel);
        gl.uniform1f(vor_pos, vor);
        gl.uniform1f(vis_pos, vis);
        
        gl.uniform2f(efp_pos, efPosx, efPosy);
        gl.uniform2f(efd_pos, efVelx, efVely);

        gl.viewport(0, 0, 64,64);
        gl.activeTexture(gl.TEXTURE0);
	    gl.bindTexture(gl.TEXTURE_2D, texturebuffers[1-buffer_id]);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texturebuffers[buffer_id], 0);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    
        gl.useProgram(color_shader);
        gl.uniform1f(cnt_col, time);
        gl.uniform2f(col_mp, px, py);
        gl.uniform1f(color_mouse_down, mouse_downf);
        gl.uniform2f(efpc_pos, efPosx, efPosy);
        gl.viewport(0, 0, 512, 512);
        gl.activeTexture(gl.TEXTURE0);
	    gl.bindTexture(gl.TEXTURE_2D, col_buffers[1-color_id]);
        gl.activeTexture(gl.TEXTURE1);
	    gl.bindTexture(gl.TEXTURE_2D, texturebuffers[buffer_id]);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, col_buffers[color_id], 0);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);buffer_id = 1 - buffer_id;color_id = 1 - color_id;
    }
    gl.viewport(0, 0, 512, 512);
    gl.useProgram(shader_program);
    gl.uniform1f(cnt_pos2, time);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texturebuffers[1-buffer_id]);
    gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, col_buffers[1-color_id]);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    time++;
    showTime(time);
    clear = 0.0;
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
        
        px = e.offsetX / 512.0 ;//e.offsetX / 512.0;
        py = (1.0 - e.offsetY / 512.0);//1.0 - e.offsetY / 512.0;
        
        ppx = px;
        ppy = py;
        
        mouse_downf = 1.0;
        is_mouse_dowm = true;
    }
});
canvas.addEventListener("mouseup", function(e){
    if(e.button == 0){
        is_mouse_dowm = !is_mouse_dowm;
        mouse_downf = 1.0 - mouse_downf;
        ppx = px;
        ppy = py;
    }
});
canvas.addEventListener("mousemove", function(e){
    if(e.button == 0 && is_mouse_dowm == true){
        ppx = px;
        ppy = py;
        px = e.offsetX / 512.0 ;//e.offsetX / 512.0;
        py = (1.0 - e.offsetY / 512.0);//1.0 - e.offsetY / 512.0;
    }
});
canvas.onwheel = function(e){
    e.preventDefault();
    if(e.wheelDelta < 0) {
        scene_scalex *= 1.1;
        scene_scaley *= 1.1;
    }
    else{
        scene_scalex *= 0.9;
        scene_scaley *= 0.9;
    }
};
function showTime(time) {
    let timeLabel = document.getElementById("time");
    timeLabel.innerText = time.toString();
}
function updateParameters() {
    let dtInput = document.getElementById("dt");
    dt = parseFloat(dtInput.value);
    let psInput = document.getElementById("penSize");
    penSize = parseFloat(psInput.value);
    let velInput = document.getElementById("vel");
    vel = parseFloat(velInput.value);
    let visInput = document.getElementById("vis");
    vis = parseFloat(visInput.value);
    let vorInput = document.getElementById("vor");
    vor = parseFloat(vorInput.value);

}
function updateSourceParameters() {
    let ax = Math.random() * 2 - 1.;
    let ay = Math.random() * 2 - 1.;
    efVelx += ax;
    efVely += ay;
    efPosx += efVelx * 1. / 1200.;
    efPosy += efVely * 1. / 1200.;
    if(efPosx > 0.98 || efPosx < 0.02) {
        efPosx = Math.max(0.02, Math.min(efPosx, 0.98));
        efVelx = -efVelx;
    }
    if(efPosy > 0.98 || efPosy < 0.02) {
        efPosy = Math.max(0.02, Math.min(efPosy, 0.98));
        efVely = -efVely;
    }
}
setInterval(draw, 1000/60);
//requestAnimationFrame(draw);
