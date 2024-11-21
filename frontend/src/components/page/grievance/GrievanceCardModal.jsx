/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RoutableModal } from "@/components/ui/RoutedModal";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Building2,
  AlertTriangle,
  Clock,
  Paperclip,
  X,
  Loader2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import cn from "classnames";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import GrievanceModalSkeleton from "./GreievanceCardModalSkeleton";
import AttachmentManager from "./MediaManager";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useDeleteGrievanceByIdMutation,
  useGetGrievanceByIdQuery,
  useUpdateGrievanceAssigneeMutation,
  useUpdateGrievanceMutation,
  useUpdateGrievanceStatusMutation,
} from "@/services/grievance.service";
import EditableDescription from "./EditableDescription";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ActionComboBoxButton from "./ActionComboBoxButton";
import { useGetAllDepartmentNameQuery } from "@/services/department.service";
import { useGetAllUserNamesQuery } from "@/services/user.service";
import EditableTitle from "./EditableTitle";
import useSocket from "@/utils/useSocket";

const PRIORITY_BADGES = {
  low: { color: "bg-green-500/10 text-green-500", label: "Low" },
  medium: { color: "bg-yellow-500/10 text-yellow-500", label: "Medium" },
  high: { color: "bg-red-500/10 text-red-500", label: "High" },
};

const STATUS_BADGES = {
  submitted: { color: "bg-blue-500/10 text-blue-500", label: "Submitted" },
  "in-progress": {
    color: "bg-yellow-500/10 text-yellow-500",
    label: "In Progress",
  },
  resolved: { color: "bg-green-500/10 text-green-500", label: "Resolved" },
  dismissed: { color: "bg-slate-500/10 text-slate-500", label: "Dismissed" },
};

