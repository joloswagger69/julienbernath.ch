"use strict";

/* =====================================================================
   JB ENGINE — Real-time WebGL visual lab
   Vanilla HTML / CSS / JS. Single-file engine below.
   ===================================================================== */

const PALETTES = {
    "Neutral / Reset":  ["#000000", "#555555", "#aaaaaa", "#ffffff"],
    "Cyberpunk Y2K":    ["#05001c", "#72008f", "#ff00aa", "#00ffff"],
    "Thermal":          ["#00000a", "#5d00ff", "#ff0055", "#ffee00"],
    "Riso Sunset":      ["#2b0a3d", "#8c2f39", "#ff7b54", "#ffd56b"],
    "Noir":             ["#050505", "#333333", "#999999", "#ffffff"],
    "Acid Mint":        ["#04140f", "#0b6b4f", "#ccff00", "#00ffc8"],
};

/* ---------------------------------------------------------------------
   Shared GLSL helpers (WebGL 1 / ES 1.00 safe)
   --------------------------------------------------------------------- */
const SHADER_HEAD = `precision mediump float;
varying vec2 v_texCoord;
uniform sampler2D u_image;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 u_pal1; uniform vec3 u_pal2; uniform vec3 u_pal3; uniform vec3 u_pal4;
float rand(vec2 n){ return fract(sin(dot(n, vec2(12.9898,4.1414))) * 43758.5453); }
float noise(vec2 p){ vec2 ip=floor(p); vec2 u=fract(p); u=u*u*(3.0-2.0*u);
  float res=mix(mix(rand(ip),rand(ip+vec2(1.0,0.0)),u.x),mix(rand(ip+vec2(0.0,1.0)),rand(ip+vec2(1.0,1.0)),u.x),u.y);
  return res*res; }
float fbm(vec2 p){ float v=0.0; float a=0.5; for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.0; a*=0.5; } return v; }
float lum(vec3 c){ return dot(c, vec3(0.299,0.587,0.114)); }
vec3 hueShift(vec3 color, float hue){ const vec3 k=vec3(0.57735); float c=cos(hue);
  return vec3(color*c + cross(k,color)*sin(hue) + k*dot(k,color)*(1.0-c)); }`;

const VERTEX_SHADER = `attribute vec2 a_position; attribute vec2 a_texCoord;
varying vec2 v_texCoord;
void main(){ gl_Position = vec4(a_position, 0.0, 1.0); v_texCoord = a_texCoord; }`;

const PASSTHROUGH_FRAG = `${SHADER_HEAD} void main(){ gl_FragColor = texture2D(u_image, v_texCoord); }`;

/* Composite shader — blends a processed layer over the accumulated result. */
const COMPOSITE_FRAG = `${SHADER_HEAD}
uniform sampler2D u_prev;
uniform float u_opacity;
uniform float u_blend; // 0 normal,1 multiply,2 screen,3 overlay,4 add,5 difference
vec3 blendMode(vec3 base, vec3 top, float m){
  if(m < 0.5) return top;
  else if(m < 1.5) return base * top;
  else if(m < 2.5) return 1.0 - (1.0-base)*(1.0-top);
  else if(m < 3.5){ return mix(2.0*base*top, 1.0-2.0*(1.0-base)*(1.0-top), step(0.5, base)); }
  else if(m < 4.5) return min(base + top, 1.0);
  else return abs(base - top);
}
void main(){
  vec3 base = texture2D(u_prev, v_texCoord).rgb;
  vec3 top = texture2D(u_image, v_texCoord).rgb;
  vec3 blended = blendMode(base, top, u_blend);
  gl_FragColor = vec4(mix(base, blended, u_opacity), 1.0);
}`;

/* ---------------------------------------------------------------------
   Effect library. `cat` groups effects in the searchable browser.
   --------------------------------------------------------------------- */
