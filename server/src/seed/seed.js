import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Company from '../models/Company.js';
import Question from '../models/Question.js';
import { slugify } from '../utils/helpers.js';
import { ROLES } from '../config/constants.js';

dotenv.config();

const companies = [
  { name: 'Amazon', logo: 'https://logo.clearbit.com/amazon.com' },
  { name: 'Google', logo: 'https://logo.clearbit.com/google.com' },
  { name: 'Microsoft', logo: 'https://logo.clearbit.com/microsoft.com' },
  { name: 'Adobe', logo: 'https://logo.clearbit.com/adobe.com' },
  { name: 'Meta', logo: 'https://logo.clearbit.com/meta.com' },
  { name: 'Netflix', logo: 'https://logo.clearbit.com/netflix.com' },
  { name: 'Uber', logo: 'https://logo.clearbit.com/uber.com' },
  { name: 'Atlassian', logo: 'https://logo.clearbit.com/atlassian.com' },
];

const sampleQuestions = [
  { title: 'Two Sum', difficulty: 'Easy', acceptanceRate: 57.5, frequencyRate: 100, url: 'https://leetcode.com/problems/two-sum/' },
  { title: 'Add Two Numbers', difficulty: 'Medium', acceptanceRate: 46.2, frequencyRate: 85, url: 'https://leetcode.com/problems/add-two-numbers/' },
  { title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', acceptanceRate: 37.1, frequencyRate: 92, url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/' },
  { title: 'Median of Two Sorted Arrays', difficulty: 'Hard', acceptanceRate: 44.3, frequencyRate: 70, url: 'https://leetcode.com/problems/median-of-two-sorted-arrays/' },
  { title: 'Longest Palindromic Substring', difficulty: 'Medium', acceptanceRate: 35.8, frequencyRate: 78, url: 'https://leetcode.com/problems/longest-palindromic-substring/' },
  { title: 'Valid Parentheses', difficulty: 'Easy', acceptanceRate: 42.5, frequencyRate: 95, url: 'https://leetcode.com/problems/valid-parentheses/' },
  { title: 'Merge Two Sorted Lists', difficulty: 'Easy', acceptanceRate: 66.8, frequencyRate: 88, url: 'https://leetcode.com/problems/merge-two-sorted-lists/' },
  { title: 'Maximum Subarray', difficulty: 'Medium', acceptanceRate: 52.1, frequencyRate: 90, url: 'https://leetcode.com/problems/maximum-subarray/' },
  { title: 'Climbing Stairs', difficulty: 'Easy', acceptanceRate: 53.4, frequencyRate: 82, url: 'https://leetcode.com/problems/climbing-stairs/' },
  { title: 'Best Time to Buy and Sell Stock', difficulty: 'Easy', acceptanceRate: 55.7, frequencyRate: 98, url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/' },
  { title: 'Binary Tree Level Order Traversal', difficulty: 'Medium', acceptanceRate: 70.2, frequencyRate: 75, url: 'https://leetcode.com/problems/binary-tree-level-order-traversal/' },
  { title: 'Word Break', difficulty: 'Medium', acceptanceRate: 48.9, frequencyRate: 68, url: 'https://leetcode.com/problems/word-break/' },
  { title: 'LRU Cache', difficulty: 'Medium', acceptanceRate: 45.6, frequencyRate: 88, url: 'https://leetcode.com/problems/lru-cache/' },
  { title: 'Serialize and Deserialize Binary Tree', difficulty: 'Hard', acceptanceRate: 59.3, frequencyRate: 72, url: 'https://leetcode.com/problems/serialize-and-deserialize-binary-tree/' },
  { title: 'Trapping Rain Water', difficulty: 'Hard', acceptanceRate: 65.4, frequencyRate: 80, url: 'https://leetcode.com/problems/trapping-rain-water/' },
];

const seed = async () => {
  try {
    await connectDB();
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Company.deleteMany({});
    await Question.deleteMany({});

    console.log('Creating admin user...');
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@companytracker.com',
      password: 'admin123',
      role: ROLES.ADMIN,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    });

    console.log('Creating demo user...');
    const user = await User.create({
      name: 'Demo User',
      email: 'demo@companytracker.com',
      password: 'demo123',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
      currentStreak: 3,
      bestStreak: 7,
    });

    console.log('Creating companies...');
    const createdCompanies = [];
    for (const c of companies) {
      const company = await Company.create({
        name: c.name,
        slug: slugify(c.name),
        logo: c.logo,
        description: `${c.name} coding interview questions curated for FAANG preparation.`,
        tags: ['faang', 'tech'],
      });
      createdCompanies.push(company);
    }

    console.log('Creating questions...');
    for (const company of createdCompanies) {
      for (let i = 0; i < sampleQuestions.length; i++) {
        const q = sampleQuestions[i];
        await Question.create({
          questionNumber: i + 1,
          title: q.title,
          slug: slugify(q.title),
          url: q.url,
          difficulty: q.difficulty,
          acceptanceRate: q.acceptanceRate,
          frequencyRate: q.frequencyRate,
          company: company._id,
          tags: ['array', 'string', 'tree', 'dp', 'graph'].slice(0, Math.floor(Math.random() * 3) + 1),
          curatedLists: i < 5 ? ['blind_75'] : i < 10 ? ['neetcode_150'] : [],
        });
      }
      await Company.findByIdAndUpdate(company._id, { totalQuestions: sampleQuestions.length });
    }

    console.log('\n✅ Seed completed!');
    console.log('\nAdmin: admin@companytracker.com / admin123');
    console.log('Demo:  demo@companytracker.com / demo123');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
