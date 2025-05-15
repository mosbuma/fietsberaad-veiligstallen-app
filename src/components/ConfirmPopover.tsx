import React, { useState } from 'react';
import { Popover, Button, Typography, Box } from '@mui/material';

interface ConfirmPopoverProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export const ConfirmPopover: React.FC<ConfirmPopoverProps> = ({
  open,
  anchorEl,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Bevestigen",
  cancelText = "Annuleren"
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
    >
      <Box sx={{ p: 2, maxWidth: 300 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          {message}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button 
            variant="outlined" 
            onClick={onClose}
            size="small"
          >
            {cancelText}
          </Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={handleConfirm}
            size="small"
          >
            {confirmText}
          </Button>
        </Box>
      </Box>
    </Popover>
  );
}; 