function GrievanceModal() {
  const { id: grievanceId } = useParams();
  const [attachmentModalOpen, setAttachmentModalOpen] = useState(false);
  const [grievance, setGrievance] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Add states to track select open states
  const [isStatusSelectOpen, setIsStatusSelectOpen] = useState(false);
  const [isPrioritySelectOpen, setIsPrioritySelectOpen] = useState(false);

  const [updateGrievance] = useUpdateGrievanceMutation();
  const [updateGrievanceAssignee] = useUpdateGrievanceAssigneeMutation();
  const [updateGrievanceStatus] = useUpdateGrievanceStatusMutation();
  const [deleteGrievance] = useDeleteGrievanceByIdMutation();
  const { data: departments, isLoading: departmentLoading } =
    useGetAllDepartmentNameQuery();
  const { data: users, isLoading: usersLoading } = useGetAllUserNamesQuery();
  const navigate = useNavigate();

  const socket = useSocket();

  const {
    data: grievanceData,
    isLoading,
    refetch,
  } = useGetGrievanceByIdQuery(grievanceId, {
    skip: !grievanceId,
  });

  useEffect(() => {
    if (grievanceData) {
      setGrievance(grievanceData);
    }
  }, [grievanceData]);

  const userPermissions = useSelector((state) => state.user.permissions);
  const user = useSelector((state) => state.user.user);

  const canEditStatus =
    userPermissions.includes("UPDATE_GRIEVANCE") ||
    user._id === grievance?.data?.assigned_to?._id.toString();
  const canEditPriority =
    userPermissions.includes("UPDATE_GRIEVANCE") ||
    user._id === grievance?.data?.reported_by?._id;
  const canEditAssignee = userPermissions.includes("UPDATE_GRIEVANCE_ASSIGNEE");
  const canEditAttachments = user._id === grievance?.data?.reported_by?._id;
  const canEditGrievance = userPermissions.includes("UPDATE_GRIEVANCE");
  const canEditTitleAndDescription =
    user._id === grievance?.data?.reported_by?._id;
  const canDeleteGrievance =
    userPermissions.includes("DELETE_GRIEVANCE") ||
    user._id === grievance?.data?.assigned_to?._id.toString();

  const handleUpdateGrievance = async (data) => {
    try {
      const response = await updateGrievance({
        id: grievanceId,
        data,
      }).unwrap();
      refetch();
      setGrievance(grievanceData);
      toast.success(response.message);
    } catch (error) {
      console.error("Failed to update grievance:", error);
      toast.error(error.data.message);
    }
  };

  const handleUpdateGrievanceAssignee = async (assigneeId) => {
    try {
      const response = await updateGrievanceAssignee({
        id: grievanceId,
        data: { assigned_to: assigneeId },
      }).unwrap();
      refetch();
      setGrievance(grievanceData);
      toast.success(response.message);
    } catch (error) {
      console.error("Failed to update assignee:", error);
      toast.error(error.data.message);
    }
  };

  const handleUpdateGrievanceStatus = async (status) => {
    try {
      const response = await updateGrievanceStatus({
        id: grievanceId,
        data: { status },
      }).unwrap();
      refetch();
      setGrievance(grievanceData);
      toast.success(response.message);
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error(error.data.message);
    }
  };

  const handleCloseGrievance = async () => {
    setDeleting(true);
    try {
      const response = await deleteGrievance(grievanceId).unwrap();
      toast.success(response.message);
      navigate(-1);
    } catch (error) {
      console.error("Failed to close grievance:", error);
      toast.error("Failed to close grievance");
    } finally {
      setDeleting(false);
    }
  };

  const handleClose = () => {
    // Only allow closing if no select is open
    if (!isStatusSelectOpen && !isPrioritySelectOpen) {
      navigate(-1);
    }
  };

  // exclude the current assignee and reported user from the list of users
  const usersList = users?.data
    ?.map((user) => {
      return {
        label: user.username,
        value: user._id,
        image: user.avatar,
      };
    })
    .filter((user) => {
      return (
        user.value !== grievance?.data?.assigned_to?._id &&
        user.value !== grievance?.data?.reported_by?._id
      );
    });

  // exclude the current department from the list of departments
  const departmentsList = departments?.data
    ?.map((department) => {
      return {
        label: department.name,
        value: department._id,
      };
    })
    .filter((department) => {
      return department.value !== grievance?.data?.department_id?._id;
    });

  const handleGrievanceUpdate = (data) => {
    if (grievanceId === data.grievanceId) {
      // update data but not the attachments
      setGrievance((prevGrievance) => {
        const updatedData = {
          ...prevGrievance,
          data: {
            ...prevGrievance.data,
            ...data.updatedData,
          },
        };
        return updatedData;
      });
    }
  };

  const handleDeleteGrievance = (data) => {
    if (grievanceId === data.grievanceId) {
      navigate(-1);
    }
  };

  useEffect(() => {
    socket.on("update_grievance", handleGrievanceUpdate);
    socket.on("update_grievance_assignee", handleGrievanceUpdate);
    socket.on("update_grievance_status", handleGrievanceUpdate);
    socket.on("delete_grievance", handleDeleteGrievance);
    return () => {
      socket.off("update_grievance");
      socket.off("update_grievance_assignee");
      socket.off("update_grievance_status");
      socket.off("delete_grievance");
    };
  }, [socket]);

  return (
    <RoutableModal
      backTo="/grievances"
      width="max-w-4xl"
      shouldRemoveCloseIcon={true}
      onPointerDownOutside={(e) => {
        // Prevent modal from closing if any select is open
        if (isStatusSelectOpen || isPrioritySelectOpen) {
          e.preventDefault();
        }
      }}
    >
      {isLoading && <GrievanceModalSkeleton />}
      {!isLoading && (
        <div className="bg-gray-100 dark:bg-slate-800 rounded-lg w-full max-h-[90vh] focus:border-red-700 focus-within:border-red-700 focus-visible:border-red-700 overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="p-4 flex items-start justify-between border-gray-200 dark:border-slate-700">
              <div className="flex-1">
                <EditableTitle
                  grievance={grievance}
                  canEditTitle={canEditTitleAndDescription}
                  handleUpdateGrievance={handleUpdateGrievance}
                />
                <div className="flex items-center gap-2 mt-3">
                  {grievance?.data?.priority && (
                    <Badge
                      className={cn(
                        "font-medium",
                        PRIORITY_BADGES[grievance.data.priority].color
                      )}
                    >
                      {PRIORITY_BADGES[grievance.data.priority].label}
                    </Badge>
                  )}
                  {grievance?.data?.status && (
                    <Badge
                      className={cn(
                        "font-medium",
                        STATUS_BADGES[grievance.data.status].color
                      )}
                    >
                      {STATUS_BADGES[grievance.data.status].label}
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-600/50"
                onClick={handleClose}
              >
                <X className="h-5 w-5" />
              </Button>
            </DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>

          <Separator className="w-[97%] mx-auto bg-gray-200 dark:bg-white/10 h-[1px]" />

          <div className="flex-1 overflow-y-auto">
            <div className="p-4 flex gap-6">
              {/* Left Column - Main Content */}
              <div className="flex-1 space-y-6">
                <div className="flex flex-wrap gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 dark:text-slate-300 mb-2">
                      Reported By
                    </h3>
                    <div className="flex items-center gap-2">
                      <Tooltip>
                        <TooltipTrigger>
                          <Avatar>
                            <AvatarImage
                              src={grievance?.data?.reported_by?.avatar}
                              alt={grievance?.data?.reported_by?.username}
                            />
                            <AvatarFallback>
                              {grievance?.data?.reported_by?.username[0]}
                            </AvatarFallback>
                          </Avatar>
                        </TooltipTrigger>
                        <TooltipContent>
                          {grievance?.data?.reported_by?.username}
                        </TooltipContent>
                      </Tooltip>
                      <span className="text-gray-700 dark:text-slate-300">
                        {grievance?.data?.reported_by?.username || "User"}
                      </span>
                    </div>
                  </div>
                  {grievance?.data?.assigned_to && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-600 dark:text-slate-300 mb-2">
                        Assigned To
                      </h3>
                      <div className="flex items-center gap-2">
                        <Tooltip>
                          <TooltipTrigger>
                            <Avatar>
                              <AvatarImage
                                src={grievance?.data?.assigned_to?.avatar}
                                alt={grievance?.data?.assigned_to?.username}
                              />
                              <AvatarFallback>
                                {grievance?.data?.assigned_to?.username[0]}
                              </AvatarFallback>
                            </Avatar>
                          </TooltipTrigger>
                          <TooltipContent>
                            {grievance?.data?.assigned_to?.username}
                          </TooltipContent>
                        </Tooltip>
                        <span className="text-gray-700 dark:text-slate-300">
                          {grievance.data.assigned_to.username}
                        </span>
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-medium text-gray-600 dark:text-slate-300 mb-2">
                      Department
                    </h3>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-gray-400 dark:text-slate-400" />
                      <span className="text-gray-700 dark:text-slate-300">
                        {grievance?.data?.department_id?.name || "Department"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <EditableDescription
                  description={grievance?.data?.description}
                  canEdit={canEditTitleAndDescription}
                  onSave={(content) => {
                    handleUpdateGrievance({ description: content });
                  }}
                />

                {/* Attachments section remains the same */}
                <AttachmentManager
                  grievanceId={grievanceId}
                  existingAttachments={grievance?.data?.attachments || []}
                  uploadModal={attachmentModalOpen}
                  setUploadModal={setAttachmentModalOpen}
                  canEdit={canEditAttachments}
                  onUpdate={(updatedGrievance) => {
                    // Handle the updated grievance data
                  }}
                />
              </div>

              {/* Right Column - Actions */}
              <div className="w-48 space-y-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400">
                    Status
                  </h4>
                  {canEditStatus ? (
                    <Select
                      value={grievance?.data?.status}
                      modal={false}
                      onValueChange={(value) => {
                        handleUpdateGrievanceStatus(value);
                      }}
                      onOpenChange={setIsStatusSelectOpen}
                    >
                      <SelectTrigger className="w-full bg-white hover:bg-gray-50 dark:bg-slate-900/70 dark:hover:bg-slate-900/50">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-slate-900">
                        {Object.entries(STATUS_BADGES).map(
                          ([value, { label, color }]) => (
                            <SelectItem
                              key={value}
                              value={value}
                              className="hover:bg-gray-100 dark:hover:bg-slate-700/50"
                            >
                              <span
                                className={`px-2 py-1 rounded text-sm ${color}`}
                              >
                                {label}
                              </span>
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div
                      className={`px-2 py-2 rounded-md w-full text-sm bg-white dark:bg-slate-900/70 border border-gray-200 dark:border-input/50 ${
                        STATUS_BADGES[grievance?.data?.status]?.color
                      }`}
                    >
                      {STATUS_BADGES[grievance?.data?.status]?.label}
                    </div>
                  )}

                  <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400 mt-4">
                    Priority
                  </h4>
                  {canEditPriority ? (
                    <Select
                      value={grievance?.data?.priority}
                      onValueChange={(value) => {
                        handleUpdateGrievance({ priority: value });
                      }}
                      onOpenChange={setIsPrioritySelectOpen}
                    >
                      <SelectTrigger className="w-full bg-white hover:bg-gray-50 dark:bg-slate-900/70 dark:hover:bg-slate-900/50">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-slate-900">
                        {Object.entries(PRIORITY_BADGES).map(
                          ([value, { label, color }]) => (
                            <SelectItem
                              key={value}
                              value={value}
                              className="hover:bg-gray-100 dark:hover:bg-slate-600/50"
                            >
                              <span
                                className={`px-2 py-1 rounded text-sm ${color}`}
                              >
                                {label}
                              </span>
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div
                      className={`px-2 py-2 rounded-md w-full text-sm bg-white dark:bg-slate-900/70 border border-gray-200 dark:border-input/50 ${
                        PRIORITY_BADGES[grievance?.data?.priority]?.color
                      }`}
                    >
                      {PRIORITY_BADGES[grievance?.data?.priority]?.label}
                    </div>
                  )}
                </div>

                {canEditAttachments && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400">
                      Add to card
                    </h4>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-black/5 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-700/50"
                      onClick={() => setAttachmentModalOpen(true)}
                    >
                      <Paperclip className="h-4 w-4 mr-2" />
                      Attachment
                    </Button>
                  </div>
                )}

                {(canEditGrievance ||
                  canEditAssignee ||
                  canDeleteGrievance) && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400">
                      Actions
                    </h4>
                    {canEditAssignee && (
                      <ActionComboBoxButton
                        buttonLabel="Change Assignee"
                        buttonIcon={Users}
                        shouldShowUserAvatar={true}
                        options={usersList}
                        onSelect={(option) => {
                          handleUpdateGrievanceAssignee(option.value);
                        }}
                      />
                    )}
                    {canEditGrievance && (
                      <ActionComboBoxButton
                        buttonLabel="Change Department"
                        buttonIcon={Building2}
                        options={departmentsList}
                        onSelect={(option) => {
                          handleUpdateGrievance({
                            department_id: option.value,
                          });
                        }}
                      />
                    )}
                    {canDeleteGrievance && grievance?.data?.is_active && (
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-200/30 dark:text-red-400 dark:hover:bg-red-500/10"
                        onClick={() => {
                          setDeleteDialog(true);
                        }}
                      >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Close Grievance
                      </Button>
                    )}
                  </div>
                )}
                <div className="pt-4 border-t border-gray-200 dark:border-slate-700 !mb-2">
                  <div className="text-sm text-gray-500 dark:text-slate-400 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Created{" "}
                    {new Date(
                      grievance?.data?.date_reported
                    ).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <AlertDialog
        open={deleteDialog}
        onOpenChange={(open) => setDeleteDialog(open ? true : false)}
      >
        <AlertDialogContent className="bg-slate-900 dark:border-2 dark:border-white/20">
          <AlertDialogHeader>
            <AlertDialogTitle>Close Grievance</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to close &quot;
              {grievance?.data?.title}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="dark:bg-transparent dark:hover:bg-slate-800/50">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCloseGrievance}
              className="bg-red-500 hover:bg-red-600"
              disabled={deleting}
            >
              {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </RoutableModal>
  );
}

export default GrievanceModal;
