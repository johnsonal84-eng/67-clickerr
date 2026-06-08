const express = require("express");
const session = require("express-session");

const app = express();

app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "67clicker-secret",
    resave: false,
    saveUninitialized: true,
  })
);

const users = {};
const verificationRequests = [];

const ADMIN_USER = "caleb";
const ADMIN_PASS = "calebtheadmin123";

app.get("/", (req, res) => {
  res.send(`
    <h1>67 Clicker</h1>

    <a href="/signup">Sign Up</a><br>
    <a href="/login">Login</a><br>
    <a href="/admin">Admin Panel</a>
  `);
});

app.get("/signup", (req, res) => {
  res.send(`
    <h2>Sign Up</h2>

    <form method="POST">
      <input name="username" placeholder="Username"><br><br>
      <input name="password" type="password" placeholder="Password"><br><br>
      <input name="email" placeholder="Email"><br><br>

      <button>Create Account</button>
    </form>
  `);
});

app.post("/signup", (req, res) => {
  const code = Math.floor(
    100000 + Math.random() * 900000
  ).toString();

  users[req.body.username] = {
    password: req.body.password,
    email: req.body.email,
    verified: false,
    code,
    clicks: 0,
  };

  verificationRequests.push({
    username: req.body.username,
    email: req.body.email,
    code,
  });

  res.send(`
    <h2>Verification Request Created</h2>

    <p>An admin must send your code manually.</p>

    <a href="/verify/${req.body.username}">
      Verify Account
    </a>
  `);
});

app.get("/verify/:user", (req, res) => {
  res.send(`
    <h2>Verify Account</h2>

    <form method="POST">
      <input name="code" placeholder="Code">
      <button>Verify</button>
    </form>
  `);
});

app.post("/verify/:user", (req, res) => {
  const user = users[req.params.user];

  if (!user) {
    return res.send("User not found");
  }

  if (req.body.code === user.code) {
    user.verified = true;
    return res.send(`
      Verified!
      <br><a href="/login">Login</a>
    `);
  }

  res.send("Invalid code");
});

app.get("/login", (req, res) => {
  res.send(`
    <h2>Login</h2>

    <form method="POST">
      <input name="username"><br><br>
      <input name="password" type="password"><br><br>

      <button>Login</button>
    </form>
  `);
});

app.post("/login", (req, res) => {
  const user = users[req.body.username];

  if (
    user &&
    user.password === req.body.password &&
    user.verified
  ) {
    req.session.user = req.body.username;
    return res.redirect("/game");
  }

  res.send("Login failed or account not verified");
});

app.get("/game", (req, res) => {
  const username = req.session.user;

  if (!username) {
    return res.redirect("/login");
  }

  const user = users[username];

  res.send(`
    <h1>67 Clicker</h1>

    <h2>${username}</h2>

    <p>Clicks: ${user.clicks}</p>

    <form method="POST" action="/click">
      <button>CLICK!</button>
    </form>

    <br>
    <a href="/logout">Logout</a>
  `);
});

app.post("/click", (req, res) => {
  const username = req.session.user;

  if (!username) {
    return res.redirect("/login");
  }

  users[username].clicks++;

  res.redirect("/game");
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

app.get("/admin", (req, res) => {
  let html = `
    <h1>Admin Login</h1>

    <form method="POST" action="/admin/login">
      <input name="username"><br><br>
      <input name="password" type="password"><br><br>

      <button>Login</button>
    </form>
  `;

  res.send(html);
});

app.post("/admin/login", (req, res) => {
  if (
    req.body.username === ADMIN_USER &&
    req.body.password === ADMIN_PASS
  ) {
    req.session.admin = true;

    let requestsHtml = verificationRequests
      .map(
        (r) => `
          <hr>
          <b>User:</b> ${r.username}<br>
          <b>Email:</b> ${r.email}<br>
          <b>Code:</b> ${r.code}<br>

          <pre>
Subject: 67 Clicker Verification Code

Hello,

Your verification code is:

${r.code}

Thanks,
67 Clicker Team
          </pre>
        `
      )
      .join("");

    return res.send(`
      <h1>Admin Panel</h1>

      ${requestsHtml || "No requests"}
    `);
  }

  res.send("Invalid admin login");
});

app.listen(3000, () => {
  console.log("Running on http://localhost:3000");
});
