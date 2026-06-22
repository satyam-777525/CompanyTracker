import * as adminService from '../services/adminService.js';
import * as csvImportService from '../services/csvImportService.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getDashboard = asyncHandler(async (req, res) => {
  const data = await adminService.getAdminDashboard();
  res.json({ success: true, data });
});

export const getLeaderboard = asyncHandler(async (req, res) => {
  const data = await adminService.getLeaderboard(req.query.period || 'alltime');
  res.json({ success: true, data });
});

export const getPlatformStats = asyncHandler(async (req, res) => {
  const data = await adminService.getPlatformStats();
  res.json({ success: true, data });
});

export const importCSV = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No CSV file uploaded' });
  }
  const result = await csvImportService.importCSV(
    req.file.buffer,
    req.file.originalname,
    req.body.companyId || null
  );
  res.json({ success: true, data: result });
});
