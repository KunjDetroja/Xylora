import { useState } from "react";
import {
  File,
  Maximize2,
  Paperclip,
  Trash2,
  Loader2,
  FileText,
  FileSpreadsheet,
  Download,
  ImageIcon,
  Film,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import toast from "react-hot-toast";
import { useUpdateAttachmentMutation } from "@/services/grievance.service";
import FileUploadComponent from "./FileUpload";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const FILE_TYPES = {
  "application/pdf": {
    icon: <FileText className="w-6 h-6 text-red-600 dark:text-red-400" />,
    color: "bg-red-500/10",
    label: "PDF",
  },
  "application/msword": {
    icon: <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
    color: "bg-blue-500/10",
    label: "Word",
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
    icon: <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
    color: "bg-blue-500/10",
    label: "Word",
  },
  "application/vnd.ms-powerpoint": {
    icon: (
      <FileSpreadsheet className="w-6 h-6 text-orange-600 dark:text-orange-400" />
    ),
    color: "bg-orange-500/10",
    label: "PowerPoint",
  },
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": {
    icon: (
      <FileSpreadsheet className="w-6 h-6 text-orange-600 dark:text-orange-400" />
    ),
    color: "bg-orange-500/10",
    label: "PowerPoint",
  },
  "text/plain": {
    icon: <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />,
    color: "bg-green-500/10",
    label: "Text",
  },
  "text/markdown": {
    icon: <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />,
    color: "bg-purple-500/10",
    label: "Markdown",
  },
};

