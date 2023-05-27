import {
  type APIApplicationRoleConnectionMetadata,
  ApplicationRoleConnectionMetadataType,
} from "discord-api-types/v10";
import env from "./env";

const setupBody: APIApplicationRoleConnectionMetadata[] = [
  {
    key: "own_product",
    name: `Own ${env.PRODUCT_NAME}`,
    description: "Owns this product",
    type: ApplicationRoleConnectionMetadataType.BooleanEqual,
  },
  {
    key: "quantity",
    name: "Quantity",
    description: "Owns at least this many of the product",
    type: ApplicationRoleConnectionMetadataType.IntegerGreaterThanOrEqual,
  },
  {
    key: "price_paid",
    name: "Price Paid",
    description: "Paid at least this much for the product",
    type: ApplicationRoleConnectionMetadataType.IntegerGreaterThanOrEqual,
  },
  {
    key: "purchase_date",
    name: "Purchase Date",
    description: "Bought it on or before this date",
    type: ApplicationRoleConnectionMetadataType.DatetimeLessThanOrEqual,
  },
];

const setup = async () => {
  const url = `https://discord.com/api/v10/applications/${env.CLIENT_ID}/role-connections/metadata`;
  const response = await fetch(url, {
    method: "PUT",
    body: JSON.stringify(setupBody),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bot ${env.BOT_TOKEN}`,
    },
  });
  if (!response.ok) {
    console.error("Failed to set up role connection metadata");
    throw new Error(await response.text());
  }
};

export default setup;
