const Job = require('../models/Job'); // Sequelize model
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, NotFoundError } = require('../errors');
const Sequelize = require('sequelize');
const moment = require('moment');

// Get all jobs with filtering, sorting, and pagination
const getAllJobs = async (req, res) => {
  const { search, status, jobType, sort, page = 1, limit = 10 } = req.query;

  const queryObject = {
    createdBy: req.user.userId,
  };

  // Search by position (case-insensitive)
  if (search) {
    queryObject.position = {
      [Sequelize.Op.iLike]: `%${search}%`,
    };
  }

  // Filter by status
  if (status && status !== 'all') {
    queryObject.status = status;
  }

  // Filter by jobType
  if (jobType && jobType !== 'all') {
    queryObject.jobType = jobType;
  }

  // Sorting options
  let order = [];
  if (sort === 'latest') {
    order = [['createdAt', 'DESC']];
  } else if (sort === 'oldest') {
    order = [['createdAt', 'ASC']];
  } else if (sort === 'a-z') {
    order = [['position', 'ASC']];
  } else if (sort === 'z-a') {
    order = [['position', 'DESC']];
  }

  // Pagination
  const offset = (page - 1) * limit;

  // Query jobs
  const { count: totalJobs, rows: jobs } = await Job.findAndCountAll({
    where: queryObject,
    order,
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  const numOfPages = Math.ceil(totalJobs / limit);

  res.status(StatusCodes.OK).json({ jobs, totalJobs, numOfPages });
};

// Get a single job
const getJob = async (req, res) => {
  const {
    user: { userId },
    params: { id: jobId },
  } = req;

  const job = await Job.findOne({
    where: {
      id: jobId,
      createdBy: userId,
    },
  });

  if (!job) {
    throw new NotFoundError(`No job with id ${jobId}`);
  }

  res.status(StatusCodes.OK).json({ job });
};

// Create a new job
const createJob = async (req, res) => {
  req.body.createdBy = req.user.userId;
  const job = await Job.create(req.body);
  res.status(StatusCodes.CREATED).json({ job });
};

// Update a job
const updateJob = async (req, res) => {
  
  const {
    body: { company, position },
    user: { userId },
    params: { id: jobId },
  } = req;

  if (!company || !position) {
    throw new BadRequestError('Company or Position fields cannot be empty');
  }
  
  
  const [updatedRowsCount, updatedJobs] = await Job.update(req.body, {
    where: {
      id: jobId,
      createdBy: userId,
    },
    returning: true, // Return updated rows (PostgreSQL-specific)
  });

  if (updatedRowsCount === 0) {
    throw new NotFoundError(`No job with id ${jobId}`);
  }

  res.status(StatusCodes.OK).json({ job: updatedJobs[0] });
};

// Delete a job
const deleteJob = async (req, res) => {
  const {
    user: { userId },
    params: { id: jobId },
  } = req;

  const deletedRowsCount = await Job.destroy({
    where: {
      id: jobId,
      createdBy: userId,
    },
  });

  if (deletedRowsCount === 0) {
    throw new NotFoundError(`No job with id ${jobId}`);
  }

  res.status(StatusCodes.OK).json({ msg: 'Success! Job Removed' });
};

// Show job statistics
const showStats = async (req, res) => {
  const userId = req.user.userId;

  // Aggregate stats by status
  const stats = await Job.findAll({
    attributes: [
      'status',
      [Sequelize.fn('COUNT', Sequelize.col('status')), 'count'],
    ],
    where: { createdBy: userId },
    group: ['status'],
  });

  const defaultStats = {
    pending: 0,
    interview: 0,
    declined: 0,
  };

  stats.forEach((stat) => {
    defaultStats[stat.status] = parseInt(stat.get('count'));
  });

  // Monthly applications
  const monthlyApplications = await Job.findAll({
    attributes: [
      [Sequelize.fn('DATE_TRUNC', 'month', Sequelize.col('createdAt')), 'date'],
      [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
    ],
    where: { createdBy: userId },
    group: [Sequelize.fn('DATE_TRUNC', 'month', Sequelize.col('createdAt'))],
    order: [[Sequelize.fn('DATE_TRUNC', 'month', Sequelize.col('createdAt')), 'DESC']],
    limit: 6,
  });

  const formattedMonthlyApplications = monthlyApplications.map((item) => {
    const date = moment(item.get('date')).format('MMM YYYY');
    const count = parseInt(item.get('count'));
    return { date, count };
  }).reverse();

  res.status(StatusCodes.OK).json({
    defaultStats,
    monthlyApplications: formattedMonthlyApplications,
  });
};

module.exports = {
  createJob,
  deleteJob,
  getAllJobs,
  updateJob,
  getJob,
  showStats,
};