"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
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
        <Dialog open={open} onOpenChange={handleClose}>
          <DialogContent className="max-w-md rounded-lg">
            <DialogHeader className="flex justify-between items-center pr-6">
              <DialogTitle>Privacy Policy</DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="absolute right-4 top-4"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogHeader>
            <div className="space-y-6 py-1">
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
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
