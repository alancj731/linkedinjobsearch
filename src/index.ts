
import LinkedInService from "./services/linkedin.service";
// import dotenv from "dotenv";
// dotenv.config();


const linkedinService = new LinkedInService();

(async () => {
  try {
    await linkedinService.Init();
    await linkedinService.SearchAndReturn();
  }
  catch (err) {
    console.error(err);
    return;
  }
  finally
  {
    await linkedinService.Close();
  }

})();