const SHADERS = {
    // ---- COLOR & TONE ----
    color: { name: "Color Grade", cat: "Color & Tone", params: {
        brightness:{type:"range",min:-1,max:1,val:0,name:"Brightness"},
        contrast:{type:"range",min:0,max:3,val:1,name:"Contrast"},
        saturation:{type:"range",min:0,max:3,val:1,name:"Saturation"},
        hue:{type:"range",min:-3.14,max:3.14,val:0,name:"Hue"} },
        frag:`${SHADER_HEAD} uniform float brightness; uniform float contrast; uniform float saturation; uniform float hue;
        void main(){ vec4 c=texture2D(u_image,v_texCoord); c.rgb+=brightness; c.rgb=(c.rgb-0.5)*max(contrast,0.0)+0.5;
        float l=lum(c.rgb); c.rgb=mix(vec3(l),c.rgb,saturation); c.rgb=hueShift(c.rgb,hue); gl_FragColor=c; }` },

    whitebalance: { name: "White Balance", cat: "Color & Tone", params: {
        temp:{type:"range",min:-1,max:1,val:0,name:"Temperature"},
        tint:{type:"range",min:-1,max:1,val:0,name:"Tint"},
        exposure:{type:"range",min:-1,max:1,val:0,name:"Exposure"} },
        frag:`${SHADER_HEAD} uniform float temp; uniform float tint; uniform float exposure;
        void main(){ vec3 c=texture2D(u_image,v_texCoord).rgb; c*=pow(2.0, exposure);
        c.r += temp*0.15; c.b -= temp*0.15; c.g += tint*0.15; gl_FragColor=vec4(clamp(c,0.0,1.0),1.0); }` },

    curves: { name: "Tone Curve", cat: "Color & Tone", params: {
        gamma:{type:"range",min:0.1,max:3,val:1,name:"Gamma"},
        lift:{type:"range",min:-0.3,max:0.3,val:0,name:"Lift"},
        gain:{type:"range",min:0.5,max:2,val:1,name:"Gain"} },
        frag:`${SHADER_HEAD} uniform float gamma; uniform float lift; uniform float gain;
        void main(){ vec3 c=texture2D(u_image,v_texCoord).rgb; c=pow(max(c,0.0), vec3(1.0/gamma));
        c=c*gain+lift; gl_FragColor=vec4(clamp(c,0.0,1.0),1.0); }` },

    vibrance: { name: "Vibrance", cat: "Color & Tone", params: {
        vibrance:{type:"range",min:-1,max:2,val:0.5,name:"Vibrance"} },
        frag:`${SHADER_HEAD} uniform float vibrance;
        void main(){ vec3 c=texture2D(u_image,v_texCoord).rgb; float mx=max(c.r,max(c.g,c.b)); float avg=(c.r+c.g+c.b)/3.0;
        float amt=(mx-avg)*(-vibrance*3.0); c=mix(c, vec3(mx), amt); gl_FragColor=vec4(clamp(c,0.0,1.0),1.0); }` },

    invert: { name: "Invert", cat: "Color & Tone", params: {
        amount:{type:"range",min:0,max:1,val:1,name:"Amount"} },
        frag:`${SHADER_HEAD} uniform float amount;
        void main(){ vec3 c=texture2D(u_image,v_texCoord).rgb; gl_FragColor=vec4(mix(c,1.0-c,amount),1.0); }` },

    posterize: { name: "Posterize", cat: "Color & Tone", params: {
        steps:{type:"range",min:2,max:32,val:6,name:"Steps"} },
        frag:`${SHADER_HEAD} uniform float steps;
        void main(){ vec3 c=texture2D(u_image,v_texCoord).rgb; float s=max(2.0,floor(steps));
        gl_FragColor=vec4(floor(c*s)/s,1.0); }` },

    // ---- PALETTE / MAP ----
    gradientmap: { name: "Gradient Map", cat: "Palette", params: {
        quantize:{type:"range",min:2,max:64,val:64,name:"Posterize Steps"} },
        frag:`${SHADER_HEAD} uniform float quantize;
        void main(){ float l=lum(texture2D(u_image,v_texCoord).rgb); l=floor(l*quantize)/quantize;
        vec3 c=mix(u_pal1,u_pal2,smoothstep(0.0,0.33,l)); c=mix(c,u_pal3,smoothstep(0.33,0.66,l));
        c=mix(c,u_pal4,smoothstep(0.66,1.0,l)); gl_FragColor=vec4(c,1.0); }` },

    duotone: { name: "Pro Duotone", cat: "Palette", params: {
        mode:{type:"select",options:{"Use Global Palette":0,"Use Custom Colors":1},val:0,name:"Color Source"},
        hl:{type:"color",val:"#ff0055",name:"Custom High"},
        sh:{type:"color",val:"#000022",name:"Custom Low"},
        mid:{type:"range",min:-0.5,max:0.5,val:0,name:"Midpoint"} },
        frag:`${SHADER_HEAD} uniform float mode; uniform vec3 hl; uniform vec3 sh; uniform float mid;
        void main(){ float l=clamp(lum(texture2D(u_image,v_texCoord).rgb)+mid,0.0,1.0);
        vec3 high=mix(u_pal4,hl,mode); vec3 low=mix(u_pal1,sh,mode);
        gl_FragColor=vec4(mix(low,high,smoothstep(0.1,0.9,l)),1.0); }` },

    thermal: { name: "Thermal Scan", cat: "Palette", params: {
        intensity:{type:"range",min:0.1,max:5,val:1.5,name:"Heat Intensity"},
        shift:{type:"range",min:-1,max:1,val:0,name:"Heat Shift"} },
        frag:`${SHADER_HEAD} uniform float intensity; uniform float shift;
        void main(){ float l=clamp(lum(texture2D(u_image,v_texCoord).rgb)*intensity+shift,0.0,1.0);
        vec3 c=mix(u_pal1,u_pal2,smoothstep(0.0,0.33,l)); c=mix(c,u_pal3,smoothstep(0.33,0.66,l));
        c=mix(c,u_pal4,smoothstep(0.66,1.0,l)); gl_FragColor=vec4(c,1.0); }` },

    infrared: { name: "Infrared", cat: "Palette", params: {
        strength:{type:"range",min:0,max:1,val:1,name:"Strength"} },
        frag:`${SHADER_HEAD} uniform float strength;
        void main(){ vec3 c=texture2D(u_image,v_texCoord).rgb; vec3 ir=vec3(c.g, c.b, c.r);
        ir.r=1.0-ir.r; gl_FragColor=vec4(mix(c, ir, strength),1.0); }` },

    // ---- BLUR & DREAM ----
    blur: { name: "Cinema Blur", cat: "Blur & Dream", params: {
        amount:{type:"range",min:0,max:0.05,val:0.02,name:"Blur Amount"} },
        frag:`${SHADER_HEAD} uniform float amount;
        void main(){ vec4 color=vec4(0.0); vec2 dir=normalize(v_texCoord-0.5); float total=0.0;
        for(int i=-3;i<=3;i++){ float fi=float(i); float w=1.0-abs(fi)/3.0;
        vec2 off=vec2(fi*amount*0.5)+dir*(fi*amount); color+=texture2D(u_image,v_texCoord+off)*w; total+=w; }
        gl_FragColor=color/total; }` },

    airbrush: { name: "Airbrush Blur", cat: "Blur & Dream", params: {
        radius:{type:"range",min:0,max:0.1,val:0.02,name:"Radius"},
        scatter:{type:"range",min:0,max:1,val:0.5,name:"Scatter"} },
        frag:`${SHADER_HEAD} uniform float radius; uniform float scatter;
        void main(){ vec3 c=vec3(0.0); float total=0.0;
        for(int i=0;i<6;i++){ float fi=float(i); float a=fi*1.047;
        float r=radius*(1.0+(rand(v_texCoord+vec2(fi))-0.5)*scatter);
        c+=texture2D(u_image,v_texCoord+vec2(cos(a),sin(a))*r).rgb; total+=1.0; }
        gl_FragColor=vec4(c/total,1.0); }` },

    glass: { name: "Frosted Glass", cat: "Blur & Dream", params: {
        radius:{type:"range",min:0.001,max:0.05,val:0.015,name:"Blur Radius"},
        detail:{type:"range",min:10,max:300,val:150,name:"Frost Detail"} },
        frag:`${SHADER_HEAD} uniform float radius; uniform float detail;
        void main(){ vec2 uv=v_texCoord; vec3 color=vec3(0.0); float n=rand(uv*detail);
        for(int i=0;i<6;i++){ float fi=float(i); float a=(fi/6.0)*6.283+(n*6.283);
        vec2 off=vec2(cos(a),sin(a))*radius*rand(uv+vec2(fi)); color+=texture2D(u_image,uv+off).rgb; }
        gl_FragColor=vec4(color/6.0,1.0); }` },

    bloom: { name: "Dream Bloom", cat: "Blur & Dream", params: {
        thresh:{type:"range",min:0,max:1,val:0.6,name:"Threshold"},
        intensity:{type:"range",min:0,max:2,val:1.0,name:"Intensity"} },
        frag:`${SHADER_HEAD} uniform float thresh; uniform float intensity;
        void main(){ vec4 base=texture2D(u_image,v_texCoord); vec3 glow=vec3(0.0); float w=0.0;
        for(int x=-1;x<=1;x++){ for(int y=-1;y<=1;y++){ vec2 off=vec2(float(x),float(y))*0.005;
        vec3 s=texture2D(u_image,v_texCoord+off).rgb; if(lum(s)>thresh){ glow+=s; w+=1.0; } } }
        if(w>0.0) glow/=w; gl_FragColor=vec4(base.rgb+glow*intensity,1.0); }` },

    streaks: { name: "Light Streaks", cat: "Blur & Dream", params: {
        len:{type:"range",min:0,max:0.2,val:0.05,name:"Streak Length"},
        thresh:{type:"range",min:0.1,max:1,val:0.7,name:"Glow Threshold"},
        tint:{type:"color",val:"#00aaff",name:"Tint"} },
        frag:`${SHADER_HEAD} uniform float len; uniform float thresh; uniform vec3 tint;
        void main(){ vec4 base=texture2D(u_image,v_texCoord); vec3 glow=vec3(0.0);
        for(int i=0;i<6;i++){ float fi=float(i); vec3 s=texture2D(u_image,v_texCoord+vec2(fi*len*0.1,0.0)).rgb;
        if(lum(s)>thresh) glow+=s*tint*(1.0-fi/6.0); } gl_FragColor=vec4(base.rgb+glow*0.5,1.0); }` },

    tiltshift: { name: "Tilt Shift", cat: "Blur & Dream", params: {
        focus:{type:"range",min:0,max:1,val:0.5,name:"Focus Line"},
        width:{type:"range",min:0.05,max:0.6,val:0.25,name:"Focus Width"},
        amount:{type:"range",min:0,max:0.03,val:0.012,name:"Blur"} },
        frag:`${SHADER_HEAD} uniform float focus; uniform float width; uniform float amount;
        void main(){ float d=abs(v_texCoord.y-focus); float b=smoothstep(width,width+0.25,d)*amount;
        vec3 c=vec3(0.0); float total=0.0;
        for(int i=-3;i<=3;i++){ float fi=float(i); float w=1.0-abs(fi)/3.0;
        c+=texture2D(u_image,v_texCoord+vec2(0.0,fi*b)).rgb*w; total+=w; }
        gl_FragColor=vec4(c/total,1.0); }` },

    // ---- DISTORTION ----
    chromatic: { name: "Aberration", cat: "Distortion", params: {
        amount:{type:"range",min:0,max:0.1,val:0.015,name:"Shift Amount"},
        radial:{type:"range",min:0,max:1,val:0.5,name:"Radial Falloff"} },
        frag:`${SHADER_HEAD} uniform float amount; uniform float radial;
        void main(){ vec2 dir=vec2(1.0,0.0); float dist=distance(v_texCoord,vec2(0.5));
        float amt=amount*mix(1.0,dist*2.0,radial);
        float r=texture2D(u_image,v_texCoord+dir*amt).r; float g=texture2D(u_image,v_texCoord).g;
        float b=texture2D(u_image,v_texCoord-dir*amt).b; gl_FragColor=vec4(r,g,b,1.0); }` },

    liquid: { name: "Liquid Warp", cat: "Distortion", params: {
        freq:{type:"range",min:1,max:30,val:10,name:"Frequency"},
        amp:{type:"range",min:0,max:0.2,val:0.05,name:"Amplitude"},
        speed:{type:"range",min:0,max:5,val:1.5,name:"Speed"} },
        frag:`${SHADER_HEAD} uniform float freq; uniform float amp; uniform float speed;
        void main(){ vec2 uv=v_texCoord; float n=noise(uv*freq+u_time*speed);
        uv.x+=sin(n*6.28)*amp; uv.y+=cos(n*6.28)*amp; gl_FragColor=texture2D(u_image,uv); }` },

    ripple: { name: "Ripple", cat: "Distortion", params: {
        freq:{type:"range",min:5,max:80,val:30,name:"Frequency"},
        amp:{type:"range",min:0,max:0.1,val:0.02,name:"Amplitude"},
        speed:{type:"range",min:0,max:6,val:2,name:"Speed"} },
        frag:`${SHADER_HEAD} uniform float freq; uniform float amp; uniform float speed;
        void main(){ vec2 c=v_texCoord-0.5; float d=length(c);
        float off=sin(d*freq - u_time*speed)*amp; vec2 uv=v_texCoord+normalize(c)*off;
        gl_FragColor=texture2D(u_image,uv); }` },

    swirl: { name: "Swirl", cat: "Distortion", params: {
        strength:{type:"range",min:-8,max:8,val:3,name:"Strength"},
        radius:{type:"range",min:0.1,max:1,val:0.6,name:"Radius"} },
        frag:`${SHADER_HEAD} uniform float strength; uniform float radius;
        void main(){ vec2 c=v_texCoord-0.5; float d=length(c);
        float a=atan(c.y,c.x)+strength*smoothstep(radius,0.0,d);
        vec2 uv=vec2(cos(a),sin(a))*d+0.5; gl_FragColor=texture2D(u_image,uv); }` },

    fisheye: { name: "Fisheye", cat: "Distortion", params: {
        amount:{type:"range",min:-1,max:1,val:0.5,name:"Amount"} },
        frag:`${SHADER_HEAD} uniform float amount;
        void main(){ vec2 c=v_texCoord-0.5; float d=length(c);
        float f=1.0+amount*d*d*2.0; vec2 uv=c*f+0.5; gl_FragColor=texture2D(u_image,uv); }` },

    kaleidoscope: { name: "Kaleidoscope", cat: "Distortion", params: {
        mode:{type:"select",options:{"Classic Mirrored":0,"Endless Tunnel":1},val:0,name:"Render Mode"},
        segments:{type:"range",min:1,max:32,val:8,name:"Segments"},
        twist:{type:"range",min:-5,max:5,val:0,name:"Twist"},
        zoom:{type:"range",min:0.1,max:5,val:1,name:"Zoom Level"},
        offX:{type:"range",min:-0.5,max:0.5,val:0,name:"Offset X"},
        offY:{type:"range",min:-0.5,max:0.5,val:0,name:"Offset Y"} },
        frag:`${SHADER_HEAD} uniform float mode; uniform float segments; uniform float twist; uniform float zoom; uniform float offX; uniform float offY;
        void main(){ vec2 center=vec2(0.5-offX,0.5+offY); vec2 uv=v_texCoord-center; uv/=zoom;
        float radius=length(uv); float angle=atan(uv.y,uv.x);
        if(mode==1.0) radius=fract(1.0/radius+u_time*0.5); angle+=radius*twist+u_time*0.2;
        float seg=6.28318/max(1.0,floor(segments)); angle=mod(angle,seg); angle=abs(angle-seg/2.0);
        vec2 m=vec2(cos(angle),sin(angle))*radius+center; gl_FragColor=texture2D(u_image,fract(m)); }` },

    fractal: { name: "Fractal Zoom", cat: "Distortion", params: {
        zoom:{type:"range",min:0.1,max:2,val:0.9,name:"Recursion Zoom"},
        iterations:{type:"range",min:1,max:5,val:5,name:"Iterations"} },
        frag:`${SHADER_HEAD} uniform float zoom; uniform float iterations;
        void main(){ vec2 uv=v_texCoord; vec4 color=vec4(0.0); float w=1.0; float totalW=0.0;
        for(int i=0;i<5;i++){ if(float(i)>=iterations) break; color+=texture2D(u_image,fract(uv))*w;
        totalW+=w; w*=0.7; uv=(uv-0.5)*zoom+0.5; } gl_FragColor=color/totalW; }` },

    moire: { name: "Moire Pattern", cat: "Distortion", params: {
        lines:{type:"range",min:10,max:500,val:200,name:"Density"},
        angle:{type:"range",min:0,max:3.14,val:0.1,name:"Angle"} },
        frag:`${SHADER_HEAD} uniform float lines; uniform float angle;
        void main(){ float s=sin(angle),c=cos(angle);
        vec2 uv2=vec2(v_texCoord.x*c-v_texCoord.y*s, v_texCoord.x*s+v_texCoord.y*c);
        float m=(sin(v_texCoord.x*lines)+sin(uv2.x*lines))*0.5;
        vec4 col=texture2D(u_image,v_texCoord); gl_FragColor=vec4(col.rgb-vec3(m*0.5),1.0); }` },

    // ---- GLITCH & DIGITAL ----
    pixelate: { name: "Pixelate", cat: "Glitch & Digital", params: {
        size:{type:"range",min:2,max:200,val:40,name:"Block Size"} },
        frag:`${SHADER_HEAD} uniform float size;
        void main(){ vec2 d=vec2(size)/u_resolution; vec2 uv=(floor(v_texCoord/d)+0.5)*d;
        gl_FragColor=texture2D(u_image,uv); }` },

    pixelsort: { name: "Pixel Sort", cat: "Glitch & Digital", params: {
        thresh:{type:"range",min:0,max:1,val:0.6,name:"Threshold"},
        len:{type:"range",min:0,max:0.5,val:0.1,name:"Sort Length"} },
        frag:`${SHADER_HEAD} uniform float thresh; uniform float len;
        void main(){ vec2 uv=v_texCoord; vec4 o=texture2D(u_image,uv);
        if(lum(o.rgb)>thresh){ float shift=noise(vec2(uv.y*50.0,u_time))*len; uv.y-=shift; }
        gl_FragColor=texture2D(u_image,fract(uv)); }` },

    datamosh: { name: "Datamosh", cat: "Glitch & Digital", params: {
        blockSize:{type:"range",min:10,max:200,val:50,name:"Block Size"},
        corrupt:{type:"range",min:0,max:1,val:0.3,name:"Corruption"} },
        frag:`${SHADER_HEAD} uniform float blockSize; uniform float corrupt;
        void main(){ vec2 uv=v_texCoord; vec2 b=floor(uv*blockSize)/blockSize; float n=rand(b+floor(u_time*5.0));
        if(n<corrupt){ uv.x+=(rand(b)-0.5)*0.1; uv.y+=(rand(b+1.0)-0.5)*0.1; }
        vec4 col=texture2D(u_image,uv); if(n<corrupt*0.5) col.rgb=col.gbr; gl_FragColor=col; }` },

    glitch: { name: "Glitch", cat: "Glitch & Digital", params: {
        intensity:{type:"range",min:0,max:1,val:0.3,name:"Displacement"},
        speed:{type:"range",min:0,max:10,val:4.0,name:"Speed"} },
        frag:`${SHADER_HEAD} uniform float intensity; uniform float speed;
        void main(){ vec2 uv=v_texCoord; float t=u_time*speed;
        float dy=rand(vec2(t,floor(uv.y*20.0)))*0.1*intensity;
        if(rand(vec2(t,floor(uv.y*5.0)))>0.9-(intensity*0.4)) uv.x+=(dy-0.05);
        float split=0.02*rand(vec2(t,1.0))*intensity*5.0;
        float r=texture2D(u_image,vec2(uv.x+split,uv.y)).r; float g=texture2D(u_image,uv).g;
        float b=texture2D(u_image,vec2(uv.x-split,uv.y)).b; gl_FragColor=vec4(r,g,b,1.0); }` },

    crt: { name: "CRT / VHS", cat: "Glitch & Digital", params: {
        curvature:{type:"range",min:0,max:1,val:0.2,name:"Curvature"},
        noiseIntensity:{type:"range",min:0,max:1,val:0.1,name:"Static Noise"} },
        frag:`${SHADER_HEAD} uniform float curvature; uniform float noiseIntensity;
        void main(){ vec2 uv=v_texCoord*2.0-1.0; uv=uv+uv*(uv.yx/5.0)*(uv.yx/5.0)*curvature; uv=uv*0.5+0.5;
        if(uv.x<0.0||uv.x>1.0||uv.y<0.0||uv.y>1.0){ gl_FragColor=vec4(0.0,0.0,0.0,1.0); return; }
        vec4 col=texture2D(u_image,uv); col.rgb-=(sin(uv.y*u_resolution.y*2.0)*0.5+0.5)*0.2;
        col.rgb+=(rand(uv*u_time)-0.5)*noiseIntensity; gl_FragColor=col; }` },

    scanlines: { name: "Scanlines", cat: "Glitch & Digital", params: {
        count:{type:"range",min:50,max:1000,val:400,name:"Line Count"},
        strength:{type:"range",min:0,max:1,val:0.4,name:"Strength"} },
        frag:`${SHADER_HEAD} uniform float count; uniform float strength;
        void main(){ vec3 c=texture2D(u_image,v_texCoord).rgb;
        float s=sin(v_texCoord.y*count)*0.5+0.5; gl_FragColor=vec4(c*(1.0-s*strength),1.0); }` },

    // ---- PRINT & PAPER ----
    paper: { name: "Thin Paper", cat: "Print & Paper", params: {
        roughness:{type:"range",min:0,max:1,val:0.5,name:"Fiber Density"},
        crumple:{type:"range",min:0,max:0.5,val:0.2,name:"Crumple Depth"} },
        frag:`${SHADER_HEAD} uniform float roughness; uniform float crumple;
        void main(){ vec3 base=texture2D(u_image,v_texCoord).rgb;
        float c=noise(v_texCoord*4.0)*0.5+noise(v_texCoord*12.0)*0.25;
        float f=noise(vec2(v_texCoord.x*200.0,v_texCoord.y*5.0))*roughness;
        float f2=noise(vec2(v_texCoord.x*5.0,v_texCoord.y*200.0))*roughness;
        vec3 paper=vec3(0.98,0.97,0.95); gl_FragColor=vec4(base*paper-(c*crumple)-((f+f2)*0.2),1.0); }` },

    folded: { name: "Folded Paper", cat: "Print & Paper", params: {
        folds:{type:"range",min:1,max:20,val:5,name:"Folds"},
        depth:{type:"range",min:0,max:0.1,val:0.03,name:"Depth"} },
        frag:`${SHADER_HEAD} uniform float folds; uniform float depth;
        void main(){ float f=abs(fract(v_texCoord.x*folds)-0.5)*2.0; vec2 uv=v_texCoord; uv.y+=f*depth;
        vec3 img=texture2D(u_image,uv).rgb; gl_FragColor=vec4(img-(1.0-f)*depth*5.0,1.0); }` },

    print: { name: "Misregister", cat: "Print & Paper", params: {
        offset:{type:"range",min:0,max:0.02,val:0.005,name:"Plate Offset"},
        bleed:{type:"range",min:0,max:0.5,val:0.2,name:"Ink Bleed"} },
        frag:`${SHADER_HEAD} uniform float offset; uniform float bleed;
        void main(){ vec2 uv=v_texCoord; float b=noise(uv*100.0)*bleed*0.01;
        float r=texture2D(u_image,uv+vec2(offset+b,offset-b)).r; float g=texture2D(u_image,uv+vec2(-offset+b,offset+b)).g;
        float bl=texture2D(u_image,uv+vec2(0.0,-offset-b)).b; gl_FragColor=vec4(r,g,bl,1.0); }` },

    xerox: { name: "Dirty Xerox", cat: "Print & Paper", params: {
        dirt:{type:"range",min:0,max:1,val:0.5,name:"Dirt"},
        streak:{type:"range",min:0,max:1,val:0.3,name:"Streaks"},
        dark:{type:"range",min:-0.5,max:0.5,val:0.1,name:"Toner Darkness"} },
        frag:`${SHADER_HEAD} uniform float dirt; uniform float streak; uniform float dark;
        void main(){ float l=lum(texture2D(u_image,v_texCoord).rgb)-dark; float n=rand(v_texCoord*u_time)*dirt;
        float s=noise(vec2(v_texCoord.x*100.0,0.0))*streak; float res=step(0.5,l+n-s); gl_FragColor=vec4(vec3(res),1.0); }` },

    stamp: { name: "Print Stamp", cat: "Print & Paper", params: {
        grunge:{type:"range",min:0,max:2,val:1,name:"Grunge Amount"},
        press:{type:"range",min:0,max:1,val:0.5,name:"Pressure"},
        ink:{type:"color",val:"#b22222",name:"Ink"} },
        frag:`${SHADER_HEAD} uniform float grunge; uniform float press; uniform vec3 ink;
        void main(){ float l=lum(texture2D(u_image,v_texCoord).rgb); float n=noise(v_texCoord*50.0)*grunge;
        float mask=step(press,l+n); gl_FragColor=vec4(mix(ink,vec3(1.0),mask),1.0); }` },

    risograph: { name: "Risograph", cat: "Print & Paper", params: {
        off:{type:"range",min:0,max:0.02,val:0.005,name:"Misregistration"},
        dot:{type:"range",min:50,max:500,val:200,name:"Dot Size"},
        rough:{type:"range",min:0,max:0.3,val:0.1,name:"Paper Noise"} },
        frag:`${SHADER_HEAD} uniform float off; uniform float dot; uniform float rough;
        void main(){ vec2 uv=v_texCoord; float r=texture2D(u_image,uv+vec2(off,off)).r;
        float g=texture2D(u_image,uv).g; float b=texture2D(u_image,uv-vec2(off,off)).b;
        float n=(rand(uv)-0.5)*rough; float p=sin(uv.x*dot)*sin(uv.y*dot)*0.1;
        gl_FragColor=vec4(r+p+n,g+p+n,b+p+n,1.0); }` },

    halftone: { name: "Halftone", cat: "Print & Paper", params: {
        scale:{type:"range",min:50,max:500,val:150,name:"Dot Scale"} },
        frag:`${SHADER_HEAD} uniform float scale;
        void main(){ vec4 col=texture2D(u_image,v_texCoord); float l=lum(col.rgb);
        vec2 pos=v_texCoord*vec2(u_resolution.x/u_resolution.y,1.0)*scale;
        float p=sin(pos.x)*sin(pos.y); float ht=clamp((l*10.0-5.0+p)*3.0,0.0,1.0); gl_FragColor=vec4(vec3(ht),1.0); }` },

    cmyk: { name: "CMYK Halftone", cat: "Print & Paper", params: {
        scale:{type:"range",min:40,max:400,val:120,name:"Dot Scale"} },
        frag:`${SHADER_HEAD} uniform float scale;
        float dots(vec2 uv, float angle, float v){ float s=sin(angle),c=cos(angle);
          vec2 p=vec2(uv.x*c-uv.y*s, uv.x*s+uv.y*c)*scale;
          float d=length(fract(p)-0.5); return step(d, v*0.8); }
        void main(){ vec2 uv=v_texCoord*vec2(u_resolution.x/u_resolution.y,1.0); vec3 rgb=texture2D(u_image,v_texCoord).rgb;
          float k=1.0-max(rgb.r,max(rgb.g,rgb.b)); vec3 cmy=(1.0-rgb-k)/max(1.0-k,0.001);
          float C=dots(uv,0.26,cmy.x); float M=dots(uv,1.30,cmy.y); float Y=dots(uv,0.0,cmy.z); float K=dots(uv,0.78,k);
          vec3 col=vec3(1.0); col-=vec3(0.0,C,C); col-=vec3(M,0.0,M); col-=vec3(Y,Y,0.0); col-=vec3(K);
          gl_FragColor=vec4(clamp(col,0.0,1.0),1.0); }` },

    // ---- FILM & GRAIN ----
    fuji: { name: "Fuji Film", cat: "Film & Grain", params: {
        grain:{type:"range",min:0,max:0.3,val:0.1,name:"Grain"},
        warmth:{type:"range",min:-0.5,max:0.5,val:0.1,name:"Warmth"},
        fade:{type:"range",min:0,max:0.4,val:0.15,name:"Fade"} },
        frag:`${SHADER_HEAD} uniform float grain; uniform float warmth; uniform float fade;
        void main(){ vec3 c=texture2D(u_image,v_texCoord).rgb; c.r+=warmth*c.r; c.b-=warmth*c.b; c=c*(1.0-fade)+fade;
        float n=(rand(v_texCoord*vec2(u_time))-0.5)*grain; float vig=smoothstep(1.5,0.5,length(v_texCoord-0.5)*2.0);
        gl_FragColor=vec4(c*vig+n,1.0); }` },

    grunge: { name: "Heavy Grunge", cat: "Film & Grain", params: {
        dirt:{type:"range",min:0,max:2,val:1,name:"Dirt Amount"},
        scratches:{type:"range",min:0,max:1,val:0.5,name:"Scratches"} },
        frag:`${SHADER_HEAD} uniform float dirt; uniform float scratches;
        void main(){ vec3 c=texture2D(u_image,v_texCoord).rgb; float d=noise(v_texCoord*10.0)*noise(v_texCoord*50.0)*dirt;
        float s=step(0.98,noise(vec2(v_texCoord.x*100.0,v_texCoord.y*2.0)))*scratches; gl_FragColor=vec4(c-vec3(d)-vec3(s),1.0); }` },

    vignette: { name: "Vignette", cat: "Film & Grain", params: {
        amount:{type:"range",min:0,max:1.5,val:0.6,name:"Amount"},
        softness:{type:"range",min:0.1,max:2,val:0.8,name:"Softness"} },
        frag:`${SHADER_HEAD} uniform float amount; uniform float softness;
        void main(){ vec3 c=texture2D(u_image,v_texCoord).rgb; float d=length(v_texCoord-0.5)*1.414;
        float v=smoothstep(softness,softness-0.5,d); gl_FragColor=vec4(c*mix(1.0,v,amount),1.0); }` },

    // ---- MONO & DITHER ----
    bitmap: { name: "Bitmap 1-Bit", cat: "Mono & Dither", params: {
        scale:{type:"range",min:1,max:10,val:2,name:"Pixel Scale"},
        thresh:{type:"range",min:0,max:1,val:0.5,name:"Threshold"},
        c1:{type:"color",val:"#000000",name:"Dark"},
        c2:{type:"color",val:"#FFFFFF",name:"Light"} },
        frag:`${SHADER_HEAD} uniform float scale; uniform float thresh; uniform vec3 c1; uniform vec3 c2;
        const mat4 bayer=mat4(0.,8.,2.,10.,12.,4.,14.,6.,3.,11.,1.,9.,15.,7.,13.,5.)/16.0;
        void main(){ vec2 res=u_resolution/scale; vec2 uv=floor(v_texCoord*res)/res; vec2 p=mod(uv*res,4.0); float limit=0.0;
        if(p.x<1.){ if(p.y<1.)limit=bayer[0][0]; else if(p.y<2.)limit=bayer[0][1]; else if(p.y<3.)limit=bayer[0][2]; else limit=bayer[0][3]; }
        else if(p.x<2.){ if(p.y<1.)limit=bayer[1][0]; else if(p.y<2.)limit=bayer[1][1]; else if(p.y<3.)limit=bayer[1][2]; else limit=bayer[1][3]; }
        else if(p.x<3.){ if(p.y<1.)limit=bayer[2][0]; else if(p.y<2.)limit=bayer[2][1]; else if(p.y<3.)limit=bayer[2][2]; else limit=bayer[2][3]; }
        else { if(p.y<1.)limit=bayer[3][0]; else if(p.y<2.)limit=bayer[3][1]; else if(p.y<3.)limit=bayer[3][2]; else limit=bayer[3][3]; }
        float l=lum(texture2D(u_image,uv).rgb); gl_FragColor=vec4(mix(c1,c2,step(limit*thresh*2.0,l)),1.0); }` },

    modDither: { name: "Mod Dither", cat: "Mono & Dither", params: {
        freq:{type:"range",min:10,max:300,val:100,name:"Wave Freq"},
        amp:{type:"range",min:0,max:1,val:0.5,name:"Amplitude"} },
        frag:`${SHADER_HEAD} uniform float freq; uniform float amp;
        void main(){ float l=lum(texture2D(u_image,v_texCoord).rgb); float wave=sin(v_texCoord.x*freq)*sin(v_texCoord.y*freq)*amp;
        gl_FragColor=vec4(vec3(step(0.5,l+wave)),1.0); }` },

    threshold: { name: "Threshold", cat: "Mono & Dither", params: {
        cut:{type:"range",min:0,max:1,val:0.5,name:"Cutoff"},
        invert:{type:"select",options:{"Normal":0,"Inverted":1},val:0,name:"Invert"} },
        frag:`${SHADER_HEAD} uniform float cut; uniform float invert;
        void main(){ float l=lum(texture2D(u_image,v_texCoord).rgb); float t=step(cut,l); gl_FragColor=vec4(vec3(abs(invert-t)),1.0); }` },

    ascii: { name: "Term ASCII", cat: "Mono & Dither", params: {
        scale:{type:"range",min:20,max:200,val:80,name:"Resolution"},
        charBias:{type:"range",min:0,max:1,val:0.5,name:"Char Bias"},
        c:{type:"color",val:"#00ff00",name:"Color"} },
        frag:`${SHADER_HEAD} uniform float scale; uniform float charBias; uniform vec3 c;
        void main(){ vec2 uv=floor(v_texCoord*scale)/scale; vec2 p=fract(v_texCoord*scale);
        float l=lum(texture2D(u_image,uv).rgb)+charBias*0.2; float draw=0.0;
        if(l>0.8) draw=step(abs(p.x-0.5),0.1)+step(abs(p.y-0.5),0.1);
        else if(l>0.5) draw=step(abs(p.x-p.y),0.1)+step(abs(p.x+p.y-1.0),0.1);
        else if(l>0.2) draw=step(length(p-0.5),0.3)-step(length(p-0.5),0.2);
        else if(l>0.1) draw=step(length(p-0.5),0.1);
        gl_FragColor=vec4(mix(vec3(0.0),c,clamp(draw,0.,1.)),1.0); }` },

    // ---- ARTISTIC ----
    sobel: { name: "Neon Edge", cat: "Artistic", params: {
        mode:{type:"select",options:{"Black/White Lines":0,"Neon Glow Overlay":1,"Hologram":2},val:1,name:"Style"},
        color:{type:"color",val:"#00ffcc",name:"Glow Color"} },
        frag:`${SHADER_HEAD} uniform float mode; uniform vec3 color;
        void main(){ vec2 px=1.0/u_resolution;
        float t=lum(texture2D(u_image,v_texCoord+vec2(0,-px.y)).rgb); float b=lum(texture2D(u_image,v_texCoord+vec2(0,px.y)).rgb);
        float l=lum(texture2D(u_image,v_texCoord+vec2(-px.x,0)).rgb); float r=lum(texture2D(u_image,v_texCoord+vec2(px.x,0)).rgb);
        float edge=abs(t-b)+abs(l-r); edge=smoothstep(0.1,0.5,edge); vec3 base=texture2D(u_image,v_texCoord).rgb; vec3 final;
        if(mode==0.0) final=vec3(edge); else if(mode==1.0) final=mix(vec3(1.0-edge),base+edge*color,1.0); else final=base*0.2+edge*color;
        gl_FragColor=vec4(final,1.0); }` },

    scribble: { name: "Scribble Art", cat: "Artistic", params: {
        dens:{type:"range",min:10,max:300,val:100,name:"Density"},
        thick:{type:"range",min:0.1,max:3.0,val:1.0,name:"Thickness"},
        ink:{type:"color",val:"#111111",name:"Ink"},
        paper:{type:"color",val:"#f4f4f0",name:"Paper"} },
        frag:`${SHADER_HEAD} uniform float dens; uniform float thick; uniform vec3 ink; uniform vec3 paper;
        void main(){ float l=lum(texture2D(u_image,v_texCoord).rgb); float n=noise(v_texCoord*dens);
        float h1=sin((v_texCoord.x+v_texCoord.y)*dens)*0.5+0.5; float h2=sin((v_texCoord.x-v_texCoord.y)*dens*1.5)*0.5+0.5;
        float hatch=mix(h1,h2,n); float draw=step(l+hatch*0.5,0.6+thick*0.2); gl_FragColor=vec4(mix(paper,ink,draw),1.0); }` },

    oil: { name: "Oil Paint", cat: "Artistic", params: {
        radius:{type:"range",min:0.001,max:0.02,val:0.006,name:"Brush Size"} },
        frag:`${SHADER_HEAD} uniform float radius;
        void main(){ vec3 mean=vec3(0.0); float best=1e9; vec3 chosen=texture2D(u_image,v_texCoord).rgb;
        for(int i=0;i<8;i++){ float a=float(i)*0.785; vec2 off=vec2(cos(a),sin(a))*radius;
          vec3 s1=texture2D(u_image,v_texCoord+off).rgb; vec3 s2=texture2D(u_image,v_texCoord+off*0.5).rgb;
          vec3 m=(s1+s2)*0.5; float var=length(s1-s2); if(var<best){ best=var; chosen=m; } }
        gl_FragColor=vec4(chosen,1.0); }` },

    crosshatch: { name: "Crosshatch", cat: "Artistic", params: {
        density:{type:"range",min:20,max:200,val:80,name:"Density"},
        ink:{type:"color",val:"#1a1a1a",name:"Ink"} },
        frag:`${SHADER_HEAD} uniform float density; uniform vec3 ink;
        void main(){ float l=lum(texture2D(u_image,v_texCoord).rgb); vec2 p=v_texCoord*density; float c=1.0;
        if(l<0.8){ c=min(c, smoothstep(0.0,0.4,abs(mod(p.x+p.y,4.0)-2.0))); }
        if(l<0.6){ c=min(c, smoothstep(0.0,0.4,abs(mod(p.x-p.y,4.0)-2.0))); }
        if(l<0.4){ c=min(c, smoothstep(0.0,0.4,abs(mod(p.x,4.0)-2.0))); }
        if(l<0.2){ c=min(c, smoothstep(0.0,0.4,abs(mod(p.y,4.0)-2.0))); }
        gl_FragColor=vec4(mix(ink,vec3(0.98),c),1.0); }` },

    foil: { name: "Foil Stamp", cat: "Artistic", params: {
        thresh:{type:"range",min:0,max:1,val:0.5,name:"Threshold"},
        foil:{type:"color",val:"#d4af37",name:"Foil Color"} },
        frag:`${SHADER_HEAD} uniform float thresh; uniform vec3 foil;
        void main(){ float l=lum(texture2D(u_image,v_texCoord).rgb); float edge=smoothstep(thresh-0.05,thresh+0.05,l);
        float n=noise(v_texCoord*50.0); vec3 metallic=foil*(0.8+n*0.4); gl_FragColor=vec4(mix(vec3(0.1),metallic,edge),1.0); }` },

    mesh: { name: "Mesh Grad", cat: "Artistic", params: {
        speed:{type:"range",min:0,max:2,val:0.5,name:"Speed"},
        blend:{type:"range",min:0,max:1,val:0.7,name:"Blend"},
        c1:{type:"color",val:"#ff0055",name:"C1"},
        c2:{type:"color",val:"#0055ff",name:"C2"},
        c3:{type:"color",val:"#ffaa00",name:"C3"} },
        frag:`${SHADER_HEAD} uniform float speed; uniform float blend; uniform vec3 c1; uniform vec3 c2; uniform vec3 c3;
        void main(){ vec2 p=v_texCoord*2.0-1.0; float t=u_time*speed; float n1=noise(p*2.0+vec2(t,t*0.5));
        float n2=noise(p*3.0-vec2(t*0.8,-t*0.3)); vec3 mesh=mix(mix(c1,c2,n1),c3,n2);
        vec4 img=texture2D(u_image,v_texCoord); gl_FragColor=vec4(mix(img.rgb,mesh,blend),1.0); }` },

    blob: { name: "Blob Tracker", cat: "Artistic", params: {
        thresh:{type:"range",min:0.1,max:0.9,val:0.5,name:"Fluid Threshold"},
        smoothW:{type:"range",min:0,max:0.2,val:0.05,name:"Edge Blur"} },
        frag:`${SHADER_HEAD} uniform float thresh; uniform float smoothW;
        void main(){ float l=lum(texture2D(u_image,v_texCoord).rgb); float blob=smoothstep(thresh-smoothW,thresh+smoothW,l);
        gl_FragColor=vec4(vec3(blob),1.0); }` },

    // ---- NEW: DESIGNER / SOCIAL EFFECTS ----
    asciiart: { name: "ASCII Art", cat: "Mono & Dither", params: {
        cols:{type:"range",min:30,max:220,val:110,name:"Columns"},
        contrast:{type:"range",min:0.5,max:3,val:1.4,name:"Contrast"},
        colorMode:{type:"select",options:{"Mono Ink":0,"Keep Colors":1,"Palette":2},val:0,name:"Color Mode"},
        ink:{type:"color",val:"#e8ff45",name:"Ink"},
        bg:{type:"color",val:"#070707",name:"Background"} },
        frag:`${SHADER_HEAD} uniform float cols; uniform float contrast; uniform float colorMode; uniform vec3 ink; uniform vec3 bg;
        float glyph(float l, vec2 p){
          float d=0.0;
          if(l>0.88){ d=max(step(abs(p.x-0.5),0.36)*step(abs(p.y-0.5),0.36), 0.0); }
          else if(l>0.72){ d=step(abs(p.x-0.5),0.09)+step(abs(p.y-0.5),0.09); }
          else if(l>0.56){ d=step(abs(p.x-p.y),0.10)+step(abs(p.x+p.y-1.0),0.10); }
          else if(l>0.42){ d=step(abs(p.y-0.5),0.09)+step(abs(p.x-0.5),0.09)*step(abs(p.y-0.5),0.3); }
          else if(l>0.30){ d=step(abs(p.y-0.5),0.08); }
          else if(l>0.18){ d=step(length(p-0.5),0.16); }
          else if(l>0.08){ d=step(length(p-0.5),0.07); }
          return clamp(d,0.0,1.0); }
        void main(){ float aspect=u_resolution.x/max(u_resolution.y,1.0);
          vec2 grid=vec2(cols, max(4.0, floor(cols/aspect*0.55)));
          vec2 cell=floor(v_texCoord*grid)/grid; vec2 p=fract(v_texCoord*grid);
          vec3 src=texture2D(u_image, cell+0.5/grid).rgb;
          float l=clamp((lum(src)-0.5)*contrast+0.5,0.0,1.0);
          float d=glyph(l,p);
          vec3 fg = ink;
          if(colorMode>0.5 && colorMode<1.5) fg = src;
          if(colorMode>1.5) fg = mix(u_pal3,u_pal4,l);
          vec3 back = colorMode>1.5 ? u_pal1 : bg;
          gl_FragColor=vec4(mix(back,fg,d),1.0); }` },

    bayer: { name: "Ordered Dither", cat: "Mono & Dither", params: {
        scale:{type:"range",min:1,max:12,val:3,name:"Pixel Scale"},
        levels:{type:"range",min:2,max:8,val:2,name:"Levels"},
        tintMode:{type:"select",options:{"Black / White":0,"Palette":1},val:0,name:"Colors"} },
        frag:`${SHADER_HEAD} uniform float scale; uniform float levels; uniform float tintMode;
        float bayer4(vec2 p){ vec2 c=mod(floor(p),4.0); float i=c.x+c.y*4.0;
          float m[16];
          m[0]=0.0;m[1]=8.0;m[2]=2.0;m[3]=10.0;m[4]=12.0;m[5]=4.0;m[6]=14.0;m[7]=6.0;
          m[8]=3.0;m[9]=11.0;m[10]=1.0;m[11]=9.0;m[12]=15.0;m[13]=7.0;m[14]=13.0;m[15]=5.0;
          float v=0.0; for(int k=0;k<16;k++){ if(float(k)==i) v=m[k]; }
          return v/16.0; }
        void main(){ vec2 px=max(vec2(1.0),floor(vec2(scale)));
          vec2 uv=(floor(v_texCoord*u_resolution/px)+0.5)*px/u_resolution;
          float l=lum(texture2D(u_image,uv).rgb);
          float n=max(2.0,floor(levels))-1.0;
          float d=bayer4(v_texCoord*u_resolution/px);
          float q=floor(l*n + d)/n;
          vec3 col = tintMode<0.5 ? vec3(q) : mix(u_pal1,u_pal4,q);
          gl_FragColor=vec4(col,1.0); }` },

    newsprint: { name: "Newsprint", cat: "Print & Paper", params: {
        dots:{type:"range",min:40,max:400,val:150,name:"Dot Density"},
        angle:{type:"range",min:0,max:1.57,val:0.4,name:"Screen Angle"},
        ink:{type:"color",val:"#141414",name:"Ink"},
        paper:{type:"color",val:"#efe9dc",name:"Paper"} },
        frag:`${SHADER_HEAD} uniform float dots; uniform float angle; uniform vec3 ink; uniform vec3 paper;
        void main(){ float s=sin(angle),c=cos(angle);
          vec2 uv=vec2(v_texCoord.x*c-v_texCoord.y*s, v_texCoord.x*s+v_texCoord.y*c);
          vec2 g=fract(uv*dots)-0.5;
          float l=lum(texture2D(u_image,v_texCoord).rgb);
          float r=sqrt(1.0-clamp(l,0.0,1.0))*0.55;
          float d=smoothstep(r, r-0.06, length(g));
          float fiber=noise(v_texCoord*380.0)*0.06;
          gl_FragColor=vec4(mix(paper-fiber, ink, d),1.0); }` },

    chrome: { name: "Liquid Chrome", cat: "Artistic", params: {
        flow:{type:"range",min:0,max:4,val:1.2,name:"Flow Speed"},
        warp:{type:"range",min:0,max:0.2,val:0.06,name:"Warp"},
        shine:{type:"range",min:0,max:2,val:1.0,name:"Shine"} },
        frag:`${SHADER_HEAD} uniform float flow; uniform float warp; uniform float shine;
        void main(){ vec2 uv=v_texCoord; float t=u_time*flow;
          float n=fbm(uv*4.0+vec2(t*0.4,-t*0.3));
          uv+=vec2(sin(n*6.28)*warp, cos(n*6.28)*warp);
          vec3 src=texture2D(u_image,uv).rgb; float l=lum(src);
          float bands=sin((l*9.0+n*5.0+t)*3.14159);
          vec3 metal=vec3(0.55)+bands*0.45*shine;
          metal*=mix(vec3(0.85,0.9,1.05), vec3(1.05,0.98,0.9), n);
          gl_FragColor=vec4(clamp(metal,0.0,1.0),1.0); }` },

    plasma: { name: "Plasma Melt", cat: "Artistic", params: {
        speed:{type:"range",min:0,max:3,val:1.0,name:"Speed"},
        scale:{type:"range",min:1,max:12,val:4,name:"Scale"},
        mixAmt:{type:"range",min:0,max:1,val:0.65,name:"Mix"} },
        frag:`${SHADER_HEAD} uniform float speed; uniform float scale; uniform float mixAmt;
        void main(){ float t=u_time*speed; vec2 p=v_texCoord*scale;
          float v=sin(p.x+t)+sin(p.y+t*1.3)+sin((p.x+p.y+t)*0.7)+fbm(p+t*0.2)*2.0;
          v=v*0.25+0.5;
          vec3 pal=mix(u_pal1,u_pal2,smoothstep(0.0,0.4,v));
          pal=mix(pal,u_pal3,smoothstep(0.35,0.7,v)); pal=mix(pal,u_pal4,smoothstep(0.7,1.0,v));
          vec3 src=texture2D(u_image, v_texCoord+vec2(sin(v*6.28)*0.01, cos(v*6.28)*0.01)).rgb;
          gl_FragColor=vec4(mix(src,pal*lum(src)*1.6,mixAmt),1.0); }` },

    slitscan: { name: "Slit Scan", cat: "Glitch & Digital", params: {
        amount:{type:"range",min:0,max:0.5,val:0.15,name:"Smear"},
        speed:{type:"range",min:0,max:4,val:1.0,name:"Speed"},
        dir:{type:"select",options:{"Horizontal":0,"Vertical":1},val:0,name:"Direction"} },
        frag:`${SHADER_HEAD} uniform float amount; uniform float speed; uniform float dir;
        void main(){ vec2 uv=v_texCoord; float t=u_time*speed;
          float w=sin((dir<0.5?uv.y:uv.x)*22.0 + t*2.0)*0.5+0.5;
          float off=(w-0.5)*amount;
          if(dir<0.5) uv.x+=off; else uv.y+=off;
          gl_FragColor=texture2D(u_image,fract(uv)); }` },

    vhstrack: { name: "VHS Tracking", cat: "Glitch & Digital", params: {
        jitter:{type:"range",min:0,max:1,val:0.4,name:"Tracking Jitter"},
        bleed:{type:"range",min:0,max:0.05,val:0.012,name:"Color Bleed"},
        speed:{type:"range",min:0,max:4,val:1.2,name:"Speed"} },
        frag:`${SHADER_HEAD} uniform float jitter; uniform float bleed; uniform float speed;
        void main(){ vec2 uv=v_texCoord; float t=u_time*speed;
          float band=step(0.985-jitter*0.06, fract(uv.y*3.0 - t*0.35));
          uv.x+=band*(rand(vec2(floor(uv.y*160.0),floor(t*12.0)))-0.5)*0.12*jitter;
          uv.x+=sin(uv.y*400.0+t*8.0)*0.0012*jitter;
          float r=texture2D(u_image,uv+vec2(bleed,0.0)).r;
          float g=texture2D(u_image,uv).g;
          float b=texture2D(u_image,uv-vec2(bleed,0.0)).b;
          vec3 c=vec3(r,g,b);
          c-= (sin(uv.y*u_resolution.y*1.6)*0.5+0.5)*0.08;
          c+= (rand(uv*vec2(t+1.0))-0.5)*0.05;
          gl_FragColor=vec4(clamp(c,0.0,1.0),1.0); }` },

    holo: { name: "Holo Foil", cat: "Artistic", params: {
        speed:{type:"range",min:0,max:3,val:0.8,name:"Speed"},
        bands:{type:"range",min:2,max:40,val:14,name:"Bands"},
        strength:{type:"range",min:0,max:1,val:0.6,name:"Strength"} },
        frag:`${SHADER_HEAD} uniform float speed; uniform float bands; uniform float strength;
        void main(){ vec3 src=texture2D(u_image,v_texCoord).rgb; float t=u_time*speed;
          float a=(v_texCoord.x+v_texCoord.y)*bands + lum(src)*6.0 + t*2.0;
          vec3 rain=0.5+0.5*cos(vec3(a, a+2.09, a+4.18));
          float sheen=smoothstep(0.25,0.95,lum(src));
          gl_FragColor=vec4(mix(src, src*0.35+rain*sheen, strength),1.0); }` },

    anaglyph: { name: "3D Anaglyph", cat: "Distortion", params: {
        sep:{type:"range",min:0,max:0.06,val:0.012,name:"Separation"},
        depth:{type:"range",min:0,max:1,val:0.5,name:"Depth Bias"} },
        frag:`${SHADER_HEAD} uniform float sep; uniform float depth;
        void main(){ float d=lum(texture2D(u_image,v_texCoord).rgb);
          float s=sep*mix(1.0, d, depth);
          float r=texture2D(u_image,v_texCoord-vec2(s,0.0)).r;
          vec3 cy=texture2D(u_image,v_texCoord+vec2(s,0.0)).rgb;
          gl_FragColor=vec4(r, cy.g, cy.b, 1.0); }` },

    emboss: { name: "Emboss Relief", cat: "Artistic", params: {
        strength:{type:"range",min:0,max:4,val:1.5,name:"Strength"},
        tintAmt:{type:"range",min:0,max:1,val:0,name:"Keep Color"} },
        frag:`${SHADER_HEAD} uniform float strength; uniform float tintAmt;
        void main(){ vec2 px=1.0/u_resolution; vec3 src=texture2D(u_image,v_texCoord).rgb;
          vec3 a=texture2D(u_image,v_texCoord-px).rgb; vec3 b=texture2D(u_image,v_texCoord+px).rgb;
          float e=(lum(a)-lum(b))*strength+0.5;
          gl_FragColor=vec4(mix(vec3(e), src*e*1.6, tintAmt),1.0); }` },

    shatter: { name: "Voronoi Shatter", cat: "Distortion", params: {
        cells:{type:"range",min:2,max:40,val:12,name:"Shards"},
        push:{type:"range",min:0,max:0.15,val:0.04,name:"Displace"},
        edge:{type:"range",min:0,max:1,val:0.4,name:"Edge Ink"} },
        frag:`${SHADER_HEAD} uniform float cells; uniform float push; uniform float edge;
        void main(){ vec2 uv=v_texCoord; vec2 g=uv*cells; vec2 ip=floor(g); vec2 fp=fract(g);
          float best=9.0; float second=9.0; vec2 bestOff=vec2(0.0);
          for(int y=-1;y<=1;y++){ for(int x=-1;x<=1;x++){
            vec2 o=vec2(float(x),float(y));
            vec2 pnt=o+vec2(rand(ip+o), rand(ip+o+7.3));
            float d=length(pnt-fp);
            if(d<best){ second=best; best=d; bestOff=ip+o; } else if(d<second){ second=d; } } }
          vec2 disp=(vec2(rand(bestOff),rand(bestOff+3.1))-0.5)*push;
          vec3 c=texture2D(u_image, fract(uv+disp)).rgb;
          float line=smoothstep(0.0,0.06,second-best);
          gl_FragColor=vec4(mix(c*(1.0-edge), c, line),1.0); }` },

    mirrorsplit: { name: "Mirror Split", cat: "Distortion", params: {
        mode:{type:"select",options:{"Vertical":0,"Horizontal":1,"Quad":2},val:0,name:"Mode"},
        offset:{type:"range",min:-0.5,max:0.5,val:0,name:"Offset"} },
        frag:`${SHADER_HEAD} uniform float mode; uniform float offset;
        void main(){ vec2 uv=v_texCoord;
          if(mode<0.5){ uv.x=abs(uv.x-0.5+offset)+0.25; }
          else if(mode<1.5){ uv.y=abs(uv.y-0.5+offset)+0.25; }
          else { uv=abs(uv-0.5+offset)+0.25; }
          gl_FragColor=texture2D(u_image, clamp(uv,0.0,1.0)); }` },

    neonbleed: { name: "Neon Bleed", cat: "Artistic", params: {
        glow:{type:"range",min:0,max:3,val:1.4,name:"Glow"},
        thresh:{type:"range",min:0,max:1,val:0.45,name:"Edge Threshold"},
        c1:{type:"color",val:"#ff2fb9",name:"Glow A"},
        c2:{type:"color",val:"#25f4ee",name:"Glow B"} },
        frag:`${SHADER_HEAD} uniform float glow; uniform float thresh; uniform vec3 c1; uniform vec3 c2;
        void main(){ vec2 px=1.0/u_resolution; vec3 src=texture2D(u_image,v_texCoord).rgb;
          float t=lum(texture2D(u_image,v_texCoord+vec2(0.0,-px.y)).rgb);
          float b=lum(texture2D(u_image,v_texCoord+vec2(0.0,px.y)).rgb);
          float l=lum(texture2D(u_image,v_texCoord+vec2(-px.x,0.0)).rgb);
          float r=lum(texture2D(u_image,v_texCoord+vec2(px.x,0.0)).rgb);
          float e=smoothstep(thresh*0.4, thresh, abs(t-b)+abs(l-r));
          vec3 neon=mix(c1,c2,lum(src));
          gl_FragColor=vec4(clamp(src*0.25+neon*e*glow,0.0,1.0),1.0); }` },

    topo: { name: "Topographic", cat: "Artistic", params: {
        lines:{type:"range",min:4,max:60,val:18,name:"Contours"},
        weight:{type:"range",min:0.02,max:0.4,val:0.12,name:"Line Weight"},
        ink:{type:"color",val:"#0f0f0f",name:"Ink"},
        paper:{type:"color",val:"#f3efe4",name:"Paper"} },
        frag:`${SHADER_HEAD} uniform float lines; uniform float weight; uniform vec3 ink; uniform vec3 paper;
        void main(){ float l=lum(texture2D(u_image,v_texCoord).rgb);
          float f=fract(l*lines); float d=min(f,1.0-f);
          float line=1.0-smoothstep(weight*0.4, weight, d);
          gl_FragColor=vec4(mix(paper, ink, line),1.0); }` },

    strobe: { name: "Strobe Pulse", cat: "Glitch & Digital", params: {
        speed:{type:"range",min:0.1,max:8,val:2.5,name:"Speed"},
        depth:{type:"range",min:0,max:1,val:0.6,name:"Depth"},
        hueSwing:{type:"range",min:0,max:3.14,val:1.2,name:"Hue Swing"} },
        frag:`${SHADER_HEAD} uniform float speed; uniform float depth; uniform float hueSwing;
        void main(){ vec3 c=texture2D(u_image,v_texCoord).rgb;
          float p=sin(u_time*speed)*0.5+0.5;
          c=hueShift(c, (p-0.5)*hueSwing);
          c*=mix(1.0, 0.35+p*1.3, depth);
          gl_FragColor=vec4(clamp(c,0.0,1.0),1.0); }` },

    wobble: { name: "Dream Wobble", cat: "Distortion", params: {
        amp:{type:"range",min:0,max:0.08,val:0.02,name:"Amplitude"},
        freq:{type:"range",min:1,max:20,val:6,name:"Frequency"},
        speed:{type:"range",min:0,max:4,val:1.2,name:"Speed"} },
        frag:`${SHADER_HEAD} uniform float amp; uniform float freq; uniform float speed;
        void main(){ vec2 uv=v_texCoord; float t=u_time*speed;
          uv.x+=sin(uv.y*freq+t)*amp; uv.y+=cos(uv.x*freq*1.3-t*0.8)*amp;
          gl_FragColor=texture2D(u_image, clamp(uv,0.0,1.0)); }` },

};

