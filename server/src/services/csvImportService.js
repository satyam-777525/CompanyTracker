import csv from 'csv-parser';
import { Readable } from 'stream';
import Question from '../models/Question.js';
import { findOrCreateCompany, updateCompanyQuestionCount } from './companyService.js';
import { slugify, parsePercentage } from '../utils/helpers.js';

const parseCSVBuffer = (buffer) => {
  return new Promise((resolve, reject) => {
    const results = [];
    const stream = Readable.from(buffer.toString());
    stream
      .pipe(csv({
        mapHeaders: ({ header }) => header.trim().toLowerCase().replace(/\s+/g, '_'),
      }))
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
};

const extractCompanyFromFilename = (filename) => {
  const name = filename.replace(/\.csv$/i, '').replace(/[-_]/g, ' ');
  return name.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
};

export const importCSV = async (buffer, filename, companyId = null) => {
  const rows = await parseCSVBuffer(buffer);
  const summary = {
    total: rows.length,
    imported: 0,
    skipped: 0,
    errors: [],
  };

  let company;
  if (companyId) {
    const Company = (await import('../models/Company.js')).default;
    company = await Company.findById(companyId);
    if (!company) {
      throw new Error('Company not found');
    }
  } else {
    const companyName = extractCompanyFromFilename(filename);
    company = await findOrCreateCompany(companyName);
  }

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    try {
      const title = row.title || row.name;
      const url = row.url || row.link;
      const difficulty = row.difficulty;
      const questionNumber = parseInt(row.id || row.question_number || (i + 1), 10);

      if (!title || !url || !difficulty) {
        summary.errors.push({ row: i + 1, message: 'Missing required fields' });
        summary.skipped++;
        continue;
      }

      const normalizedDifficulty = difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase();
      if (!['Easy', 'Medium', 'Hard'].includes(normalizedDifficulty)) {
        summary.errors.push({ row: i + 1, message: `Invalid difficulty: ${difficulty}` });
        summary.skipped++;
        continue;
      }

      const slug = slugify(title);
      const existing = await Question.findOne({
        $or: [
          { company: company._id, slug },
          { company: company._id, questionNumber },
          { url },
        ],
      });

      if (existing) {
        summary.skipped++;
        continue;
      }

      await Question.create({
        questionNumber,
        title,
        slug,
        url,
        difficulty: normalizedDifficulty,
        acceptanceRate: parsePercentage(row['acceptance_%'] || row.acceptance_rate || row.acceptance),
        frequencyRate: parsePercentage(row['frequency_%'] || row.frequency_rate || row.frequency),
        company: company._id,
        leetcodeId: String(row.id || ''),
      });

      summary.imported++;
    } catch (err) {
      summary.errors.push({ row: i + 1, message: err.message });
      summary.skipped++;
    }
  }

  await updateCompanyQuestionCount(company._id);

  return { ...summary, company: { id: company._id, name: company.name, slug: company.slug } };
};
