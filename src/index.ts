import fs from "fs";
import axios from "axios";
import { config } from "dotenv";
import { AC } from "./anti-captcha";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar, MemoryCookieStore } from "tough-cookie";
import { Site } from "./site";
import { log } from "./log";
import { TG } from './tg'

const cookies = fs.existsSync("./cookie.json") && require("../cookie.json");

const cookieStrorage = new MemoryCookieStore();
const jar = cookies
  ? CookieJar.deserializeSync(cookies, cookieStrorage)
  : new CookieJar(cookieStrorage);
const instance = wrapper(
  axios.create({
    jar,
    baseURL: "https://q.midpass.ru",
  })
);

config();

const AC_TOKEN = process.env.AC_TOKEN;

if (!AC_TOKEN) {
  throw new Error("AC_TOKEN is not defined");
}

const ac = new AC(AC_TOKEN, instance);
const site = new Site(instance, cookieStrorage, ac);

const tg = process.env.TG_TOKEN && process.env.TG_CHATS ? new TG(process.env.TG_TOKEN, process.env.TG_CHATS.split(',')) : undefined;

class LastRunError extends Error {
  constructor() {
    super("Last run was less than 24 hours ago");
  }
}

const checkLastRun = () => {
  const LASTRUN_FILENAME = './lastrun';

  if(fs.existsSync(LASTRUN_FILENAME)) {
    const content = fs.readFileSync(LASTRUN_FILENAME, 'utf8');
    if(Date.now() - parseInt(content) < 1000 * 60 * 60 * 24 + 1000 * 60 * 10) {
      throw new LastRunError();
    }
  }
  
  fs.writeFileSync(LASTRUN_FILENAME, ''+Date.now());
}

const main = async () => {
  checkLastRun();

  await site.login(process.env.EMAIL!, process.env.PASSWORD!);

  const schedule = await site.getMonthSchedule();
  if(schedule.AvailableSlots > 0){
    log(schedule);
  }

  const waitingList = await site.getWaitingList();
  log(waitingList);

  if(waitingList?.Items?.length === 0){
    throw new Error("You have no appointments");
  }

  const appointment = waitingList.Items[0];

  if(!appointment.CanConfirm) {
    throw new Error("You can't confirm this appointment");
  }

  const confirmation = await site.confirmWaitingAppointments(appointment.Id);
  if(!confirmation?.IsSuccessful){
    throw new Error(`${confirmation?.ErrorMessage}`);
  }

  tg?.send(`Confirmed appointment\nPlaceInQueue: ${appointment.PlaceInQueue}`);

  log("Appointment confirmed");
};

main().catch(err => {
  if(!(err instanceof LastRunError)) {
    log(err.message)
    tg?.send(`Error\n${err.message}`);
  } 
});