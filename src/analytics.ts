const measurementId =
  "G-9HX7XJH5P4";

type AnalyticsValue =
  | string
  | number
  | boolean
  | Date
  | undefined;

type AnalyticsParams =
  Record<
    string,
    AnalyticsValue
  >;

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (
      command: string,
      ...args: unknown[]
    ) => void;
  }
}

const loadScript = (): void => {
  const script =
    document.createElement(
      "script"
    );

  script.async = true;

  script.src =
    `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;

  document.head.appendChild(
    script
  );
};

export const trackEvent = (
  name: string,
  params: AnalyticsParams = {}
): void => {
  if (!window.gtag) {
    return;
  }

  window.gtag(
    "event",
    name,
    params
  );
};

export const initAnalytics =
  (): void => {
    if (
      window.location.hostname ===
        "localhost" ||
      window.location.hostname ===
        "127.0.0.1"
    ) {
      return;
    }

    window.dataLayer =
      window.dataLayer || [];

    window.gtag = (
      ...args: unknown[]
    ): void => {
      window.dataLayer.push(
        args
      );
    };

    loadScript();

    window.gtag(
      "js",
      new Date()
    );

    window.gtag(
      "config",
      measurementId
    );
  };