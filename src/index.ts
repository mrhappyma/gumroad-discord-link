import { RESTPostOAuth2AccessTokenResult } from "discord-api-types/v10";
import env from "./env";
import setup from "./setup";
import express from "express";
import path from "path";

setup();
const app = express();

app.get("/", (req, res) => {
  res.redirect(
    301,
    `https://discord.com/api/oauth2/authorize?client_id=${env.CLIENT_ID}&permissions=0&scope=bot`
  );
});

app.listen(env.PORT, () => {
  console.log(`Listening on port ${env.PORT}`);
});

app.get("/linked-role", async (req, res) => {
  return res.status(200).sendFile(path.join(__dirname + "/../prompt.html"));
});

app.get("/continue", async (req, res) => {
  const { key } = req.query;
  if (!key) return res.status(400).send("No key provided");

  const url = `https://discord.com/api/oauth2/authorize?client_id=993574491823276052&redirect_uri=${encodeURI(
    env.SELF_URL
  )}%2Fdiscord-callback&response_type=code&scope=role_connections.write&state=${key}`;
  return res.redirect(301, url);
});

app.get("/discord-callback", async (req, res) => {
  const { code, state } = req.query;
  if (typeof code != "string" || !state)
    return res.status(400).send("No code or state provided");

  const tokenRequest = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: env.CLIENT_ID,
      client_secret: env.CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: `${env.SELF_URL}/discord-callback`,
    }),
  });
  const token: RESTPostOAuth2AccessTokenResult = await tokenRequest.json();

  const licenseVerifyRequest = await fetch(
    "https://api.gumroad.com/v2/licenses/verify",
    {
      method: "POST",
      body: JSON.stringify({
        product_id: env.PRODUCT_ID,
        license_key: state,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const licenseVerify = await licenseVerifyRequest.json();

  if (!licenseVerify.success)
    return res.status(400).send("Invalid license key");

  const roleRequest = await fetch(
    `https://discord.com/api/v10/users/@me/applications/${env.CLIENT_ID}/role-connection`,
    {
      method: "PUT",
      body: JSON.stringify({
        platform_name: "Gumroad",
        metadata: {
          own_product: true,
          quantity: licenseVerify.purchase.quantity,
          price_paid: licenseVerify.purchase.price,
          purchase_date: licenseVerify.purchase.created_at,
        },
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.access_token}`,
      },
    }
  );

  if (!roleRequest.ok) {
    return res.status(400).send("Failed to set role connection");
  }
  return res
    .status(200)
    .send("Role connection set. You can close this window.");
});