/* Flag effects whose shader actually uses u_time so the render loop can animate them. */
for (const k in SHADERS) {
    SHADERS[k].animated = SHADERS[k].frag.split(SHADER_HEAD).join("").includes("u_time");
}

/* ---------------------------------------------------------------------
   Engine
   --------------------------------------------------------------------- */
class VisualLabEngine {
    constructor() {
        this.canvas = document.getElementById("mainCanvas");
        this.gl = this.canvas.getContext("webgl", { preserveDrawingBuffer: true, premultipliedAlpha: false });
        if (!this.gl) { this.fatal("WebGL is not supported in this browser."); return; }

        this.dropZone = document.getElementById("dropZone");
        this.time = 0;
        this.effectStack = [];
        this.activeEffectId = null;
        this.effectCounter = 0;
        this.programs = {};
        this.uniformCache = new Map();
        this.attribCache = new Map();
        this.fbos = [];
        this.isRecording = false;
        this.isRendering = false;
        this.isVideo = false;
        this.needsRender = true;      // on-demand render flag for static images
        this.compareMode = false;

        this.activePalette = null;
        this.isHoverZooming = false;
        this.zoomEnabled = false;
        this.cameraStream = null;

        this.cropModes = ["ORIG", "1:1", "4:5", "16:9", "9:16"];
        this.cropIndex = 0;

        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
        this.initWebGL();
        this.buildEffectMenu();
        this.bindEvents();
        this.initPalettes();
        this.renderLoop = this.renderLoop.bind(this);
        requestAnimationFrame(this.renderLoop);
    }