const MediaTypeIndicator = ({ type }) => {
  let icon = <FileText className="w-4 h-4" />;
  let label = "File";
  let bgColor = "bg-gray-500";

  if (type?.startsWith("image/")) {
    icon = <ImageIcon className="w-4 h-4 backdrop-blur-md" />;
    label = "Image";
    bgColor = "bg-blue-500 dark:bg-black/50";
  } else if (type?.startsWith("video/")) {
    icon = <Film className="w-4 h-4" />;
    label = "Video";
    bgColor = "bg-purple-500 dark:bg-black/50";
  } else if (FILE_TYPES[type]) {
    label = FILE_TYPES[type].label;
    bgColor = "bg-gray-500 dark:bg-black/50";
  }

  return (
    <Tooltip>
      <TooltipTrigger
        className={`absolute top-1 right-1 ${bgColor} bg-opacity-75 p-1 rounded-md`}
      >
        {icon}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
};

const AttachmentManager = ({
  uploadModal,
  setUploadModal,
  grievanceId,
  existingAttachments = [],
  onUpdate,
  canEdit,
}) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewModal, setPreviewModal] = useState({
    open: false,
    content: null,
  });
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    attachment: null,
  });
  const [deleting, setDeleting] = useState(false);
  const [selectedAttachments, setSelectedAttachments] = useState([]);
  const [loadingMedia, setLoadingMedia] = useState({});

  const [updateAttachment] = useUpdateAttachmentMutation();

  const handleUpload = async () => {
    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    files.forEach(({ file }) => formData.append("attachments", file));

    try {
      const response = await updateAttachment({
        id: grievanceId,
        data: formData,
      }).unwrap();
      onUpdate(response.data);
      setFiles([]);
      setUploadModal(false);
      toast.success("Attachments uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.data.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (attachmentsToDelete) => {
    if (!attachmentsToDelete || attachmentsToDelete.length === 0) return;

    setDeleting(true);
    try {
      const data = { delete_attachments: attachmentsToDelete };
      const response = await updateAttachment({
        id: grievanceId,
        data,
      }).unwrap();
      onUpdate(response.data);
      toast.success("Attachments deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error?.data?.message || "Failed to delete attachments");
    } finally {
      setDeleting(false);
      setDeleteDialog({ open: false, attachments: [] });
      setSelectedAttachments([]);
    }
  };

  const handlePreview = (file) => {
    if (file.filetype?.startsWith("image/")) {
      setPreviewModal({
        open: true,
        content: (
          <img
            src={file.url}
            alt="Preview"
            className="max-h-[80vh] max-w-full"
          />
        ),
      });
    } else if (file.filetype?.startsWith("video/")) {
      setPreviewModal({
        open: true,
        content: (
          <video controls src={file.url} className="max-h-[80vh] max-w-full" />
        ),
      });
    }
  };

  const toggleSelectAttachment = (attachmentId) => {
    setSelectedAttachments((prevSelected) =>
      prevSelected.includes(attachmentId)
        ? prevSelected.filter((id) => id !== attachmentId)
        : [...prevSelected, attachmentId]
    );
  };

  const handleDeleteSelected = () => {
    if (selectedAttachments.length > 0) {
      setDeleteDialog({ open: true, attachments: selectedAttachments });
    }
  };

  const handleMediaLoad = (attachmentId) => {
    setLoadingMedia((prev) => ({
      ...prev,
      [attachmentId]: false,
    }));
  };

  const handleMediaError = (attachmentId) => {
    setLoadingMedia((prev) => ({
      ...prev,
      [attachmentId]: false,
    }));
    toast.error(`Failed to load media: ${attachmentId}`);
  };

  const handleImageVideoRender = (attachment) => {
    // Initialize loading state for this media if not already set
    if (
      loadingMedia[attachment._id] === undefined &&
      (attachment.filetype?.startsWith("image/") ||
        attachment.filetype?.startsWith("video/"))
    ) {
      setLoadingMedia((prev) => ({
        ...prev,
        [attachment._id]: true,
      }));
    }

    return (
      <>
        <div
          className={`relative group w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden cursor-pointer ${
            selectedAttachments.includes(attachment._id)
              ? "ring-2 ring-blue-500"
              : ""
          }`}
        >
          <MediaTypeIndicator type={attachment.filetype} />

          {loadingMedia[attachment._id] && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
              <Loader2 className="w-6 h-6 animate-spin text-gray-500 dark:text-gray-400" />
            </div>
          )}

          {attachment.filetype?.startsWith("image/") ? (
            <img
              src={attachment.url}
              alt={attachment.filename}
              className={`object-cover w-32 h-32 transition-opacity duration-300 ${
                loadingMedia[attachment._id] ? "opacity-0" : "opacity-100"
              }`}
              onLoad={() => handleMediaLoad(attachment._id)}
              onError={() => handleMediaError(attachment._id)}
            />
          ) : (
            <video
              className={`h-32 w-32 object-cover rounded transition-opacity duration-300 ${
                loadingMedia[attachment._id] ? "opacity-0" : "opacity-100"
              }`}
              onLoadedData={() => handleMediaLoad(attachment._id)}
              onError={() => handleMediaError(attachment._id)}
            >
              <source src={attachment.url} type={attachment.filetype} />
            </video>
          )}

          <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handlePreview(attachment);
              }}
              className="hover:bg-gray-100 dark:hover:bg-white/20"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            {canEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteDialog({
                    open: true,
                    attachments: [attachment._id],
                  });
                }}
                className="text-red-500 hover:text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/30"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <Tooltip>
          <TooltipTrigger className="w-full text-black dark:text-white text-xs my[6px] text-center p-1 truncate">
            {attachment.filename}
          </TooltipTrigger>
          <TooltipContent>{attachment.filename}</TooltipContent>
        </Tooltip>
      </>
    );
  };

  const handleFileRender = (attachment) => {
    return (
      <>
        <div
          className={`relative group w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden cursor-pointer ${
            selectedAttachments.includes(attachment._id)
              ? "ring-2 ring-blue-500"
              : ""
          }`}
        >
          <MediaTypeIndicator type={attachment.filetype} />

          <div className="h-32 w-32 flex items-center justify-center">
            {FILE_TYPES[attachment.filetype]?.icon || (
              <File className="h-6 w-6 text-gray-500 dark:text-slate-400" />
            )}
          </div>
          <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <a
              href={attachment.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="h-9 rounded-md px-[10px] text-blue-500 hover:text-blue-600 dark:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/30"
            >
              <Download className="h-4 w-4 mt-2" />
            </a>
            {canEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteDialog({
                    open: true,
                    attachments: [attachment._id],
                  });
                }}
                className="text-red-500 hover:text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/30"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <Tooltip>
          <TooltipTrigger className="w-full text-black dark:text-white text-xs my[6px] text-center p-1 truncate">
            {attachment.filename}
          </TooltipTrigger>
          <TooltipContent>{attachment.filename}</TooltipContent>
        </Tooltip>
      </>
    );
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2 relative">
        <h3 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 flex items-center gap-2">
          <Paperclip className="h-5 w-5" /> Attachments (
          {existingAttachments.length})
        </h3>

        {selectedAttachments.length > 0 && canEdit && (
          <div className="flex items-center gap-2 absolute -top-3 right-0 !mt-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedAttachments([])}
              className="text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700/50"
            >
              Cancel
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteSelected}
              className="text-red-500 hover:text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/20"
            >
              <Trash2 className="h-4 w-4 mr-[6px]" />
              Delete ({selectedAttachments.length})
            </Button>
          </div>
        )}

        <div className="flex overflow-x-auto space-x-4 p-2 max-w-[645px]">
          {existingAttachments.map((attachment) => (
            <div
              key={attachment._id}
              className={`relative shrink-0 group w-32 rounded-lg ${
                canEdit ? "cursor-pointer" : "cursor-default"
              }`}
              onClick={
                canEdit
                  ? () => toggleSelectAttachment(attachment._id)
                  : undefined
              }
            >
              {attachment.filetype?.startsWith("image/") ||
              attachment.filetype?.startsWith("video/")
                ? handleImageVideoRender(attachment)
                : handleFileRender(attachment)}
            </div>
          ))}
        </div>

        {existingAttachments.length === 0 && (
          <div className="text-gray-500 !mt-4 ml-6 dark:text-slate-400 text-sm">
            No attachments found
          </div>
        )}
      </div>

      <Dialog open={uploadModal} onOpenChange={setUploadModal}>
        <DialogContent className="bg-white dark:bg-gray-900 max-w-xl">
          <DialogTitle className="text-gray-900 dark:text-white">
            Upload Attachments
          </DialogTitle>
          <DialogDescription className="text-gray-500 dark:text-gray-400">
            Add Image, Video or file upto 5 files
          </DialogDescription>
          <FileUploadComponent
            files={files}
            onFilesChange={setFiles}
            onUpload={handleUpload}
            uploading={uploading}
            uploadProgress={uploadProgress}
            existingFiles={existingAttachments}
            shouldShowExistingFiles={false}
            onRemoveExisting={(id) => {
              // Handle existing file removal
              console.log("Remove existing file:", id);
            }}
            canEdit={canEdit}
          />
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <Dialog
        open={previewModal.open}
        onOpenChange={() => setPreviewModal({ open: false, content: null })}
      >
        <DialogContent
          shouldRemoveCloseIcon={true}
          className="sm:max-w-3xl w-fit dark:bg-transparent border-none"
        >
          <DialogTitle className="hidden">Attachment Preview</DialogTitle>
          <DialogDescription></DialogDescription>
          <div className="flex justify-center">{previewModal.content}</div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          setDeleteDialog({ open, attachments: deleteDialog.attachments || [] })
        }
      >
        <AlertDialogContent className="bg-slate-900 dark:border-2 dark:border-white/20">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Attachments</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the selected attachments? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="dark:bg-transparent dark:hover:bg-slate-800/50">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDelete(deleteDialog.attachments)}
              className="bg-red-500 hover:bg-red-600"
              disabled={deleting}
            >
              {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AttachmentManager;
