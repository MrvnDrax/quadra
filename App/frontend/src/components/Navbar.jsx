import { Stack, UnstyledButton, ThemeIcon, Group, Box } from "@mantine/core";
import { IconChefHat, IconHome, IconMapPin } from "@tabler/icons-react";

const Navbar = () => {
  return (
    <div>
      <Stack>
        <UnstyledButton>
          <Group justify="space-between" gap={0}>
            <Box style={{ display: "flex", alignItems: "center" }}>
              <ThemeIcon color="tomatoe" variant="light" size={30}>
                <IconHome size={18} />
              </ThemeIcon>
              <Box ml="md">Inicio</Box>
            </Box>
          </Group>
        </UnstyledButton>
        <UnstyledButton>
          <Group justify="space-between" gap={0}>
            <Box style={{ display: "flex", alignItems: "center" }}>
              <ThemeIcon color="teal" variant="light" size={30}>
                <IconChefHat size={18} />
              </ThemeIcon>
              <Box ml="md">Restaurantes</Box>
            </Box>
          </Group>
        </UnstyledButton>
        <UnstyledButton>
          <Group justify="space-between" gap={0}>
            <Box style={{ display: "flex", alignItems: "center" }}>
              <ThemeIcon color="blue" variant="light" size={30}>
                <IconMapPin size={18} />
              </ThemeIcon>
              <Box ml="md">Agregar Lugar</Box>
            </Box>
          </Group>
        </UnstyledButton>
      </Stack>
    </div>
  );
};

export default Navbar;
