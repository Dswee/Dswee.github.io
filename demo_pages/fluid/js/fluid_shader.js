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
uniform vec2 pm_pos;
uniform float mouse_down;
uniform sampler2D preFrame;
uniform float clear;
uniform float dt;
uniform float vorticityThreshold;
uniform float velocityThreshold;
uniform float viscosityThreshold;
uniform float pen_size;
uniform vec2 efPos;
uniform vec2 efDirection;
//#define dt 0.25
// lower value for vorticity threshold means higher viscosity
// and vice versa (max .3). Setting it to 0. disables it.
//#define vorticityThreshold 10.
//#define velocityThreshold 15.
// higher this threshold, lower the viscosity (max .8)
//#define viscosityThreshold .6
vec4 textureLinear(sampler2D fv, vec2 st){
    st = st * 512.0;
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    vec4 a = texture2D(fv, i/512.0);
    vec4 b = texture2D(fv, (i + vec2(1.0, 0.0))/512.0);
    vec4 c = texture2D(fv, (i + vec2(0.0, 1.0))/512.0);
    vec4 d = texture2D(fv, (i + vec2(1.0, 1.0))/512.0);

    // Smooth Interpolation

    // Cubic Hermine Curve.  Same as SmoothStep()
    vec2 u = f*f*(3.0-2.0*f);
    // u = smoothstep(0.,1.,f);

    // Mix 4 coorners percentages
    vec4 fc = mix(a, b, u.x)+
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
            //fc.y *= smoothstep(.5,.48,abs(st.y/512. - .5));
            //fc.x *= smoothstep(.5,.49,abs(st.x/512. - .5));
          return fc;
}


vec4 simpleFluid(sampler2D fluid, vec2 st, vec2 step){
  if(cnt < 2.){
    return vec4(0.);
  } 
  float k = 0.1, s = k/dt;
  vec4 fc = texture2D(fluid, st);
  vec4 fl = texture2D(fluid, st - vec2(step.x, 0.));
  vec4 fr = texture2D(fluid, st + vec2(step.x, 0.));
  vec4 ft = texture2D(fluid, st + vec2(0., step.y));
  vec4 fd = texture2D(fluid, st - vec2(0., step.y));

  vec3 fdx = (fr - fl).xyz /2.;
  vec3 fdy = (ft - fd).xyz /2.;
  float du = fdx.x + fdy.y;
  vec2 dd = vec2(fdx.z, fdy.z);

  fc.z -= dt * (dot(vec3(dd, du), fc.xyz));
  //fc.z *= 0.999;

  vec2 lap = fr.xy + fl.xy + ft.xy + fd.xy - 4.*fc.xy;
  vec2 vf = 0.2 * lap;

  vec2 shifted_st = st - dt * fc.xy * step;
  fc.xyw = texture2D(fluid, shifted_st).xyw;
  //fc.w *= 0.9995;
  float time = cnt / 6.;
  vec2 ef = m_pos - pm_pos;
  //if(length(ef) == 0.) ef = vec2(0.);
  //else ef = normalize(ef);
 // ef = ;//-normalize(ef);
 vec2 p = st - m_pos;
 float t = float(length(p) < pen_size / 512.);
 //vec2 ef = pre - center;
 //ef = 1024.*ef * t;
  ef = 1280. * mouse_down * t *  ef;
  vec2 efdir = normalize(st - efPos);

  vec2 efStatic = float(length(st - efPos) < 1./64.) * max(dot(efDirection, efdir), 0.) * efdir;//efDirection;
  //vec2 fbule = float(length(st - vec2(0.75)) < 1./64.) * vec2(-10. * (sin(time)+1.));
  fc.xy += dt*(vf - s * dd + ef + efStatic);
  fc.y *= smoothstep(.5,.48,abs(st.y - .5));//1. - 2.*min(1., (float(st.y > 0.995) + float(st.y < 0.005)));
  fc.x *= smoothstep(.5,.48,abs(st.x - .5));//1. - 2.*min(1., (float(st.x > 0.995) + float(st.x < 0.005)));//
  fc = clamp(fc, vec4(vec2(-velocityThreshold), 0.5 , 0.), vec4(vec2(velocityThreshold),3., 1.));
  return fc;


}
void main(){  
	vec4 f = simpleFluid(preFrame, gl_FragCoord.xy/64.0, vec2(1./64.));
  gl_FragColor = f;
}
`;


var color_fs = `
precision highp float;
uniform sampler2D image;
uniform sampler2D fluid;

uniform float cnt;
uniform vec2 m_pos;
uniform float mouse_down;
uniform vec2 efPos;
vec3 hash33(vec3 p3){
  p3 = fract(p3 * vec3(.1031, .1030, .0973));
     p3 += dot(p3, p3.yxz+33.33);
     return fract((p3.xxy + p3.yxx)*p3.zyx);
 }
 vec3 hash13(float p){
  vec3 p3 = fract(vec3(p) * vec3(.1031, .1030, .0973));
  p3 += dot(p3, p3.yzx+33.33);
  return fract((p3.xxy+p3.yzz)*p3.zyx); 
}

void main(){
  vec2 uv = gl_FragCoord.xy / 512.0;
  if(length(uv - efPos) < 0.04)  gl_FragColor = vec4(hash13(floor(2.+cnt/60.)), 1.);
  //else if(length(uv - vec2(0.75)) < 0.04) gl_FragColor = vec4(0.,0.,1., 1.);
  else {
  vec4 f = texture2D(fluid, uv);
  vec2 st = uv - vec2(0.25 * 1.0/256.0) * f.xy;
  vec2 pp = uv - m_pos;//hash13(floor(cnt/30.))
  vec3 col = mouse_down * hash13(floor(cnt/30.)) * 0.0005/ length(pp);
  vec3 c = texture2D(image, st).rgb;
  //gl_FragColor = vec4(c*0.999, 1.);
  //}
   float t = cnt/60.;
   col = c + 0.4*step(length(pp)*1., 1.) * col;
   col = clamp(col, 0., 1.);
   col *= 0.9995;
   gl_FragColor = vec4(col, 1.);
  }
}

`;

var fs = `
precision highp float;
uniform sampler2D wave;
uniform sampler2D image;
uniform float cnt;

void main(){
    vec4 u = texture2D(image, gl_FragCoord.xy/512.0);
    //u = texture2D(wave, gl_FragCoord.xy/512.0);
    //u = fract(u);
    gl_FragColor = vec4(u.xyz, 1.);
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