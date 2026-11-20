const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { Resend } = require("resend");

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

app.use(cors());

const resend = new Resend(process.env.RESEND_API_KEY);

app.post(
  "/submit",
  upload.fields([
    { name: "firstPhoto", maxCount: 1 },
    { name: "secondPhoto", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const { name, phone } = req.body;
      const first = req.files?.firstPhoto?.[0];
      const second = req.files?.secondPhoto?.[0];

      if (!name || !phone || !first || !second) {
        return res.status(400).json({
          success: false,
          message: "All fields and both photos are required."
        });
      }

      await resend.emails.send({
        from: "Website <onboarding@resend.dev>",
        to: ["dadm23906@gmail.com"],
        subject: "New Website Form Submission",
        text: `Name: ${name}\nPhone: ${phone}`,
        attachments: [
          {
            filename: first.originalname,
            content: first.buffer.toString("base64")
          },
          {
            filename: second.originalname,
            content: second.buffer.toString("base64")
          }
        ]
      });

      res.json({ success: true, message: "Submitted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Email sending failed"
      });
    }
  }
);

app.listen(process.env.PORT || 3000);
