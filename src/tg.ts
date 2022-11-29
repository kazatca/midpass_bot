import axios, { AxiosError, AxiosInstance } from "axios";
import { stringify } from "querystring";
import { log } from "./log";

export class TG {
  private client: AxiosInstance | undefined;

  constructor(private token: string, private chats: string[]) {
    this.client = axios.create({
      baseURL: "https://api.telegram.org",
    });
  }

  async send(message: string) {
    await Promise.all(
      this.chats.map(async (chat_id) => {
        if (!this.client) {
          throw new Error("Axios does not initialized");
        }
        try {
          log(`send message to tg:${chat_id}`);
          await this.client.post(
            `/bot${this.token}/sendMessage`,
            stringify({ chat_id, text: message }),
            { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
          );
        } catch (e: AxiosError | any) {
          log(e.message);
          log(e.response?.data);
        }
      })
    );
  }
}
