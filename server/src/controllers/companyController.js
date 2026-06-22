import * as companyService from '../services/companyService.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getCompanies = asyncHandler(async (req, res) => {
  const result = await companyService.getAllCompanies({
    search: req.query.search,
    sort: req.query.sort,
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 20,
    userId: req.user?._id,
  });
  res.json({ success: true, data: result });
});

export const getCompany = asyncHandler(async (req, res) => {
  const company = await companyService.getCompanyBySlug(req.params.slug, req.user?._id);
  res.json({ success: true, data: company });
});

export const createCompany = asyncHandler(async (req, res) => {
  const company = await companyService.createCompany(req.body);
  res.status(201).json({ success: true, data: company });
});

export const updateCompany = asyncHandler(async (req, res) => {
  const company = await companyService.updateCompany(req.params.id, req.body);
  res.json({ success: true, data: company });
});

export const deleteCompany = asyncHandler(async (req, res) => {
  const result = await companyService.deleteCompany(req.params.id);
  res.json({ success: true, data: result });
});
