import fs from "fs";
import axios from "axios";
import { config } from "dotenv";
import { AC } from "./anti-captcha";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar, MemoryCookieStore } from "tough-cookie";
import { Site } from "./site";
import { log } from "./log";

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


const checkLastRun = () => {
  const LASTRUN_FILENAME = './lastrun';

  if(fs.existsSync(LASTRUN_FILENAME)) {
    const content = fs.readFileSync(LASTRUN_FILENAME, 'utf8');
    if(Date.now() - parseInt(content) < 1000 * 60 * 60 * 24 + 1000 * 60 * 10) {
      throw new Error('Last run was less than 24 hours ago, exiting');
    }
  }
  
  fs.writeFileSync(LASTRUN_FILENAME, ''+Date.now());
}

const main = async () => {
  checkLastRun();

  await site.login(process.env.EMAIL!, process.env.PASSWORD!);
  log(jar.toJSON());

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
  if(!confirmation.IsSuccessful){
    throw new Error(`${confirmation.ErrorMessage}`);
  }

  log("Appointment confirmed");
};

main().catch(console.error);

/*

curl 'https://q.midpass.ru/ru/Account/CaptchaImage?1664814318070' \
  -H 'authority: q.midpass.ru' \
  -H 'accept-language: ru,en-US;q=0.9,en;q=0.8' \
  -H 'cache-control: no-cache' \
  -H 'cookie: _ga=GA1.2.922856215.1662886359; cookiesConsentDate=1662886625072; cf_clearance=VIryH2IFjhs5yHwi25dvPFwUXyqKv1is2uySqJIfCAY-1664290039-0-150; ASP.NET_SessionId=ffu2yjk2bquwcannovq3glgl' \
  -H 'pragma: no-cache' \
  -H 'referer: https://q.midpass.ru/' \
  -H 'sec-ch-ua: "Chromium";v="105", "Not)A;Brand";v="8"' \
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'sec-ch-ua-platform: "Linux"' \
  -H 'sec-fetch-dest: image' \
  -H 'sec-fetch-mode: no-cors' \
  -H 'sec-fetch-site: same-origin' \
  -H 'user-agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36' \
  --compressed
*/

/*
curl 'https://q.midpass.ru/ru/Account/DoPrivatePersonLogOn' \
  -H 'authority: q.midpass.ru' \
  -H 'accept-language: ru,en-US;q=0.9,en;q=0.8' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/x-www-form-urlencoded' \
  -H 'cookie: _ga=GA1.2.922856215.1662886359; cookiesConsentDate=1662886625072; cf_clearance=VIryH2IFjhs5yHwi25dvPFwUXyqKv1is2uySqJIfCAY-1664290039-0-150; ASP.NET_SessionId=ffu2yjk2bquwcannovq3glgl' \
  -H 'origin: https://q.midpass.ru' \
  -H 'pragma: no-cache' \
  -H 'referer: https://q.midpass.ru/' \
  -H 'sec-ch-ua: "Chromium";v="105", "Not)A;Brand";v="8"' \
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'sec-ch-ua-platform: "Linux"' \
  -H 'sec-fetch-dest: document' \
  -H 'sec-fetch-mode: navigate' \
  -H 'sec-fetch-site: same-origin' \
  -H 'sec-fetch-user: ?1' \
  -H 'upgrade-insecure-requests: 1' \
  -H 'user-agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36' \
  --data-raw 'NeedShowBlockWithServiceProviderAndCountry=True&CountryId=88655495-3b8c-f56d-5337-0f2743a7bfed&ServiceProviderId=b8af6319-9d8d-5bd9-f896-edb8b97362d0&Email=kazatca%40gmail.com&g-recaptcha-response=&Captcha=l24219&Password=d2C9Dco7' \
  --compressed
*/

/*
curl 'https://q.midpass.ru/ru/Appointments/FindWaitingAppointments' \
  -H 'authority: q.midpass.ru' \
  -H 'accept-language: ru,en-US;q=0.9,en;q=0.8' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/x-www-form-urlencoded; charset=UTF-8' \
  -H 'cookie: _ga=GA1.2.922856215.1662886359; cookiesConsentDate=1662886625072; cf_clearance=VIryH2IFjhs5yHwi25dvPFwUXyqKv1is2uySqJIfCAY-1664290039-0-150; ASP.NET_SessionId=ffu2yjk2bquwcannovq3glgl; .ASPXAUTH=47782235343A1B283BDC5FF063F0A9FDA14A649997E440F10798072E547972EC5B70ABAF9F2E5C7E9F7A8841ADACDE18B20FA932A042305CD53A34D90A020D3ECB1E7F09DD21193FF5F145A61D4D4274A0C1735F12E1DC105ECF1072434A8B141B7E767A46E29C6D9B117C14F8AF705573215386ABEBF41B019D1BF7E0E26980CE3C1A5D712379539BC9D8EE007716E55FC66516' \
  -H 'origin: https://q.midpass.ru' \
  -H 'pragma: no-cache' \
  -H 'referer: https://q.midpass.ru/ru/Appointments/WaitingList' \
  -H 'sec-ch-ua: "Chromium";v="105", "Not)A;Brand";v="8"' \
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'sec-ch-ua-platform: "Linux"' \
  -H 'sec-fetch-dest: empty' \
  -H 'sec-fetch-mode: cors' \
  -H 'sec-fetch-site: same-origin' \
  -H 'user-agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36' \
  -H 'x-requested-with: XMLHttpRequest' \
  --data-raw 'begin=0&end=10' \
  --compressed
*/

