import puppeteer, { Browser, Page } from "puppeteer";
import { sleep, wait, getPostedRange, extractJobID } from "../utils/utils";
import Parser from "./parser.service";
import { JOBINFO, JOBINFOWITHID } from "src/types/jobInfo";
import postgresDB from "./postgres/repo";

export default class LinkedInService {
  public browser: Browser | null = null;
  private parser: Parser = new Parser("<div></div>");
  private username: string = process.env.USERNAME || "";
  private password: string = process.env.PASSWORD || "";
  private jobTitle: string = process.env.JOB_TITLE || "";
  private page: Page | null = null;
  private jobs: JOBINFO[] = [];
  private db: postgresDB = postgresDB.getInstance();

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
      await sleep(15000);
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
    await this.Browsing();
    console.log("total jobs found:", this.jobs.length);
    
    await this.db.connect();
    const jobsWithIDs = this.jobs.map((job) => ({
      ...job,
      job_id: extractJobID(job.link),
    }));
    console.log("Database Connected successfully.");
    const existingJobIDs = await this.db.getAllJobIDs();
    const jobsToSave = jobsWithIDs.filter(
      (job) => !existingJobIDs.includes(job.job_id)
    );
    console.log("Jobs to save:", jobsToSave.length);

    if (jobsToSave.length > 0) {
      await this.db.insertJobs('jobs', jobsToSave);
      console.log("Jobs inserted successfully.");
      await this.db.truncateTable('new_jobs');
      await this.db.insertJobs('new_jobs', jobsToSave);
      console.log("New jobs inserted into new_job table successfully.");
    } else {
      console.log("No new jobs to insert.");
    }

    await this.db.disconnect();
    console.log("✅ PostgreSQL connection disconnected successfully.");
  }

  private async filterNewJobs(jobs: JOBINFO[]): Promise<JOBINFOWITHID[]> {
    const existingJobIDs = await this.db.getAllJobIDs();
    const jobsWithIDs = jobs.map((job) => ({
      ...job,
      job_id: extractJobID(job.link),
    }));
    const newJobs = jobsWithIDs.filter(
      (job) => !existingJobIDs.includes(job.job_id)
    );
    return newJobs;
  }

  private async Browsing() {
    if (!this.page) {
      throw new Error("Page is not initialized. Please login first.");
    }
    let browsing = true;
    while (browsing) {
      for (let i = 0; i < 10; i++) {
        await this.page!.mouse.wheel({ deltaY: 800 });
        await wait();
      }
      await wait();
      const html = await this.page.content();
      this.parser.setContent(html);

      const foundJobs = await this.parser.parse();
      if (foundJobs.length === 0) {
        console.warn("No jobs found. Pleasebs check your search criteria.");
        browsing = false;
      } else {
        this.jobs.push(...foundJobs);
        const moreJobsPageToSearch = await this.parser.CheckExtraJobsPage();
        if (!moreJobsPageToSearch) {
          console.log("No more jobs page. Ending search.");
          browsing = false;
        } else {
          console.log("Found more jobs page. Continuing search.");
          // see next page
          await this.page.click('button[aria-label="View next page"]');
          await sleep(8000);
        }
      }
    }
    return null;
  }

  public async ExportPage() {
    if (!this.page) {
      throw new Error("Page is not initialized. Please login first.");
    }
    return await this.page.content();
  }

  public async SearchAndReturn(): Promise<boolean> {
    try {
      await this.Login();
      console.log("Logged in successfully!");
      await wait();
      console.log("Searching for jobs...");
      await this.SearchJobs();
      console.log("Job search completed!");
      return true;
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
