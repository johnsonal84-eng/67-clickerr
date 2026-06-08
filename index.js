const express = require("express");
const session = require("express-session");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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

const SHOP_ITEMS = [
  { id: "auto1", name: "Auto Clicker", description: "Clicks once per second automatically", price: 50, type: "auto", rate: 1 },
  { id: "auto2", name: "Turbo Clicker", description: "Clicks 5 times per second", price: 250, type: "auto", rate: 5 },
  { id: "multi2", name: "Double Clicks", description: "Each click counts as 2", price: 100, type: "multiplier", value: 2 },
  { id: "multi5", name: "5x Clicks", description: "Each click counts as 5", price: 500, type: "multiplier", value: 5 },
  { id: "multi10", name: "10x Clicks", description: "Each click counts as 10", price: 2000, type: "multiplier", value: 10 },
];

const styles = `
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323:wght@400&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #0a0a0f;
      color: #e0e0ff;
      font-family: 'VT323', monospace;
      font-size: 20px;
      min-height: 100vh;
      background-image:
        radial-gradient(ellipse at 20% 50%, rgba(100,50,200,0.1) 0%, transparent 60%),
        radial-gradient(ellipse at 80% 20%, rgba(50,100,200,0.1) 0%, transparent 60%);
    }
    .container {
      max-width: 700px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    h1 {
      font-family: 'Press Start 2P', monospace;
      font-size: 22px;
      color: #a78bfa;
      text-shadow: 0 0 20px #7c3aed, 0 0 40px #7c3aed;
      margin-bottom: 30px;
      letter-spacing: 2px;
    }
    h2 {
      font-family: 'Press Start 2P', monospace;
      font-size: 14px;
      color: #c4b5fd;
      margin-bottom: 24px;
    }
    a {
      color: #818cf8;
      text-decoration: none;
      border-bottom: 1px solid #4f46e5;
      padding-bottom: 1px;
      transition: color 0.2s;
    }
    a:hover { color: #a78bfa; }
    nav { margin-bottom: 30px; display: flex; gap: 20px; flex-wrap: wrap; }
    input {
      background: #1a1a2e;
      border: 1px solid #4f46e5;
      color: #e0e0ff;
      font-family: 'VT323', monospace;
      font-size: 20px;
      padding: 10px 14px;
      width: 100%;
      margin-bottom: 14px;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    input:focus {
      border-color: #7c3aed;
      box-shadow: 0 0 10px rgba(124,58,237,0.3);
    }
    button, .btn {
      background: linear-gradient(135deg, #4f46e5, #7c3aed);
      color: #fff;
      font-family: 'Press Start 2P', monospace;
      font-size: 11px;
      border: none;
      padding: 12px 24px;
      cursor: pointer;
      transition: transform 0.1s, box-shadow 0.2s;
      box-shadow: 0 4px 15px rgba(124,58,237,0.4);
      letter-spacing: 1px;
    }
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(124,58,237,0.6);
    }
    button:active { transform: translateY(0); }
    .card {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(124,58,237,0.3);
      padding: 24px;
      margin-bottom: 20px;
    }
    .clicks-display {
      font-family: 'Press Start 2P', monospace;
      font-size: 32px;
      color: #a78bfa;
      text-shadow: 0 0 20px #7c3aed;
      margin: 20px 0;
    }
    .click-btn {
      font-size: 16px;
      padding: 20px 40px;
      background: linear-gradient(135deg, #7c3aed, #4f46e5);
      box-shadow: 0 0 30px rgba(124,58,237,0.5);
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { box-shadow: 0 0 30px rgba(124,58,237,0.5); }
      50% { box-shadow: 0 0 50px rgba(124,58,237,0.8); }
    }
    .shop-item {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(124,58,237,0.2);
      padding: 16px 20px;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }
    .shop-item:hover { border-color: rgba(124,58,237,0.5); }
    .shop-item-info { flex: 1; }
    .shop-item-name { color: #c4b5fd; font-size: 22px; }
    .shop-item-desc { color: #6b7280; font-size: 16px; }
    .shop-item-price { color: #fbbf24; font-size: 20px; white-space: nowrap; }
    .owned-badge {
      background: rgba(16,185,129,0.2);
      border: 1px solid #10b981;
      color: #10b981;
      font-size: 14px;
      padding: 4px 10px;
    }
    .stat-row { display: flex; gap: 30px; margin-bottom: 16px; flex-wrap: wrap; }
    .stat { color: #6b7280; font-size: 18px; }
    .stat span { color: #a78bfa; }
    .msg { padding: 14px; margin-bottom: 16px; border-left: 3px solid #7c3aed; background: rgba(124,58,237,0.1); font-size: 18px; }
    .msg.error { border-color: #ef4444; background: rgba(239,68,68,0.1); }
    .msg.success { border-color: #10b981; background: rgba(16,185,129,0.1); }
    hr { border: none; border-top: 1px solid rgba(124,58,237,0.2); margin: 20px 0; }
    .admin-req { background: rgba(255,255,255,0.02); border: 1px solid rgba(124,58,237,0.2); padding: 20px; margin-bottom: 16px; }
    pre { background: rgba(0,0,0,0.3); padding: 14px; font-family: 'VT323', monospace; font-size: 16px; white-space: pre-wrap; margin-top: 10px; color: #86efac; }
    .ping-dot {
      display: inline-block;
      width: 10px; height: 10px;
      background: #ef4444;
      border-radius: 50%;
      animation: ping 1s infinite;
      margin-right: 8px;
    }
    @keyframes ping {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(1.4); }
    }
  </style>
`;

