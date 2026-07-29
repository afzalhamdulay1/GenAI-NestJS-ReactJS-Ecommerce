import React from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Rating } from "@mui/material";

interface SubmitReviewDialogProps {
  open: boolean;
  onClose: () => void;
  rating: number;
  setRating: (rating: number) => void;
  comment: string;
  setComment: (comment: string) => void;
  onSubmit: () => void;
}

const SubmitReviewDialog: React.FC<SubmitReviewDialogProps> = ({
  open,
  onClose,
  rating,
  setRating,
  comment,
  setComment,
  onSubmit,
}) => {
  return (
    <Dialog
      aria-labelledby="simple-dialog-title"
      open={open}
      onClose={onClose}
    >
      <DialogTitle>Submit Review</DialogTitle>
      <DialogContent className="submitDialog">
        <Rating
          onChange={(_e, newValue) => setRating(newValue || 0)}
          value={rating}
          size="large"
        />

        <textarea
          className="submitDialogTextArea"
          cols={30}
          rows={5}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        ></textarea>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={onSubmit} color="primary">
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SubmitReviewDialog;
