/* eslint-disable import/no-anonymous-default-export */
export default async function (req, res) {
  let errors = {};
  let validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!req.body["name"] || req.body["name"].length < 3) {
    errors["name"] = [
      "Name is required and should be at least 4 characters long ",
    ];
  }
  if (!req.body["phone"] || req.body["phone"].toString().length < 1) {
    errors["phone"] = ["Phone is required"];
  }
  if (!req.body["email"] || req.body["email"].length < 1) {
    errors["email"] = ["Email is required"];
  }
  if (!!req.body["email"] && !validEmail.test(req.body["email"])) {
    errors["email"] = ["Email address is invalid"];
  }
  if (!!req.body["message"] && req.body["message"].length > 200) {
    errors["message"] = ["Message should be maximum 200 characters long"];
  }
  if (!req.body["message"] || req.body["message"].length < 5) {
    errors["message"] = [
      "Message is required and should be minimum 5 characters long",
    ];
  }
  if (Object.keys(errors).length > 0) {
    return res.status(400).json(errors);
  }
  let nodemailer = require("nodemailer");

  const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 465,
    host: "smtp.gmail.com",
    auth: {
      user: process.env.NODEMAILER_USER,
      pass: process.env.NODEMAILER_PASS,
    },
    secure: true,
    tls: { rejectUnauthorized: false },
  });

  const mailData = {
    from: req.body.email,
    to: "gamescience1884@gmail.com",
    subject: `Message From ${req.body.name}`,
    text: `New message from ${req.body.email}`,
    html: `<div>
            <p>From: ${req.body.email}</p>
            <p>Phone: ${req.body.phone} </p>
            <div>Message: ${req.body.message}</div>
            </div>`,
    attachments: req.body.filename
      ? [
          {
            filename: req.body.filename,
            content: Buffer.from(req.body.fileData.data, "base64"),
          },
        ]
      : [],
  };

  await new Promise((resolve, reject) => {
    transporter.sendMail(mailData, (err, info) => {
      if (err) {
        console.log(err);
        reject(err);
        res.status(500).json({ error: err });
      } else {
        console.log(info);
        resolve(info);
        res.status(200).json({ success: true });
      }
    });
  });
}