app.get("/", (req, res) => {
  res.send(`<!DOCTYPE html><html><head><title>67 Clicker</title>${styles}</head><body>
    <div class="container">
      <h1>67 CLICKER</h1>
      <nav>
        <a href="/signup">Sign Up</a>
        <a href="/login">Login</a>
        <a href="/admin">Admin</a>
      </nav>
      <p style="color:#6b7280;">The most important clicking game ever made.</p>
    </div>
  </body></html>`);
});

app.get("/signup", (req, res) => {
  res.send(`<!DOCTYPE html><html><head><title>Sign Up</title>${styles}</head><body>
    <div class="container">
      <h1>67 CLICKER</h1>
      <h2>CREATE ACCOUNT</h2>
      <form method="POST">
        <input name="username" placeholder="Username">
        <input name="password" type="password" placeholder="Password">
        <input name="email" placeholder="Email">
        <button type="submit">CREATE ACCOUNT</button>
      </form>
      <br><a href="/login">Already have an account?</a>
    </div>
  </body></html>`);
});

app.post("/signup", (req, res) => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  users[req.body.username] = {
    password: req.body.password,
    email: req.body.email,
    verified: false,
    code,
    clicks: 0,
    multiplier: 1,
    autoRate: 0,
    inventory: [],
  };
  verificationRequests.push({ username: req.body.username, email: req.body.email, code, time: Date.now() });
  res.send(`<!DOCTYPE html><html><head><title>Verify</title>${styles}</head><body>
    <div class="container">
      <h1>67 CLICKER</h1>
      <div class="msg">An admin will send your verification code to your email.</div>
      <a href="/verify/${req.body.username}">→ Enter verification code</a>
    </div>
  </body></html>`);
});

app.get("/verify/:user", (req, res) => {
  res.send(`<!DOCTYPE html><html><head><title>Verify</title>${styles}</head><body>
    <div class="container">
      <h1>67 CLICKER</h1>
      <h2>VERIFY ACCOUNT</h2>
      <form method="POST">
        <input name="code" placeholder="Enter 6-digit code">
        <button type="submit">VERIFY</button>
      </form>
    </div>
  </body></html>`);
});

app.post("/verify/:user", (req, res) => {
  const user = users[req.params.user];
  if (!user) return res.send("User not found");
  if (req.body.code === user.code) {
    user.verified = true;
    return res.send(`<!DOCTYPE html><html><head><title>Verified</title>${styles}</head><body>
      <div class="container">
        <h1>67 CLICKER</h1>
        <div class="msg success">Account verified! You're good to go.</div>
        <a href="/login">→ Login</a>
      </div>
    </body></html>`);
  }
  res.send(`<!DOCTYPE html><html><head><title>Verify</title>${styles}</head><body>
    <div class="container">
      <h1>67 CLICKER</h1>
      <div class="msg error">Invalid code. Try again.</div>
      <form method="POST">
        <input name="code" placeholder="Enter 6-digit code">
        <button type="submit">VERIFY</button>
      </form>
    </div>
  </body></html>`);
});

