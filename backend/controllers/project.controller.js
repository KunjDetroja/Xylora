const { default: mongoose } = require("mongoose");
const Project = require("../models/project.model");
const {
  catchResponse,
  successResponse,
  errorResponse,
} = require("../utils/response");
const { ObjectId } = mongoose.Types;
const projectService = require("../services/project.service");

// Create a new project
const createProject = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const response = await projectService.createProject(
      session,
      req.body,
      req.user
    );
    if (!response.isSuccess) {
      await session.abortTransaction();
      return errorResponse(res, response.code, response.message);
    }
    await session.commitTransaction();
    return successResponse(res, response.data, "Project created successfully");
  } catch (err) {
    console.error("Get Users Error:", err.message);
    await session.abortTransaction();
    return catchResponse(res);
  } finally {
    session.endSession();
  }
};

// update a project
const updateProject = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const response = await projectService.updateProject(
      session,
      req.params.id,
      req.body,
      req.user
    );
    if (!response.isSuccess) {
      await session.abortTransaction();
      return errorResponse(res, response.code, response.message);
    }
    await session.commitTransaction();
    return successResponse(
      res,
      response.project,
      "Project updated successfully"
    );
  } catch (err) {
    console.error("Update Project Error:", err.message);
    await session.abortTransaction();
    return catchResponse(res);
  } finally {
    session.endSession();
  }
};

// Add a Project Board Tag
const addProjectBoardTag = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const response = await projectService.updateProjectBoardTag(
      session,
      req.params.id,
      req.body,
      req.user,
      "add"
    );
    if (!response.isSuccess) {
      await session.abortTransaction();
      return errorResponse(res, response.code, response.message);
    }
    await session.commitTransaction();
    return successResponse(
      res,
      response.board,
      "Project board updated successfully"
    );
  } catch (err) {
    console.error("Add Project Board Tag Error:", err.message);
    await session.abortTransaction();
    return catchResponse(res);
  } finally {
    session.endSession();
  }
};

// update a project Board Tag
const updateProjectBoardTag = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const response = await projectService.updateProjectBoardTag(
      session,
      req.params.id,
      req.body,
      req.user,
      "update"
    );
    if (!response.isSuccess) {
      await session.abortTransaction();
      return errorResponse(res, response.code, response.message);
    }
    await session.commitTransaction();
    return successResponse(
      res,
      response.board,
      "Project board updated successfully"
    );
  } catch (err) {
    console.error("Update Project Board Error:", err.message);
    await session.abortTransaction();
    return catchResponse(res);
  } finally {
    session.endSession();
  }
};

// delete a project Board Tag
const deleteProjectBoardTag = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const response = await projectService.updateProjectBoardTag(
      session,
      req.params.id,
      req.body,
      req.user,
      "delete"
    );
    if (!response.isSuccess) {
      await session.abortTransaction();
      return errorResponse(res, response.code, response.message);
    }
    await session.commitTransaction();
    return successResponse(
      res,
      response.board,
      "Project board updated successfully"
    );
  } catch (err) {
    console.error("Delete Project Board Error:", err.message);
    await session.abortTransaction();
    return catchResponse(res);
  } finally {
    session.endSession();
  }
};

const addProjectBoardTask = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const response = await projectService.addProjectBoardTask(
      session,
      req.params.id,
      req.body,
      req.user,
      req.files
    );
    if (!response.isSuccess) {
      await session.abortTransaction();
      return errorResponse(res, response.code, response.message);
    }
    await session.commitTransaction();
    return successResponse(
      res,
      response.board,
      "Added task to project board successfully"
    );
  } catch (err) {
    console.error("Add Project Board Task Error:", err.message);
    await session.abortTransaction();
    return catchResponse(res);
  } finally {
    session.endSession();
  }
};

// update a project Board Task
const updateProjectBoardTask = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const response = await projectService.updateProjectBoardTask(
      session,
      req.params.project_id,
      req.params.task_id,
      req.body,
      req.user
    );
    if (!response.isSuccess) {
      await session.abortTransaction();
      return errorResponse(res, response.code, response.message);
    }
    await session.commitTransaction();
    return successResponse(
      res,
      response.board,
      "Updated task in project board successfully"
    );
  } catch (err) {
    console.error("Update Project Board Task Error:", err.message);
    await session.abortTransaction();
    return catchResponse(res);
  } finally {
    session.endSession();
  }
};

// update a project Board Task Attachment
const updateProjectBoardTaskAttachment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const response = await projectService.updateProjectBoardTaskAttachment(
      session,
      req.params.project_id,
      req.params.task_id,
      req.body,
      req.files,
      req.user
    );
    if (!response.isSuccess) {
      await session.abortTransaction();
      return errorResponse(res, response.code, response.message);
    }
    await session.commitTransaction();
    return successResponse(
      res,
      response.board,
      "Updated task attachment in project board successfully"
    );
  } catch (err) {
    console.error("Update Project Board Task Attachment Error:", err.message);
    await session.abortTransaction();
    return catchResponse(res);
  } finally {
    session.endSession();
  }
};

// Update a project Board Task Submission
const updateProjectBoardTaskSubmission = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const response = await projectService.updateProjectBoardTaskSubmission(
      session,
      req.params.project_id,
      req.params.task_id,
      req.body,
      req.user
    );
    if (!response.isSuccess) {
      await session.abortTransaction();
      return errorResponse(res, response.code, response.message);
    }
    await session.commitTransaction();
    return successResponse(
      res,
      response.data,
      "Updated task submission in project board successfully"
    );
  } catch (err) {
    console.error("Update Project Board Task Submission Error:", err.message);
    await session.abortTransaction();
    return catchResponse(res);
  } finally {
    session.endSession();
  }
};

