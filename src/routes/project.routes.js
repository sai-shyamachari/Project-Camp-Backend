import {Router} from "express";
import {getProjects , getProjectById , createProject , updateProject , deleteProject , addMembersToProject , getProjectMembers , updateMemberRole , deleteMember} from "../controllers/project.controller.js"
import { createProjectValidator , addMembersToProjectValidator} from "../validators/index.js"
import {validate} from "../middlewares/validator.middleware.js"
import {verifyJWT , validateProjectPermission} from "../middlewares/auth.middlewares.js"
import { AvailableUserRoles, UserRolesEnum } from "../utils/constants.js";


const router = Router();

router.use(verifyJWT);

router.
    route("/")
    .get(getProjects)
    .post(createProjectValidator , validate , createProject)

router.
    route("/:projectId")
    .get(validateProjectPermission(AvailableUserRoles), getProjectById)
    .put(validateProjectPermission([UserRolesEnum.ADMIN]) , createProjectValidator , validate , updateProject)
    .delete(validateProjectPermission([UserRolesEnum.ADMIN]) , deleteProject)

router
    .route("/:projectId/members")
    .get(getProjectMembers)
    .post(validateProjectPermission([UserRolesEnum.ADMIN]) , addMembersToProjectValidator , validate , addMembersToProject)

router
    .route("/:projectId/members/:userId")
    .put(validateProjectPermission([UserRolesEnum.ADMIN]),updateMemberRole)
    .delete(validateProjectPermission([UserRolesEnum.ADMIN]),deleteMember)



export default router;