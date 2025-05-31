import postgresDB from "./repo";
import { extractJobID } from "src/utils/utils";

const db = postgresDB.getInstance();

// db.connect()

const testJobs = [
    {
    title: 'Data Engineer - Databricks',
    company: 'Lumenalta',
    location: 'Winnipeg, MB (Remote)',
    link: 'https://www.linkedin.com/jobs/search-results/?currentJobId=4237960824&keywords=data&f_TPR=r604800&f_TPR=r604800&origin=JOBS_HOME_SEARCH_BUTTON&trackingId=WUmkuyPOOxQwhJkgXoI6ig%3D%3D&refId=YoeUH3A7IlDQMbzsnygpjQ%3D%3D&eBP=NON_CHARGEABLE_CHANNEL',
    postedTime: '4 days ago',
    job_id: '4237960824'
  },
  {
    title: 'Data Engineer - Databricks',
    company: 'Lumenalta',
    location: 'Winnipeg, MB (Remote)',
    link: 'https://www.linkedin.com/jobs/search-results/?currentJobId=4237967332&keywords=data&f_TPR=r604800&f_TPR=r604800&origin=JOBS_HOME_SEARCH_BUTTON&trackingId=MH%2F3erxOJyRIDZ5waj7xUA%3D%3D&refId=YoeUH3A7IlDQMbzsnygpjQ%3D%3D&eBP=NON_CHARGEABLE_CHANNEL',
    postedTime: '4 days ago',
    job_id: '4237967332'
  }
];

// db.insertJobs(testJobs)

(async () => {
    await db.connect();
    const existingJobIDs = await db.getAllJobIDs();
    const toSaveJobs = testJobs.filter(job => !existingJobIDs.includes(extractJobID(job.link)));
    console.log("Jobs to save:", toSaveJobs.length);
    if (toSaveJobs.length > 0) {
        await db.insertJobs('jobs', toSaveJobs);
        console.log("Jobs inserted successfully.");
    }
    await db.disconnect();
})()