    fatal(msg) {
        const es = document.getElementById("emptyState");
        if (es) es.innerHTML = `<h2>UNSUPPORTED</h2><p>${msg}</p>`;
    }

    toast(msg) {
        const el = document.getElementById("toast");
        el.textContent = msg;
        el.classList.add("show");
        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
    }

    invalidate() { this.needsRender = true; }

    /* ---- Palettes ---- */
    initPalettes() {
        const container = document.getElementById("paletteContainer");
        for (const key in PALETTES) {
            const colors = PALETTES[key];
            const swatch = document.createElement("button");
            swatch.className = "palette-swatch";
            swatch.title = key;
            swatch.setAttribute("aria-label", key);
            if (key === "Neutral / Reset") {
                swatch.style.border = "1px solid #ccc";
                swatch.style.background = "#eeeeee";
            } else {
                swatch.innerHTML = colors.map(c => `<div class="palette-color" style="background:${c}"></div>`).join("");
            }
            swatch.addEventListener("click", () => {
                if (this.activePalette === key) {
                    this.activePalette = null;
                    swatch.classList.remove("active");
                } else {
                    this.activePalette = key;
                    document.querySelectorAll(".palette-swatch").forEach(s => s.classList.remove("active"));
                    swatch.classList.add("active");
                }
                this.invalidate();
            });
            container.appendChild(swatch);
        }
    }

