
import LinkedInService from "./services/linkedin.service";
import {sleep, wait} from "./utils/utils";
import dotenv from "dotenv";
dotenv.config();


const linkedinService = new LinkedInService();

(async () => {
  try {
    await linkedinService.Init();
    await linkedinService.Login();
    console.log("Logged in successfully!");
    await wait();
    console.log("Searching for jobs...");
    await linkedinService.SearchJobs();
    console.log("Job search completed!");
    await wait();
    console.log("Exporting jobs...");
    await linkedinService.ExportJobs();
    console.log("Job export completed!");
    await sleep(3000);
    await linkedinService.Close();
  }
  catch (err) {
    console.error(err);
    return;
  }
})();