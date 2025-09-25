// ─── 🚀🔥 index.js ───

// استدعاء المكتبات
import express from "express";
import chalk from "chalk";
import figlet from "figlet";

const app = express();
const PORT = process.env.PORT || 3000;

// ميدل وير يطبع كل ريكويست
app.use((req, res, next) => {
  console.log(chalk.cyan(`[⚡] ${req.method} - ${req.url}`));
  next();
});

// الراوت الرئيسي
app.get("/", (req, res) => {
  res.send(`
    <div style="font-family: sans-serif; text-align: center; margin-top: 50px;">
      <h1>🚀✨ أهلاً بك في مشروعي الخرافي ✨🚀</h1>
      <p style="font-size: 18px; color: #555;">كل شيء يعمل بكفاءة 🔥</p>
    </div>
  `);
});

// تشغيل السيرفر
app.listen(PORT, () => {
  console.clear();
  console.log(
    chalk.magenta(
      figlet.textSync("Vanitas", { horizontalLayout: "full" })
    )
  );
  console.log(chalk.greenBright(`🚀 السيرفر شغال على http://localhost:${PORT}`));
});