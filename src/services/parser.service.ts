import * as ch from "cheerio";
import { JOBINFO } from "src/types/jobInfo";

export default class Parser {
  private content: string;
  private $: ch.CheerioAPI;

  constructor(html: string) {
    this.content = html;
    this.$ = ch.load(html);
  }

  public setContent(html: string) {
    this.content = html;
    this.$ = ch.load(html);
  }

  public async CheckExtraJobsPage(): Promise<boolean> {
    const pageRegex = /Page\s+(\d+)\s+of\s+(\d+)/i;
    let extraPage = false;

    this.$("p").each((i, el) => {
      const text = this.$(el).text().trim();
      if (pageRegex.test(text)) {
        console.log("Found page tag:");
        const match = text.match(pageRegex);
        if (match && match.length === 3) {
          const currentPage = parseInt(match[1], 10);
          const totalPages = parseInt(match[2], 10);
          console.log(
            `Current Page: ${currentPage}, Total Pages: ${totalPages}`
          );
          if (currentPage < totalPages) {
            extraPage = true;
            console.log("There is an extra page to search for jobs.");
          }
        }
      }
    });

    return extraPage;
  }

  public async parse() {
    const results = this.$("ul.semantic-search-results-list");

    const lis = results.children();

    const jobs: JOBINFO[] = [];
    lis.each((_, el) => {
      const element = this.$(el);

      const title = element
        .find(".job-card-job-posting-card-wrapper__title strong")
        .text()
        .trim();
      const company = element
        .find(".artdeco-entity-lockup__subtitle")
        .text()
        .trim();
      const location = element
        .find(".artdeco-entity-lockup__caption")
        .text()
        .trim();
      const link = element
        .find("a.job-card-job-posting-card-wrapper__card-link")
        .attr("href");
      const fullLink = link?.startsWith("http")
        ? link
        : `https://www.linkedin.com${link}`;
      const postedTime = element.find("time").text().trim();
      const logo = element.find("img.ivm-view-attr__img--centered").attr("src");

      if (!title) return;

      jobs.push({
        title,
        company,
        location,
        link: fullLink,
        postedTime,
      });
    });

    console.log(`Found ${jobs.length} jobs`);

    return jobs;
  }
}
