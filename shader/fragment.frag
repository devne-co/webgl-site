varying vec2 vUv;
uniform int u_count;
uniform sampler2D tDiffuse;

float random (vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

int mod(int x,int y){
    return (x - (x / y) * y);
}

void main(void){
   // gl_FragColor = texture2D(tDiffuse,vUv);
 //  float f = random(vec2(gl_FragCoord.y,uTime));
  // gl_FragColor = vec4(1,1,uTime,1);
   float r1 = random(vec2(int(gl_FragCoord.y)/ 5,u_count / 5));
   float r2 = random(vec2(int(gl_FragCoord.y)/ 10,u_count));

   vec2 newPos = (r1 < 0.2) && (mod(u_count,100) < 20) ? vec2(vUv.x + (mod(u_count,2) == 0 ? 0.05 : -0.05),vUv.y) : vec2(vUv.x,vUv.y);
   float a = (r2 < 0.5) ? random(vec2(gl_FragCoord.x + float(u_count) * 0.02,gl_FragCoord.y)) * 0.05 : 0.0;
   vec4 color = vec4(texture2D(tDiffuse,vec2(newPos.x + 0.002,newPos.y)).r + a,texture2D(tDiffuse,vec2(newPos.x + 0.004,newPos.y)).g + a,texture2D(tDiffuse,vec2(newPos.x + 0.006,newPos.y)).b + a,texture2D(tDiffuse,vec2(newPos.x,newPos.y)).a);
   color = u_count < 60 ? color * (float(u_count) / 60.0) : color;
   color *= 1.2;
   gl_FragColor = color;
}