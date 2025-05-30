import * as ch from "cheerio";
import { wait } from "../utils/utils";

export default class Parser {
  private content: string;
  private $: ch.CheerioAPI;

  constructor(html: string) {
    this.content = html;
    this.$ = ch.load(html);
  }

  public async parse() {
    const results = this.$("ul.semantic-search-results-list");

    const lis = results.children();

    console.log("lis", lis.length);

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

      console.log({
        title,
        company,
        location,
        link: fullLink,
        postedTime,
        logo,
      });
    });
  }

}