// Update a project Board Task Finish
const updateProjectBoardTaskFinish = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const response = await projectService.updateProjectBoardTaskFinish(
      session,
      req.params.project_id,
      req.params.task_id,
      req.body,
      req.user
    );
    if (!response.isSuccess) {
      await session.abortTransaction();
      return errorResponse(res, response.code, response.message);
    }
    await session.commitTransaction();
    return successResponse(
      res,
      response.data,
      "Updated task finish in project board successfully"
    );
  } catch (err) {
    console.error("Update Project Board Task Finish Error:", err.message);
    await session.abortTransaction();
    return catchResponse(res);
  } finally {
    session.endSession();
  }
};

// delete a project Board Task
const deleteProjectBoardTask = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const response = await projectService.deleteProjectBoardTask(
      session,
      req.params.project_id,
      req.params.task_id,
      req.user
    );
    if (!response.isSuccess) {
      await session.abortTransaction();
      return errorResponse(res, response.code, response.message);
    }
    await session.commitTransaction();
    return successResponse(
      res,
      response.board,
      "Deleted task from project board successfully"
    );
  } catch (err) {
    console.error("Delete Project Board Task Error:", err.message);
    await session.abortTransaction();
    return catchResponse(res);
  } finally {
    session.endSession();
  }
};

// get by id
const getProjectById = async (req, res) => {
  try {
    const response = await projectService.getProjectById(
      req.params.id,
      req.user
    );
    if (!response.isSuccess) {
      return errorResponse(res, response.code, response.message);
    }
    return successResponse(
      res,
      response.project,
      "Project fetched successfully"
    );
  } catch (err) {
    console.error("Get Project Error:", err.message);
    return catchResponse(res);
  }
};

// Delete a project
const deleteProject = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const response = await projectService.deleteProject(
      session,
      req.params.id,
      req.user.organization_id
    );
    if (!response.isSuccess) {
      await session.abortTransaction();
      return errorResponse(res, response.code, response.message);
    }
    await session.commitTransaction();
    return successResponse(res, null, "Project deleted successfully");
  } catch (err) {
    console.error("Delete Project Error:", err.message);
    await session.abortTransaction();
    return catchResponse(res);
  } finally {
    session.endSession();
  }
};

// get all projects
const getAllProjects = async (req, res) => {
  try {
    const { organization_id } = req.user;
    const {
      page = 1,
      limit = 10,
      name,
      manager,
      members,
      is_active = "true",
      sort_by = "created_at",
      order = "desc",
    } = req.query;

    const pageNumber = Number.isInteger(parseInt(page, 10))
      ? parseInt(page, 10)
      : 1;
    const limitNumber = Number.isInteger(parseInt(limit, 10))
      ? parseInt(limit, 10)
      : 10;
    const skip = (pageNumber - 1) * limitNumber;

    const query = {};

    if (is_active === "true" || is_active === "false") {
      query.is_active = is_active === "true";
    }
    if (organization_id) {
      query.organization_id = organization_id;
    }
    if (name) {
      query.name = { $regex: name, $options: "i" };
    }
    if (manager) {
      query.manager = new ObjectId(manager);
    }
    if (members) {
      const membersArray = members
        .split(",")
        .map((member) => new ObjectId(member.trim()));
      query.members = { $in: membersArray };
    }
    const [projects, totalProjects] = await Promise.all([
      Project.find(query)
        .sort({ [sort_by]: order })
        .limit(limitNumber)
        .skip(skip)
        .populate("manager", "username avatar"),
      Project.countDocuments(query),
    ]);
    if (!projects) {
      return errorResponse(res, 404, "Projects not found");
    }
    const totalPages = Math.ceil(totalProjects / limitNumber);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const pagination = {
      totalItems: totalProjects,
      totalPages: totalPages,
      currentPage: pageNumber,
      limit: limitNumber,
      hasNextPage: hasNextPage,
      hasPrevPage: hasPrevPage,
    };
    return successResponse(
      res,
      {
        projects,
        pagination,
      },
      "Projects fetched successfully"
    );
  } catch (err) {
    console.error("Get Projects Error:", err.message);
    return catchResponse(res);
  }
};

// get All Project Board Tasks
const getAllProjectBoardTasks = async (req, res) => {
  try {
    const response = await projectService.getAllProjectBoardTasks(
      req.params.id,
      req.user,
      req.query
    );
    if (!response.isSuccess) {
      return errorResponse(res, response.code, response.message);
    }
    return successResponse(
      res,
      { tasks: response.data, pagination: response.pagination },
      "Project board tasks fetched successfully"
    );
  } catch (err) {
    console.error("Get Project Board Tasks Error:", err.message);
    return catchResponse(res);
  }
};

module.exports = {
  createProject,
  updateProject,
  addProjectBoardTag,
  updateProjectBoardTag,
  deleteProjectBoardTag,
  addProjectBoardTask,
  updateProjectBoardTask,
  updateProjectBoardTaskAttachment,
  updateProjectBoardTaskSubmission,
  updateProjectBoardTaskFinish,
  deleteProjectBoardTask,
  getProjectById,
  deleteProject,
  getAllProjects,
  getAllProjectBoardTasks,
};
