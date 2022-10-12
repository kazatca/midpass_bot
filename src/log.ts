import moment from 'moment';

export const log = (message: any) => {
  console.log(`[${moment().format("DD.MM.yyyy HH:mm:ss")}] ${JSON.stringify(message, null, 2)}`);
}