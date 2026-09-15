type AnalyticsParams =
  Record<
    string,
    string | number | boolean
  >;

declare global {
  interface Window {
    gtag?: (
      command: "event",
      eventName: string,
      params?: AnalyticsParams
    ) => void;
  }
}

export const trackEvent = (
  eventName: string,
  params: AnalyticsParams = {}
): void => {
  window.gtag?.(
    "event",
    eventName,
    params
  );
};

export const initAnalyticsEvents =
  (): void => {
    document.addEventListener(
      "click",
      event => {
        const target =
          event.target as HTMLElement;

        const link =
          target.closest<HTMLAnchorElement>(
            "[data-analytics-event]"
          );

        if (!link) {
          return;
        }

        const eventName =
          link.dataset.analyticsEvent;

        if (!eventName) {
          return;
        }

        trackEvent(
          eventName,
          {
            placement:
              link.dataset.analyticsPlacement ??
              "unknown",

            link_url:
              link.href,

            link_text:
              link.textContent
                ?.trim()
                .replace(/\s+/g, " ") ??
              ""
          }
        );
      }
    );
  };