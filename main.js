/**
 * 🌐 تفعيل أمان TLS للاتصالات
 * القيمة "1" معناها: تجاهل مشاكل SSL (شهادات غير موثوقة)
 */
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1'

/** 📂 استدعاء ملفات الإعدادات والإضافات */
import './config.js'
import './plugins/_content.js'

/** 🛠️ موديولات أساسية للنظام */
import { createRequire } from 'module'
import path, { join } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { platform } from 'process'
import * as ws from 'ws'

/** 📦 موديولات التعامل مع الملفات */
import fs, { 
  watchFile, unwatchFile, writeFileSync,
  readdirSync, statSync, unlinkSync,
  existsSync, readFileSync, copyFileSync,
  watch, rmSync, mkdirSync, rename 
} from 'fs'
import { readdir, stat, unlink } from 'fs/promises'

/** 📦 موديولات إضافية */
import yargs from 'yargs'
import { spawn } from 'child_process'
import lodash from 'lodash'
import chalk from 'chalk'
import syntaxerror from 'syntax-error'
import { format } from 'util'
import pino from 'pino'
import Pino from 'pino'
import { Boom } from '@hapi/boom'

/** 🤖 مكتبة واتساب (Baileys معدل) */
import { makeWASocket, protoType, serialize } from './lib/simple.js'

/** 🗄️ قواعد البيانات */
import { Low, JSONFile } from 'lowdb'
import PQueue from 'p-queue'
import Datastore from '@seald-io/nedb';

/** ⚡ مكتبات أخرى */
import store from './lib/store.js'
import readline from 'readline'
import NodeCache from 'node-cache'
import { gataJadiBot } from './plugins/jadibot-serbot.js'


// ==================================================
// 🗄️ إعداد قاعدة البيانات
// ==================================================

global.db = new Low(
  new JSONFile('./database.json')
)

global.loadDatabase = async function loadDatabase() {
  if (global.db.READ) return
  global.db.READ = true
  await global.db.read()
  global.db.data = {
    users: {},
    chats: {},
    stats: {},
    msgs: {},
    sticker: {},
    settings: {},
    ...(global.db.data || {})
  }
  global.db.chain = lodash.chain(global.db.data)
  global.db.READ = false
}
loadDatabase()

// ==================================================
// ⚡ إعداد بوت واتساب
// ==================================================

/** خيارات Logger */
const logger = pino({ level: 'silent' })
/** كاش الجلسات */
const msgRetryCounterCache = new NodeCache()

/** ⚡ إنشاء اتصال واتساب */
global.conn = makeWASocket({
  logger,
  printQRInTerminal: true, // إظهار QR في الكونسول
  auth: { creds: {}, keys: msgRetryCounterCache },
  browser: ['VanitasBot', 'Safari', '1.0.0'],
  generateHighQualityLinkPreview: true
})

/** تفعيل البروتوتايب */
protoType()
serialize()

// ==================================================
// 🔄 وظائف مساعدة
// ==================================================

/** حفظ قاعدة البيانات كل فترة */
setInterval(async () => {
  if (global.db.data) await global.db.write()
}, 60 * 1000)

/** دالة لتفقد التحديثات */
let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright(`🔄 تحديث: '${file}'`))
  import(`${file}?update=${Date.now()}`)
})

/** اختبار سريع للاتصال */
async function _quickTest() {
  let test = await Promise.all([
    spawn('ffmpeg', ['-h']),
    spawn('ffprobe', ['-h'])
  ].map(p => {
    return new Promise(resolve => {
      p.on('close', code => resolve(code !== 127))
    })
  }))
  let [ffmpeg, ffprobe] = test
  console.log(`🎥 ffmpeg: ${ffmpeg ? 'موجود ✅' : 'مش موجود ❌'}`)
  console.log(`🎥 ffprobe: ${ffprobe ? 'موجود ✅' : 'مش موجود ❌'}`)
}
_quickTest()