import puppeteer, { Browser, Page } from "puppeteer";
import { sleep, wait, getPostedRange } from "../utils/utils";

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
        waitUntil: "load",
      });

      await page.waitForSelector("#username");
      await page.type("#username", this.username);
      await wait();
      await page.waitForSelector("#password");
      await page.type("#password", this.password);
      await wait();
      await page.click(".btn__primary--large");
      await sleep(15000)
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
    console.log("Navigating to LinkedIn Jobs...");
    await wait();
    await this.page.goto("https://www.linkedin.com/jobs", {
      waitUntil: "load",
    });
    console.log("Navigated to LinkedIn Jobs");
    await wait();
    await this.page.waitForSelector(".jobs-search-box__text-input");
    await this.page.type(".jobs-search-box__text-input", this.jobTitle);
    await wait();
    await this.page.keyboard.press("Enter");
    await wait();
    await this.page.waitForSelector("#searchFilter_timePostedRange");
    await this.page.click("#searchFilter_timePostedRange");
    await wait();
    const postedRange = getPostedRange();
    await this.page.click(`input[id="${postedRange}"]`);
    await wait();
    await this.page.click(".artdeco-button--primary");
    await wait();
    // await this.page.waitForSelector(
    //   ".scaffold-layout__list.jobs-semantic-search-list"
    // );

    // Now scroll using the mouse wheel
    for (let i = 0; i < 5; i++) {
      await this.page.mouse.wheel({ deltaY: 800 }); // Scroll down
      await wait(); 
    }
    await wait();
  }

  public async ExportPage() {
    if (!this.page) {
      throw new Error("Page is not initialized. Please login first.");
    }
    return await this.page.content();
  }

  public async SearchAndReturnHtml(): Promise<string> {
    try {
      await this.Login();
      console.log("Logged in successfully!");
      await wait();
      console.log("Searching for jobs...");
      await this.SearchJobs();
      console.log("Job search completed!");
      await wait();
      console.log("Exporting jobs...");
      await wait();
      const html = await this.ExportPage();
      console.log("Job export completed!");
      return html;
    } catch (err) {
      console.error("Error during job search:", err);
      throw err;
    }
  }

  public async Close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
