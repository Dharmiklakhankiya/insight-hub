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

export default function TermsPage() {
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
            Terms of Service
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
                  1. Acceptance of Terms
                </h2>
                <p>
                  By accessing the Sovereign Archive (the "System"), you
                  acknowledge that you have read, understood, and agree to be
                  bound by these Terms of Service. If you do not agree to these
                  terms, you must cease all use of the System immediately.
                </p>
                <p>
                  We reserve the right to modify these terms at any time. Your
                  continued use of the System following the posting of changes
                  constitutes your acceptance of such changes.
                </p>
              </section>
              <section>
                <h2 className="text-lg font-semibold mb-2">
                  2. Limitations of Liability
                </h2>
                <p>
                  To the maximum extent permitted by applicable law, InsightHub
                  shall not be liable for any indirect, incidental, special,
                  consequential, or punitive damages, or any loss of profits or
                  revenues, whether incurred directly or indirectly.
                </p>
              </section>
              <section>
                <h2 className="text-lg font-semibold mb-2">3. Governing Law</h2>
                <p>
                  These Terms shall be governed and construed in accordance with
                  the laws of the Sovereign District, without regard to its
                  conflict of law provisions. Any dispute arising out of or
                  related to these Terms shall be resolved exclusively in the
                  courts of the Sovereign District.
                </p>
              </section>
              <section>
                <h2 className="text-lg font-semibold mb-2">
                  4. Data Sovereignty
                </h2>
                <p>
                  The Sovereign Archive maintains strict protocols for data
                  integrity. Users are responsible for maintaining the
                  confidentiality of their credentials and all activities
                  occurring under their account.
                </p>
              </section>
            </Box>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
