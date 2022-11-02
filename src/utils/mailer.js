const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const { OAuth2 } = google.auth;
const auth_link = "https://developers.google.com/oauthplayground";
const { EMAIL, MAILING_ID, MAILING_REFRESH, MAILING_SECRET } = process.env;

const auth = new OAuth2(MAILING_ID, MAILING_SECRET, MAILING_REFRESH, auth_link);

exports.sendVerificationEmail = (email, name, url, func) => {
  auth.setCredentials({
    refresh_token: MAILING_REFRESH,
  });
  const accessToken = auth.getAccessToken();
  const stmp = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAUTH2",
      user: EMAIL,
      clientId: MAILING_ID,
      clientSecret: MAILING_SECRET,
      refreshToken: MAILING_REFRESH,
      accessToken,
    },
  });
  const mailOptions = {
    from: EMAIL,
    to: email,
    subject: "Flixtor email verification",
    html: `<div style="max-width:700px;margin-bottom:1rem;display:flex;align-items:center;gap:10px;font-family:Arial,Helvetica,sans-serif;font-weight:600;color:#17a2b8"><img src="https://s1.bunnycdn.ru/assets/sites/flixtor/logo.png" alt="" width="30" height="30"><span>Action require : ${
      func === "forgot"
        ? "Forgot your password"
        : "Activate your flixtor account"
    }</span></div><div style="padding:1rem 0;border-top:1px solid #e5e5e5;border-bottom:1px solid #e5e5e5;color:#141823;font-size:17px;font-family:Arial,Helvetica,sans-serif"><span>Hello ${name}</span><div style="padding:20px 0"><span style="padding:1.5rem 0">${
      func === "forgot"
        ? "You recenttly forgot password on Flixtor. To complete your forgot password please confirm your account"
        : "You recenttly created an account on Flixtor. To complete your registration please confirm your account"
    } .</span></div><a href="${url}" style="width:200px;padding:10px 15px;background-color:#17a2b8;color:#fff;text-decoration:none;font-weight:600">${
      func === "forgot" ? "Forgot your password" : "Confirm your account"
    }</a><br><div style="padding-top:20px"><span style="margin:1.5rem 0;color:#898f9c">Flixtor allows you to stay in touch with all your friends, once refistered on Flixtor, you can share photos,organize events and much more.</span></div></div>`,
  };
  stmp.sendMail(mailOptions, (error, res) => {
    if (error) return error;
    return res;
  });
};
