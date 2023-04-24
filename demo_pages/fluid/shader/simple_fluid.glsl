float hash11(float v){
    v = fract(v * 0.1031);
    v *= v + 33.33;
    v *= v + v;
    return fract(v);
}
vec2 hash12(float v){
    vec3 v3 = fract(vec3(v) * vec3(.1031, .1030, .0973));
 v3 += dot(v3, v3.yzx + 33.33);
    return fract((v3.xx + v3.yz) * v3.zy);
}
float hash21(vec2 v){
    vec3 v3 = fract(vec3(v.xyx));
    v3 += dot(v3, v3.yzx + 33.33);
    return fract((v3.x + v3.y) * v3.z);
}

M {
    r *= 0.;
    for(vec2 i = vec2(-7); ++i.x < 7.;) for(i.y = -7.; ++i.y < 7.;) {
        vec2 v = A(i).xy;                          // neighbour velocity
        r += A(i).z                                // neighbour mass
                * exp(-dot(v+i,v+i)) / 3.14        // normalised Gaussian
                * vec4(mix(v+v+i, v, A(i).z),1,1); // velocity contribution
    }
    
    r.xy /= r.z + 0.02;
    //if(iFrame % 2 == 1) {
        vec2 m = 4.*u/iResolution.xy-2.;
        for(float i = 0.; i < 2.; i += 1.0){
            vec2 pos = 4.*hash12(iTime + i) -2.;
            r += vec4(normalize(m - pos),5. * hash11(iTime),0) * sqrt(0.05-min(length(m - pos), 0.05));
        }
    //}
    r.y -= r.z * 0.1;
    r.y = min(0., r.y);
    r.x = r.x + 0.2 * hash11(u.y) - 0.1;
    r.x *= step(r.y,0.);
    ///r.z *= 0.99;
}