app.get("/login", (req, res) => {
  res.send(`<!DOCTYPE html><html><head><title>Login</title>${styles}</head><body>
    <div class="container">
      <h1>67 CLICKER</h1>
      <h2>LOGIN</h2>
      <form method="POST">
        <input name="username" placeholder="Username">
        <input name="password" type="password" placeholder="Password">
        <button type="submit">LOGIN</button>
      </form>
      <br><a href="/signup">Need an account?</a>
    </div>
  </body></html>`);
});

app.post("/login", (req, res) => {
  const user = users[req.body.username];
  if (user && user.password === req.body.password && user.verified) {
    req.session.user = req.body.username;
    return res.redirect("/game");
  }
  res.send(`<!DOCTYPE html><html><head><title>Login</title>${styles}</head><body>
    <div class="container">
      <h1>67 CLICKER</h1>
      <div class="msg error">Login failed or account not verified.</div>
      <form method="POST">
        <input name="username" placeholder="Username">
        <input name="password" type="password" placeholder="Password">
        <button type="submit">LOGIN</button>
      </form>
    </div>
  </body></html>`);
});

app.get("/game", (req, res) => {
  const username = req.session.user;
  if (!username) return res.redirect("/login");
  const user = users[username];

  // apply auto clicker ticks
  if (user.lastTick) {
    const secs = (Date.now() - user.lastTick) / 1000;
    user.clicks += Math.floor(secs * (user.autoRate || 0));
  }
  user.lastTick = Date.now();

  res.send(`<!DOCTYPE html><html><head><title>67 Clicker</title>${styles}</head><body>
    <div class="container">
      <h1>67 CLICKER</h1>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <span style="color:#c4b5fd;font-family:'Press Start 2P',monospace;font-size:12px;">${username}</span>
        <span>
          <a href="/shop">SHOP</a> &nbsp;
          <a href="/logout">LOGOUT</a>
        </span>
      </div>
      <div class="stat-row">
        <div class="stat">clicks: <span>${user.clicks}</span></div>
        <div class="stat">multiplier: <span>${user.multiplier || 1}x</span></div>
        <div class="stat">auto/sec: <span>${user.autoRate || 0}</span></div>
      </div>
      <form method="POST" action="/click">
        <button class="click-btn" type="submit">CLICK!</button>
      </form>
    </div>
    <script>
      // auto-refresh every 5s to show auto clicker progress
      if (${user.autoRate || 0} > 0) {
        setTimeout(() => location.reload(), 5000);
      }
    </script>
  </body></html>`);
});

app.post("/click", (req, res) => {
  const username = req.session.user;
  if (!username) return res.redirect("/login");
  const user = users[username];

  // apply auto clicker ticks first
  if (user.lastTick) {
    const secs = (Date.now() - user.lastTick) / 1000;
    user.clicks += Math.floor(secs * (user.autoRate || 0));
  }
  user.lastTick = Date.now();

  user.clicks += (user.multiplier || 1);
  res.redirect("/game");
});

app.get("/shop", (req, res) => {
  const username = req.session.user;
  if (!username) return res.redirect("/login");
  const user = users[username];

  const itemsHtml = SHOP_ITEMS.map(item => {
    const owned = (user.inventory || []).includes(item.id);
    const canAfford = user.clicks >= item.price;
    return `
      <div class="shop-item">
        <div class="shop-item-info">
          <div class="shop-item-name">${item.name}</div>
          <div class="shop-item-desc">${item.description}</div>
        </div>
        <div style="display:flex;align-items:center;gap:12px;">
          <div class="shop-item-price">${item.price} clicks</div>
          ${owned
            ? `<span class="owned-badge">OWNED</span>`
            : `<form method="POST" action="/shop/buy">
                <input type="hidden" name="itemId" value="${item.id}">
                <button type="submit" ${canAfford ? '' : 'style="opacity:0.4;cursor:not-allowed;"'} ${canAfford ? '' : 'disabled'}>BUY</button>
              </form>`
          }
        </div>
      </div>
    `;
  }).join('');

  res.send(`<!DOCTYPE html><html><head><title>Shop</title>${styles}</head><body>
    <div class="container">
      <h1>67 CLICKER</h1>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
        <h2>SHOP</h2>
        <span style="color:#fbbf24;font-family:'Press Start 2P',monospace;font-size:12px;">${user.clicks} clicks</span>
      </div>
      ${itemsHtml}
      <br><a href="/game">← Back to game</a>
    </div>
  </body></html>`);
});

