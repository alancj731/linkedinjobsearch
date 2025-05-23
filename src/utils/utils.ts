const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const wait = async () =>{
    const waitTime = Math.floor(Math.random() * 500) + 500;
    await sleep(waitTime);
}

const POSTEDRANGE ={
    "Any time": "timePostedRange-",
    "Past month": "timePostedRange-r2592000",
    "Past week": "timePostedRange-r604800",
    "Past 24 hours": "timePostedRange-r86400",
}

const getPostedRange = () => {
    let choice = process.env.DATE_POSTED || "Any time";
    
    if (!Object.keys(POSTEDRANGE).includes(choice)) {
        console.warn(`Invalid date posted range: ${choice}. Defaulting to "Any time".`);
        choice = "Any time";
    }
    const key = choice as keyof typeof POSTEDRANGE;
    
    return POSTEDRANGE[key]
    
}

export { sleep, wait, getPostedRange }
