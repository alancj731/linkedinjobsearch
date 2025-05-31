import { Client } from "pg";
import { JOBINFO, JOBINFOWITHID } from "src/types/jobInfo";
import dotenv from "dotenv";
dotenv.config();

const connectionString = process.env.DATABASE_URL;

export default class postgresDB {
  public static instance: postgresDB;
  private client: Client;

  private constructor() {
    if (!connectionString) {
      throw new Error("DATABASE_URL is not set");
    }
    this.client = new Client({
      connectionString,
      ssl: {
        rejectUnauthorized: false,
      },
    });
  }

  public static getInstance(): postgresDB {
    if (!postgresDB.instance) {
      postgresDB.instance = new postgresDB();
    }
    return postgresDB.instance;
  }

  public async getAllJobIDs(): Promise<string[]> {
    try {
      const res = await this.client.query("SELECT job_id FROM jobs");
      return res.rows.map((row) => row.job_id);
    } catch (error) {
      console.error("Error fetching job IDs:", error);
      throw error;
    }
  }

  public async truncateTable(table: string): Promise<void> {
    try {
      await this.client.query(`TRUNCATE TABLE ${table} RESTART IDENTITY`);
      console.log(`✅ Table ${table} truncated successfully`);
    }
    catch (error) {
      console.error(`❌ Error truncating table ${table}:`, error);
      throw error;
    }
  }

  public async insertJobs(table: string, jobs: JOBINFOWITHID[]): Promise<void> {
    if (jobs.length === 0) return;
    try {
      const values: string[] = [];
      const placeholders: string[] = [];

      jobs.forEach((job, i) => {
        const idx = i * 6;
        placeholders.push(
          `($${idx + 1}, $${idx + 2}, $${idx + 3}, $${idx + 4}, $${idx + 5}, $${idx + 6})`
        );
        values.push(
          job.title,
          job.company,
          job.location,
          job.link,
          job.postedTime,
          job.job_id
        );
      });

      const query = `
      INSERT INTO ${table} (title, company, location, link, posted_time, job_id)
      VALUES ${placeholders.join(", ")}
      `;

      try {
        await this.client.query("BEGIN");
        await this.client.query(query, values);
        await this.client.query("COMMIT");
      } catch (error) {
        await this.client.query("ROLLBACK");
        console.error("Error inserting jobs:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error connecting to PostgreSQL:", error);
      throw error;
    }
  }

  public async connect(): Promise<void> {
    try {
      await this.client.connect();
      console.log("✅ PostgreSQL connection successful");
    } catch (error) {
      console.error("❌ PostgreSQL connection failed:", error);
      throw error;
    }
  }
  public async disconnect(): Promise<void> {
    try {
      await this.client.end();
    } catch (error) {
      console.error("❌ PostgreSQL disconnection failed:", error);
      throw error;
    }
  }
}
