type SceneUniforms = {
  time: WebGLUniformLocation | null;
  pointer: WebGLUniformLocation | null;
  aspect: WebGLUniformLocation | null;
};

type SphereGeometry = {
  vertices: Float32Array;
  indices: Uint16Array;
};

const compile = (
  gl: WebGLRenderingContext,
  type: number,
  source: string
): WebGLShader | null => {
  const shader =
    gl.createShader(type);

  if (!shader) {
    return null;
  }

  gl.shaderSource(
    shader,
    source
  );

  gl.compileShader(shader);

  if (
    !gl.getShaderParameter(
      shader,
      gl.COMPILE_STATUS
    )
  ) {
    console.error(
      gl.getShaderInfoLog(shader)
    );

    gl.deleteShader(shader);

    return null;
  }

  return shader;
};

const createSphere = (
  lat: number,
  lon: number
): SphereGeometry => {
  const vertices: number[] = [];
  const indices: number[] = [];

  for (
    let y = 0;
    y <= lat;
    y += 1
  ) {
    const v =
      y / lat;

    const theta =
      v * Math.PI;

    for (
      let x = 0;
      x <= lon;
      x += 1
    ) {
      const u =
        x / lon;

      const phi =
        u *
        Math.PI *
        2;

      vertices.push(
        Math.sin(theta) *
          Math.cos(phi) *
          1.28,

        Math.cos(theta) *
          1.28,

        Math.sin(theta) *
          Math.sin(phi) *
          1.28
      );
    }
  }

  for (
    let y = 0;
    y < lat;
    y += 1
  ) {
    for (
      let x = 0;
      x < lon;
      x += 1
    ) {
      const a =
        y *
          (lon + 1) +
        x;

      const b =
        a +
        lon +
        1;

      indices.push(
        a,
        b,
        a + 1,

        b,
        b + 1,
        a + 1
      );
    }
  }

  return {
    vertices:
      new Float32Array(
        vertices
      ),

    indices:
      new Uint16Array(
        indices
      )
  };
};

export const initScene =
  (): void => {
    const canvas =
      document.querySelector<HTMLCanvasElement>(
        "[data-scene]"
      );

    if (!canvas) {
      return;
    }

    const gl =
      canvas.getContext(
        "webgl",
        {
          alpha: true,
          antialias: true
        }
      );

    if (!gl) {
      return;
    }

    const vertexSource = `
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
    `;

    const fragmentSource = `
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
    `;

    const vertexShader =
      compile(
        gl,
        gl.VERTEX_SHADER,
        vertexSource
      );

    const fragmentShader =
      compile(
        gl,
        gl.FRAGMENT_SHADER,
        fragmentSource
      );

    if (
      !vertexShader ||
      !fragmentShader
    ) {
      return;
    }

    const program =
      gl.createProgram();

    if (!program) {
      return;
    }

    gl.attachShader(
      program,
      vertexShader
    );

    gl.attachShader(
      program,
      fragmentShader
    );

    gl.linkProgram(program);

    if (
      !gl.getProgramParameter(
        program,
        gl.LINK_STATUS
      )
    ) {
      console.error(
        gl.getProgramInfoLog(
          program
        )
      );

      gl.deleteProgram(
        program
      );

      return;
    }

    gl.useProgram(
      program
    );

    const geometry =
      createSphere(
        58,
        72
      );

    const vertexBuffer =
      gl.createBuffer();

    const indexBuffer =
      gl.createBuffer();

    if (
      !vertexBuffer ||
      !indexBuffer
    ) {
      return;
    }

    gl.bindBuffer(
      gl.ARRAY_BUFFER,
      vertexBuffer
    );

    gl.bufferData(
      gl.ARRAY_BUFFER,
      geometry.vertices,
      gl.STATIC_DRAW
    );

    gl.bindBuffer(
      gl.ELEMENT_ARRAY_BUFFER,
      indexBuffer
    );

    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      geometry.indices,
      gl.STATIC_DRAW
    );

    const position =
      gl.getAttribLocation(
        program,
        "aPosition"
      );

    if (position < 0) {
      return;
    }

    gl.enableVertexAttribArray(
      position
    );

    gl.vertexAttribPointer(
      position,
      3,
      gl.FLOAT,
      false,
      0,
      0
    );

    const uniforms: SceneUniforms = {
      time:
        gl.getUniformLocation(
          program,
          "uTime"
        ),

      pointer:
        gl.getUniformLocation(
          program,
          "uPointer"
        ),

      aspect:
        gl.getUniformLocation(
          program,
          "uAspect"
        )
    };

    let pointerX = 0;
    let pointerY = 0;

    let targetX = 0;
    let targetY = 0;

    const updatePointer = (
      event: PointerEvent
    ): void => {
      const rect =
        canvas.getBoundingClientRect();

      if (
        rect.width <= 0 ||
        rect.height <= 0
      ) {
        return;
      }

      targetX =
        (
          (
            event.clientX -
            rect.left
          ) /
          rect.width
        ) *
          2 -
        1;

      targetY =
        -(
          (
            (
              event.clientY -
              rect.top
            ) /
            rect.height
          ) *
            2 -
          1
        );
    };

    canvas.addEventListener(
      "pointermove",
      updatePointer
    );

    canvas.addEventListener(
      "pointerleave",
      () => {
        targetX = 0;
        targetY = 0;
      }
    );

    const resize =
      (): void => {
        const rect =
          canvas.getBoundingClientRect();

        if (
          rect.width <= 0 ||
          rect.height <= 0
        ) {
          return;
        }

        const dpr =
          Math.min(
            window.devicePixelRatio ||
              1,
            1.6
          );

        const width =
          Math.max(
            1,
            Math.round(
              rect.width *
              dpr
            )
          );

        const height =
          Math.max(
            1,
            Math.round(
              rect.height *
              dpr
            )
          );

        if (
          canvas.width !==
            width ||
          canvas.height !==
            height
        ) {
          canvas.width =
            width;

          canvas.height =
            height;

          gl.viewport(
            0,
            0,
            width,
            height
          );
        }

        gl.uniform1f(
          uniforms.aspect,
          width /
            height
        );
      };

    gl.enable(
      gl.DEPTH_TEST
    );

    gl.enable(
      gl.BLEND
    );

    gl.blendFunc(
      gl.SRC_ALPHA,
      gl.ONE_MINUS_SRC_ALPHA
    );

    gl.clearColor(
      0,
      0,
      0,
      0
    );

    const start =
      performance.now();

    const reduceMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      );

    const render = (
      now: number
    ): void => {
      resize();

      pointerX +=
        (
          targetX -
          pointerX
        ) *
        0.045;

      pointerY +=
        (
          targetY -
          pointerY
        ) *
        0.045;

      gl.clear(
        gl.COLOR_BUFFER_BIT |
          gl.DEPTH_BUFFER_BIT
      );

      const time =
        reduceMotion.matches
          ? 0
          : (
              now -
              start
            ) /
            1000;

      gl.uniform1f(
        uniforms.time,
        time
      );

      gl.uniform2f(
        uniforms.pointer,
        pointerX,
        pointerY
      );

      gl.drawElements(
        gl.TRIANGLES,
        geometry.indices.length,
        gl.UNSIGNED_SHORT,
        0
      );

      requestAnimationFrame(
        render
      );
    };

    requestAnimationFrame(
      render
    );
  };