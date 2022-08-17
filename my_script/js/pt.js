const canvas = document.getElementById("glCanvas");
const gl = canvas.getContext('webgl');
const shader_program = init_shader(gl);
var time = 0;
var vbo = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
gl.useProgram(shader_program);
var vp = gl.getAttribLocation(shader_program, 'aVertexPosition');
var cnt_pos = gl.getUniformLocation(shader_program, 'cnt');
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

var scale_loc = gl.getUniformLocation(shader_program, "scale");
var center_loc = gl.getUniformLocation(shader_program, "center");

function draw(){
    gl.uniform1i(cnt_pos, time);
    gl.uniform2f(scale_loc, scene_scalex, scene_scaley);
    gl.uniform2f(center_loc, scene_centerx, scene_centery);
    time++;
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(draw);
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

var textareas = document.getElementsByClassName("text");
var processTab = function(e){
    if(e.code == 'Tab'){
        e.preventDefault();
        let st = this.selectionStart;
        this.value = this.value.substr(0, st) + '\t' + this.value.substr(st);
        this.selectionStart = st + 1;
        this.selectionEnd = st + 1;
    }
}
for(let i = 0; i < textareas.length; ++i){
    textareas.item(i).onkeydown = processTab;
}
/*document.addEventListener("mousedown", function(e){
    if(e.button == 0){
        is_mouse_dowm = true;
        px = e.clientX;
        py = e.clientY;
    }
    
});
document.addEventListener("mouseup", function(e){
    if(e.button == 0)
        is_mouse_dowm = !is_mouse_dowm;
});
document.addEventListener("mousemove", function(e){
    if(e.button == 0 && is_mouse_dowm == true){
        scene_centerx -= 2 * scene_scalex / 512 * (e.clientX - px);
        scene_centery += 2 * scene_scaley / 512 * (e.clientY - py);
        px = e.clientX;
        py = e.clientY;
    }
});*/
canvas.addEventListener("mousedown", function(e){
    if(e.button == 0){
        is_mouse_dowm = true;
        px = e.offsetX;
        py = e.offsetY;
    }
});
canvas.addEventListener("mouseup", function(e){
    if(e.button == 0)
        is_mouse_dowm = !is_mouse_dowm;
});
canvas.addEventListener("mousemove", function(e){
    if(e.button == 0 && is_mouse_dowm == true){
        scene_centerx -= 2 * scene_scalex / 512 * (e.offsetX - px);
        scene_centery += 2 * scene_scaley / 512 * (e.offsetY - py);
        px = e.offsetX;
        py = e.offsetY;
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
requestAnimationFrame(draw);
