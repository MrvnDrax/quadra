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
import { useState, useEffect } from "react";
import classes from "./styles/UserButton.module.css";

export default function UserButton() {
  const [opened, { open, close }] = useDisclosure(false);
  const [isLogin, setIsLogin] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUser(token);
    }
  }, []);

  const fetchUser = async (token) => {
    try {
      const res = await fetch("http://localhost:8000/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Token inválido");
      const data = await res.json();
      setUser(data);
      setError("");
    } catch {
      localStorage.removeItem("token");
      setUser(null);
    }
  };

  const handleSubmit = async () => {
    const validation = form.validate();

    if (!validation.hasErrors) {
      const url = isLogin
        ? "http://localhost:8000/login"
        : "http://localhost:8000/register";

      try {
        const formData = new FormData();
        formData.append("username", form.values.email);
        formData.append("password", form.values.password);

        if (!isLogin) {
          const avatar = `https://api.dicebear.com/6.x/fun-emoji/svg?seed=${Math.floor(
            Math.random() * 9999
          )}`;
          formData.append("avatar", avatar);
        }

        const res = await fetch(url, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          let errorData;
          try {
            errorData = await res.json();
          } catch {
            errorData = { detail: "Error desconocido" };
          }
          throw new Error(errorData.detail || "Error desconocido");
        }

        if (isLogin) {
          const data = await res.json();
          localStorage.setItem("token", data.access_token);
          await fetchUser(data.access_token);
          close();
          form.reset();
        } else {
          setIsLogin(true);
          setError("Registro exitoso. Por favor inicia sesión.");
          form.reset();
        }
      } catch (e) {
        setError(e.message);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setError("");
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
              {user ? user.email : "¿No tienes cuenta?"}
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
