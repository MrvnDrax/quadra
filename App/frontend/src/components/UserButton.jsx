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
import { notifications } from "@mantine/notifications";
import { IconChevronRight } from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { authAPI } from "../services/api";
import classes from "./styles/UserButton.module.css";

export default function UserButton() {
  const [opened, { open, close }] = useDisclosure(false);
  const [isLogin, setIsLogin] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  const form = useForm({
    initialValues: {
      username: "",
      password: "",
      confirmPassword: "",
    },
    validate: {
      username: (value) =>
        value.length >= 3
          ? null
          : "El usuario debe tener al menos 3 caracteres",
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

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      fetchUser();
    }
  }, []);

  const fetchUser = async () => {
    try {
      const data = await authAPI.getCurrentUser();
      setUser(data);
      setError("");
    } catch {
      localStorage.removeItem("auth_token");
      setUser(null);
    }
  };

  const handleSubmit = async () => {
    const validation = form.validate();

    if (!validation.hasErrors) {
      try {
        let data;
        if (isLogin) {
          data = await authAPI.login({
            username: form.values.username,
            password: form.values.password,
          });
          localStorage.setItem("auth_token", data.access_token);
          await fetchUser();
          close();
          form.reset();
          notifications.show({
            title: "Éxito",
            message: "Sesión iniciada correctamente",
            color: "green",
          });
        } else {
          await authAPI.register({
            username: form.values.username,
            password: form.values.password,
          });
          setIsLogin(true);
          setError("Registro exitoso. Por favor inicia sesión.");
          form.reset();
          notifications.show({
            title: "Éxito",
            message: "Usuario registrado correctamente",
            color: "green",
          });
        }
      } catch (error) {
        setError(error.message || "Error de autenticación");
      }
    }
  };

  const handleLogout = () => {
    console.log("Cerrando sesión...");
    authAPI.logout();
    setUser(null);
    setError("");
    form.reset();
    console.log("Sesión cerrada, token eliminado");
  };

  const switchToRegister = () => {
    setIsLogin(false);
    form.clearErrors();
    setError("");
  };

  const switchToLogin = () => {
    setIsLogin(true);
    form.clearErrors();
    setError("");
  };

  return (
    <>
      <UnstyledButton
        className={classes.user}
        onClick={() => {
          if (user) {
            handleLogout();
          } else {
            open();
            setIsLogin(true);
            setError("");
          }
        }}
      >
        <Group>
          <Avatar
            src={
              user?.avatar ||
              "https://api.dicebear.com/6.x/fun-emoji/svg?seed=👾"
            }
            radius="xl"
            size="lg"
          />
          <div style={{ flex: 1 }}>
            <Text size="sm" fw={500}>
              {user ? `Cerrar sesión (${user.username})` : "Ingresa"}
            </Text>
            <Text c="dimmed" size="xs">
              {user ? `@${user.username}` : "¿No tienes cuenta?"}
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
          setError("");
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
              label="Usuario"
              placeholder="Nombre de usuario"
              withAsterisk
              {...form.getInputProps("username")}
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

            {error && (
              <Text color="red" size="sm" align="center">
                {error}
              </Text>
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
