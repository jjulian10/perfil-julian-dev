import "./styles.scss";
import "./intro.scss";
import "./hero.scss";
import "./projects.scss";
import "./services.scss";
import "./challenge.scss";
import "./contact.scss";

import { initIntro } from "./intro";
import { initIntroScene } from "./intro-scene";
import { initScene } from "./scene";
import { initUi } from "./ui";
import {
  initAnalyticsEvents
} from "./analytics";
import { initChallenge } from "./challenge";


const start = (): void => {
  initAnalyticsEvents();

  initIntroScene();
  initIntro();
  initUi();
  initScene();
  initChallenge();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start, {
    once: true
  });
} else {
  start();
}
