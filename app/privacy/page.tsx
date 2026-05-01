"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useRouter } from "next/navigation";

export default function PrivacyPage() {
  const router = useRouter();
  const [open, setOpen] = React.useState(true);

  const handleClose = () => {
    setOpen(false);
    // Navigate back after a short delay to allow modal animation
    const timer = setTimeout(() => {
      router.back();
    }, 300);
    return () => clearTimeout(timer);
  };

  return (
    <>
      {open && (
        <Dialog
          open={open}
          onClose={handleClose}
          maxWidth="md"
          fullWidth
          slotProps={{
            paper: {
              sx: {
                borderRadius: 2,
              },
            },
          }}
        >
          <DialogTitle sx={{ pr: 6 }}>
            Privacy Policy
            <IconButton
              aria-label="close"
              onClick={handleClose}
              sx={{
                position: "absolute",
                right: 12,
                top: 12,
                color: (theme) => theme.palette.grey[500],
                "&:hover": {
                  backgroundColor: (theme) => theme.palette.action.hover,
                },
              }}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Box sx={{ py: 1 }} className="space-y-6">
              <section>
                <h2 className="text-lg font-semibold mb-2">
                  1. Information We Collect
                </h2>
                <p>
                  We collect information you provide directly to us, such as
                  when you create an account, upload documents, or communicate
                  with us. We may also collect information automatically as you
                  navigate the System.
                </p>
              </section>
              <section>
                <h2 className="text-lg font-semibold mb-2">
                  2. Use of Information
                </h2>
                <p>
                  We use the information we collect to provide, maintain, and
                  improve our services, to protect our rights and the rights of
                  others, and to comply with our legal obligations.
                </p>
              </section>
              <section>
                <h2 className="text-lg font-semibold mb-2">
                  3. Sharing of Information
                </h2>
                <p>
                  We do not share your personal information with third parties
                  except as described in this Privacy Policy or with your
                  consent.
                </p>
              </section>
              <section>
                <h2 className="text-lg font-semibold mb-2">4. Data Security</h2>
                <p>
                  We take reasonable measures to help protect information about
                  you from loss, theft, misuse and unauthorized access,
                  disclosure, alteration, and destruction.
                </p>
              </section>
            </Box>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
