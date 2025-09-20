// index.js
// ───────────────────────────────
// بوت جديد معرب ومضبوط
// تم التعديل + التعليقات للشرح
// ───────────────────────────────

import { join, dirname } from 'path'
import { createRequire } from 'module';
import { fileURLToPath } from 'url'
import { setupMaster, fork } from 'cluster'
import { watchFile, unwatchFile } from 'fs'
import cfonts from 'cfonts';
import { createInterface } from 'readline'
import yargs from 'yargs'
import chalk from 'chalk'
import path from 'path'
import os from 'os'
import { promises as fsPromises } from 'fs'

/* تحديد المسار */
const __dirname = dirname(fileURLToPath(import.meta.url))
const require = createRequire(__dirname)

/* قراءة معلومات من package.json */
const { name, author } = require(join(__dirname, './package.json'))
const { say } = cfonts
const rl = createInterface(process.stdin, process.stdout)

/** واجهة تجريبية */
//import express from 'express'
//const app = express()
//const port = process.env.PORT || 8080;

/* واجهة الخط */
say('Vanitas\nBot\nMD', {
  font: 'chrome',
  align: 'center',
  gradient: ['red', 'magenta']
})
say(`Powered By Vanitas`, {
  font: 'console',
  align: 'center',
  gradient: ['red', 'magenta']
})

/* حالة التشغيل */
var isRunning = false

/* معالجة الأخطاء الغير متوقعة */
process.on('uncaughtException', (err) => {
  if (err.code === 'ENOSPC') {
    console.error('⚠️ لا يوجد مساحة كافية أو الحد الأقصى للمراقبة وصل. إعادة التشغيل...')
  } else {
    console.error('⚠️ خطأ غير متوقع:', err)
  }
  process.exit(1)
})

/* وظيفة بدء التشغيل */
async function start(file) {
  if (isRunning) return
  isRunning = true

  const currentFilePath = new URL(import.meta.url).pathname
  let args = [join(__dirname, file), ...process.argv.slice(2)]

  /* عرض أمر التشغيل */
  say([process.argv[0], ...args].join(' '), {
    font: 'console',
    align: 'center',
    gradient: ['red', 'magenta']
  })

  /* تشغيل الملف الرئيسي عبر cluster */
  setupMaster({ exec: args[0], args: args.slice(1) })
  let p = fork()

  /* استقبال رسائل من العملية الفرعية */
  p.on('message', data => {
    switch (data) {
      case 'reset':
        p.process.kill()
        isRunning = false
        start.apply(this, arguments)
        break
      case 'uptime':
        p.send(process.uptime())
        break
    }
  })

  /* عند الخروج */
  p.on('exit', (_, code) => {
    isRunning = false
    console.error('⚠️ ERROR ⚠️ >> ', code)
    start('main.js') // إعادة تشغيل الملف الرئيسي

    if (code === 0) return
    watchFile(args[0], () => {
      unwatchFile(args[0])
      start(file)
    })
  })

  /* معلومات النظام */
  const ramInGB = os.totalmem() / (1024 * 1024 * 1024)
  const freeRamInGB = os.freemem() / (1024 * 1024 * 1024)
  const packageJsonPath = path.join(path.dirname(currentFilePath), './package.json')

  try {
    const packageJsonData = await fsPromises.readFile(packageJsonPath, 'utf-8')
    const packageJsonObj = JSON.parse(packageJsonData)
    const currentTime = new Date().toLocaleString()
    let lineM = '⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ 》'

    console.log(chalk.yellow(`╭${lineM}
┊${chalk.blueBright('╭──────────────')}
┊${chalk.blueBright('┊')} 🖥️ ${os.type()}, ${os.release()} - ${os.arch()}
┊${chalk.blueBright('┊')} 💾 RAM كلية: ${ramInGB.toFixed(2)} GB
┊${chalk.blueBright('┊')} 💽 RAM متاحة: ${freeRamInGB.toFixed(2)} GB
┊${chalk.blueBright('╰──────────────')}
┊${chalk.blueBright('╭──────────────')}
┊${chalk.blueBright('┊')} 🟢 ${chalk.blue.bold('معلومات البوت')}
┊${chalk.blueBright('┊')} 💚 الاسم: ${packageJsonObj.name}
┊${chalk.blueBright('┊')} 🐾 الإصدار: ${packageJsonObj.version}
┊${chalk.blueBright('┊')} 💜 الوصف: ${packageJsonObj.description}
┊${chalk.blueBright('┊')} 😺 المطور: ${packageJsonObj.author?.name || 'Vanitas'}
┊${chalk.blueBright('╰──────────────')}
┊${chalk.blueBright('╭──────────────')}
┊${chalk.blueBright('┊')} ⏰ الوقت الحالي:
┊${chalk.blueBright('┊')} ${currentTime}
┊${chalk.blueBright('╰──────────────')}
╰${lineM}`));

    setInterval(() => { }, 1000)

  } catch (err) {
    console.error(chalk.red(`❌ لم أستطع قراءة package.json: ${err}`))
  }

  /* أوامر يدوية من الكونسول */
  let opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())
  if (!opts['test'])
    if (!rl.listenerCount()) rl.on('line', line => {
      p.emit('message', line.trim())
    })
}

/* بدء تشغيل main.js */
start('main.js')