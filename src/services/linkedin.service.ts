import puppeteer, { Browser, Page } from "puppeteer";
import { wait, getPostedRange } from "../utils/utils";

export default class LinkedInService {
  public browser: Browser | null = null;
  private username: string = process.env.USERNAME || "";
  private password: string = process.env.PASSWORD || "";
  private jobTitle: string = process.env.JOB_TITLE || "";
  private page: Page | null = null;
  

  public async Init() {
    try {
      this.browser = await puppeteer.launch({
        headless: false,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
    } catch (err) {
      console.error("Error launching browser:", err);
      throw err;
    }
  }

  public async Login() {
    try {
      const page = await this.browser!.newPage();
      this.page = page;

      await page.goto("https://www.linkedin.com/login", {
        waitUntil: "networkidle2",
      });

      await page.waitForSelector("#username");
      await page.type("#username", this.username);
      await wait();
      await page.waitForSelector("#password");
      await page.type("#password", this.password);
      await wait();
      await page.click(".btn__primary--large");
      await wait();
    } catch (err) {
      console.error("Error logging in:", err);
      throw err;
    }
  }

  public async SearchJobs() {
    if (!this.page) {
      throw new Error("Page is not initialized. Please login first.");
    }
    await this.page.goto("https://www.linkedin.com/jobs", {
        waitUntil: "networkidle2",
    });
    wait();
    await this.page.waitForSelector(".jobs-search-box__text-input");
    await this.page.type(".jobs-search-box__text-input", this.jobTitle);
    await wait();
    await this.page.keyboard.press('Enter');
    await wait();
    await this.page.waitForSelector("#searchFilter_timePostedRange");
    await this.page.click("#searchFilter_timePostedRange");
    await wait();
    const postedRange = getPostedRange();
    await this.page.click(`input[id="${postedRange}"]`);
    await wait();
    await this.page.click(".artdeco-button--primary");
    await wait();
  }

  public async ExportJobs() {
    if (!this.page) {
      throw new Error("Page is not initialized. Please login first.");
    }
    await wait();
  }



  public async Close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
