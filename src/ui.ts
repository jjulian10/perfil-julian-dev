const clamp = (
  value: number,
  min: number,
  max: number
): number =>
  Math.min(
    Math.max(value, min),
    max
  );

const initReveal = (): void => {
  const elements =
    Array.from(
      document.querySelectorAll<HTMLElement>(
        ".reveal, .mask"
      )
    );

  // Observe a máscara estável, não o texto deslocado e recortado dentro dela.
  const reveal = (element: HTMLElement): void => {
    element.classList.add("is-visible");
    if (element.matches(".mask")) {
      element.querySelector<HTMLElement>(":scope > span")?.classList.add("is-visible");
    }
  };

  if (!("IntersectionObserver" in window)) {
    elements.forEach(reveal);
    return;
  }

  const observer =
    new IntersectionObserver(
      entries => {
        entries.forEach(
          entry => {
            if (
              !entry.isIntersecting
            ) {
              return;
            }

            reveal(entry.target as HTMLElement);

            observer.unobserve(
              entry.target
            );
          }
        );
      },
      {
        threshold: 0.12
      }
    );

  elements.forEach(
    element =>
      observer.observe(
        element
      )
  );
};

const initNav = (): void => {
  const nav =
    document.querySelector<HTMLElement>(
      "[data-nav]"
    );

  const progress =
    document.querySelector<HTMLElement>(
      "[data-progress]"
    );

  if (
    !nav ||
    !progress
  ) {
    return;
  }

  const update = (): void => {
    const y =
      window.scrollY;

    const max =
      document.documentElement
        .scrollHeight -
      window.innerHeight;

    const ratio =
      max > 0
        ? y / max
        : 0;

    nav.classList.toggle(
      "is-scrolled",
      y > 24
    );

    progress.style.transform =
      `scaleX(${ratio})`;
  };

  update();

  window.addEventListener(
    "scroll",
    update,
    {
      passive: true
    }
  );

  window.addEventListener(
    "resize",
    update
  );
};

const initCursor = (): void => {
  if (
    window
      .matchMedia(
        "(pointer: coarse)"
      )
      .matches
  ) {
    return;
  }

  const cursor =
    document.querySelector<HTMLElement>(
      "[data-cursor]"
    );

  const label =
    document.querySelector<HTMLElement>(
      "[data-cursor-label]"
    );

  if (
    !cursor ||
    !label
  ) {
    return;
  }

  let x =
    window.innerWidth / 2;

  let y =
    window.innerHeight / 2;

  let currentX = x;
  let currentY = y;

  document.addEventListener(
    "pointermove",
    event => {
      x = event.clientX;
      y = event.clientY;

      cursor.classList.add(
        "is-visible"
      );
    }
  );

  document
    .querySelectorAll<HTMLElement>(
      "[data-cursor-text]"
    )
    .forEach(
      item => {
        item.addEventListener(
          "pointerenter",
          () => {
            label.textContent =
              item.dataset
                .cursorText ??
              "VER";

            cursor.classList.add(
              "is-active"
            );
          }
        );

        item.addEventListener(
          "pointerleave",
          () => {
            label.textContent =
              "VER";

            cursor.classList.remove(
              "is-active"
            );
          }
        );
      }
    );

  const animate = (): void => {
    currentX +=
      (
        x -
        currentX
      ) *
      0.18;

    currentY +=
      (
        y -
        currentY
      ) *
      0.18;

    cursor.style.transform =
      `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;

    requestAnimationFrame(
      animate
    );
  };

  animate();
};

const initTilts = (): void => {
  if (
    window
      .matchMedia(
        "(pointer: coarse)"
      )
      .matches
  ) {
    return;
  }

  document
    .querySelectorAll<HTMLElement>(
      "[data-tilt]"
    )
    .forEach(
      stage => {
        stage.addEventListener(
          "pointermove",
          event => {
            const rect =
              stage.getBoundingClientRect();

            const x =
              (
                event.clientX -
                rect.left
              ) /
                rect.width -
              0.5;

            const y =
              (
                event.clientY -
                rect.top
              ) /
                rect.height -
              0.5;

            const rotateX =
              clamp(
                y * -5,
                -4,
                4
              );

            const rotateY =
              clamp(
                x * 6,
                -5,
                5
              );

            stage.style.setProperty(
              "--rx",
              `${rotateX}deg`
            );

            stage.style.setProperty(
              "--ry",
              `${rotateY}deg`
            );

            stage.style.setProperty(
              "--mx",
              `${(x + 0.5) * 100}%`
            );

            stage.style.setProperty(
              "--my",
              `${(y + 0.5) * 100}%`
            );
          }
        );

        stage.addEventListener(
          "pointerleave",
          () => {
            stage.style.setProperty(
              "--rx",
              "0deg"
            );

            stage.style.setProperty(
              "--ry",
              "0deg"
            );

            stage.style.setProperty(
              "--mx",
              "50%"
            );

            stage.style.setProperty(
              "--my",
              "50%"
            );
          }
        );
      }
    );
};

const initCaseMotion = (): void => {
  const cases =
    Array.from(
      document.querySelectorAll<HTMLElement>(
        "[data-case]"
      )
    );

  if (
    cases.length === 0
  ) {
    return;
  }

  const update = (): void => {
    cases.forEach(
      item => {
        const rect =
          item.getBoundingClientRect();

        const total =
          rect.height +
          window.innerHeight;

        const progress =
          clamp(
            (
              window.innerHeight -
              rect.top
            ) /
              total,
            0,
            1
          );

        item.style.setProperty(
          "--case-progress",
          progress.toFixed(3)
        );
      }
    );
  };

  update();

  window.addEventListener(
    "scroll",
    update,
    {
      passive: true
    }
  );

  window.addEventListener(
    "resize",
    update
  );
};

const initServiceGlow = (): void => {
  if (
    window
      .matchMedia(
        "(pointer: coarse)"
      )
      .matches
  ) {
    return;
  }

  const services =
    document.querySelectorAll<HTMLElement>(
      ".service"
    );

  services.forEach(
    service => {
      service.addEventListener(
        "pointermove",
        event => {
          const rect =
            service.getBoundingClientRect();

          const x =
            event.clientX -
            rect.left;

          const y =
            event.clientY -
            rect.top;

          service.style.setProperty(
            "--service-x",
            `${x}px`
          );

          service.style.setProperty(
            "--service-y",
            `${y}px`
          );
        }
      );

      service.addEventListener(
        "pointerleave",
        () => {
          service.style.setProperty(
            "--service-x",
            "50%"
          );

          service.style.setProperty(
            "--service-y",
            "50%"
          );
        }
      );
    }
  );
};

export const initUi =
  (): void => {
    initReveal();
    initNav();
    initCursor();
    initTilts();
    initCaseMotion();
    initServiceGlow();
  };