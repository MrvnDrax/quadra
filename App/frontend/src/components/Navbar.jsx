import { Stack, UnstyledButton, ThemeIcon, Group, Box } from "@mantine/core";
import { IconChefHat, IconHome, IconMapPin } from "@tabler/icons-react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    {
      label: "Inicio",
      path: "/",
      icon: IconHome,
      color: "red",
    },
    {
      label: "Restaurantes",
      path: "/restaurantes",
      icon: IconChefHat,
      color: "teal",
    },
    {
      label: "Agregar Lugar",
      path: "/agregar-lugar",
      icon: IconMapPin,
      color: "blue",
    },
  ];

  return (
    <div>
      <Stack>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <UnstyledButton
              key={item.path}
              component={Link}
              to={item.path}
              style={{
                backgroundColor: isActive
                  ? "rgba(0, 0, 0, 0.1)"
                  : "transparent",
                borderRadius: "8px",
                padding: "8px",
              }}
            >
              <Group justify="space-between" gap={0}>
                <Box style={{ display: "flex", alignItems: "center" }}>
                  <ThemeIcon
                    color={item.color}
                    variant={isActive ? "filled" : "light"}
                    size={30}
                  >
                    <Icon size={18} />
                  </ThemeIcon>
                  <Box ml="md" style={{ fontWeight: isActive ? 500 : 400 }}>
                    {item.label}
                  </Box>
                </Box>
              </Group>
            </UnstyledButton>
          );
        })}
      </Stack>
    </div>
  );
};

export default Navbar;
