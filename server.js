const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
  })
);

const user = {
  email: "admin@site.com",
  password: bcrypt.hashSync("123456", 10),
};

function auth(req, res, next) {
  if (req.session.user) return next();
  res.redirect("/login");
}

app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/login", (req, res) => {
  res.render("login", { error: null });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const okEmail = email === user.email;
  const okPass = bcrypt.compareSync(password, user.password);

  if (!okEmail || !okPass) {
    return res.status(401).render("login", { error: "Email ou senha inválidos" });
  }

  req.session.user = { email };
  res.redirect("/dashboard");
});

app.get("/dashboard", auth, (req, res) => {
  res.render("dashboard");
});

app.post("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/login"));
});

app.listen(PORT, () => console.log("Servidor iniciado"));
