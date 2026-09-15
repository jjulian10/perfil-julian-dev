const frameDuration = 1500;
const transitionDuration = 900;

let audio: AudioContext | null = null;
let soundEnabled = false;

const playTone = (frequency: number): void => {
  if (!soundEnabled || !audio) {
    return;
  }

  const oscillator = audio.createOscillator();
  const gain = audio.createGain();

  oscillator.type = "sine";
  oscillator.frequency.value = frequency;

  gain.gain.setValueAtTime(0, audio.currentTime);
  gain.gain.linearRampToValueAtTime(
    0.035,
    audio.currentTime + 0.05
  );

  gain.gain.exponentialRampToValueAtTime(
    0.001,
    audio.currentTime + 0.7
  );

  oscillator.connect(gain);
  gain.connect(audio.destination);

  oscillator.start();
  oscillator.stop(audio.currentTime + 0.7);
};

export const initIntro = (): void => {
  const intro = document.querySelector<HTMLElement>(
    "[data-intro]"
  );

  if (!intro) {
    return;
  }

  const frames = Array.from(
    intro.querySelectorAll<HTMLElement>(
      "[data-intro-frame]"
    )
  );

  const skip = intro.querySelector<HTMLButtonElement>(
    "[data-intro-skip]"
  );

  const sound = intro.querySelector<HTMLButtonElement>(
    "[data-intro-sound]"
  );

  const soundLabel = intro.querySelector<HTMLElement>(
    "[data-intro-sound-label]"
  );

  const soundStatus = intro.querySelector<HTMLElement>(
    "[data-intro-sound-status]"
  );

  const current = intro.querySelector<HTMLElement>(
    "[data-intro-current]"
  );

  const progress = intro.querySelector<HTMLElement>(
    "[data-intro-progress]"
  );

  let index = 0;
  let timer = 0;
  let animation = 0;
  let finished = false;

  document.body.classList.add("intro-open");

  const updateFrame = (next: number): void => {
    frames.forEach((frame, frameIndex) => {
      frame.classList.toggle(
        "is-active",
        frameIndex === next
      );

      frame.classList.toggle(
        "is-before",
        frameIndex < next
      );
    });

    if (current) {
      current.textContent = String(next + 1).padStart(
        2,
        "0"
      );
    }

    playTone(180 + next * 90);
  };

  const finish = (): void => {
    if (finished) {
      return;
    }

    finished = true;

    window.clearInterval(timer);
    window.cancelAnimationFrame(animation);

    if (progress) {
      progress.style.transform = "scaleX(1)";
    }

    intro.classList.add("is-leaving");

    window.setTimeout(() => {
      document.body.classList.remove("intro-open");
      intro.remove();
    }, transitionDuration);
  };

  const startProgress = (): void => {
    const startedAt = performance.now();
    const duration = frameDuration * frames.length;

    const render = (time: number): void => {
      if (finished) {
        return;
      }

      const elapsed = time - startedAt;
      const value = Math.min(elapsed / duration, 1);

      if (progress) {
        progress.style.transform = `scaleX(${value})`;
      }

      animation = requestAnimationFrame(render);
    };

    animation = requestAnimationFrame(render);
  };

  const nextFrame = (): void => {
    index += 1;

    if (index >= frames.length) {
      finish();
      return;
    }

    updateFrame(index);
  };

  const toggleSound = async (): Promise<void> => {
    if (!audio) {
      audio = new AudioContext();
    }

    if (audio.state === "suspended") {
      await audio.resume();
    }

    soundEnabled = !soundEnabled;

    sound?.classList.toggle(
      "is-active",
      soundEnabled
    );

    soundStatus?.classList.toggle(
      "is-active",
      soundEnabled
    );

    if (soundLabel) {
      soundLabel.textContent = soundEnabled
        ? "SOM LIGADO"
        : "ATIVAR SOM";
    }

    if (soundEnabled) {
      playTone(220);
    }
  };

  skip?.addEventListener(
    "click",
    finish
  );

  sound?.addEventListener(
    "click",
    () => {
      void toggleSound();
    }
  );

  updateFrame(0);
  startProgress();

  timer = window.setInterval(
    nextFrame,
    frameDuration
  );

  if (
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
  ) {
    finish();
  }
};