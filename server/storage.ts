import { type ModelSubmissionWithImage } from "@shared/schema";
import { randomUUID } from "crypto";

export interface StoredSubmission extends ModelSubmissionWithImage {
  id: string;
  submittedAt: Date;
}

export interface IStorage {
  saveSubmission(submission: ModelSubmissionWithImage): Promise<StoredSubmission>;
  getSubmissions(): Promise<StoredSubmission[]>;
  getSubmissionById(id: string): Promise<StoredSubmission | undefined>;
}

export class MemStorage implements IStorage {
  private submissions: Map<string, StoredSubmission>;

  constructor() {
    this.submissions = new Map();
  }

  async saveSubmission(submission: ModelSubmissionWithImage): Promise<StoredSubmission> {
    const id = randomUUID();
    const stored: StoredSubmission = {
      ...submission,
      id,
      submittedAt: new Date(),
    };
    this.submissions.set(id, stored);
    return stored;
  }

  async getSubmissions(): Promise<StoredSubmission[]> {
    return Array.from(this.submissions.values()).sort(
      (a, b) => b.submittedAt.getTime() - a.submittedAt.getTime()
    );
  }

  async getSubmissionById(id: string): Promise<StoredSubmission | undefined> {
    return this.submissions.get(id);
  }
}

export const storage = new MemStorage();
