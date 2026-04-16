import { Box, Container } from "@mui/material";
import { type PropsWithChildren } from "react";

export default function AuthLayout({ children }: PropsWithChildren) {
  return (
    <Box
      className="min-h-screen py-10"
      sx={{
        background:
          "radial-gradient(circle at 10% 12%, rgba(0,95,115,0.2), transparent 36%), radial-gradient(circle at 90% 12%, rgba(174,32,18,0.16), transparent 35%), linear-gradient(170deg, #faf7f0 0%, #fffaf2 48%, #f5e5c8 100%)",
      }}
    >
      <Container maxWidth="sm">{children}</Container>
    </Box>
  );
}
