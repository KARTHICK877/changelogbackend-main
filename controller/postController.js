// controllers/postController.js
const path = require("path");
const fs = require("fs"); // Require the fs module
const Post = require("../models/Post");
const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const { upload } = require("../util");
require("dotenv").config();
const { Op } = require("sequelize");
const EmailList = require("../models/EmailList");
const moment = require("moment");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const serverBaseUrl = "https://changelogbackend-production.up.railway.app/";

const handlebarOptions = {
  viewEngine: {
    extName: ".hbs",
    partialsDir: path.resolve("./views"),
    defaultLayout: false,
  },
  viewPath: path.resolve("./views"),
  extName: ".hbs",
};

transporter.use("compile", hbs(handlebarOptions));


const addPost = async (req, res) => {
  try {
    upload.single("image")(req, res, async (err) => {
      // Assuming 'media' is the field name for the file
      if (err) {
        console.error("Error uploading media:", err);
        return res.status(400).json({ message: "Error uploading media" });
      }

      const { title, email, type } = req.body;
      const description = req.body.description; // HTML content from React Quill

      const mediaPath = req.file ? req.file.path : "";
     
      // Check if email is valid
      if (!email) {
        return res.status(400).json({ message: "Email address is required" });
      }

      // Check if mediaPath exists
      // if (!mediaPath) {
      //   return res.status(400).json({ message: "Media path is missing" });
      // }
      const today = new Date();
      const createdate = today.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      });

      const mailOptions = {
        from: "devpodmain@gmail.com",
        to: email,
        subject: "Welcome Orion ChangeLog",
        html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta http-equiv="x-ua-compatible" content="ie=edge">
            <title>${title}</title>
            <link href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
          </head>
          <body>
            <div style="margin: 0 auto;">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div style="width: 20%;">
                  <p style="font-size: 14px; color: #333; margin-bottom: 10px;">${new Date().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: '2-digit' 
                  })}</p>
                </div>
                <div style="width: 80%; text-align: left;">
                  <h1 style="font-size: 24px; color: #333; margin-bottom: 10px;">${title}</h1>
                  <span style="font-size: 12px; padding: 5px 10px; background-color: #007bff; color: #fff; border-radius: 4px;">${type}</span>
                  <p style="font-size: 16px; color: #333; margin-bottom: 20px;">${description}</p>
                  <div style="margin-top: 20px;">
                    <img src="cid:image" alt="Image" style="display: block; max-width: 100%; height: auto;">
                  </div>
                </div>
              </div>
            </div>
          </body>
        </html>
        `,
        attachments: mediaPath ? [
          {
            filename: "image.jpg",
            content: fs.readFileSync(mediaPath ),
            cid: "image",
          },
        ]
        :[],
      };

      await transporter.sendMail(mailOptions);

      // Create post
      const post = await Post.create({
        title,
        description,
        email,
        image: mediaPath,
        tag: type,
      });

      res.status(201).json(post);
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.findAll();
    console.log("posts");
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const searchPosts = async (req, res) => {
  console.log("searchTerm");
  try {
    const { searchTerm } = req.query;
    const posts = await Post.findAll({
      where: {
        [Op.or]: [
          { title: { [Op.like]: `%${searchTerm.toLowerCase()}%` } },
          { description: { [Op.like]: `%${searchTerm.toLowerCase()}%` } },
        ],
      },
      collate: {
        collation: "utf8_general_ci", // Case-insensitive collation
      },
    });
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findByPk(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const deletePostById = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findByPk(id);
    const imagePath = post.image;
    const deletedPost = await Post.destroy({ where: { id } });

    if (imagePath) {
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error("Error deleting image:", err);
        } else {
          console.log("Image deleted successfully");
        }
      });
    }

    if (!deletedPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const sendMail = async (
  title,
  description,
  email,
  mediaPath,
  type,
  createdate
) => {
  console.log("mediaPath *******************", mediaPath);
  try {
    const mailOptions = {
      from: "devpodmain@gmail.com",
      to: email,
      subject: "Welcome Orion ChangeLog",
      template: "emailTemplate",
      context: {
        title: title,
        description: description,
        type: type,
        createdate: createdate,
      },
      attachments: [
        {
          filename: mediaPath ? path.basename(mediaPath) : null,
          path: mediaPath,
          imageUrl: serverBaseUrl,
        },
      ],
    };

    console.log("mailOptions", mailOptions);
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending:", error);
    throw new Error("Failed to send email");
  }
};

function getUniquePosts(posts) {
  const uniquePostsMap = new Map();
  posts.forEach((post) => {
    uniquePostsMap.set(post.id, post);
  });
  return Array.from(uniquePostsMap.values());
}
const shareLogByMail = async (req, res) => {
  const { emails, post } = req.body;
  let html = "";
  try {
    for (const email of emails) {
      // Reset the HTML content for each email
      const postsForRecipient = post.filter(
        (postlog) => postlog.email === email.label
      );
      const uniquePostsForRecipient = getUniquePosts(postsForRecipient);

      for (const postlog of uniquePostsForRecipient) {
        const { title, description, image, tag, createdAt } = postlog;

        html += `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta http-equiv="x-ua-compatible" content="ie=edge">
            <title>${title}</title>
            <link href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
          </head>
          <body>
            <div style="margin: 0 auto;">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div style="width: 20%;">
                  <p style="font-size: 14px; color: #333; margin-bottom: 10px;">${moment(
                    createdAt
                  ).format("MMMM DD, YYYY")}</p>
                </div>
                <div style="width: 80%; text-align: left;">
                  <h1 style="font-size: 24px; color: #333; margin-bottom: 10px;">${title}</h1>
                  <span style="font-size: 12px; padding: 5px 10px; background-color: #007bff; color: #fff; border-radius: 4px;">${tag}</span>
                  <p style="font-size: 16px; color: #333; margin-bottom: 20px;">${description}</p>
                  <div style="margin-top: 20px;">
                    <img src="cid:image_${
                      postlog.id
                    }" alt="Image" style="display: block; max-width: 100%; height: auto;">
                  </div>
                </div>
              </div>
            </div>
          </body>
          </html>
        `;
      }

      const attachments = post.map((postlog) => ({
        filename: "image.jpg",
        content: fs.readFileSync(postlog.image),
        cid: `image_${postlog.id}`,
      }));

      const mailOptions = {
        from: "devpodmain@gmail.com",
        to: email?.label,
        subject: "Welcome Orion ChangeLog",
        html,
        attachments,
      };
      html = "";
      // Send the email
      await transporter.sendMail(mailOptions);
    }

    res.json({ message: "Mails sent" });
  } catch (error) {
    console.error("Error sending:", error);
    res.status(500).json({ error: "Failed to send emails" });
  }
};

const editPost = async (req, res) => {
  try {
    const { id } = req.params;
    upload.single("image")(req, res, async (err) => {
      // Assuming 'media' is the field name for the file
      if (err) {
        console.error("Error uploading media:", err);
        return res.status(400).json({ message: "Error uploading media" });
      }

      const { title, description, email, type } = req.body;
      const mediaPath = req.file ? req.file.path : null;
      console.log("newImageFile", mediaPath);

      let post = await Post.findByPk(id);

      post.title = title;
      post.description = description;
      post.email = email;
      post.tag = type;
      if (mediaPath) {
        post.image = mediaPath;
      } // Only update image if new image is provided

      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      await post.save();

      res.status(200).json(post);
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};


const addmaillist = async (req, res) => {
  const { emaillist } = req.body;

  try {
    const saveEmail = await EmailList.bulkCreate(emaillist);
    if (saveEmail) {
      return res.json({ message: "Email saved" });
    }
  } catch (err) {
    console.log(err);
  }
};

const getAllEmail = async (req, res) => {
  try {
    const allEmail = await EmailList.findAll();
    if (allEmail) {
      return res.json(allEmail);
    }
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  shareLogByMail,
  addmaillist,
  getAllEmail,
  addPost,
  getAllPosts,
  searchPosts,
  getPostById,
  deletePostById,
  sendMail,
  editPost,
};
