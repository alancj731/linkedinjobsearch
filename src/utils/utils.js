"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractJobID = exports.getPostedRange = exports.wait = exports.sleep = void 0;
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
exports.sleep = sleep;
const wait = async () => {
    const waitTime = Math.floor(Math.random() * 500) + 500;
    await sleep(waitTime);
};
exports.wait = wait;
const POSTEDRANGE = {
    "Any time": "timePostedRange-",
    "Past month": "timePostedRange-r2592000",
    "Past week": "timePostedRange-r604800",
    "Past 24 hours": "timePostedRange-r86400",
};
const getPostedRange = () => {
    let choice = process.env.DATE_POSTED || "Any time";
    if (!Object.keys(POSTEDRANGE).includes(choice)) {
        console.warn(`Invalid date posted range: ${choice}. Defaulting to "Any time".`);
        choice = "Any time";
    }
    const key = choice;
    return POSTEDRANGE[key];
};
exports.getPostedRange = getPostedRange;
const extractJobID = (url) => {
    const regex = /currentJobId=(\d+)/;
    const match = url.match(regex);
    return match ? match[1] : '';
};
exports.extractJobID = extractJobID;