    /* ---- Searchable / categorized effect menu ---- */
    buildEffectMenu(filter = "") {
        const menu = document.getElementById("addEffectMenu");
        menu.innerHTML = "";
        const q = filter.trim().toLowerCase();
        const cats = {};
        for (const [key, data] of Object.entries(SHADERS)) {
            if (q && !(data.name.toLowerCase().includes(q) || data.cat.toLowerCase().includes(q))) continue;
            (cats[data.cat] = cats[data.cat] || []).push([key, data]);
        }
        const catKeys = Object.keys(cats);
        if (catKeys.length === 0) {
            menu.innerHTML = `<p class="no-results">No effects match “${filter}”.</p>`;
            return;
        }
        const added = this.effectStack.map(e => e.type);
        for (const cat of catKeys) {
            const h = document.createElement("div");
            h.className = "effect-category";
            h.textContent = cat;
            menu.appendChild(h);
            const grid = document.createElement("div");
            grid.className = "effect-grid";
            for (const [key, data] of cats[cat]) {
                const btn = document.createElement("button");
                btn.textContent = data.name;
                btn.title = `Add ${data.name}`;
                btn.dataset.effect = key;
                if (added.includes(key)) btn.classList.add("used");
                btn.addEventListener("click", () => this.addEffect(key));
                grid.appendChild(btn);
            }
            menu.appendChild(grid);
        }
    }

