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
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { IconChevronRight } from "@tabler/icons-react";
import { useState } from "react";
import classes from "./styles/UserButton.module.css";

export default function UserButton() {
  const [opened, { open, close }] = useDisclosure(false);
  const [isLogin, setIsLogin] = useState(true);

  const form = useForm({
    initialValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    validate: {
      email: (value) =>
        /^\S+@\S+\.\S+$/.test(value) ? null : "Correo inválido",
      password: (value) =>
        value.length >= 6
          ? null
          : "La contraseña debe tener al menos 6 caracteres",
      confirmPassword: (value, values) =>
        isLogin || value === values.password
          ? null
          : "Las contraseñas no coinciden",
    },
  });

  const handleSubmit = () => {
    const validation = form.validate();

    if (!validation.hasErrors) {
      if (isLogin) {
        console.log("Iniciar sesión con:", form.values);
      } else {
        console.log("Registrando con:", form.values);
      }

      close();
      form.reset();
    }
  };

  const switchToRegister = () => {
    setIsLogin(false);
    form.clearErrors();
  };

  const switchToLogin = () => {
    setIsLogin(true);
    form.clearErrors();
  };

  return (
    <>
      <UnstyledButton
        className={classes.user}
        onClick={() => {
          open();
          setIsLogin(true);
        }}
      >
        <Group>
          <Avatar radius="xl" size="lg" />
          <div style={{ flex: 1 }}>
            <Text size="sm" fw={500}>
              Ingresa
            </Text>
            <Text c="dimmed" size="xs">
              ¿No tienes cuenta?
            </Text>
          </div>
          <IconChevronRight size={14} stroke={1.5} />
        </Group>
      </UnstyledButton>

      <Modal
        opened={opened}
        onClose={() => {
          close();
          form.reset();
        }}
        title={isLogin ? "Iniciar sesión" : "Registrarse"}
        centered
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <Stack>
            <TextInput
              label="Correo"
              placeholder="ejemplo@correo.com"
              withAsterisk
              {...form.getInputProps("email")}
            />

            <PasswordInput
              label="Contraseña"
              placeholder="Tu contraseña"
              withAsterisk
              {...form.getInputProps("password")}
            />

            {!isLogin && (
              <PasswordInput
                label="Confirmar contraseña"
                placeholder="Repite tu contraseña"
                withAsterisk
                {...form.getInputProps("confirmPassword")}
              />
            )}

            <Button type="submit">
              {isLogin ? "Iniciar sesión" : "Registrarse"}
            </Button>

            <Button
              variant="subtle"
              color="gray"
              type="button"
              onClick={isLogin ? switchToRegister : switchToLogin}
            >
              {isLogin
                ? "¿No tienes cuenta? Regístrate"
                : "¿Ya tienes cuenta? Inicia sesión"}
            </Button>
          </Stack>
        </form>
      </Modal>
    </>
  );
}
