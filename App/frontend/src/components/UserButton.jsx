import { useState } from "react";
import {
  Avatar,
  Group,
  Text,
  UnstyledButton,
  Modal,
  TextInput,
  PasswordInput,
  Button,
  Stack,
} from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import classes from "./styles/UserButton.module.css";

export default function UserButton() {
  const [opened, setOpened] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    setOpened(false); // cierra el modal después del intento
  };

  return (
    <>
      <UnstyledButton className={classes.user} onClick={() => setOpened(true)}>
        <Group>
          <Avatar radius="xl" />

          <div style={{ flex: 1 }}>
            <Text size="sm" fw={500}>
              Ingresa
            </Text>

            <Text c="dimmed" size="xs">
              O registrate
            </Text>
          </div>

          <IconChevronRight size={14} stroke={1.5} />
        </Group>
      </UnstyledButton>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Iniciar sesión"
        centered
      >
        <Stack>
          <TextInput
            label="Correo"
            placeholder="ejemplo@correo.com"
            value={email}
            onChange={(event) => setEmail(event.currentTarget.value)}
            required
          />

          <PasswordInput
            label="Contraseña"
            placeholder="Tu contraseña"
            value={password}
            onChange={(event) => setPassword(event.currentTarget.value)}
            required
          />

          <Button onClick={handleLogin}>Iniciar sesión</Button>
          <Button variant="subtle" color="gray">
            ¿No tienes cuenta? Regístrate
          </Button>
        </Stack>
      </Modal>
    </>
  );
}