    updateMenuState() {
        const added = this.effectStack.map(e => e.type);
        document.querySelectorAll("#addEffectMenu button[data-effect]").forEach(btn => {
            btn.classList.toggle("used", added.includes(btn.dataset.effect));
        });
    }

    /* ---- Events ---- */
    bindEvents() {
        const dz = this.dropZone;
        dz.addEventListener("dragover", e => { e.preventDefault(); dz.classList.add("dragging-file"); });
        dz.addEventListener("dragleave", () => dz.classList.remove("dragging-file"));
        dz.addEventListener("drop", e => {
            e.preventDefault(); dz.classList.remove("dragging-file");
            if (e.dataTransfer.files[0]) this.handleMedia(e.dataTransfer.files[0]);
        });

        const fileInput = document.getElementById("fileInput");
        document.getElementById("browseBtn").addEventListener("click", () => fileInput.click());
        fileInput.addEventListener("change", e => { if (e.target.files[0]) this.handleMedia(e.target.files[0]); });
        document.getElementById("sampleBtn").addEventListener("click", () => this.loadSample());

        document.getElementById("effectSearch").addEventListener("input", e => this.buildEffectMenu(e.target.value));

        document.getElementById("exportBtn").addEventListener("click", () => this.exportFrame());
        document.getElementById("exportVidBtn").addEventListener("click", () => this.toggleRecordVideo());
        document.getElementById("liveCameraBtn").addEventListener("click", () => this.toggleLiveCamera());
        document.getElementById("randomizeBtn").addEventListener("click", () => this.randomizeEffects());
        document.getElementById("clearBtn").addEventListener("click", () => this.clearEffects());
        document.getElementById("resetParamsBtn").addEventListener("click", () => this.resetActiveParams());

        document.getElementById("cropBtn").addEventListener("click", () => {
            this.cropIndex = (this.cropIndex + 1) % this.cropModes.length;
            document.getElementById("cropBtn").textContent = "CROP: " + this.cropModes[this.cropIndex];
            this.applyCrop();
            this.invalidate();
        });

        document.getElementById("resetBtn").addEventListener("click", () => this.resetAll());

        const zoomLockBtn = document.getElementById("zoomLockBtn");
        zoomLockBtn.addEventListener("click", () => {
            this.zoomEnabled = !this.zoomEnabled;
            zoomLockBtn.classList.toggle("locked", this.zoomEnabled);
            zoomLockBtn.textContent = this.zoomEnabled ? "🔒" : "🔍";
            if (!this.zoomEnabled) { this.isHoverZooming = false; this.canvas.style.transform = "scale(1)"; }
        });

        // Hold-to-compare (mouse + touch)
        const cmp = document.getElementById("compareBtn");
        const startCmp = () => { this.compareMode = true; cmp.classList.add("comparing"); this.invalidate(); };
        const endCmp = () => { this.compareMode = false; cmp.classList.remove("comparing"); this.invalidate(); };
        cmp.addEventListener("mousedown", startCmp);
        cmp.addEventListener("touchstart", e => { e.preventDefault(); startCmp(); }, { passive: false });
        ["mouseup", "mouseleave", "touchend", "touchcancel"].forEach(ev => cmp.addEventListener(ev, endCmp));

        // Magnifier
        this.canvas.addEventListener("mousemove", e => {
            if (!this.isHoverZooming || !this.zoomEnabled) return;
            const r = this.canvas.getBoundingClientRect();
            this.canvas.style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`;
        });
        this.canvas.addEventListener("mouseenter", e => {
            if (!this.zoomEnabled) return;
            this.isHoverZooming = true;
            const r = this.canvas.getBoundingClientRect();
            this.canvas.style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`;
            this.canvas.style.transform = "scale(2.2)";
        });
        this.canvas.addEventListener("mouseleave", () => {
            this.isHoverZooming = false;
            this.canvas.style.transform = "scale(1)";
        });

        // Keyboard shortcuts
        window.addEventListener("keydown", e => {
            if (e.target.matches("input, select, textarea")) return;
            if (e.key === "r" || e.key === "R") this.randomizeEffects();
            else if (e.key === "Backspace" && this.activeEffectId) { this.removeEffect(this.activeEffectId, e); }
            else if (e.key === "e" || e.key === "E") this.exportFrame();
        });
    }

