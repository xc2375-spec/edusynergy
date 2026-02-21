// EduSynergy (心能教育) — bilingual mode toggle + blessing generator
const $ = (s) => document.querySelector(s);

function setMode(mode){
  document.body.setAttribute("data-mode", mode);
  localStorage.setItem("edusynergy_mode", mode);

  // Update chip label
  const btn = $("#modeToggle");
  if (btn){
    if (mode === "bi"){
      btn.innerHTML = '<span class="zh">中英</span><span class="en">BI</span>';
    } else if (mode === "zh"){
      btn.innerHTML = '<span class="zh">中文</span><span class="en">ZH</span>';
    } else {
      btn.innerHTML = '<span class="zh">英文</span><span class="en">EN</span>';
    }
  }
}

function toggleMode(){
  const current = document.body.getAttribute("data-mode") || "bi";
  const next = current === "bi" ? "zh" : (current === "zh" ? "en" : "bi");
  setMode(next);
}

async function copyText(text){
  try{
    await navigator.clipboard.writeText(text);
    const btn = $("#copyBlessing");
    if (btn){
      btn.textContent = "✓";
      setTimeout(()=> btn.textContent = (document.body.getAttribute("data-mode")==="en" ? "Copy" : "复制"), 700);
    }
  }catch(e){
    alert("复制失败：请长按手动复制 / Copy failed—please copy manually.");
  }
}

// Blessing generator (outputs match current mode; bilingual shows both lines)
const pool = {
  elder: {
    zh: {
      steady: [
        "新年好！感谢您一直的关心照顾，祝您身体健康、万事顺意。",
        "过年好！看到您精神真好，祝您新岁平安喜乐、福气满满。",
        "新年快乐！愿您新的一年安康顺遂，日子越过越舒心。"
      ],
      light: [
        "过年好！您今天气色特别好，祝您新年开心、身体倍儿棒！",
        "新年好呀！谢谢您一直惦记我，祝您一年顺顺利利！"
      ],
      playful: [
        "新年好！祝您每天都开开心心，福气像红包一样越来越多！",
        "过年啦！祝您身体健康、心情超好，天天都有好事发生。"
      ]
    },
    en: {
      steady: [
        "Happy New Year! Thank you for always caring—wishing you health and peace all year.",
        "Happy Spring Festival! You look great today—wishing you comfort, joy, and good fortune.",
        "Happy New Year! May your days be calm, healthy, and full of blessings."
      ],
      light: [
        "Happy New Year! You’re looking so well—wishing you lots of smiles and good health!",
        "Happy Spring Festival! Thanks for thinking of me—wishing you a smooth and happy year."
      ],
      playful: [
        "Happy New Year! May your good luck be as generous as red envelopes!",
        "Happy New Year! Wishing you great health and many happy surprises."
      ]
    }
  },
  teacher: {
    zh: {
      steady: [
        "老师新年好！感谢您的指导与鼓励，祝您新年顺遂、桃李满园。",
        "新年快乐！祝您身体安康、工作顺利，一切都如愿。"
      ],
      light: [
        "老师过年好！祝您新的一年状态在线，天天开心！",
        "新年快乐！祝您顺顺利利，假期好好休息～"
      ],
      playful: [
        "老师新年快乐！祝您灵感不断、好运加倍，天天都想笑～",
        "过年好！祝您新一年“心情在线、能量拉满”。"
      ]
    },
    en: {
      steady: [
        "Happy New Year! Thank you for your guidance—wishing you health, joy, and a wonderful year.",
        "Happy Spring Festival! Wishing you a smooth year and continued inspiration in your work."
      ],
      light: [
        "Happy New Year! Hope you get a restful break and a great start to the year!",
        "Happy Spring Festival! Wishing you an easy, happy, and rewarding year."
      ],
      playful: [
        "Happy New Year! Wishing you great vibes, great luck, and lots of joyful moments!",
        "Happy Spring Festival! May your energy stay high and your stress stay low."
      ]
    }
  },
  peer: {
    zh: {
      steady: [
        "新年快乐！祝你新的一年目标清晰、进步稳定，想做的事都能成。",
        "过年好！希望你新一年顺利升级，学业/工作都更顺手。"
      ],
      light: [
        "新年快乐！祝你好运连连，想要的都能拿下～",
        "过年好！新的一年一起更强、更开心！"
      ],
      playful: [
        "新年快乐！祝你一路开挂，但也别太累～",
        "过年啦！祝你快乐翻倍、烦恼清零！"
      ]
    },
    en: {
      steady: [
        "Happy New Year! Wishing you clear goals, steady progress, and good things ahead.",
        "Happy Spring Festival! May this year bring you growth, ease, and momentum."
      ],
      light: [
        "Happy New Year! Wishing you good luck and lots of wins this year!",
        "Happy Spring Festival! Let’s grow stronger—and happier—together."
      ],
      playful: [
        "Happy New Year! May you level up smoothly (and still get enough sleep).",
        "Happy Spring Festival! Wishing you double the joy and zero the worries."
      ]
    }
  },
  kid: {
    zh: {
      steady: [
        "新年快乐！祝你健康快乐、每天都有新发现。",
        "过年好！祝你新一年更勇敢、更自信，天天开心。"
      ],
      light: [
        "新年快乐！祝你吃好玩好，天天都有好心情～",
        "过年啦！祝你红包多多，快乐多多！"
      ],
      playful: [
        "新年快乐！祝你每天都像开盲盒一样惊喜！",
        "过年啦！祝你快乐升级、好运加载完成！"
      ]
    },
    en: {
      steady: [
        "Happy New Year! Wishing you health, joy, and new discoveries every day.",
        "Happy Spring Festival! May you feel brave, confident, and happy this year."
      ],
      light: [
        "Happy New Year! Eat well, play well, and smile a lot!",
        "Happy Spring Festival! Wishing you lots of fun and lots of happiness."
      ],
      playful: [
        "Happy New Year! May every day feel like a surprise box—full of good stuff!",
        "Happy Spring Festival! Wishing your happiness to level up!"
      ]
    }
  }
};

function pickOne(arr){ return arr[Math.floor(Math.random() * arr.length)]; }

function generateBlessing(){
  if (!$("#genBlessing")) return;

  const who = $("#who").value;      // elder/teacher/peer/kid
  const tone = $("#tone").value;    // steady/light/playful
  const zh = pickOne(pool[who].zh[tone]);
  const en = pickOne(pool[who].en[tone]);

  const mode = document.body.getAttribute("data-mode") || "bi";
  const out = $("#blessingOut");

  if (!out) return;

  if (mode === "zh"){
    out.textContent = zh;
  } else if (mode === "en"){
    out.textContent = en;
  } else {
    out.innerHTML = `<span class="zh">${zh}</span><span class="en">${en}</span>`;
  }
}

function init(){
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const saved = localStorage.getItem("edusynergy_mode");
  setMode(saved === "zh" || saved === "en" || saved === "bi" ? saved : "bi");

  const btn = $("#modeToggle");
  if (btn) btn.addEventListener("click", toggleMode);

  // Tool interactions on spring page
  if ($("#genBlessing")){
    $("#genBlessing").addEventListener("click", generateBlessing);
    $("#newBlessing").addEventListener("click", generateBlessing);
    $("#copyBlessing").addEventListener("click", () => copyText($("#blessingOut").innerText));
    generateBlessing();
  }
}

document.addEventListener("DOMContentLoaded", init);
