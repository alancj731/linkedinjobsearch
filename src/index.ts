
import LinkedInService from "./services/linkedin.service";
import Parser from "./services/parser.service";
import dotenv from "dotenv";
dotenv.config();


const linkedinService = new LinkedInService();

(async () => {
  try {
    await linkedinService.Init();
    const html = await linkedinService.SearchAndReturnHtml();
    const parser = new Parser(html);
    await parser.parse();
  }
  catch (err) {
    console.error(err);
    return;
  }
  finally
  {
    // await linkedinService.Close();
  }

})();