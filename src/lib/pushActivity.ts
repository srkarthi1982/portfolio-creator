import type { PortfolioDashboardSummaryV1 } from "../dashboard/summary.schema";

const getWebhookUrl = (baseUrl: string) =>
  `${baseUrl.replace(/\/$/, "")}/api/webhooks/portfolio-creator-activity.json`;

type PortfolioActivity = {
  event: string;
  occurredAt: string;
  entityId?: string;
};

export const pushPortfolioCreatorActivity = (params: {
  userId: string;
  activity: PortfolioActivity;
  summary: PortfolioDashboardSummaryV1;
}): void => {
  try {
    const baseUrl = import.meta.env.PARENT_APP_URL;
    const secret = import.meta.env.ANSIVERSA_WEBHOOK_SECRET;

    if (!baseUrl || !secret) {
      if (import.meta.env.DEV) {
        console.warn(
          "pushPortfolioCreatorActivity skipped: missing PARENT_APP_URL or ANSIVERSA_WEBHOOK_SECRET",
        );
      }
      return;
    }

    const url = getWebhookUrl(baseUrl);
    const payload = {
      userId: params.userId,
      appId: "portfolio-creator",
      activity: params.activity,
      summary: params.summary,
    };

    void fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Ansiversa-Signature": secret,
      },
      body: JSON.stringify(payload),
    }).catch(() => {});
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn("pushPortfolioCreatorActivity failed", error);
    }
  }
};