/*
curl 'https://q.midpass.ru/ru/Appointments/ConfirmWaitingAppointments' \
  -H 'authority: q.midpass.ru' \
  -H 'accept-language: ru,en-US;q=0.9,en;q=0.8' \
  -H 'content-type: application/x-www-form-urlencoded; charset=UTF-8' \
  -H 'cookie: _ga=GA1.2.922856215.1662886359; cookiesConsentDate=1662886625072; cf_clearance=VIryH2IFjhs5yHwi25dvPFwUXyqKv1is2uySqJIfCAY-1664290039-0-150; ASP.NET_SessionId=cvdfjsxm14ae5w5el5fsubrj; .ASPXAUTH=94EB2E048374D684B93584A48EC5D1B8B163248369B30B4BCB19040184D08C1AD91E1005ECE60986F6B05E5B003116B6504C48B877BFE90A66BD55924AC14116F7613960DECCFFBCC04A791712F97BD39D8FFA24F203D0B5E5DCDABB34BB45591FA771ED0AC02898B3E55370F91AFB72B1F50AFDB8D298CB4800A167B437054D1828677D52193C067D754355696528572E50222E' \
  -H 'origin: https://q.midpass.ru' \
  -H 'referer: https://q.midpass.ru/ru/Appointments/WaitingList' \
  -H 'sec-ch-ua: "Chromium";v="105", "Not)A;Brand";v="8"' \
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'sec-ch-ua-platform: "Linux"' \
  -H 'sec-fetch-dest: empty' \
  -H 'sec-fetch-mode: cors' \
  -H 'sec-fetch-site: same-origin' \
  -H 'user-agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36' \
  -H 'x-requested-with: XMLHttpRequest' \
  --data-raw 'ids=33c1c221-57fa-4c90-a1c6-58cac04aff9c&captcha=n28110' \
  --compressed
*/


/*
curl 'https://q.midpass.ru/ru/Booking/GetMonthSchedule' \
  -H 'authority: q.midpass.ru' \
  -H 'accept-language: ru,en-US;q=0.9,en;q=0.8' \
  -H 'content-type: application/x-www-form-urlencoded; charset=UTF-8' \
  -H 'cookie: _ga=GA1.2.922856215.1662886359; cookiesConsentDate=1662886625072; cf_clearance=VIryH2IFjhs5yHwi25dvPFwUXyqKv1is2uySqJIfCAY-1664290039-0-150; _gid=GA1.2.1162768510.1665316426; ASP.NET_SessionId=i5kb0xlkzehppbfrrvtcm4j2; .ASPXAUTH=C03F05BEC320FE5255C33ED4705467119FC6007A2AC2D170DA6A404F56F0DCB78F94A26405CDA468B340D824F2F02E0827C77D43A5377EBF00011B16D5339E6B5CBB03AC674725C2C39DC51FA8294DA6EDF822D184FCB7118AAC9F14A3AED3CA8B142E66F10F040B0B87F007A6E3D50E7214AD51AC50528D5768923F2D0C42FDD9722DF22BD4F265467CB13A1C2F6BAC9812F625' \
  -H 'origin: https://q.midpass.ru' \
  -H 'referer: https://q.midpass.ru/ru/Booking?serviceId=bb064812-a917-248e-d17c-2cf57b9f8cb2' \
  -H 'sec-ch-ua: "Chromium";v="105", "Not)A;Brand";v="8"' \
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'sec-ch-ua-platform: "Linux"' \
  -H 'sec-fetch-dest: empty' \
  -H 'sec-fetch-mode: cors' \
  -H 'sec-fetch-site: same-origin' \
  -H 'user-agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36' \
  -H 'x-requested-with: XMLHttpRequest' \
  --data-raw 'serviceId=bb064812-a917-248e-d17c-2cf57b9f8cb2&month=10&year=2022&day=1&k=7431' \
  --compressed

*/