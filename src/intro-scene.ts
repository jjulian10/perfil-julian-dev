const vertexShader = `
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
`;

const fragmentShader = `
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
`;

interface IGeometry {
  positions: Float32Array;
  types: Float32Array;
  count: number;
}

const createShader = (
  gl: WebGLRenderingContext,
  type: number,
  source: string
): WebGLShader | null => {
  const shader = gl.createShader(type);

  if (!shader) {
    return null;
  }

  gl.shaderSource(
    shader,
    source
  );

  gl.compileShader(shader);

  const compiled = gl.getShaderParameter(
    shader,
    gl.COMPILE_STATUS
  );

  if (!compiled) {
    console.error(
      gl.getShaderInfoLog(shader)
    );

    gl.deleteShader(shader);

    return null;
  }

  return shader;
};

const createProgram = (
  gl: WebGLRenderingContext
): WebGLProgram | null => {
  const vertex = createShader(
    gl,
    gl.VERTEX_SHADER,
    vertexShader
  );

  const fragment = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShader
  );

  if (!vertex || !fragment) {
    return null;
  }

  const program = gl.createProgram();

  if (!program) {
    return null;
  }

  gl.attachShader(
    program,
    vertex
  );

  gl.attachShader(
    program,
    fragment
  );

  gl.linkProgram(program);

  const linked = gl.getProgramParameter(
    program,
    gl.LINK_STATUS
  );

  gl.deleteShader(vertex);
  gl.deleteShader(fragment);

  if (!linked) {
    console.error(
      gl.getProgramInfoLog(program)
    );

    gl.deleteProgram(program);

    return null;
  }

  return program;
};

const createGeometry = (): IGeometry => {
  const positions: number[] = [];
  const types: number[] = [];

  const sphereCount = 4200;
  const goldenAngle =
    Math.PI *
    (3 - Math.sqrt(5));

  for (
    let index = 0;
    index < sphereCount;
    index += 1
  ) {
    const progress =
      index /
      (sphereCount - 1);

    const y =
      1 -
      progress * 2;

    const radius =
      Math.sqrt(
        Math.max(
          0,
          1 - y * y
        )
      );

    const angle =
      goldenAngle *
      index;

    const x =
      Math.cos(angle) *
      radius;

    const z =
      Math.sin(angle) *
      radius;

    positions.push(
      x,
      y,
      z
    );

    types.push(0);
  }

  const ringCount = 900;

  for (
    let index = 0;
    index < ringCount;
    index += 1
  ) {
    const angle =
      (
        index /
        ringCount
      ) *
      Math.PI *
      2;

    const radius =
      1.22 +
      Math.sin(
        angle * 5
      ) *
      0.018;

    const x =
      Math.cos(angle) *
      radius;

    const y =
      Math.sin(
        angle * 3
      ) *
      0.035;

    const z =
      Math.sin(angle) *
      radius;

    positions.push(
      x,
      y,
      z
    );

    types.push(1);
  }

  const orbitCount = 700;

  for (
    let index = 0;
    index < orbitCount;
    index += 1
  ) {
    const angle =
      (
        index /
        orbitCount
      ) *
      Math.PI *
      2;

    const radius = 1.38;

    let x =
      Math.cos(angle) *
      radius;

    let y =
      Math.sin(angle) *
      radius *
      0.42;

    let z =
      Math.sin(angle) *
      radius;

    const tilt = 0.65;

    const nextY =
      y * Math.cos(tilt) -
      z * Math.sin(tilt);

    const nextZ =
      y * Math.sin(tilt) +
      z * Math.cos(tilt);

    y = nextY;
    z = nextZ;

    x *= 0.98;

    positions.push(
      x,
      y,
      z
    );

    types.push(1);
  }

  return {
    positions:
      new Float32Array(
        positions
      ),

    types:
      new Float32Array(
        types
      ),

    count:
      types.length
  };
};

