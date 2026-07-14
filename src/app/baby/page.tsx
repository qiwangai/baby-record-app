"use client";

import {
  Baby,
  Bell,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Coffee,
  CupSoda,
  Edit3,
  Home,
  Moon,
  Package,
  Play,
  Plus,
  RotateCcw,
  Settings,
  ShoppingBag,
  Star,
  TrendingUp,
  Trash2,
  User,
  Utensils,
  X,
} from "lucide-react";
import type { FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";

type TabKey = "home" | "feed" | "expense" | "growth" | "sleep" | "profile";
type TimerKind = "feed" | "sleep";
type FeedKind = "母乳" | "配方奶" | "辅食";
type FeedSide = "左侧" | "右侧";
type ModalKey = "formula" | "solid" | "sleep" | "expense" | "growth" | "profile" | "reminders" | null;

type BabyProfile = {
  parentName: string;
  babyName: string;
  gender: string;
  birthday: string;
  zodiac: string;
  feedReminderHours: number;
  sleepReminderHours: number;
};

type FeedRecord = {
  id: number;
  kind: FeedKind;
  time: string;
  minutes?: number;
  side?: FeedSide;
  amount?: number;
  food?: string;
};

type SleepRecord = {
  id: number;
  startTime: string;
  endTime: string;
  minutes: number;
  note: string;
};

type ExpenseRecord = {
  id: number;
  name: string;
  category: string;
  amount: number;
  date: string;
};

type GrowthRecord = {
  id: number;
  date: string;
  height: number;
  weight: number;
};

type BabyAppState = {
  profile: BabyProfile;
  feeds: FeedRecord[];
  sleeps: SleepRecord[];
  expenses: ExpenseRecord[];
  growth: GrowthRecord[];
};

type Activity = {
  id: string;
  time: string;
  type: "喂养" | "睡眠" | "消费";
  detail: string;
  sub?: string;
  color: "orange" | "blue" | "green";
  sortAt: number;
};

const STORAGE_KEY = "baby-care-app-state-v3";

const tabs: Array<{ key: TabKey; label: string; icon: typeof Home }> = [
  { key: "home", label: "首页", icon: Home },
  { key: "feed", label: "喂养", icon: Coffee },
  { key: "expense", label: "消费", icon: ShoppingBag },
  { key: "growth", label: "成长", icon: TrendingUp },
  { key: "sleep", label: "睡眠", icon: Moon },
  { key: "profile", label: "我的", icon: User },
];

const initialState: BabyAppState = {
  profile: {
    parentName: "Mo",
    babyName: "布布",
    gender: "女",
    birthday: "2026-07-09",
    zodiac: "双鱼座",
    feedReminderHours: 2,
    sleepReminderHours: 2.5,
  },
  feeds: [
    { id: 1, kind: "母乳", time: "13:34", minutes: 0, side: "右侧" },
    { id: 2, kind: "母乳", time: "10:33", minutes: 0, side: "左侧" },
  ],
  sleeps: [
    { id: 3, startTime: "12:33", endTime: "13:33", minutes: 60, note: "下午觉" },
    { id: 4, startTime: "10:34", endTime: "10:34", minutes: 0, note: "小睡" },
  ],
  expenses: [],
  growth: [
    { id: 8, date: "2026-03-17", height: 50, weight: 3.4 },
    { id: 9, date: "2026-04-17", height: 60, weight: 6.3 },
    { id: 10, date: "2026-05-17", height: 76, weight: 11.1 },
  ],
};

const babyInlineCss = `
[class*="pageShell"]{height:100vh;overflow:hidden;background:#eee8e4;display:flex;align-items:center;justify-content:center;padding:20px;color:#201b18;font-family:Arial,"PingFang SC","Microsoft YaHei",sans-serif}
[class*="phoneFrame"]{position:relative;width:min(100vw,430px);height:min(100vh,932px);background:#fff7f5;overflow:hidden;box-shadow:0 30px 90px rgba(91,61,45,.22)}
[class*="statusBar"]{display:none}
[class*="statusIcons"]{font-size:15px;letter-spacing:1px}
[class*="appSurface"]{height:calc(100% - 86px);overflow-y:auto;scrollbar-width:none}
[class*="appSurface"]::-webkit-scrollbar{display:none}
[class*="header"]{height:78px;padding:0 26px;position:relative;display:flex;align-items:center;justify-content:center}
[class*="header"] h1{position:absolute;left:50%;transform:translateX(-50%);text-align:center;font-size:30px;font-weight:500;line-height:1;max-width:180px;white-space:nowrap}
[class*="headerRight"]{position:absolute;right:24px;min-width:0;color:#4d433e;display:flex;align-items:center;justify-content:flex-end}
[class*="screenBody"]{height:auto;overflow:visible;padding:18px 18px 38px;scrollbar-width:none}
[class*="screenBody"]::-webkit-scrollbar{display:none}
[class*="card"],[class*="metricCard"],[class*="typeCard"],[class*="statCard"],[class*="listCard"],[class*="historyCard"],[class*="settingsList"],[class*="expenseItem"]{border-radius:8px;box-shadow:0 8px 24px rgba(106,69,47,.06)}
[class*="card"]{background:#fff0ec}
[class*="profileSummary"]{min-height:104px;padding:22px;display:grid;grid-template-columns:76px 1fr auto;gap:18px;align-items:center}
[class*="babyAvatar"],[class*="userAvatar"]{border-radius:50%;background:#ffd8c8;color:#93603a;display:grid;place-items:center}
[class*="babyAvatar"]{width:70px;height:70px}
[class*="profileSummary"] h2,[class*="userHero"] h2{font-size:27px;font-weight:800;margin-bottom:8px}
[class*="profileSummary"] p,[class*="userHero"] p{font-size:18px;color:#706966}
[class*="profileSummary"] button,[class*="sectionTitle"] button{border:0;background:transparent;color:#8a817d;font-size:16px;white-space:nowrap}
[class*="todaySummary"]{margin-top:26px;padding:24px 18px 20px;background:#fff2d9}
[class*="todaySummary"] h2,[class*="sectionTitle"] h2,[class*="timerCard"] h2,[class*="growthCard"] h2{font-size:24px;font-weight:800}
[class*="summaryGrid"],[class*="statGrid"],[class*="expenseGrid"]{display:grid;grid-template-columns:1fr 1fr;gap:18px}
[class*="summaryGrid"]{margin-top:22px}
[class*="metricCard"]{background:rgba(255,255,255,.92);min-height:104px;padding:22px 18px}
[class*="metricCard"] span,[class*="statCard"] span,[class*="expenseHero"] span{display:flex;align-items:center;gap:8px;font-size:17px;font-weight:800}
[class*="metricCard"] strong,[class*="statCard"] strong,[class*="expenseHero"] strong{display:block;margin-top:18px;font-size:39px;line-height:1;font-weight:900;letter-spacing:0}
[class*="statusLine"]{margin-top:22px;color:#655b55;font-size:18px;display:flex;align-items:center;gap:12px}
[class*="statusLine"] span{width:10px;height:10px;border-radius:50%;background:#48b657}
[class*="sectionTitle"]{margin:30px 0 14px;display:flex;justify-content:space-between;align-items:center;gap:14px}
[class*="_timeline__"]{display:flex;flex-direction:column;gap:24px}
[class*="timelineItem"]{display:grid;grid-template-columns:14px minmax(0,1fr);column-gap:24px;align-items:start}
[class*="timelineDot"]{width:13px;height:13px;border-radius:50%;margin-top:10px}
[class*="timelineContent"]{min-width:0}
[class*="timelineTop"]{display:flex;align-items:center;gap:10px;margin-bottom:18px}
[class*="timelineTop"] strong{font-size:21px}
[class*="timelineItem"] p{font-size:19px;line-height:1.45;margin:0}
[class*="timelineItem"] b{display:block;margin-top:8px;font-size:19px;color:#efa500}
[class*="badge"]{display:inline-flex;align-items:center;height:30px;padding:0 10px;border-radius:6px;font-size:16px;font-weight:700}
[class*="_orange__"]{background:#ffa900}[class*="_blue__"]{background:#2da7df}[class*="_green__"]{background:#48b657}
[class*="orangeText"]{color:#eaa000}[class*="blueText"]{color:#2d9ed3}[class*="greenText"]{color:#43ad55}
[class*="orangeBadge"]{background:#fff1d8;color:#eaa000}[class*="blueBadge"]{background:#e3f2fb;color:#258cbd}[class*="greenBadge"]{background:#e5f7e9;color:#3ba04a}
[class*="fab"]{position:absolute;right:28px;bottom:110px;width:76px;height:76px;border:0;border-radius:20px;background:#9f592b;color:#7b3f1d;display:grid;place-items:center;box-shadow:0 12px 22px rgba(88,54,35,.28)}
[class*="recordDate"]{font-size:18px;color:#716966;white-space:nowrap}
[class*="timerCard"]{min-height:428px;padding:34px 26px 30px;text-align:center}
[class*="feedTimerBubble"],[class*="sleepTimerBubble"]{margin:42px auto 36px;width:190px;height:190px;border-radius:50%;background:#ffd8c8;color:#73390f;display:flex;flex-direction:column;align-items:center;justify-content:center}
[class*="sleepTimerBubble"]{width:222px;height:222px;background:#ffe6de}
[class*="feedTimerBubble"] strong,[class*="sleepTimerBubble"] strong{font-size:43px;line-height:1;font-weight:900}
[class*="sleepTimerBubble"] strong{font-size:36px}
[class*="sideControls"]{margin-top:22px;display:flex;gap:18px}
[class*="sideControls"] button{border:0;width:58px;height:58px;border-radius:50%;background:#e8ebe9;color:#929292;font-size:24px}
[class*="sideControls"] [class*="sideActive"]{background:#fff5ef;color:#8b4b20;box-shadow:inset 0 0 0 2px #c97945}
[class*="sideControls"] span{display:block;margin-top:16px;font-size:16px}
[class*="feedActions"],[class*="sleepActions"]{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
[class*="sleepActions"]{grid-template-columns:1fr 1fr;max-width:260px;margin:0 auto}
[class*="roundAction"],[class*="primaryRoundAction"]{border:0;background:transparent;color:#58453a;display:flex;flex-direction:column;align-items:center;gap:12px;font-size:17px}
[class*="roundAction"] svg,[class*="primaryRoundAction"] svg{width:64px;height:64px;padding:18px;border-radius:50%;background:#f1e1d8}
[class*="primaryRoundAction"]{color:#8b4b20}
[class*="primaryRoundAction"] svg{background:#9f592b;color:#fff}
[class*="typeGrid"]{display:grid;grid-template-columns:1fr 1fr;gap:24px}
[class*="typeCard"]{border:0;min-height:108px;background:#fff5f2;color:#1f1a17;display:grid;place-content:center;gap:12px;font-size:21px}
[class*="historyCard"],[class*="listCard"],[class*="settingsList"]{background:rgba(255,255,255,.78);padding:18px}
[class*="datePill"]{height:auto;min-width:0;border-radius:0;background:transparent;display:inline-flex;align-items:center;justify-content:flex-end;padding:0;font-size:18px;color:#69615d;white-space:nowrap}
[class*="statGrid"]{margin-bottom:26px}
[class*="statCard"]{min-height:134px;padding:22px 20px;overflow:hidden}
[class*="statCard"] strong{font-size:34px}
[class*="statCard"] p,[class*="statCard"] small,[class*="expenseHero"] p,[class*="expenseItem"] p,[class*="recordRow"] p{color:#4aaf5a;font-size:17px;margin-top:14px}
[class*="softBlue"]{background:#f2f4f6;color:#2d9ed3}[class*="softGreen"]{background:#f6f7f3;color:#48b657}
[class*="softGreenLarge"]{background:#e4f7e9;color:#43ad55}[class*="softBlueLarge"]{background:#e4f3ff;color:#268fc4}
[class*="growthCard"]{padding:24px 24px 20px}
[class*="chart"]{width:100%;height:215px;margin-top:22px;overflow:visible}
[class*="chart"] line{stroke:#ece3dd;stroke-width:1}
[class*="heightLine"],[class*="weightLine"]{fill:none;stroke-width:4;stroke-linecap:round;stroke-linejoin:round}
[class*="heightLine"]{stroke:#2da7df}[class*="weightLine"]{stroke:#48b657}[class*="heightPoint"]{fill:#2da7df}[class*="weightPoint"]{fill:#48b657}
[class*="legend"]{display:flex;justify-content:center;gap:26px;color:#8d8783;font-size:17px}
[class*="legend"] span{display:inline-flex;align-items:center;gap:8px}
[class*="blueDot"],[class*="greenDot"]{width:10px;height:10px;border-radius:50%;display:inline-block}
[class*="blueDot"]{background:#2da7df}[class*="greenDot"]{background:#48b657}
[class*="outlineButton"]{width:100%;height:58px;border:1.5px solid #5c524d;border-radius:28px;background:transparent;color:#8b4b20;display:flex;align-items:center;justify-content:center;gap:12px;font-size:21px;font-weight:800}
[class*="achievementGrid"]{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
[class*="achievementGrid"] div{min-height:120px;border-radius:8px;background:#f4f4f4;color:#9e9e9e;display:grid;place-items:center;align-content:center;gap:10px;text-align:center}
[class*="achievementGrid"] span{width:54px;height:54px;border-radius:50%;display:grid;place-items:center;background:#e4e4e4}
[class*="achievementActive"]{background:#fffbe6!important;color:#1d1b19!important}
[class*="expenseHero"]{padding:26px;display:flex;align-items:center;gap:20px;background:#fff1de}
[class*="expenseHero"] svg{color:#9f592b}
[class*="expenseGrid"]{margin:24px 0}
[class*="expenseItem"]{background:#fff;min-height:118px;padding:20px}
[class*="expenseItem"] span{color:#766e69;font-size:17px}
[class*="expenseItem"] strong{display:block;margin-top:14px;font-size:28px}
[class*="recordRow"]{min-height:70px;display:grid;grid-template-columns:56px minmax(0,1fr) auto 40px;gap:10px;align-items:center;padding:8px 0}
[class*="recordRow"]+[class*="recordRow"],[class*="settingsRow"]+[class*="settingsRow"]{border-top:1px solid #eee7e3}
[class*="recordRow"] strong{font-size:22px}
[class*="recordRow"] div{min-width:0}
[class*="recordRow"] p{overflow-wrap:anywhere}
[class*="recordRow"] b{color:#8b4b20;font-size:24px;white-space:nowrap}
[class*="sleepIcon"],[class*="expenseIcon"]{width:46px;height:46px;border-radius:50%;display:grid;place-items:center}
[class*="sleepIcon"]{background:#cceeff;color:#2da7df}
[class*="expenseIcon"]{background:#fff2d9;color:#9f592b}
[class*="deleteButton"]{border:0;width:36px;height:36px;border-radius:50%;background:#fff0ec;color:#b15134;display:grid;place-items:center}
[class*="userHero"]{min-height:142px;display:grid;grid-template-columns:86px 1fr 48px;gap:22px;align-items:center}
[class*="userAvatar"]{width:78px;height:78px;background:#dedede;color:#999}
[class*="userHero"] button{border:0;background:#f5f5f5;color:#8d8d8d;width:46px;height:46px;border-radius:50%;display:grid;place-items:center}
[class*="settingsList"]{padding:0;overflow:hidden}
[class*="settingsRow"]{width:100%;min-height:78px;border:0;background:#fff;display:grid;grid-template-columns:58px 1fr auto 24px;align-items:center;gap:14px;padding:0 20px;text-align:left}
[class*="settingsRow"] strong{font-size:21px;font-weight:500}
[class*="settingsRow"] em{color:#6d6662;font-style:normal;font-size:20px}
[class*="settingIcon"]{width:42px;height:42px;border-radius:8px;display:grid;place-items:center}
[class*="settingIcon"][class*="_blue__"]{color:#2da7df;background:#e7f6ff}
[class*="settingIcon"][class*="_orange__"]{color:#efa500;background:#fff4de}
[class*="dangerZone"]{display:grid;gap:12px}
[class*="dangerZone"] button{border:1px solid #f0c9bc;border-radius:8px;background:#fff7f4;color:#a0442d;min-height:76px;display:grid;grid-template-columns:42px 1fr;align-items:center;gap:12px;padding:14px 16px;text-align:left}
[class*="dangerZone"] strong,[class*="dangerZone"] em{display:block}
[class*="dangerZone"] strong{font-size:19px;color:#7e341f}
[class*="dangerZone"] em{margin-top:4px;font-style:normal;color:#806c63;font-size:14px;line-height:1.35}
[class*="bottomNav"]{position:absolute;left:0;right:0;bottom:0;height:86px;background:#ffeee9;border-top:1px solid rgba(135,91,68,.08);display:grid;grid-template-columns:repeat(6,1fr);padding:8px 4px 6px;z-index:5}
[class*="navItem"]{border:0;background:transparent;color:#493d37;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;font-size:15px;font-weight:700}
[class*="navIconWrap"]{height:34px;min-width:58px;border-radius:28px;display:grid;place-items:center}
[class*="navItemActive"] [class*="navIconWrap"]{background:#ffdcca;color:#6f3d22}
[class*="emptyBox"]{min-height:92px;border-radius:8px;background:rgba(255,255,255,.72);display:grid;place-items:center;padding:20px;color:#7f766f;font-size:17px;text-align:center}
[class*="modalBackdrop"]{position:absolute;inset:0;z-index:20;background:rgba(40,29,22,.28);display:flex;align-items:flex-end;justify-content:center;padding:18px}
[class*="modalSheet"]{width:100%;max-height:78%;overflow-y:auto;background:#fff9f7;border-radius:8px;padding:20px;box-shadow:0 20px 60px rgba(50,33,24,.28)}
[class*="modalHeader"]{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:18px}
[class*="modalHeader"] h2{font-size:24px;font-weight:800}
[class*="modalHeader"] button{border:0;width:38px;height:38px;border-radius:50%;display:grid;place-items:center;background:#f2e7e1;color:#55453d}
[class*="formStack"]{display:grid;gap:14px}
[class*="formStack"] label{display:grid;gap:8px;color:#5d5049;font-size:16px;font-weight:700}
[class*="formStack"] input,[class*="formStack"] select{width:100%;min-height:48px;border:1px solid #e5d7cf;border-radius:8px;background:#fff;color:#211b18;font-size:18px;padding:0 14px;outline:none}
[class*="formStack"] input:focus,[class*="formStack"] select:focus{border-color:#a96231;box-shadow:0 0 0 3px rgba(169,98,49,.14)}
[class*="submitButton"]{height:52px;border:0;border-radius:8px;background:#9f592b;color:#fff;font-size:19px;font-weight:800;margin-top:6px}
@media(max-width:520px){[class*="pageShell"]{display:block;padding:0;background:#fff7f5}[class*="phoneFrame"]{width:100vw;height:100vh;box-shadow:none}[class*="header"] h1{font-size:28px}[class*="screenBody"]{padding-left:18px;padding-right:18px}}
[class*="statusBar"]{display:none}
[class*="appSurface"]{height:calc(100% - 88px);overflow-y:auto;scrollbar-width:none}
[class*="header"]{height:92px;padding:0 24px}
[class*="header"] h1{font-size:28px;font-weight:600}
[class*="screenBody"]{height:auto;overflow:visible;padding:14px 24px 46px}
[class*="profileSummary"]{min-height:112px;padding:20px;grid-template-columns:72px minmax(160px,1fr) auto;gap:12px;background:#fff1ed}
[class*="babyAvatar"]{width:72px;height:72px}
[class*="profileSummary"] h2{font-size:25px;margin-bottom:8px}
[class*="profileSummary"] p{font-size:17px;white-space:nowrap}
[class*="profileSummary"] button{font-size:15px;color:#9b918d}
[class*="todaySummary"]{margin-top:28px;padding:22px 18px 20px;background:#fff2d9}
[class*="todaySummary"] h2{font-size:24px}
[class*="summaryGrid"]{margin-top:20px;gap:20px}
[class*="metricCard"]{min-height:108px;padding:22px 20px}
[class*="metricCard"] span{font-size:16px}
[class*="metricCard"] strong{font-size:34px;margin-top:20px}
[class*="statusLine"]{font-size:18px;margin-top:22px}
[class*="sectionTitle"]{margin:34px 0 18px}
[class*="sectionTitle"] h2{font-size:27px}
[class*="_timeline__"]{gap:24px}
[class*="timelineItem"]{grid-template-columns:14px minmax(0,1fr);column-gap:22px}
[class*="timelineDot"]{width:13px;height:13px;margin-top:8px}
[class*="timelineTop"]{gap:10px;margin-bottom:14px}
[class*="timelineTop"] strong{font-size:20px}
[class*="badge"]{height:30px;font-size:16px;padding:0 10px}
[class*="timelineItem"] p{font-size:19px;line-height:1.5}
[class*="timelineItem"] b{font-size:19px;margin-top:8px}
[class*="fab"]{width:70px;height:70px;right:26px;bottom:104px;border-radius:18px}
[class*="bottomNav"]{height:88px;padding:8px 4px 7px}
`;

function pad(value: number) {
  return value.toString().padStart(2, "0");
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function dateLabel(date = new Date()) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function currentTime(date = new Date()) {
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function formatMinutes(minutes: number) {
  return `${Math.max(0, Math.round(minutes))} 分钟`;
}

function formatHours(minutes: number) {
  if (minutes < 60) return `${Math.round(minutes)}min`;
  const hours = Math.floor(minutes / 60);
  const rest = Math.round(minutes % 60);
  return rest ? `${hours}h${rest}m` : `${hours}.0h`;
}

function formatClock(seconds: number, withHours = false) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return withHours ? `${pad(hours)}:${pad(minutes)}:${pad(secs)}` : `${pad(minutes)}:${pad(secs)}`;
}

function minutesSince(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const now = new Date();
  const then = new Date();
  then.setHours(hours, minutes, 0, 0);
  if (then > now) then.setDate(then.getDate() - 1);
  return Math.max(0, Math.round((now.getTime() - then.getTime()) / 60000));
}

function timestampForTodayTime(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hours || 0, minutes || 0, 0, 0);
  return date.getTime();
}

function timestampForDate(date: string) {
  const parsed = new Date(`${date}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
}

function sortStamp(id: number, fallback: number) {
  return id > 1_000_000_000_000 ? id : fallback;
}

function babyAgeDays(birthday: string) {
  const born = new Date(`${birthday}T00:00:00`);
  const now = new Date();
  return Math.max(1, Math.floor((now.getTime() - born.getTime()) / 86400000) + 1);
}

function loadState(): BabyAppState {
  if (typeof window === "undefined") return initialState;
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (!saved) return initialState;
  try {
    return { ...initialState, ...JSON.parse(saved) } as BabyAppState;
  } catch {
    return initialState;
  }
}

function Header({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <header className={styles.header}>
      <div />
      <h1>{title}</h1>
      <div className={styles.headerRight}>{right}</div>
    </header>
  );
}

function BottomNav({ tab, setTab }: { tab: TabKey; setTab: (tab: TabKey) => void }) {
  return (
    <nav className={styles.bottomNav} aria-label="主导航">
      {tabs.map((item) => {
        const Icon = item.icon;
        const active = tab === item.key;
        return (
          <button
            aria-label={item.label}
            data-testid={`baby-tab-${item.key}`}
            className={`${styles.navItem} ${active ? styles.navItemActive : ""}`}
            key={item.key}
            onClick={() => setTab(item.key)}
            type="button"
          >
            <span className={styles.navIconWrap}>
              <Icon size={25} strokeWidth={active ? 3 : 2.4} />
            </span>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div className={styles.sectionTitle}>
      <h2>{title}</h2>
      {action ? (
        <button type="button" onClick={onAction}>
          {action}
        </button>
      ) : null}
    </div>
  );
}

function ActivityList({ activities }: { activities: Activity[] }) {
  if (!activities.length) {
    return <div className={styles.emptyBox}>还没有记录，点右下角或进入对应页面添加。</div>;
  }
  return (
    <div className={styles.timeline}>
      {activities.map((activity) => (
        <article className={styles.timelineItem} key={activity.id}>
          <span className={`${styles.timelineDot} ${styles[activity.color]}`} />
          <div className={styles.timelineContent}>
            <div className={styles.timelineTop}>
              <strong className={styles[`${activity.color}Text`]}>{activity.time}</strong>
              <span className={`${styles.badge} ${styles[`${activity.color}Badge`]}`}>{activity.type}</span>
            </div>
            <p>{activity.detail}</p>
            {activity.sub ? <b>{activity.sub}</b> : null}
          </div>
        </article>
      ))}
    </div>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className={styles.modalBackdrop}>
      <section className={styles.modalSheet}>
        <div className={styles.modalHeader}>
          <h2>{title}</h2>
          <button aria-label="关闭" onClick={onClose} type="button">
            <X size={22} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

function HomePage({
  state,
  activities,
  sleepMinutes,
  lastFeedText,
  statusText,
  activityDateLabel,
  setTab,
}: {
  state: BabyAppState;
  activities: Activity[];
  sleepMinutes: number;
  lastFeedText: string;
  statusText: string;
  activityDateLabel: string;
  setTab: (tab: TabKey) => void;
}) {
  const age = babyAgeDays(state.profile.birthday);
  return (
    <>
      <Header title="首页" right={<CalendarDays size={28} />} />
      <main className={styles.screenBody}>
        <section className={`${styles.card} ${styles.profileSummary}`}>
          <div className={styles.babyAvatar}>
            <Baby size={34} />
          </div>
          <div>
            <h2>{state.profile.babyName}</h2>
            <p>{age} 天 · 今天的第{age}天</p>
          </div>
          <button type="button" onClick={() => setTab("profile")}>
            去“我的”编辑
          </button>
        </section>

        <section className={`${styles.card} ${styles.todaySummary}`}>
          <h2>今日实时摘要</h2>
          <div className={styles.summaryGrid}>
            <div className={styles.metricCard}>
              <span className={styles.orangeText}>累计睡眠</span>
              <strong>{formatHours(sleepMinutes)}</strong>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.blueText}>距离上次喂奶</span>
              <strong>{lastFeedText}</strong>
            </div>
          </div>
          <p className={styles.statusLine}>
            <span /> 状态： {statusText}
          </p>
        </section>

        <SectionTitle title="今日动态" action={activityDateLabel} />
        <ActivityList activities={activities} />
      </main>
      <button className={styles.fab} type="button" onClick={() => setTab("feed")} aria-label="新增记录">
        <Plus size={34} />
      </button>
    </>
  );
}

function TimerPanel({
  kind,
  seconds,
  running,
  feedSide,
  onSwitchSide,
  onToggle,
  onComplete,
}: {
  kind: TimerKind;
  seconds: number;
  running: boolean;
  feedSide?: FeedSide;
  onSwitchSide?: () => void;
  onToggle: () => void;
  onComplete: () => void;
}) {
  const isFeed = kind === "feed";
  return (
    <section className={`${styles.card} ${styles.timerCard}`}>
      <h2>{isFeed ? "母乳" : "睡眠"}</h2>
      <div className={isFeed ? styles.feedTimerBubble : styles.sleepTimerBubble}>
        <strong>{formatClock(seconds, !isFeed)}</strong>
        {isFeed ? (
          <div className={styles.sideControls}>
            {(["左侧", "右侧"] as FeedSide[]).map((side) => (
              <button
                className={feedSide === side ? styles.sideActive : ""}
                key={side}
                onClick={onSwitchSide}
                type="button"
              >
                {side === "左侧" ? "☝" : "✋"}
                <span>{side}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <div className={isFeed ? styles.feedActions : styles.sleepActions}>
        {isFeed ? (
          <button className={styles.roundAction} type="button" onClick={onSwitchSide} aria-label="切换乳房">
            <RotateCcw size={25} />
            <span>切换乳房</span>
          </button>
        ) : null}
        <button className={styles.primaryRoundAction} type="button" onClick={onToggle} aria-label="开始计时">
          <Play size={30} fill="currentColor" />
          <span>{running ? "暂停计时" : "开始计时"}</span>
        </button>
        <button className={styles.roundAction} type="button" onClick={onComplete} aria-label="完成记录">
          <Check size={30} />
          <span>完成记录</span>
        </button>
      </div>
    </section>
  );
}

function FeedPage({
  feeds,
  seconds,
  running,
  feedSide,
  onSwitchSide,
  onToggle,
  onComplete,
  openModal,
  onDeleteFeed,
}: {
  feeds: FeedRecord[];
  seconds: number;
  running: boolean;
  feedSide: FeedSide;
  onSwitchSide: () => void;
  onToggle: () => void;
  onComplete: () => void;
  openModal: (modal: ModalKey) => void;
  onDeleteFeed: (id: number) => void;
}) {
  return (
    <>
      <Header title="喂养记录" right={<span className={styles.recordDate}>记录于 {todayDate().slice(5)}</span>} />
      <main className={styles.screenBody}>
        <TimerPanel
          kind="feed"
          seconds={seconds}
          running={running}
          feedSide={feedSide}
          onSwitchSide={onSwitchSide}
          onToggle={onToggle}
          onComplete={onComplete}
        />
        <SectionTitle title="其他类型" />
        <div className={styles.typeGrid}>
          <button type="button" className={styles.typeCard} onClick={() => openModal("formula")}>
            <CupSoda size={42} />
            <span>配方奶</span>
          </button>
          <button type="button" className={styles.typeCard} onClick={() => openModal("solid")}>
            <Utensils size={42} />
            <span>辅食</span>
          </button>
        </div>
        <SectionTitle title="历史记录" />
        <div className={styles.historyCard}>
          {feeds.length ? (
            feeds.slice(0, 6).map((feed) => (
              <div className={styles.recordRow} key={feed.id}>
                <span className={styles.expenseIcon}>
                  <Coffee size={24} />
                </span>
                <div>
                  <strong>{feed.kind}</strong>
                  <p>{feedToActivity(feed).detail}</p>
                </div>
                <b>{feed.time}</b>
                <button className={styles.deleteButton} type="button" onClick={() => onDeleteFeed(feed.id)} aria-label="删除喂养记录">
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          ) : (
            <div className={styles.emptyBox}>还没有喂养记录。</div>
          )}
        </div>
      </main>
    </>
  );
}

function SleepPage({
  sleeps,
  seconds,
  running,
  sleepMinutes,
  openModal,
  onToggle,
  onComplete,
  onDeleteSleep,
}: {
  sleeps: SleepRecord[];
  seconds: number;
  running: boolean;
  sleepMinutes: number;
  openModal: (modal: ModalKey) => void;
  onToggle: () => void;
  onComplete: () => void;
  onDeleteSleep: (id: number) => void;
}) {
  const latest = sleeps[0];
  return (
    <>
      <Header title="睡眠" right={<span className={styles.datePill}>记录于 {todayDate().slice(5)}</span>} />
      <main className={styles.screenBody}>
        <div className={styles.statGrid}>
          <div className={`${styles.statCard} ${styles.softBlue}`}>
            <span>
              <Moon size={28} fill="currentColor" /> 今日睡眠
            </span>
            <strong>{formatHours(sleepMinutes)}</strong>
            <p>今日累计</p>
          </div>
          <div className={`${styles.statCard} ${styles.softGreen}`}>
            <span>
              <Clock3 size={28} /> 最新记录
            </span>
            <strong>{latest ? formatHours(latest.minutes) : "0min"}</strong>
            <p>{latest ? `结束于 今天 ${latest.endTime}` : "暂无记录"}</p>
          </div>
        </div>
        <TimerPanel kind="sleep" seconds={seconds} running={running} onToggle={onToggle} onComplete={onComplete} />
        <button className={styles.outlineButton} type="button" onClick={() => openModal("sleep")}>
          <Plus size={24} /> 手动补录睡眠
        </button>
        <SectionTitle title="历史记录" />
        <div className={styles.listCard}>
          {sleeps.slice(0, 6).map((item) => (
            <div className={styles.recordRow} key={item.id}>
              <span className={styles.sleepIcon}>
                <Moon size={25} fill="currentColor" />
              </span>
              <div>
                <strong>{item.note}</strong>
                <p>
                  {item.startTime} - {item.endTime}
                </p>
              </div>
              <b>{formatHours(item.minutes)}</b>
              <button className={styles.deleteButton} type="button" onClick={() => onDeleteSleep(item.id)} aria-label="删除睡眠记录">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          {!sleeps.length ? <div className={styles.emptyBox}>还没有睡眠记录。</div> : null}
        </div>
      </main>
    </>
  );
}

function GrowthChart({ records }: { records: GrowthRecord[] }) {
  const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date)).slice(-6);
  const heights = sorted.map((item) => item.height);
  const weights = sorted.map((item) => item.weight);
  const maxHeight = Math.max(...heights, 1);
  const minHeight = Math.min(...heights, maxHeight - 1);
  const maxWeight = Math.max(...weights, 1);
  const minWeight = Math.min(...weights, maxWeight - 1);
  const toPoints = (values: number[], min: number, max: number) =>
    values.map((value, index) => {
      const x = sorted.length === 1 ? 160 : (index / (sorted.length - 1)) * 320;
      const y = 155 - ((value - min) / Math.max(1, max - min)) * 145;
      return [x, y];
    });
  const heightPoints = toPoints(heights, minHeight, maxHeight);
  const weightPoints = toPoints(weights, minWeight, maxWeight);
  const path = (values: number[][]) => values.map(([x, y], index) => `${index ? "L" : "M"}${x},${y}`).join(" ");

  return (
    <svg className={styles.chart} viewBox="0 0 360 190" role="img" aria-label="身高体重成长趋势">
      {[30, 80, 130].map((y) => (
        <line key={y} x1="0" x2="340" y1={y} y2={y} />
      ))}
      <path d={path(heightPoints)} className={styles.heightLine} />
      <path d={path(weightPoints)} className={styles.weightLine} />
      {heightPoints.map(([x, y]) => (
        <circle className={styles.heightPoint} cx={x} cy={y} key={`h-${x}`} r="5" />
      ))}
      {weightPoints.map(([x, y]) => (
        <circle className={styles.weightPoint} cx={x} cy={y} key={`w-${x}`} r="5" />
      ))}
    </svg>
  );
}

function GrowthPage({
  growth,
  openModal,
  onDeleteGrowth,
}: {
  growth: GrowthRecord[];
  openModal: (modal: ModalKey) => void;
  onDeleteGrowth: (id: number) => void;
}) {
  const sorted = [...growth].sort((a, b) => b.date.localeCompare(a.date));
  const latest = sorted[0];
  const previous = sorted[1];
  return (
    <>
      <Header title="成长档案" right={<Settings size={30} />} />
      <main className={styles.screenBody}>
        <section className={`${styles.card} ${styles.growthCard}`}>
          <h2>成长趋势</h2>
          <GrowthChart records={growth} />
          <div className={styles.legend}>
            <span>
              <i className={styles.blueDot} />身高
            </span>
            <span>
              <i className={styles.greenDot} />体重
            </span>
          </div>
        </section>
        <div className={styles.statGrid}>
          <div className={`${styles.statCard} ${styles.softGreenLarge}`}>
            <span>↕ 当前身高</span>
            <strong>{latest ? `${latest.height.toFixed(1)} cm` : "--"}</strong>
            <p>{latest ? `↑ 较上次 ${(latest.height - (previous?.height ?? latest.height)).toFixed(1)}cm` : "暂无数据"}</p>
            <small>◷ 更新于 {latest?.date ?? "--"}</small>
          </div>
          <div className={`${styles.statCard} ${styles.softBlueLarge}`}>
            <span>▣ 当前体重</span>
            <strong>{latest ? `${latest.weight.toFixed(1)} kg` : "--"}</strong>
            <p>{latest ? `↑ 较上次 ${(latest.weight - (previous?.weight ?? latest.weight)).toFixed(1)}kg` : "暂无数据"}</p>
            <small>◷ 更新于 {latest?.date ?? "--"}</small>
          </div>
        </div>
        <button className={styles.outlineButton} type="button" onClick={() => openModal("growth")}>
          <Plus size={24} /> 添加生长数据
        </button>
        <SectionTitle title="生长记录" />
        <div className={styles.listCard}>
          {sorted.map((item) => (
            <div className={styles.recordRow} key={item.id}>
              <span className={styles.sleepIcon}>
                <TrendingUp size={24} />
              </span>
              <div>
                <strong>{item.height.toFixed(1)} cm</strong>
                <p>
                  {item.date} · {item.weight.toFixed(1)} kg
                </p>
              </div>
              <button className={styles.deleteButton} type="button" onClick={() => onDeleteGrowth(item.id)} aria-label="删除成长记录">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          {!sorted.length ? <div className={styles.emptyBox}>还没有生长记录。</div> : null}
        </div>
        <SectionTitle title="里程碑成就" action="查看全部" />
        <div className={styles.achievementGrid}>
          <div className={styles.achievementActive}>
            <span>☀</span>
            <strong>第一次笑</strong>
          </div>
          <div>
            <span>🔒</span>
            <strong>抬头稳健</strong>
          </div>
          <div>
            <span>🔒</span>
            <strong>学会独立坐</strong>
          </div>
        </div>
      </main>
    </>
  );
}

function ExpensePage({
  expenses,
  openModal,
  onDeleteExpense,
}: {
  expenses: ExpenseRecord[];
  openModal: (modal: ModalKey) => void;
  onDeleteExpense: (id: number) => void;
}) {
  const total = expenses.reduce((sum, item) => sum + item.amount, 0);
  const categoryTotals = expenses.reduce<Record<string, number>>((totals, item) => {
    totals[item.category] = (totals[item.category] ?? 0) + item.amount;
    return totals;
  }, {});
  const categories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  return (
    <>
      <Header title="消费" right={<CalendarDays size={28} />} />
      <main className={styles.screenBody}>
        <section className={`${styles.card} ${styles.expenseHero}`}>
          <Package size={38} />
          <div>
            <span>本月宝宝花费</span>
            <strong>¥ {total.toLocaleString("zh-CN")}</strong>
            <p>已记录 {expenses.length} 笔消费</p>
          </div>
        </section>
        <div className={styles.expenseGrid}>
          {(categories.length ? categories : [["暂无", 0] as [string, number]]).slice(0, 4).map(([name, amount]) => (
            <article className={styles.expenseItem} key={name}>
              <span>{name}</span>
              <strong>¥ {amount}</strong>
              <p>{total ? `${Math.round((amount / total) * 100)}%` : "0%"}</p>
            </article>
          ))}
        </div>
        <button className={styles.outlineButton} type="button" onClick={() => openModal("expense")}>
          <Plus size={24} /> 添加消费记录
        </button>
        <SectionTitle title="最近消费" />
        <div className={styles.listCard}>
          {expenses.slice(0, 6).map((item) => (
            <div className={styles.recordRow} key={item.id}>
              <span className={styles.expenseIcon}>
                <ShoppingBag size={24} />
              </span>
              <div>
                <strong>{item.name}</strong>
                <p>
                  {item.category} · {item.date.slice(5)}
                </p>
              </div>
              <b>¥ {item.amount}</b>
              <button className={styles.deleteButton} type="button" onClick={() => onDeleteExpense(item.id)} aria-label="删除消费记录">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          {!expenses.length ? <div className={styles.emptyBox}>还没有消费记录。</div> : null}
        </div>
      </main>
    </>
  );
}

function ProfilePage({
  profile,
  openModal,
  onClearRecords,
  onResetBaby,
}: {
  profile: BabyProfile;
  openModal: (modal: ModalKey) => void;
  onClearRecords: () => void;
  onResetBaby: () => void;
}) {
  const babyRows = [
    [Baby, "宝贝名称", profile.babyName, "blue"],
    [Baby, "性别", profile.gender, "orange"],
    [Star, "出生年月", profile.birthday, "pink"],
    [Star, "星座", profile.zodiac, "purple"],
  ] as const;
  const remindRows = [
    [Coffee, "喂养设置", `${profile.feedReminderHours}h`, "orange"],
    [Moon, "睡眠设置", `${profile.sleepReminderHours}h`, "blue"],
  ] as const;

  return (
    <>
      <Header title="我的" right={<Bell size={28} fill="currentColor" />} />
      <main className={styles.screenBody}>
        <section className={styles.userHero}>
          <div className={styles.userAvatar}>
            <User size={54} fill="currentColor" />
          </div>
          <div>
            <h2>{profile.parentName}</h2>
            <p>用户名： ****</p>
          </div>
          <button type="button" aria-label="编辑资料" onClick={() => openModal("profile")}>
            <Edit3 size={24} />
          </button>
        </section>
        <SectionTitle title="宝贝信息" action="编辑" onAction={() => openModal("profile")} />
        <div className={styles.settingsList}>
          {babyRows.map(([Icon, label, value, tone]) => (
            <button className={styles.settingsRow} key={label} type="button" onClick={() => openModal("profile")}>
              <span className={`${styles.settingIcon} ${styles[tone]}`}>
                <Icon size={24} />
              </span>
              <strong>{label}</strong>
              <em>{value}</em>
              <ChevronRight size={24} />
            </button>
          ))}
        </div>
        <SectionTitle title="提醒设置" action="编辑" onAction={() => openModal("reminders")} />
        <div className={styles.settingsList}>
          {remindRows.map(([Icon, label, value, tone]) => (
            <button className={styles.settingsRow} key={label} type="button" onClick={() => openModal("reminders")}>
              <span className={`${styles.settingIcon} ${styles[tone]}`}>
                <Icon size={24} />
              </span>
              <strong>{label}</strong>
              <em>{value}</em>
              <ChevronRight size={24} />
            </button>
          ))}
        </div>
        <SectionTitle title="交接工具" />
        <div className={styles.dangerZone}>
          <button type="button" onClick={onClearRecords}>
            <Trash2 size={22} />
            <span>
              <strong>清空所有记录</strong>
              <em>保留宝宝资料，只删除喂养、睡眠、消费和成长记录</em>
            </span>
          </button>
          <button type="button" onClick={onResetBaby}>
            <X size={22} />
            <span>
              <strong>换新宝宝</strong>
              <em>清空记录，并把宝宝资料恢复为默认值</em>
            </span>
          </button>
        </div>
      </main>
    </>
  );
}

function feedToActivity(feed: FeedRecord): Activity {
  const detail =
    feed.kind === "母乳"
      ? `${feed.side ?? "左侧"}亲喂 ${feed.minutes ?? 0} 分钟`
      : feed.kind === "配方奶"
        ? `配方奶 ${feed.amount ?? 0} ml`
        : `${feed.food || "辅食"} ${feed.amount ?? 0} g`;
  return {
    id: `feed-${feed.id}`,
    time: feed.time,
    type: "喂养",
    detail,
    sub: feed.kind === "母乳" ? `${feed.minutes ?? 0} 分钟` : undefined,
    color: "orange",
    sortAt: sortStamp(feed.id, timestampForTodayTime(feed.time)),
  };
}

function sleepToActivity(sleep: SleepRecord): Activity {
  return {
    id: `sleep-${sleep.id}`,
    time: sleep.startTime,
    type: "睡眠",
    detail: `${sleep.note} ${formatMinutes(sleep.minutes)}`,
    color: "blue",
    sortAt: sortStamp(sleep.id, timestampForTodayTime(sleep.startTime)),
  };
}

function expenseToActivity(expense: ExpenseRecord): Activity {
  return {
    id: `expense-${expense.id}`,
    time: expense.date.slice(5),
    type: "消费",
    detail: `${expense.name} · ${expense.category}`,
    sub: `¥ ${expense.amount}`,
    color: "green",
    sortAt: sortStamp(expense.id, timestampForDate(expense.date)),
  };
}

function BabyModal({
  modal,
  state,
  setState,
  close,
}: {
  modal: ModalKey;
  state: BabyAppState;
  setState: (updater: (state: BabyAppState) => BabyAppState) => void;
  close: () => void;
}) {
  const [form, setForm] = useState({
    amount: "",
    sleepHours: "",
    sleepNote: "小睡",
    sleepEndTime: currentTime(),
    food: "米粉",
    expenseName: "",
    expenseCategory: "日用",
    expenseAmount: "",
    expenseDate: todayDate(),
    height: state.growth[0]?.height.toString() ?? "",
    weight: state.growth[0]?.weight.toString() ?? "",
    growthDate: todayDate(),
    parentName: state.profile.parentName,
    babyName: state.profile.babyName,
    gender: state.profile.gender,
    birthday: state.profile.birthday,
    zodiac: state.profile.zodiac,
    feedReminderHours: state.profile.feedReminderHours.toString(),
    sleepReminderHours: state.profile.sleepReminderHours.toString(),
  });

  if (!modal) return null;

  const updateForm = (key: keyof typeof form, value: string) => setForm((draft) => ({ ...draft, [key]: value }));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const id = Date.now();
    if (modal === "formula") {
      setState((current) => ({
        ...current,
        feeds: [{ id, kind: "配方奶", time: currentTime(), amount: Number(form.amount || 0) }, ...current.feeds],
      }));
    }
    if (modal === "solid") {
      setState((current) => ({
        ...current,
        feeds: [
          {
            id,
            kind: "辅食",
            time: currentTime(),
            food: form.food || "辅食",
            amount: Number(form.amount || 0),
          },
          ...current.feeds,
        ],
      }));
    }
    if (modal === "sleep") {
      const hours = Math.max(0, Number(form.sleepHours || 0));
      const minutes = Math.max(1, Math.round(hours * 60));
      const endTime = form.sleepEndTime || currentTime();
      const end = new Date(`${todayDate()}T${endTime}`);
      const start = new Date(end.getTime() - minutes * 60_000);
      setState((current) => ({
        ...current,
        sleeps: [
          {
            id,
            startTime: currentTime(start),
            endTime,
            minutes,
            note: form.sleepNote || (minutes > 45 ? "下午觉" : "小睡"),
          },
          ...current.sleeps,
        ],
      }));
    }
    if (modal === "expense") {
      setState((current) => ({
        ...current,
        expenses: [
          {
            id,
            name: form.expenseName || "宝宝用品",
            category: form.expenseCategory || "日用",
            amount: Number(form.expenseAmount || 0),
            date: form.expenseDate || todayDate(),
          },
          ...current.expenses,
        ],
      }));
    }
    if (modal === "growth") {
      setState((current) => ({
        ...current,
        growth: [
          {
            id,
            date: form.growthDate || todayDate(),
            height: Number(form.height || 0),
            weight: Number(form.weight || 0),
          },
          ...current.growth,
        ],
      }));
    }
    if (modal === "profile") {
      setState((current) => ({
        ...current,
        profile: {
          ...current.profile,
          parentName: form.parentName || current.profile.parentName,
          babyName: form.babyName || current.profile.babyName,
          gender: form.gender || current.profile.gender,
          birthday: form.birthday || current.profile.birthday,
          zodiac: form.zodiac || current.profile.zodiac,
        },
      }));
    }
    if (modal === "reminders") {
      setState((current) => ({
        ...current,
        profile: {
          ...current.profile,
          feedReminderHours: Number(form.feedReminderHours || current.profile.feedReminderHours),
          sleepReminderHours: Number(form.sleepReminderHours || current.profile.sleepReminderHours),
        },
      }));
    }
    close();
  };

  const titleMap: Record<Exclude<ModalKey, null>, string> = {
    formula: "添加配方奶",
    solid: "添加辅食",
    sleep: "手动补录睡眠",
    expense: "添加消费记录",
    growth: "添加生长数据",
    profile: "编辑资料",
    reminders: "编辑提醒",
  };

  return (
    <Modal title={titleMap[modal]} onClose={close}>
      <form className={styles.formStack} onSubmit={submit}>
        {modal === "formula" ? (
          <label>
            奶量 ml
            <input inputMode="decimal" value={form.amount} onChange={(event) => updateForm("amount", event.target.value)} placeholder="90" />
          </label>
        ) : null}
        {modal === "solid" ? (
          <>
            <label>
              食物
              <input value={form.food} onChange={(event) => updateForm("food", event.target.value)} placeholder="米粉" />
            </label>
            <label>
              份量 g
              <input inputMode="decimal" value={form.amount} onChange={(event) => updateForm("amount", event.target.value)} placeholder="30" />
            </label>
          </>
        ) : null}
        {modal === "sleep" ? (
          <>
            <label>
              睡眠时长 h
              <input inputMode="decimal" value={form.sleepHours} onChange={(event) => updateForm("sleepHours", event.target.value)} placeholder="1.5" />
            </label>
            <label>
              结束时间
              <input type="time" value={form.sleepEndTime} onChange={(event) => updateForm("sleepEndTime", event.target.value)} />
            </label>
            <label>
              备注
              <select value={form.sleepNote} onChange={(event) => updateForm("sleepNote", event.target.value)}>
                <option>小睡</option>
                <option>上午觉</option>
                <option>下午觉</option>
                <option>夜睡</option>
              </select>
            </label>
          </>
        ) : null}
        {modal === "expense" ? (
          <>
            <label>
              名称
              <input value={form.expenseName} onChange={(event) => updateForm("expenseName", event.target.value)} placeholder="婴儿湿巾" />
            </label>
            <label>
              分类
              <select value={form.expenseCategory} onChange={(event) => updateForm("expenseCategory", event.target.value)}>
                <option>日用</option>
                <option>奶粉</option>
                <option>尿布</option>
                <option>衣物</option>
                <option>医疗</option>
                <option>玩具</option>
              </select>
            </label>
            <label>
              金额
              <input inputMode="decimal" value={form.expenseAmount} onChange={(event) => updateForm("expenseAmount", event.target.value)} placeholder="88" />
            </label>
            <label>
              日期
              <input type="date" value={form.expenseDate} onChange={(event) => updateForm("expenseDate", event.target.value)} />
            </label>
          </>
        ) : null}
        {modal === "growth" ? (
          <>
            <label>
              日期
              <input type="date" value={form.growthDate} onChange={(event) => updateForm("growthDate", event.target.value)} />
            </label>
            <label>
              身高 cm
              <input inputMode="decimal" value={form.height} onChange={(event) => updateForm("height", event.target.value)} placeholder="76" />
            </label>
            <label>
              体重 kg
              <input inputMode="decimal" value={form.weight} onChange={(event) => updateForm("weight", event.target.value)} placeholder="11.1" />
            </label>
          </>
        ) : null}
        {modal === "profile" ? (
          <>
            <label>
              我的昵称
              <input value={form.parentName} onChange={(event) => updateForm("parentName", event.target.value)} />
            </label>
            <label>
              宝贝名称
              <input value={form.babyName} onChange={(event) => updateForm("babyName", event.target.value)} />
            </label>
            <label>
              性别
              <select value={form.gender} onChange={(event) => updateForm("gender", event.target.value)}>
                <option>女</option>
                <option>男</option>
              </select>
            </label>
            <label>
              出生年月
              <input type="date" value={form.birthday} onChange={(event) => updateForm("birthday", event.target.value)} />
            </label>
            <label>
              星座
              <input value={form.zodiac} onChange={(event) => updateForm("zodiac", event.target.value)} />
            </label>
          </>
        ) : null}
        {modal === "reminders" ? (
          <>
            <label>
              喂养提醒间隔 h
              <input inputMode="decimal" value={form.feedReminderHours} onChange={(event) => updateForm("feedReminderHours", event.target.value)} />
            </label>
            <label>
              睡眠提醒间隔 h
              <input inputMode="decimal" value={form.sleepReminderHours} onChange={(event) => updateForm("sleepReminderHours", event.target.value)} />
            </label>
          </>
        ) : null}
        <button className={styles.submitButton} type="submit">
          保存
        </button>
      </form>
    </Modal>
  );
}

export default function BabyAppPage() {
  const [tab, setTab] = useState<TabKey>("home");
  const [state, setStateValue] = useState<BabyAppState>(initialState);
  const [loaded, setLoaded] = useState(false);
  const [modal, setModal] = useState<ModalKey>(null);
  const [feedSeconds, setFeedSeconds] = useState(0);
  const [sleepSeconds, setSleepSeconds] = useState(0);
  const [feedSide, setFeedSide] = useState<FeedSide>("左侧");
  const [sleepStartedAt, setSleepStartedAt] = useState<Date | null>(null);
  const [runningTimer, setRunningTimer] = useState<TimerKind | null>(null);

  const setState = (updater: (current: BabyAppState) => BabyAppState) => {
    setStateValue((current) => updater(current));
  };

  useEffect(() => {
    setStateValue(loadState());
    const requestedTab = new URLSearchParams(window.location.search).get("tab");
    if (requestedTab && ["home", "feed", "expense", "growth", "sleep", "profile"].includes(requestedTab)) {
      setTab(requestedTab as TabKey);
    }
    if ("serviceWorker" in navigator) {
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
      navigator.serviceWorker.register(`${basePath}/baby-sw.js`, { scope: `${basePath || "/"}` }).catch(() => undefined);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [loaded, state]);

  useEffect(() => {
    if (!runningTimer) return;
    const id = window.setInterval(() => {
      if (runningTimer === "feed") setFeedSeconds((value) => value + 1);
      if (runningTimer === "sleep") setSleepSeconds((value) => value + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [runningTimer]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, [tab]);

  const activities = useMemo(
    () =>
      [
        ...state.feeds.slice(0, 8).map(feedToActivity),
        ...state.sleeps.slice(0, 8).map(sleepToActivity),
        ...state.expenses.slice(0, 4).map(expenseToActivity),
      ]
        .sort((a, b) => b.sortAt - a.sortAt)
        .slice(0, 10),
    [state.expenses, state.feeds, state.sleeps],
  );

  const sleepMinutes = useMemo(() => state.sleeps.reduce((sum, sleep) => sum + sleep.minutes, 0), [state.sleeps]);
  const usingDemoRecords = state.feeds.length > 0 && state.feeds.every((feed) => feed.id < 1_000_000_000_000);
  const lastFeedMinutes = state.feeds[0] ? minutesSince(state.feeds[0].time) : null;
  const lastFeedText = usingDemoRecords
    ? "2.1h"
    : lastFeedMinutes === null
      ? "--"
      : lastFeedMinutes < 60
        ? `${lastFeedMinutes}m`
        : `${(lastFeedMinutes / 60).toFixed(1)}h`;
  const statusText =
    runningTimer === "sleep"
      ? "宝宝正在睡眠中..."
      : runningTimer === "feed"
        ? "宝宝正在喝奶中..."
        : usingDemoRecords
          ? "宝宝正在午睡中..."
          : "宝宝状态平稳";

  const toggleTimer = (kind: TimerKind) => {
    if (kind === "sleep" && runningTimer !== "sleep") {
      setSleepStartedAt(new Date());
    }
    setRunningTimer((timer) => (timer === kind ? null : kind));
  };

  const completeTimer = (kind: TimerKind) => {
    const id = Date.now();
    if (kind === "feed") {
      const minutes = Math.max(1, Math.round(feedSeconds / 60));
      setState((current) => ({
        ...current,
        feeds: [{ id, kind: "母乳", time: currentTime(), minutes, side: feedSide }, ...current.feeds],
      }));
      setFeedSeconds(0);
    }
    if (kind === "sleep") {
      const end = new Date();
      const start = sleepStartedAt ?? end;
      const minutes = Math.max(1, Math.round(sleepSeconds / 60));
      setState((current) => ({
        ...current,
        sleeps: [
          {
            id,
            startTime: currentTime(start),
            endTime: currentTime(end),
            minutes,
            note: minutes > 45 ? "下午觉" : "小睡",
          },
          ...current.sleeps,
        ],
      }));
      setSleepSeconds(0);
      setSleepStartedAt(null);
    }
    setRunningTimer(null);
    setTab("home");
  };

  const deleteFeed = (id: number) => {
    setState((current) => ({
      ...current,
      feeds: current.feeds.filter((item) => item.id !== id),
    }));
  };

  const deleteSleep = (id: number) => {
    setState((current) => ({
      ...current,
      sleeps: current.sleeps.filter((item) => item.id !== id),
    }));
  };

  const deleteExpense = (id: number) => {
    setState((current) => ({
      ...current,
      expenses: current.expenses.filter((item) => item.id !== id),
    }));
  };

  const deleteGrowth = (id: number) => {
    setState((current) => ({
      ...current,
      growth: current.growth.filter((item) => item.id !== id),
    }));
  };

  const clearRecords = () => {
    if (!window.confirm("确认清空所有记录？宝宝资料会保留。")) return;
    setState((current) => ({
      ...current,
      feeds: [],
      sleeps: [],
      expenses: [],
      growth: [],
    }));
    setFeedSeconds(0);
    setSleepSeconds(0);
    setRunningTimer(null);
    setTab("home");
  };

  const resetBaby = () => {
    if (!window.confirm("确认换新宝宝？所有记录会清空，宝宝资料会恢复默认。")) return;
    setStateValue(initialState);
    setFeedSeconds(0);
    setSleepSeconds(0);
    setRunningTimer(null);
    setTab("profile");
  };

  const page = useMemo(() => {
    if (tab === "feed") {
      return (
        <FeedPage
          feeds={state.feeds}
          seconds={feedSeconds}
          running={runningTimer === "feed"}
          feedSide={feedSide}
          onSwitchSide={() => setFeedSide((side) => (side === "左侧" ? "右侧" : "左侧"))}
          onToggle={() => toggleTimer("feed")}
          onComplete={() => completeTimer("feed")}
          openModal={setModal}
          onDeleteFeed={deleteFeed}
        />
      );
    }
    if (tab === "expense") return <ExpensePage expenses={state.expenses} openModal={setModal} onDeleteExpense={deleteExpense} />;
    if (tab === "growth") return <GrowthPage growth={state.growth} openModal={setModal} onDeleteGrowth={deleteGrowth} />;
    if (tab === "sleep") {
      return (
        <SleepPage
          sleeps={state.sleeps}
          seconds={sleepSeconds}
          running={runningTimer === "sleep"}
          sleepMinutes={sleepMinutes}
          openModal={setModal}
          onToggle={() => toggleTimer("sleep")}
          onComplete={() => completeTimer("sleep")}
          onDeleteSleep={deleteSleep}
        />
      );
    }
    if (tab === "profile") {
      return <ProfilePage profile={state.profile} openModal={setModal} onClearRecords={clearRecords} onResetBaby={resetBaby} />;
    }
    return (
      <HomePage
        state={state}
        activities={activities}
        sleepMinutes={sleepMinutes}
        lastFeedText={lastFeedText}
        statusText={statusText}
        activityDateLabel={usingDemoRecords ? "2026 年 3 月 23 日" : dateLabel()}
        setTab={setTab}
      />
    );
  }, [activities, feedSeconds, feedSide, lastFeedText, runningTimer, sleepMinutes, sleepSeconds, state, statusText, tab]);

  return (
    <div className={styles.pageShell}>
      <style dangerouslySetInnerHTML={{ __html: babyInlineCss }} />
      <div className={styles.phoneFrame}>
        <div className={styles.appSurface}>{page}</div>
        <BottomNav tab={tab} setTab={setTab} />
        <BabyModal modal={modal} state={state} setState={setState} close={() => setModal(null)} />
      </div>
    </div>
  );
}
