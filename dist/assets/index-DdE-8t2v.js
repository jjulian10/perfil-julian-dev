(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=1500,t=900,n=null,r=!1,i=e=>{if(!r||!n)return;let t=n.createOscillator(),i=n.createGain();t.type=`sine`,t.frequency.value=e,i.gain.setValueAtTime(0,n.currentTime),i.gain.linearRampToValueAtTime(.035,n.currentTime+.05),i.gain.exponentialRampToValueAtTime(.001,n.currentTime+.7),t.connect(i),i.connect(n.destination),t.start(),t.stop(n.currentTime+.7)},a=()=>{let a=document.querySelector(`[data-intro]`);if(!a)return;let o=Array.from(a.querySelectorAll(`[data-intro-frame]`)),s=a.querySelector(`[data-intro-skip]`),c=a.querySelector(`[data-intro-sound]`),l=a.querySelector(`[data-intro-sound-label]`),u=a.querySelector(`[data-intro-sound-status]`),d=a.querySelector(`[data-intro-current]`),f=a.querySelector(`[data-intro-progress]`),p=0,m=0,h=0,g=!1;document.body.classList.add(`intro-open`);let _=e=>{o.forEach((t,n)=>{t.classList.toggle(`is-active`,n===e),t.classList.toggle(`is-before`,n<e)}),d&&(d.textContent=String(e+1).padStart(2,`0`)),i(180+e*90)},v=()=>{g||(g=!0,window.clearInterval(m),window.cancelAnimationFrame(h),f&&(f.style.transform=`scaleX(1)`),a.classList.add(`is-leaving`),window.setTimeout(()=>{document.body.classList.remove(`intro-open`),a.remove()},t))},y=()=>{let t=performance.now(),n=e*o.length,r=e=>{if(g)return;let i=e-t,a=Math.min(i/n,1);f&&(f.style.transform=`scaleX(${a})`),h=requestAnimationFrame(r)};h=requestAnimationFrame(r)},b=()=>{if(p+=1,p>=o.length){v();return}_(p)},x=async()=>{n||=new AudioContext,n.state===`suspended`&&await n.resume(),r=!r,c?.classList.toggle(`is-active`,r),u?.classList.toggle(`is-active`,r),l&&(l.textContent=r?`SOM LIGADO`:`ATIVAR SOM`),r&&i(220)};s?.addEventListener(`click`,v),c?.addEventListener(`click`,()=>{x()}),_(0),y(),m=window.setInterval(b,e),window.matchMedia(`(prefers-reduced-motion: reduce)`).matches&&v()},o=`
  precision highp float;

  attribute vec3 aPosition;
  attribute float aType;

  uniform float uTime;
  uniform float uAspect;
  uniform float uPixelRatio;
  uniform vec2 uPointer;

  varying vec3 vColor;
  varying float vAlpha;

  mat2 rotate2d(float angle) {
    float s = sin(angle);
    float c = cos(angle);

    return mat2(
      c, -s,
      s, c
    );
  }

  void main() {
    vec3 position = aPosition;

    float wave =
      sin(position.y * 6.0 + uTime * 1.2) *
      cos(position.x * 5.0 - uTime) *
      0.035;

    position *= 1.0 + wave;

    float rotationY =
      uTime * 0.12 +
      uPointer.x * 0.32;

    float rotationX =
      -0.18 +
      uPointer.y * 0.22;

    position.xz =
      rotate2d(rotationY) *
      position.xz;

    position.yz =
      rotate2d(rotationX) *
      position.yz;

    float depth =
      3.25 +
      position.z;

    float scale =
      2.35 /
      depth;

    float aspectX =
      min(
        1.0,
        1.0 / uAspect
      );

    float aspectY =
      min(
        1.0,
        uAspect
      );

    vec2 projected =
      vec2(
        position.x * aspectX,
        position.y * aspectY
      ) * scale;

    gl_Position = vec4(
      projected,
      0.0,
      1.0
    );

    float front =
      clamp(
        (position.z + 1.4) / 2.8,
        0.0,
        1.0
      );

    gl_PointSize =
      mix(
        1.1,
        3.3,
        front
      ) *
      uPixelRatio;

    if (aType > 0.5) {
      gl_PointSize *= 1.5;
    }

    vec3 acid =
      vec3(
        0.647,
        1.0,
        0.757
      );

    vec3 violet =
      vec3(
        0.463,
        0.341,
        1.0
      );

    vec3 blue =
      vec3(
        0.18,
        0.54,
        1.0
      );

    float colorMix =
      0.5 +
      0.5 *
      sin(
        position.y * 2.5 +
        position.z * 2.0 +
        uTime * 0.35
      );

    vColor =
      mix(
        violet,
        acid,
        colorMix
      );

    vColor =
      mix(
        vColor,
        blue,
        front * 0.22
      );

    if (aType > 0.5) {
      vColor =
        mix(
          acid,
          vec3(1.0),
          0.25
        );
    }

    vAlpha =
      aType > 0.5
        ? 0.82
        : mix(
            0.18,
            0.72,
            front
          );
  }
`,s=`
  precision highp float;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec2 point =
      gl_PointCoord -
      vec2(0.5);

    float distanceToCenter =
      length(point);

    float alpha =
      smoothstep(
        0.5,
        0.05,
        distanceToCenter
      );

    alpha *= vAlpha;

    if (alpha < 0.01) {
      discard;
    }

    gl_FragColor =
      vec4(
        vColor,
        alpha
      );
  }
`,c=(e,t,n)=>{let r=e.createShader(t);return r?(e.shaderSource(r,n),e.compileShader(r),e.getShaderParameter(r,e.COMPILE_STATUS)?r:(console.error(e.getShaderInfoLog(r)),e.deleteShader(r),null)):null},l=e=>{let t=c(e,e.VERTEX_SHADER,o),n=c(e,e.FRAGMENT_SHADER,s);if(!t||!n)return null;let r=e.createProgram();if(!r)return null;e.attachShader(r,t),e.attachShader(r,n),e.linkProgram(r);let i=e.getProgramParameter(r,e.LINK_STATUS);return e.deleteShader(t),e.deleteShader(n),i?r:(console.error(e.getProgramInfoLog(r)),e.deleteProgram(r),null)},u=()=>{let e=[],t=[],n=Math.PI*(3-Math.sqrt(5));for(let r=0;r<4200;r+=1){let i=1-r/4199*2,a=Math.sqrt(Math.max(0,1-i*i)),o=n*r,s=Math.cos(o)*a,c=Math.sin(o)*a;e.push(s,i,c),t.push(0)}for(let n=0;n<900;n+=1){let r=n/900*Math.PI*2,i=1.22+Math.sin(r*5)*.018,a=Math.cos(r)*i,o=Math.sin(r*3)*.035,s=Math.sin(r)*i;e.push(a,o,s),t.push(1)}for(let n=0;n<700;n+=1){let r=n/700*Math.PI*2,i=1.38,a=Math.cos(r)*i,o=Math.sin(r)*i*.42,s=Math.sin(r)*i,c=.65,l=o*Math.cos(c)-s*Math.sin(c),u=o*Math.sin(c)+s*Math.cos(c);o=l,s=u,a*=.98,e.push(a,o,s),t.push(1)}return{positions:new Float32Array(e),types:new Float32Array(t),count:t.length}},d=()=>{let e=document.querySelector(`[data-intro-scene]`);if(!e)return;let t=e.getContext(`webgl`,{alpha:!0,antialias:!0,powerPreference:`high-performance`});if(!t)return;let n=l(t);if(!n)return;let r=u(),i=t.createBuffer(),a=t.createBuffer();if(!i||!a)return;let o=t.getAttribLocation(n,`aPosition`),s=t.getAttribLocation(n,`aType`),c=t.getUniformLocation(n,`uTime`),d=t.getUniformLocation(n,`uAspect`),f=t.getUniformLocation(n,`uPixelRatio`),p=t.getUniformLocation(n,`uPointer`);t.useProgram(n),t.bindBuffer(t.ARRAY_BUFFER,i),t.bufferData(t.ARRAY_BUFFER,r.positions,t.STATIC_DRAW),t.enableVertexAttribArray(o),t.vertexAttribPointer(o,3,t.FLOAT,!1,0,0),t.bindBuffer(t.ARRAY_BUFFER,a),t.bufferData(t.ARRAY_BUFFER,r.types,t.STATIC_DRAW),t.enableVertexAttribArray(s),t.vertexAttribPointer(s,1,t.FLOAT,!1,0,0),t.enable(t.BLEND),t.blendFunc(t.SRC_ALPHA,t.ONE),t.disable(t.DEPTH_TEST),t.clearColor(0,0,0,0);let m=1,h=1,g=1,_=()=>{m=window.innerWidth,h=window.innerHeight,g=Math.min(window.devicePixelRatio||1,1.7),e.width=Math.floor(m*g),e.height=Math.floor(h*g),e.style.width=`${m}px`,e.style.height=`${h}px`,t.viewport(0,0,e.width,e.height)},v={x:0,y:0},y={x:0,y:0},b=e=>{y.x=e.clientX/window.innerWidth*2-1,y.y=-(e.clientY/window.innerHeight*2-1)},x=window.matchMedia(`(prefers-reduced-motion: reduce)`).matches,S=performance.now(),C=i=>{if(!e.isConnected)return;v.x+=(y.x-v.x)*.035,v.y+=(y.y-v.y)*.035;let a=x?0:(i-S)/1e3;t.clear(t.COLOR_BUFFER_BIT),t.useProgram(n),t.uniform1f(c,a),t.uniform1f(d,m/h),t.uniform1f(f,g),t.uniform2f(p,v.x,v.y),t.drawArrays(t.POINTS,0,r.count),x||requestAnimationFrame(C)};_(),window.addEventListener(`resize`,_),window.addEventListener(`pointermove`,b,{passive:!0}),requestAnimationFrame(C)},f=(e,t,n)=>{let r=e.createShader(t);return r?(e.shaderSource(r,n),e.compileShader(r),e.getShaderParameter(r,e.COMPILE_STATUS)?r:(console.error(e.getShaderInfoLog(r)),e.deleteShader(r),null)):null},p=(e,t)=>{let n=[],r=[];for(let r=0;r<=e;r+=1){let i=r/e*Math.PI;for(let e=0;e<=t;e+=1){let r=e/t*Math.PI*2;n.push(Math.sin(i)*Math.cos(r)*1.28,Math.cos(i)*1.28,Math.sin(i)*Math.sin(r)*1.28)}}for(let n=0;n<e;n+=1)for(let e=0;e<t;e+=1){let i=n*(t+1)+e,a=i+t+1;r.push(i,a,i+1,a,a+1,i+1)}return{vertices:new Float32Array(n),indices:new Uint16Array(r)}},m=()=>{let e=document.querySelector(`[data-scene]`);if(!e)return;let t=e.getContext(`webgl`,{alpha:!0,antialias:!0});if(!t)return;let n=f(t,t.VERTEX_SHADER,`
      attribute vec3 aPosition;

      uniform float uTime;
      uniform vec2 uPointer;
      uniform float uAspect;

      varying vec3 vPosition;
      varying float vWave;

      mat3 rotateX(float a) {
        float s = sin(a);
        float c = cos(a);

        return mat3(
          1.0, 0.0, 0.0,
          0.0, c, -s,
          0.0, s, c
        );
      }

      mat3 rotateY(float a) {
        float s = sin(a);
        float c = cos(a);

        return mat3(
          c, 0.0, s,
          0.0, 1.0, 0.0,
          -s, 0.0, c
        );
      }

      void main() {
        vec3 p =
          aPosition;

        float wave =
          sin(
            p.y * 5.5 +
            uTime * 1.15
          ) * 0.07
          +
          cos(
            p.x * 4.8 -
            uTime * 0.9
          ) * 0.035
          +
          sin(
            (p.x + p.z) *
            4.0 +
            uTime
          ) * 0.02;

        p *=
          1.0 +
          wave;

        p =
          rotateX(
            uPointer.y *
            0.25 +
            sin(
              uTime *
              0.18
            ) *
            0.12
          ) * p;

        p =
          rotateY(
            uTime *
            0.13 +
            uPointer.x *
            0.32
          ) * p;

        vPosition = p;
        vWave = wave;

        float z =
          p.z +
          3.45;

        vec2 pos =
          p.xy /
          z *
          1.7;

        // Ajusta a esfera ao menor lado do canvas, inclusive no celular.
        pos *= min(uAspect, 1.0);

        pos.x /=
          uAspect;

        gl_Position =
          vec4(
            pos,
            (
              z -
              3.45
            ) /
            5.0,
            1.0
          );
      }
    `),r=f(t,t.FRAGMENT_SHADER,`
      precision mediump float;

      varying vec3 vPosition;
      varying float vWave;

      void main() {
        vec3 acid =
          vec3(
            0.62,
            1.0,
            0.76
          );

        vec3 violet =
          vec3(
            0.38,
            0.22,
            1.0
          );

        vec3 blue =
          vec3(
            0.12,
            0.35,
            1.0
          );

        float height =
          clamp(
            vPosition.y *
            0.35 +
            0.5,
            0.0,
            1.0
          );

        float depth =
          clamp(
            vPosition.z *
            0.3 +
            0.5,
            0.0,
            1.0
          );

        vec3 color =
          mix(
            violet,
            blue,
            depth
          );

        color =
          mix(
            color,
            acid,
            height *
            0.75
          );

        color +=
          vWave *
          1.6;

        float rim =
          pow(
            1.0 -
            abs(
              normalize(
                vPosition
              ).z
            ),
            2.2
          );

        color +=
          rim *
          vec3(
            0.25,
            0.4,
            0.32
          );

        gl_FragColor =
          vec4(
            color,
            1.0
          );
      }
    `);if(!n||!r)return;let i=t.createProgram();if(!i)return;if(t.attachShader(i,n),t.attachShader(i,r),t.linkProgram(i),!t.getProgramParameter(i,t.LINK_STATUS)){console.error(t.getProgramInfoLog(i)),t.deleteProgram(i);return}t.useProgram(i);let a=p(58,72),o=t.createBuffer(),s=t.createBuffer();if(!o||!s)return;t.bindBuffer(t.ARRAY_BUFFER,o),t.bufferData(t.ARRAY_BUFFER,a.vertices,t.STATIC_DRAW),t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,s),t.bufferData(t.ELEMENT_ARRAY_BUFFER,a.indices,t.STATIC_DRAW);let c=t.getAttribLocation(i,`aPosition`);if(c<0)return;t.enableVertexAttribArray(c),t.vertexAttribPointer(c,3,t.FLOAT,!1,0,0);let l={time:t.getUniformLocation(i,`uTime`),pointer:t.getUniformLocation(i,`uPointer`),aspect:t.getUniformLocation(i,`uAspect`)},u=0,d=0,m=0,h=0;e.addEventListener(`pointermove`,t=>{let n=e.getBoundingClientRect();n.width<=0||n.height<=0||(m=(t.clientX-n.left)/n.width*2-1,h=-((t.clientY-n.top)/n.height*2-1))}),e.addEventListener(`pointerleave`,()=>{m=0,h=0});let g=()=>{let n=e.getBoundingClientRect();if(n.width<=0||n.height<=0)return;let r=Math.min(window.devicePixelRatio||1,1.6),i=Math.max(1,Math.round(n.width*r)),a=Math.max(1,Math.round(n.height*r));(e.width!==i||e.height!==a)&&(e.width=i,e.height=a,t.viewport(0,0,i,a)),t.uniform1f(l.aspect,i/a)};t.enable(t.DEPTH_TEST),t.enable(t.BLEND),t.blendFunc(t.SRC_ALPHA,t.ONE_MINUS_SRC_ALPHA),t.clearColor(0,0,0,0);let _=performance.now(),v=window.matchMedia(`(prefers-reduced-motion: reduce)`),y=e=>{g(),u+=(m-u)*.045,d+=(h-d)*.045,t.clear(t.COLOR_BUFFER_BIT|t.DEPTH_BUFFER_BIT);let n=v.matches?0:(e-_)/1e3;t.uniform1f(l.time,n),t.uniform2f(l.pointer,u,d),t.drawElements(t.TRIANGLES,a.indices.length,t.UNSIGNED_SHORT,0),requestAnimationFrame(y)};requestAnimationFrame(y)},h=(e,t,n)=>Math.min(Math.max(e,t),n),g=()=>{let e=Array.from(document.querySelectorAll(`.reveal, .mask`)),t=e=>{e.classList.add(`is-visible`),e.matches(`.mask`)&&e.querySelector(`:scope > span`)?.classList.add(`is-visible`)};if(!(`IntersectionObserver`in window)){e.forEach(t);return}let n=new IntersectionObserver(e=>{e.forEach(e=>{e.isIntersecting&&(t(e.target),n.unobserve(e.target))})},{threshold:.12});e.forEach(e=>n.observe(e))},_=()=>{let e=document.querySelector(`[data-nav]`),t=document.querySelector(`[data-progress]`);if(!e||!t)return;let n=()=>{let n=window.scrollY,r=document.documentElement.scrollHeight-window.innerHeight,i=r>0?n/r:0;e.classList.toggle(`is-scrolled`,n>24),t.style.transform=`scaleX(${i})`};n(),window.addEventListener(`scroll`,n,{passive:!0}),window.addEventListener(`resize`,n)},v=()=>{if(window.matchMedia(`(pointer: coarse)`).matches)return;let e=document.querySelector(`[data-cursor]`),t=document.querySelector(`[data-cursor-label]`);if(!e||!t)return;let n=window.innerWidth/2,r=window.innerHeight/2,i=n,a=r;document.addEventListener(`pointermove`,t=>{n=t.clientX,r=t.clientY,e.classList.add(`is-visible`)}),document.querySelectorAll(`[data-cursor-text]`).forEach(n=>{n.addEventListener(`pointerenter`,()=>{t.textContent=n.dataset.cursorText??`VER`,e.classList.add(`is-active`)}),n.addEventListener(`pointerleave`,()=>{t.textContent=`VER`,e.classList.remove(`is-active`)})});let o=()=>{i+=(n-i)*.18,a+=(r-a)*.18,e.style.transform=`translate3d(${i}px, ${a}px, 0) translate(-50%, -50%)`,requestAnimationFrame(o)};o()},y=()=>{window.matchMedia(`(pointer: coarse)`).matches||document.querySelectorAll(`[data-tilt]`).forEach(e=>{e.addEventListener(`pointermove`,t=>{let n=e.getBoundingClientRect(),r=(t.clientX-n.left)/n.width-.5,i=(t.clientY-n.top)/n.height-.5,a=h(i*-5,-4,4),o=h(r*6,-5,5);e.style.setProperty(`--rx`,`${a}deg`),e.style.setProperty(`--ry`,`${o}deg`),e.style.setProperty(`--mx`,`${(r+.5)*100}%`),e.style.setProperty(`--my`,`${(i+.5)*100}%`)}),e.addEventListener(`pointerleave`,()=>{e.style.setProperty(`--rx`,`0deg`),e.style.setProperty(`--ry`,`0deg`),e.style.setProperty(`--mx`,`50%`),e.style.setProperty(`--my`,`50%`)})})},b=()=>{let e=Array.from(document.querySelectorAll(`[data-case]`));if(e.length===0)return;let t=()=>{e.forEach(e=>{let t=e.getBoundingClientRect(),n=t.height+window.innerHeight,r=h((window.innerHeight-t.top)/n,0,1);e.style.setProperty(`--case-progress`,r.toFixed(3))})};t(),window.addEventListener(`scroll`,t,{passive:!0}),window.addEventListener(`resize`,t)},x=()=>{window.matchMedia(`(pointer: coarse)`).matches||document.querySelectorAll(`.service`).forEach(e=>{e.addEventListener(`pointermove`,t=>{let n=e.getBoundingClientRect(),r=t.clientX-n.left,i=t.clientY-n.top;e.style.setProperty(`--service-x`,`${r}px`),e.style.setProperty(`--service-y`,`${i}px`)}),e.addEventListener(`pointerleave`,()=>{e.style.setProperty(`--service-x`,`50%`),e.style.setProperty(`--service-y`,`50%`)})})},S=()=>{let e=document.querySelectorAll(`[data-project-filter]`),t=document.querySelectorAll(`[data-project-category]`);e.length!==0&&t.length!==0&&e.forEach(n=>{n.addEventListener(`click`,()=>{let r=n.dataset.projectFilter??`todos`;e.forEach(e=>e.classList.toggle(`is-active`,e===n)),t.forEach(e=>{let t=e.dataset.projectCategory??``;e.hidden=r!==`todos`&&t!==r}),window.dispatchEvent(new Event(`resize`))})})},C=()=>{g(),_(),v(),y(),b(),x(),S()},w=(e,t={})=>{window.gtag?.(`event`,e,t)},T=()=>{document.addEventListener(`click`,e=>{let t=e.target.closest(`[data-analytics-event]`);if(!t)return;let n=t.dataset.analyticsEvent;n&&w(n,{placement:t.dataset.analyticsPlacement??`unknown`,link_url:t.href,link_text:t.textContent?.trim().replace(/\s+/g,` `)??``})})},E=`X`,D=`O`,O=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]],k=e=>{for(let t of O){let[n,r,i]=t;if(e[n]&&e[n]===e[r]&&e[n]===e[i])return{winner:e[n],line:t}}return e.every(Boolean)?{winner:`draw`,line:[]}:null},A=e=>e.map((e,t)=>e?-1:t).filter(e=>e!==-1),j=(e,t)=>{let n=k(e);if(n)return n.winner===D?10:n.winner===E?-10:0;if(t){let t=-1/0;return A(e).forEach(n=>{e[n]=D,t=Math.max(t,j(e,!1)),e[n]=``}),t}let r=1/0;return A(e).forEach(t=>{e[t]=E,r=Math.min(r,j(e,!0)),e[t]=``}),r},M=e=>{let t=-1/0,n=[];return A(e).forEach(r=>{e[r]=D;let i=j(e,!1);e[r]=``,i>t?(t=i,n=[r]):i===t&&n.push(r)}),n},N=e=>e[Math.floor(Math.random()*e.length)],P=()=>`SF-${new Date().toISOString().slice(2,10).replace(/-/g,``)}-${Math.random().toString(36).slice(2,6).toUpperCase()}`,F=()=>{let e=document.querySelector(`[data-challenge]`);if(!e)return;let t=e.querySelector(`[data-challenge-board]`),n=e.querySelector(`[data-challenge-speech]`),r=e.querySelector(`[data-challenge-turn]`),i=e.querySelector(`[data-challenge-turn-mark]`),a=e.querySelector(`[data-challenge-reward]`),o=e.querySelector(`[data-challenge-reset]`),s=e.querySelector(`[data-challenge-copy]`),c=e.querySelector(`[data-challenge-code]`),l=e.querySelector(`[data-challenge-claim]`),u=e.querySelector(`[data-challenge-attempts]`);if(!t||!n||!r||!i||!a||!o||!s||!c||!l||!u)return;let d=Array.from(u.querySelectorAll(`i`)),f=[`Interessante. Eu teria escolhido outro caminho, mas vamos ver onde isso chega.`,`Analisando possibilidades. Você ainda pode me surpreender.`,`Boa jogada. Agora deixe comigo.`,`Você está pensando à frente — gosto disso.`],p=[`Primeira rodada para mim. Ajuste sua estratégia e tente novamente.`,`Quase. Agora você já conhece parte do meu jogo.`,`Última tentativa. Sem pressão — apenas uma consultoria em jogo.`],m=Array(9).fill(``),h=3,g=!1,_=!1,v=!1,y,b=()=>{d.forEach((e,t)=>{e.classList.toggle(`is-used`,t>=h)}),u.setAttribute(`aria-label`,`${h} tentativa${h===1?``:`s`} restante${h===1?``:`s`}`)},x=()=>{Array.from(t.children).forEach((e,t)=>{let n=e,r=m[t];n.textContent=r,n.dataset.mark=r,n.disabled=!!r||g||_,n.setAttribute(`aria-label`,r?`Casa ${t+1}, marcada com ${r}`:`Casa ${t+1}, disponível`)}),b()},S=()=>{let e=A(m),t=M(m);if(Math.random()<(h===3?.74:h===2?.56:.36))return N(t);let n=e.filter(e=>!t.includes(e));return N(n.length?n:e)},C=()=>{let e=P(),t=[`Olá, Julian! Venci o Desafio da Sexta-Feira no seu portfólio.`,`Meu código de vitória é: ${e}.`,`Gostaria de solicitar a consultoria inicial gratuita.`].join(`

`);c.textContent=e,l.href=`https://wa.me/5569992667022?text=${encodeURIComponent(t)}`,a.classList.add(`is-visible`),a.setAttribute(`aria-hidden`,`false`),w(`challenge_reward_unlocked`,{attempts_remaining:h})},T=e=>{if(_=!0,g=!0,x(),e.line.forEach(e=>{t.children[e]?.classList.add(`is-winner`)}),e.winner===E){n.textContent=`Vitória confirmada. Você ganhou — e eu cumpro o que prometo.`,r.textContent=`Você venceu`,i.textContent=`✓`,w(`challenge_result`,{result:`win`,attempts_remaining:h}),window.setTimeout(C,650);return}h=Math.max(0,h-1),b();let a=h===0;e.winner===`draw`?(n.textContent=a?`Foi um empate digno. O desafio termina aqui — por enquanto.`:`Empate. Ninguém venceu, mas você continua no jogo.`,r.textContent=`Empate`):(n.textContent=a?`Essa foi a última rodada. Mas admito: você me deu trabalho.`:p[2-h],r.textContent=`Sexta-Feira venceu`),o.textContent=a?`Recomeçar desafio`:`Próxima tentativa`,w(`challenge_result`,{result:e.winner===`draw`?`draw`:`loss`,attempts_remaining:h})},O=()=>{_||(g=!0,x(),r.textContent=`Sexta-Feira pensando`,i.textContent=D,n.textContent=N(f)??f[0],n.classList.add(`is-thinking`),y=window.setTimeout(()=>{let e=S();e!==void 0&&(m[e]=D),n.classList.remove(`is-thinking`);let t=k(m);if(t){x(),T(t);return}g=!1,r.textContent=`Sua vez`,i.textContent=E,n.textContent=`Sua vez. Estou observando o padrão das suas escolhas.`,x()},620))},j=e=>{if(g||_||m[e])return;v||(v=!0,w(`challenge_started`,{attempt:4-h})),m[e]=E,x();let t=k(m);if(t){T(t);return}O()},F=()=>{t.innerHTML=``;for(let e=0;e<9;e+=1){let n=document.createElement(`button`);n.className=`challenge__cell`,n.type=`button`,n.setAttribute(`role`,`gridcell`),n.addEventListener(`click`,()=>j(e)),t.appendChild(n)}},I=(e=!1)=>{y!==void 0&&window.clearTimeout(y),(e||h===0)&&(h=3),m=Array(9).fill(``),g=!1,_=!1,v=!1,a.classList.remove(`is-visible`),a.setAttribute(`aria-hidden`,`true`),F(),x(),r.textContent=`Sua vez`,i.textContent=E,o.textContent=`Reiniciar partida`,n.classList.remove(`is-thinking`),n.textContent=h===3?`Você começa. Escolha uma casa — prometo não subestimar sua estratégia.`:`Nova rodada. Já aprendi algumas coisas sobre o seu jeito de jogar.`};o.addEventListener(`click`,()=>{!_&&m.some(Boolean)&&(h=Math.max(0,h-1),w(`challenge_reset`,{attempts_remaining:h})),I(h===0)}),s.addEventListener(`click`,async()=>{try{await navigator.clipboard.writeText(c.textContent??``),s.textContent=`COPIADO ✓`}catch{s.textContent=`COPIE O CÓDIGO`}}),F(),x()},I=()=>{T(),d(),a(),C(),m(),F()};document.readyState===`loading`?document.addEventListener(`DOMContentLoaded`,I,{once:!0}):I();