    /* ---- Media ---- */
    loadSample() {
        // Procedurally generated gradient + noise sample so the app is usable with zero uploads.
        const c = document.createElement("canvas");
        c.width = 1280; c.height = 800;
        const ctx = c.getContext("2d");
        const g = ctx.createLinearGradient(0, 0, c.width, c.height);
        g.addColorStop(0, "#1b2a4a"); g.addColorStop(0.5, "#e63946"); g.addColorStop(1, "#ffd56b");
        ctx.fillStyle = g; ctx.fillRect(0, 0, c.width, c.height);
        for (let i = 0; i < 240; i++) {
            ctx.beginPath();
            ctx.arc(Math.random() * c.width, Math.random() * c.height, Math.random() * 60 + 4, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.18})`;
            ctx.fill();
        }
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.font = "800 120px -apple-system, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("JB", c.width / 2, c.height / 2 + 40);
        const img = new Image();
        img.onload = () => { this.isVideo = false; this.sourceMedia = img; this.setupMedia(); };
        img.src = c.toDataURL();
    }

    handleMedia(file) {
        if (this.cameraStream) this.stopCamera();
        if (file.type.startsWith("video/")) {
            this.isVideo = true;
            const v = document.createElement("video");
            v.loop = true; v.muted = true; v.playsInline = true;
            v.src = URL.createObjectURL(file);
            v.onloadeddata = () => { v.play(); this.sourceMedia = v; this.setupMedia(); };
            v.onerror = () => this.toast("Could not load that video.");
        } else if (file.type.startsWith("image/")) {
            this.isVideo = false;
            const img = new Image();
            img.onload = () => { this.sourceMedia = img; this.setupMedia(); };
            img.onerror = () => this.toast("Could not load that image.");
            img.src = URL.createObjectURL(file);
        } else {
            this.toast("Unsupported file type.");
        }
    }

    setupMedia() {
        document.getElementById("emptyState").style.display = "none";
        document.getElementById("canvasTools").hidden = false;
        document.getElementById("zoomLockBtn").hidden = false;
        document.getElementById("compareBtn").hidden = false;
        this.canvas.style.display = "block";
        this.applyCrop();
        this.uploadSourceTexture(true);
        this.invalidate();
        this.updateMeta();
    }

    updateMeta() {
        const meta = document.getElementById("canvasMeta");
        if (meta) meta.textContent = `${this.canvas.width}×${this.canvas.height}`;
    }

    stopCamera() {
        if (this.cameraStream) this.cameraStream.getTracks().forEach(t => t.stop());
        this.cameraStream = null;
        const btn = document.getElementById("liveCameraBtn");
        btn.textContent = "LIVE FEED"; btn.classList.remove("recording");
    }

    async toggleLiveCamera() {
        const btn = document.getElementById("liveCameraBtn");
        if (this.cameraStream) {
            this.stopCamera();
            this.isVideo = false; this.sourceMedia = null;
            document.getElementById("emptyState").style.display = "flex";
            document.getElementById("canvasTools").hidden = true;
            document.getElementById("zoomLockBtn").hidden = true;
            document.getElementById("compareBtn").hidden = true;
            this.canvas.style.display = "none";
            return;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1920 }, height: { ideal: 1080 } } });
            this.cameraStream = stream;
            this.isVideo = true;
            const v = document.createElement("video");
            v.loop = true; v.muted = true; v.playsInline = true; v.srcObject = stream;
            v.onloadedmetadata = () => { v.play(); this.sourceMedia = v; this.setupMedia(); };
            btn.textContent = "STOP LIVE"; btn.classList.add("recording");
        } catch (err) {
            this.toast("Camera access denied.");
        }
    }

    /* ---- Cropping ---- */
    applyCrop() {
        if (!this.sourceMedia) return;
        const mode = this.cropModes[this.cropIndex];
        const sw = this.sourceMedia.videoWidth || this.sourceMedia.width;
        const sh = this.sourceMedia.videoHeight || this.sourceMedia.height;
        if (!sw || !sh) return;
        let cw = sw, ch = sh;
        if (mode === "1:1") { const s = Math.min(sw, sh); cw = s; ch = s; }
        else if (mode === "4:5") { if (sw / sh > 4 / 5) { cw = sh * (4 / 5); ch = sh; } else { cw = sw; ch = sw * (5 / 4); } }
        else if (mode === "16:9") { if (sw / sh > 16 / 9) { cw = sh * (16 / 9); ch = sh; } else { cw = sw; ch = sw * (9 / 16); } }
        else if (mode === "9:16") { if (sw / sh > 9 / 16) { cw = sh * (9 / 16); ch = sh; } else { cw = sw; ch = sw * (16 / 9); } }

        // Cap resolution to keep it responsive on large media.
        const MAX = 2200;
        const scale = Math.min(1, MAX / Math.max(cw, ch));
        this.canvas.width = Math.round(cw * scale);
        this.canvas.height = Math.round(ch * scale);
        this.setupFBOs(true);

        const sa = sw / sh, ca = cw / ch;
        let u0 = 0, u1 = 1, v0 = 0, v1 = 1;
        if (ca > sa) { const sy = sa / ca; const oy = (1 - sy) / 2; v0 = oy; v1 = 1 - oy; }
        else { const sx = ca / sa; const ox = (1 - sx) / 2; u0 = ox; u1 = 1 - ox; }
        const gl = this.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.sourceTexBuf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([u0, v0, u1, v0, u0, v1, u0, v1, u1, v0, u1, v1]), gl.STATIC_DRAW);
        this.updateMeta();
    }

    /* ---- WebGL setup ---- */
    initWebGL() {
        const gl = this.gl;
        this.programs.passthrough = this.createProgram(VERTEX_SHADER, PASSTHROUGH_FRAG);
        this.programs.__composite = this.createProgram(VERTEX_SHADER, COMPOSITE_FRAG);
        for (const [key, data] of Object.entries(SHADERS)) {
            const p = this.createProgram(VERTEX_SHADER, data.frag, key);
            if (p) this.programs[key] = p;
        }
        this.posBuf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
        this.texBuf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texBuf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]), gl.STATIC_DRAW);
        this.sourceTexBuf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.sourceTexBuf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]), gl.STATIC_DRAW);
        this.sourceTexture = this.createTexture();
    }

    createProgram(vs, fs, label = "shader") {
        const gl = this.gl;
        const compile = (type, src) => {
            const sh = gl.createShader(type);
            gl.shaderSource(sh, src);
            gl.compileShader(sh);
            if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
                console.error(`[v0] Shader compile failed (${label}):`, gl.getShaderInfoLog(sh));
                gl.deleteShader(sh);
                return null;
            }
            return sh;
        };
        const v = compile(gl.VERTEX_SHADER, vs);
        const f = compile(gl.FRAGMENT_SHADER, fs);
        if (!v || !f) return null;
        const p = gl.createProgram();
        gl.attachShader(p, v); gl.attachShader(p, f); gl.linkProgram(p);
        if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
            console.error(`[v0] Program link failed (${label}):`, gl.getProgramInfoLog(p));
            return null;
        }
        return p;
    }

    createTexture() {
        const gl = this.gl;
        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        return tex;
    }

    setupFBOs() {
        const gl = this.gl;
        // Need 3 ping-pong targets: 2 for effect chain + 1 accumulator for compositing.
        this.fbos.forEach(f => { gl.deleteFramebuffer(f.fbo); gl.deleteTexture(f.texture); });
        this.fbos = [];
        for (let i = 0; i < 3; i++) {
            const tex = this.createTexture();
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.canvas.width, this.canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
            const fbo = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
            this.fbos.push({ fbo, texture: tex });
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    getUniform(prog, name) {
        let map = this.uniformCache.get(prog);
        if (!map) { map = new Map(); this.uniformCache.set(prog, map); }
        if (map.has(name)) return map.get(name);
        const loc = this.gl.getUniformLocation(prog, name);
        map.set(name, loc);
        return loc;
    }

    getAttrib(prog, name) {
        let map = this.attribCache.get(prog);
        if (!map) { map = new Map(); this.attribCache.set(prog, map); }
        if (map.has(name)) return map.get(name);
        const loc = this.gl.getAttribLocation(prog, name);
        map.set(name, loc);
        return loc;
    }

    /* ---- Effect stack ops ---- */
    makeEffect(type, randomize = false) {
        const src = SHADERS[type];
        const params = {};
        if (src.params) {
            for (const [k, p] of Object.entries(src.params)) {
                const np = { ...p };
                if (randomize) {
                    if (p.type === "range") np.val = p.min + Math.random() * (p.max - p.min);
                    else if (p.type === "color") np.val = "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
                    else if (p.type === "select") { const vals = Object.values(p.options); np.val = vals[Math.floor(Math.random() * vals.length)]; }
                }
                params[k] = np;
            }
        }
        return { id: "eff_" + this.effectCounter++, type, name: src.name, params, enabled: true, opacity: 1, blend: 0 };
    }

    addEffect(type) {
        if (!SHADERS[type] || !this.programs[type]) return;
        const eff = this.makeEffect(type);
        this.effectStack.push(eff);
        this.updateMenuState();
        this.updateLayerUI();
        this.selectEffect(eff.id);
        this.invalidate();
    }

    clearEffects() {
        this.effectStack = [];
        this.activeEffectId = null;
        this.updateMenuState();
        this.updateLayerUI();
        this.clearProperties();
        this.invalidate();
    }

    randomizeEffects() {
        this.effectStack = [];
        this.activeEffectId = null;
        const available = Object.keys(SHADERS).filter(k => this.programs[k]);
        const n = Math.floor(Math.random() * 5) + 3; // 3–7
        const shuffled = available.slice().sort(() => 0.5 - Math.random()).slice(0, n);
        shuffled.forEach(type => this.effectStack.push(this.makeEffect(type, true)));

        const paletteKeys = Object.keys(PALETTES);
        this.activePalette = paletteKeys[Math.floor(Math.random() * paletteKeys.length)];
        document.querySelectorAll(".palette-swatch").forEach(s => s.classList.toggle("active", s.title === this.activePalette));

        this.updateMenuState();
        this.updateLayerUI();
        if (this.effectStack.length) this.selectEffect(this.effectStack[0].id);
        this.invalidate();
        this.toast(`Rolled ${n} effects · ${this.activePalette}`);
    }

    resetAll() {
        this.effectStack = [];
        this.activeEffectId = null;
        this.activePalette = null;
        document.querySelectorAll(".palette-swatch").forEach(s => s.classList.remove("active"));
        this.cropIndex = 0;
        document.getElementById("cropBtn").textContent = "CROP: ORIG";
        this.applyCrop();
        this.updateMenuState();
        this.updateLayerUI();
        this.clearProperties();
        this.invalidate();
    }

    clearProperties() {
        document.getElementById("controlsContainer").innerHTML = '<p class="helper-text">Select an effect in the pipeline to adjust its parameters.</p>';
        document.getElementById("currentEffectName").textContent = "NO EFFECT";
        document.getElementById("propHeaderActions").hidden = true;
    }

    toggleEffect(id, e) {
        e.stopPropagation();
        const eff = this.effectStack.find(x => x.id === id);
        if (eff) eff.enabled = !eff.enabled;
        this.updateLayerUI();
        this.invalidate();
    }

    removeEffect(id, e) {
        if (e) e.stopPropagation();
        this.effectStack = this.effectStack.filter(x => x.id !== id);
        if (this.activeEffectId === id) { this.activeEffectId = null; this.clearProperties(); }
        this.updateMenuState();
        this.updateLayerUI();
        this.invalidate();
    }

    moveEffect(id, dir, e) {
        e.stopPropagation();
        const idx = this.effectStack.findIndex(x => x.id === id);
        if (idx < 0) return;
        const j = idx + dir;
        if (j < 0 || j >= this.effectStack.length) return;
        [this.effectStack[idx], this.effectStack[j]] = [this.effectStack[j], this.effectStack[idx]];
        this.updateLayerUI();
        this.invalidate();
    }

    selectEffect(id) {
        this.activeEffectId = id;
        this.updateLayerUI();
        this.buildParameterUI();
    }

    resetActiveParams() {
        const eff = this.effectStack.find(e => e.id === this.activeEffectId);
        if (!eff) return;
        const fresh = this.makeEffect(eff.type);
        eff.params = fresh.params;
        eff.opacity = 1; eff.blend = 0;
        this.buildParameterUI();
        this.updateLayerUI();
        this.invalidate();
    }

    /* ---- Layer UI ---- */
    updateLayerUI() {
        const list = document.getElementById("layerList");
        list.innerHTML = "";
        if (!this.effectStack.length) {
            list.innerHTML = '<p class="helper-text empty-pipeline">Your pipeline is empty. Add an effect above or hit RANDOM.</p>';
            return;
        }
        this.effectStack.forEach(eff => {
            const div = document.createElement("div");
            div.className = `layer ${eff.id === this.activeEffectId ? "active" : ""}`;
            div.dataset.id = eff.id;
            div.innerHTML = `
                <div class="layer-top">
                    <div class="layer-left">
                        <button class="visibility-btn ${eff.enabled ? "" : "disabled"}" data-action="toggle" data-id="${eff.id}" title="Toggle visibility">${eff.enabled ? "👁" : "⊘"}</button>
                        <span class="layer-name">${eff.name}</span>
                    </div>
                    <div class="layer-actions">
                        <button data-action="up" data-id="${eff.id}" title="Move up">▲</button>
                        <button data-action="down" data-id="${eff.id}" title="Move down">▼</button>
                        <button class="del-btn" data-action="delete" data-id="${eff.id}" title="Delete">✕</button>
                    </div>
                </div>
                <div class="layer-opacity">
                    <input type="range" min="0" max="1" step="0.01" value="${eff.opacity}" data-action="opacity" data-id="${eff.id}" title="Layer opacity" aria-label="${eff.name} opacity">
                    <span class="op-val">${Math.round(eff.opacity * 100)}%</span>
                </div>`;
            div.addEventListener("click", () => this.selectEffect(eff.id));


            list.appendChild(div);
        });

        list.querySelectorAll("[data-action]").forEach(el => {
            const a = el.dataset.action, id = el.dataset.id;
            if (a === "opacity") {
                el.addEventListener("click", e => e.stopPropagation());
                el.addEventListener("input", e => {
                    e.stopPropagation();
                    const eff = this.effectStack.find(x => x.id === id);
                    if (eff) { eff.opacity = parseFloat(e.target.value); el.nextElementSibling.textContent = Math.round(eff.opacity * 100) + "%"; this.invalidate(); }
                });
            } else {
                el.addEventListener("click", e => {
                    if (a === "toggle") this.toggleEffect(id, e);
                    else if (a === "delete") this.removeEffect(id, e);
                    else if (a === "up") this.moveEffect(id, -1, e);
                    else if (a === "down") this.moveEffect(id, 1, e);
                });
            }
        });
    }

    /* ---- Parameter panel ---- */
    buildParameterUI() {
        const eff = this.effectStack.find(e => e.id === this.activeEffectId);
        if (!eff) return;
        document.getElementById("currentEffectName").textContent = eff.name;
        document.getElementById("propHeaderActions").hidden = false;
        const cont = document.getElementById("controlsContainer");
        cont.innerHTML = "";

        // Blend mode selector (per layer)
        const blendGroup = document.createElement("div");
        blendGroup.className = "control-group";
        const blendModes = { "Normal": 0, "Multiply": 1, "Screen": 2, "Overlay": 3, "Add": 4, "Difference": 5 };
        let blendOpts = "";
        for (const [name, v] of Object.entries(blendModes)) blendOpts += `<option value="${v}" ${eff.blend == v ? "selected" : ""}>${name}</option>`;
        blendGroup.innerHTML = `<label>Blend Mode</label><select>${blendOpts}</select>`;
        blendGroup.querySelector("select").addEventListener("change", e => { eff.blend = parseFloat(e.target.value); this.invalidate(); });
        cont.appendChild(blendGroup);

        if (!eff.params || !Object.keys(eff.params).length) {
            const note = document.createElement("p");
            note.className = "control-note";
            note.textContent = "This effect has no adjustable parameters — control it with layer opacity and blend mode.";
            cont.appendChild(note);
            return;
        }

        Object.keys(eff.params).forEach(k => {
            const p = eff.params[k];
            const g = document.createElement("div");
            g.className = "control-group";
            if (p.type === "select") {
                let opts = "";
                for (const optKey in p.options) opts += `<option value="${p.options[optKey]}" ${p.val == p.options[optKey] ? "selected" : ""}>${optKey}</option>`;
                g.innerHTML = `<label>${p.name}</label><select>${opts}</select>`;
                g.querySelector("select").addEventListener("change", e => { p.val = parseFloat(e.target.value); this.invalidate(); });
            } else if (p.type === "color") {
                g.innerHTML = `<label>${p.name}</label><input type="color" value="${p.val}">`;
                g.querySelector("input").addEventListener("input", e => { p.val = e.target.value; this.invalidate(); });
            } else {
                const step = (p.max - p.min) < 5 ? 0.01 : 1;
                g.innerHTML = `<label>${p.name} <span class="val">${p.val.toFixed(2)}</span></label>
                    <input type="range" min="${p.min}" max="${p.max}" step="${step}" value="${p.val}">`;
                const s = g.querySelector("input"), v = g.querySelector(".val");
                s.addEventListener("input", e => { const val = parseFloat(e.target.value); p.val = val; v.textContent = val.toFixed(2); this.invalidate(); });
            }
            cont.appendChild(g);
        });
    }

    /* ---- Rendering ---- */
    hexToRgb(hex) {
        const h = hex.replace("#", "");
        return [parseInt(h.substring(0, 2), 16) / 255, parseInt(h.substring(2, 4), 16) / 255, parseInt(h.substring(4, 6), 16) / 255];
    }

    uploadSourceTexture(force = false) {
        if (!this.sourceMedia) return;
        const gl = this.gl;
        try {
            gl.bindTexture(gl.TEXTURE_2D, this.sourceTexture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.sourceMedia);
        } catch (e) { /* frame not ready */ }
    }

    bindGeometry(prog, useSourceCoords) {
        const gl = this.gl;
        const pLoc = this.getAttrib(prog, "a_position");
        if (pLoc !== -1) { gl.enableVertexAttribArray(pLoc); gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuf); gl.vertexAttribPointer(pLoc, 2, gl.FLOAT, false, 0, 0); }
        const tLoc = this.getAttrib(prog, "a_texCoord");
        if (tLoc !== -1) { gl.enableVertexAttribArray(tLoc); gl.bindBuffer(gl.ARRAY_BUFFER, useSourceCoords ? this.sourceTexBuf : this.texBuf); gl.vertexAttribPointer(tLoc, 2, gl.FLOAT, false, 0, 0); }
    }

    drawPassthrough(srcTex) {
        const gl = this.gl;
        const prog = this.programs.passthrough;
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        gl.useProgram(prog);
        this.bindGeometry(prog, srcTex === this.sourceTexture);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, srcTex);
        gl.uniform1i(this.getUniform(prog, "u_image"), 0);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    renderLoop(now) {
        // Live media (video/camera) needs continuous re-upload + redraw.
        const live = this.isVideo && this.sourceMedia;
        const animated = this.effectStack.some(e => e.enabled && SHADERS[e.type] && SHADERS[e.type].animated);
        if (live) { this.uploadSourceTexture(); }
        if (live || animated || this.isRecording) { this.time += 0.016; this.needsRender = true; }
        const continuous = live || animated || this.isRecording;

        if (this.sourceMedia && this.needsRender) {
            this.render();
            if (!continuous) this.needsRender = false;
        }
        requestAnimationFrame(this.renderLoop);
    }

    render() {
        const gl = this.gl;
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);

        // Compare mode: show untouched source.
        if (this.compareMode) { this.drawPassthrough(this.sourceTexture); return; }

        const active = this.effectStack.filter(e => e.enabled && this.programs[e.type]);
        if (active.length === 0) { this.drawPassthrough(this.sourceTexture); return; }

        // Global palette resolution.
        let gColors = ["#000000", "#555555", "#aaaaaa", "#ffffff"];
        if (this.activePalette && this.activePalette !== "Neutral / Reset" && PALETTES[this.activePalette]) gColors = PALETTES[this.activePalette];

        // FBO roles: [0] and [1] ping-pong for effect output, [2] accumulator.
        const A = this.fbos[0], B = this.fbos[1], ACC = this.fbos[2];
        let accum = null; // texture holding composited result so far
        let ping = 0;

        for (let i = 0; i < active.length; i++) {
            const eff = active[i];
            const prog = this.programs[eff.type];
            const outFbo = (ping === 0 ? A : B);

            // 1) Render the effect over the *source* into a scratch FBO.
            gl.bindFramebuffer(gl.FRAMEBUFFER, outFbo.fbo);
            gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT);
            gl.useProgram(prog);
            this.bindGeometry(prog, i === 0);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, accum ? accum : this.sourceTexture);
            gl.uniform1i(this.getUniform(prog, "u_image"), 0);

            const uT = this.getUniform(prog, "u_time"); if (uT) gl.uniform1f(uT, this.time);
            const uR = this.getUniform(prog, "u_resolution"); if (uR) gl.uniform2f(uR, this.canvas.width, this.canvas.height);

            let colors = gColors;
            if (!this.activePalette || this.activePalette === "Neutral / Reset") {
                if (eff.type === "thermal") colors = PALETTES["Thermal Default"];
                if (eff.type === "gradientmap") colors = PALETTES["Vaporwave"];
            }
            const setPal = (name, hex) => { const l = this.getUniform(prog, name); if (l) gl.uniform3f(l, ...this.hexToRgb(hex)); };
            setPal("u_pal1", colors[0]); setPal("u_pal2", colors[1]); setPal("u_pal3", colors[2]); setPal("u_pal4", colors[3]);

            if (eff.params) {
                for (const [k, p] of Object.entries(eff.params)) {
                    const l = this.getUniform(prog, k);
                    if (!l) continue;
                    if (p.type === "color") { const c = this.hexToRgb(p.val); gl.uniform3f(l, c[0], c[1], c[2]); }
                    else gl.uniform1f(l, p.val);
                }
            }
            gl.drawArrays(gl.TRIANGLES, 0, 6);

            // 2) Composite scratch over accumulator with opacity + blend.
            const first = (accum === null);
            const isLast = (i === active.length - 1);
            if (first && eff.opacity >= 0.999 && eff.blend === 0) {
                // Fast path: first full-strength normal layer becomes the accumulator directly.
                accum = outFbo.texture;
                ping = 1 - ping;
            } else {
                const cprog = this.programs.__composite;
                gl.bindFramebuffer(gl.FRAMEBUFFER, ACC.fbo);
                gl.useProgram(cprog);
                this.bindGeometry(cprog, false);
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, outFbo.texture);
                gl.uniform1i(this.getUniform(cprog, "u_image"), 0);
                gl.activeTexture(gl.TEXTURE1);
                gl.bindTexture(gl.TEXTURE_2D, first ? this.sourceTexture : accum);
                gl.uniform1i(this.getUniform(cprog, "u_prev"), 1);
                gl.uniform1f(this.getUniform(cprog, "u_opacity"), eff.opacity);
                gl.uniform1f(this.getUniform(cprog, "u_blend"), eff.blend);
                // For the composite we need source coords only when reading the raw source as prev (first layer).
                gl.drawArrays(gl.TRIANGLES, 0, 6);

                // Copy ACC into a ping target so ACC is reusable next iteration.
                if (!isLast) {
                    const dst = (ping === 0 ? A : B);
                    gl.bindFramebuffer(gl.FRAMEBUFFER, dst.fbo);
                    this.drawPassthroughToBound(ACC.texture);
                    accum = dst.texture;
                    ping = 1 - ping;
                } else {
                    accum = ACC.texture;
                }
            }
        }

        // Final draw to screen.
        this.drawPassthrough(accum);
    }

    drawPassthroughToBound(srcTex) {
        const gl = this.gl;
        const prog = this.programs.passthrough;
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        gl.useProgram(prog);
        this.bindGeometry(prog, false);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, srcTex);
        gl.uniform1i(this.getUniform(prog, "u_image"), 0);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    /* ---- Export ---- */
    exportFrame() {
        if (!this.sourceMedia) { this.toast("Load media first."); return; }
        this.needsRender = true; this.render();
        const a = document.createElement("a");
        a.download = `jb-engine-${Date.now()}.png`;
        a.href = this.canvas.toDataURL("image/png");
        a.click();
        this.toast("Picture exported.");
    }

    toggleRecordVideo() {
        if (!this.sourceMedia) { this.toast("Load media first."); return; }
        const btn = document.getElementById("exportVidBtn");
        if (this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            btn.textContent = "EXPORT VIDEO"; btn.classList.remove("recording");
            return;
        }
        if (!this.canvas.captureStream) { this.toast("Recording not supported here."); return; }
        const stream = this.canvas.captureStream(30);
        const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9") ? "video/webm;codecs=vp9" : "video/webm";
        this.mediaRecorder = new MediaRecorder(stream, { mimeType: mime });
        this.recordedChunks = [];
        this.mediaRecorder.ondataavailable = e => { if (e.data.size > 0) this.recordedChunks.push(e.data); };
        this.mediaRecorder.onstop = () => {
            const blob = new Blob(this.recordedChunks, { type: "video/webm" });
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = `jb-engine-${Date.now()}.webm`;
            a.click();
            this.toast("Video saved.");
        };
        this.mediaRecorder.start();
        this.isRecording = true;
        this.needsRender = true; // keep drawing while recording
        btn.textContent = "STOP RECORDING"; btn.classList.add("recording");
    }
}

function startEngine() {
    const engine = new VisualLabEngine();
    return engine;
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => startEngine());
} else {
    startEngine();
}
