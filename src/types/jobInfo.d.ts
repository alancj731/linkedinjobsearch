export interface JOBINFO {
  title: string;
  company: string;
  location: string;
  link: string;
  postedTime: string;
}

export interface JOBINFOWITHID extends JOBINFO {
  job_id: string;
}