export const initIntroScene = (): void => {
  const canvas =
    document.querySelector<HTMLCanvasElement>(
      "[data-intro-scene]"
    );

  if (!canvas) {
    return;
  }

  const gl =
    canvas.getContext(
      "webgl",
      {
        alpha: true,
        antialias: true,
        powerPreference:
          "high-performance"
      }
    );

  if (!gl) {
    return;
  }

  const program =
    createProgram(gl);

  if (!program) {
    return;
  }

  const geometry =
    createGeometry();

  const positionBuffer =
    gl.createBuffer();

  const typeBuffer =
    gl.createBuffer();

  if (
    !positionBuffer ||
    !typeBuffer
  ) {
    return;
  }

  const positionLocation =
    gl.getAttribLocation(
      program,
      "aPosition"
    );

  const typeLocation =
    gl.getAttribLocation(
      program,
      "aType"
    );

  const timeLocation =
    gl.getUniformLocation(
      program,
      "uTime"
    );

  const aspectLocation =
    gl.getUniformLocation(
      program,
      "uAspect"
    );

  const ratioLocation =
    gl.getUniformLocation(
      program,
      "uPixelRatio"
    );

  const pointerLocation =
    gl.getUniformLocation(
      program,
      "uPointer"
    );

  gl.useProgram(program);

  gl.bindBuffer(
    gl.ARRAY_BUFFER,
    positionBuffer
  );

  gl.bufferData(
    gl.ARRAY_BUFFER,
    geometry.positions,
    gl.STATIC_DRAW
  );

  gl.enableVertexAttribArray(
    positionLocation
  );

  gl.vertexAttribPointer(
    positionLocation,
    3,
    gl.FLOAT,
    false,
    0,
    0
  );

  gl.bindBuffer(
    gl.ARRAY_BUFFER,
    typeBuffer
  );

  gl.bufferData(
    gl.ARRAY_BUFFER,
    geometry.types,
    gl.STATIC_DRAW
  );

  gl.enableVertexAttribArray(
    typeLocation
  );

  gl.vertexAttribPointer(
    typeLocation,
    1,
    gl.FLOAT,
    false,
    0,
    0
  );

  gl.enable(gl.BLEND);

  gl.blendFunc(
    gl.SRC_ALPHA,
    gl.ONE
  );

  gl.disable(
    gl.DEPTH_TEST
  );

  gl.clearColor(
    0,
    0,
    0,
    0
  );

  let width = 1;
  let height = 1;
  let ratio = 1;

  const resize = (): void => {
    width =
      window.innerWidth;

    height =
      window.innerHeight;

    ratio =
      Math.min(
        window.devicePixelRatio || 1,
        1.7
      );

    canvas.width =
      Math.floor(
        width *
        ratio
      );

    canvas.height =
      Math.floor(
        height *
        ratio
      );

    canvas.style.width =
      `${width}px`;

    canvas.style.height =
      `${height}px`;

    gl.viewport(
      0,
      0,
      canvas.width,
      canvas.height
    );
  };

  const pointer = {
    x: 0,
    y: 0
  };

  const target = {
    x: 0,
    y: 0
  };

  const move = (
    event: PointerEvent
  ): void => {
    target.x =
      (
        event.clientX /
        window.innerWidth
      ) *
        2 -
      1;

    target.y =
      -(
        (
          event.clientY /
          window.innerHeight
        ) *
          2 -
        1
      );
  };

  const reducedMotion =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

  const startedAt =
    performance.now();

  const render = (
    now: number
  ): void => {
    if (!canvas.isConnected) {
      return;
    }

    pointer.x +=
      (
        target.x -
        pointer.x
      ) *
      0.035;

    pointer.y +=
      (
        target.y -
        pointer.y
      ) *
      0.035;

    const elapsed =
      reducedMotion
        ? 0
        : (
            now -
            startedAt
          ) /
          1000;

    gl.clear(
      gl.COLOR_BUFFER_BIT
    );

    gl.useProgram(program);

    gl.uniform1f(
      timeLocation,
      elapsed
    );

    gl.uniform1f(
      aspectLocation,
      width / height
    );

    gl.uniform1f(
      ratioLocation,
      ratio
    );

    gl.uniform2f(
      pointerLocation,
      pointer.x,
      pointer.y
    );

    gl.drawArrays(
      gl.POINTS,
      0,
      geometry.count
    );

    if (!reducedMotion) {
      requestAnimationFrame(
        render
      );
    }
  };

  resize();

  window.addEventListener(
    "resize",
    resize
  );

  window.addEventListener(
    "pointermove",
    move,
    {
      passive: true
    }
  );

  requestAnimationFrame(
    render
  );
};