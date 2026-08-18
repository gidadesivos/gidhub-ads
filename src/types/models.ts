import type { Prisma } from "@prisma/client";

export type CampaignWithRelations = Prisma.CampaignGetPayload<{
  include: {
    product: true;
    attendant: true;
    backupAttendant: true;
    landingPage: true;
    offer: true;
    creatives: { include: { creative: true } };
    audiences: { include: { audience: true } };
  };
}>;

export type CampaignCardData = Prisma.CampaignGetPayload<{
  include: {
    product: true;
    attendant: true;
    creatives: { include: { creative: true } };
    audiences: { include: { audience: true } };
  };
}>;
