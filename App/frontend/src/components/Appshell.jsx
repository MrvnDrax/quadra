import { AppShell, Stack } from "@mantine/core";
import { Routes, Route } from "react-router-dom";
import Navbar from "./Navbar";
import Header from "./Header";
import Home from "./Home";
import Restaurantes from "./Restaurantes";
import AgregarLugar from "./AgregarLugar";
import UserButton from "./UserButton";

export default function Appshell() {
  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: "sm" }}
      padding="md"
    >
      <AppShell.Header p="xs">
        <Header />
      </AppShell.Header>
      <AppShell.Navbar p="md">
        <Stack justify="space-between" h="100%">
          <Navbar />
          <UserButton />
        </Stack>
      </AppShell.Navbar>
      <AppShell.Main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/restaurantes" element={<Restaurantes />} />
          <Route path="/agregar-lugar" element={<AgregarLugar />} />
        </Routes>
      </AppShell.Main>
    </AppShell>
  );
}
