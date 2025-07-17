import { AppShell, Burger, Group, Skeleton, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import Navbar from "./Navbar";

export default function Appshell() {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: "sm", collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header p="md">QUADRA</AppShell.Header>
      <AppShell.Navbar p="md">
        <Stack>
          <Navbar />
        </Stack>
      </AppShell.Navbar>
      <AppShell.Main>Main</AppShell.Main>
    </AppShell>
  );
}