app.post("/shop/buy", (req, res) => {
  const username = req.session.user;
  if (!username) return res.redirect("/login");
  const user = users[username];
  const item = SHOP_ITEMS.find(i => i.id === req.body.itemId);
  if (!item) return res.redirect("/shop");
  if ((user.inventory || []).includes(item.id)) return res.redirect("/shop");
  if (user.clicks < item.price) return res.redirect("/shop");

  user.clicks -= item.price;
  user.inventory = user.inventory || [];
  user.inventory.push(item.id);

  if (item.type === "auto") {
    user.autoRate = (user.autoRate || 0) + item.rate;
    user.lastTick = Date.now();
  } else if (item.type === "multiplier") {
    user.multiplier = Math.max(user.multiplier || 1, item.value);
  }

  res.redirect("/shop");
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});

// Admin SSE endpoint for live ping
app.get("/admin/events", (req, res) => {
  if (!req.session.admin) return res.status(403).end();
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const send = () => {
    res.write(`data: ${verificationRequests.length}\n\n`);
  };
  send();
  const interval = setInterval(send, 3000);
  req.on("close", () => clearInterval(interval));
});

app.get("/admin", (req, res) => {
  res.send(`<!DOCTYPE html><html><head><title>Admin</title>${styles}</head><body>
    <div class="container">
      <h1>67 CLICKER</h1>
      <h2>ADMIN LOGIN</h2>
      <form method="POST" action="/admin/login">
        <input name="username" placeholder="Username">
        <input name="password" type="password" placeholder="Password">
        <button type="submit">LOGIN</button>
      </form>
    </div>
  </body></html>`);
});

app.post("/admin/login", (req, res) => {
  if (req.body.username === ADMIN_USER && req.body.password === ADMIN_PASS) {
    req.session.admin = true;
    return res.redirect("/admin/panel");
  }
  res.send(`<!DOCTYPE html><html><head><title>Admin</title>${styles}</head><body>
    <div class="container">
      <h1>67 CLICKER</h1>
      <div class="msg error">Invalid credentials.</div>
      <a href="/admin">← Try again</a>
    </div>
  </body></html>`);
});

app.get("/admin/panel", (req, res) => {
  if (!req.session.admin) return res.redirect("/admin");

  const requestsHtml = verificationRequests.length === 0
    ? `<div class="msg">No pending verification requests.</div>`
    : verificationRequests.map((r, i) => `
        <div class="admin-req">
          <div><span class="ping-dot"></span><b>User:</b> ${r.username}</div>
          <div><b>Email:</b> ${r.email}</div>
          <div><b>Code:</b> <span style="color:#fbbf24;font-family:'Press Start 2P',monospace;">${r.code}</span></div>
          <pre>Subject: 67 Clicker Verification Code

Hello,

Your verification code is: ${r.code}

Thanks,
67 Clicker Team</pre>
        </div>
      `).join('');

  res.send(`<!DOCTYPE html><html><head><title>Admin Panel</title>${styles}</head><body>
    <div class="container">
      <h1>67 CLICKER</h1>
      <h2>ADMIN PANEL</h2>
      <div style="color:#6b7280;margin-bottom:20px;">
        Pending requests: <span style="color:#fbbf24;" id="reqCount">${verificationRequests.length}</span>
      </div>
      ${requestsHtml}
    </div>
    <script>
      // Ding sound using Web Audio API
      function ding() {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.frequency.setValueAtTime(880, ctx.currentTime);
        o.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.3);
        g.gain.setValueAtTime(0.4, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        o.start(ctx.currentTime);
        o.stop(ctx.currentTime + 0.6);
      }

      let lastCount = ${verificationRequests.length};

      const es = new EventSource("/admin/events");
      es.onmessage = (e) => {
        const count = parseInt(e.data);
        document.getElementById("reqCount").textContent = count;
        if (count > lastCount) {
          ding();
          // reload to show new request
          setTimeout(() => location.reload(), 800);
        }
        lastCount = count;
      };
    </script>
  </body></html>`);
});

app.listen(3000, () => {
  console.log("Running on http://localhost:3000");
});
