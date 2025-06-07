
import LinkedInService from "./services/linkedin.service";

const linkedinService = new LinkedInService();

const searchAndExport = async () => {
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
};

export const linkedInSearch = async (message: any, context:any) => {
  const messageId = context.eventId;
  console.log(`Processing Pub/Sub message ID: ${messageId}`);
  try{
    console.log("Starting LinkedIn search and export process...");
    await searchAndExport();
    return
  }
  catch (e) {
    console.error("Error in smsHandler:", e);
    throw e;
  }
}

export const jobsearchapp = linkedInSearch;