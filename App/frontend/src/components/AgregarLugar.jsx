import { useState, useEffect } from "react";
import {
  Stack,
  Title,
  Text,
  Card,
  TextInput,
  Textarea,
  Button,
  Group,
  Box,
  Alert,
  Select,
  Loader,
  Center,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { Map, Marker } from "pigeon-maps";
import { IconMapPin, IconInfoCircle, IconPlus } from "@tabler/icons-react";
import { placesAPI, authAPI } from "../services/api";

const AgregarLugar = () => {
  const [center, setCenter] = useState([19.4326, -99.1332]);
  const [zoom, setZoom] = useState(12);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadUserAndCategories();
  }, []);

  const loadUserAndCategories = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("auth_token");
      if (token) {
        const user = await authAPI.getCurrentUser();
        setCurrentUser(user);
      }

      const places = await placesAPI.getPlaces();
      const uniqueCategories = [...new Set(places.map((p) => p.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const form = useForm({
    initialValues: {
      name: "",
      description: "",
      category: "",
    },
    validate: {
      name: (value) =>
        value.length < 2 ? "El nombre debe tener al menos 2 caracteres" : null,
      description: (value) =>
        value.length < 10
          ? "La descripción debe tener al menos 10 caracteres"
          : null,
      category: (value) =>
        value.length < 2 ? "La categoría es requerida" : null,
    },
  });

  const handleMapClick = ({ latLng }) => {
    setSelectedPosition(latLng);
    setIsSuccess(false);
  };

  const handleSubmit = async (values) => {
    if (!selectedPosition) {
      notifications.show({
        title: "Error",
        message: "Debes seleccionar una ubicación en el mapa",
        color: "red",
      });
      return;
    }

    if (!currentUser) {
      notifications.show({
        title: "Error",
        message: "Debes iniciar sesión para agregar un lugar",
        color: "red",
      });
      return;
    }

    try {
      setSubmitting(true);

      const newPlace = {
        name: values.name,
        description: values.description,
        category: values.category,
        latitude: selectedPosition[0],
        longitude: selectedPosition[1],
      };

      await placesAPI.createPlace(newPlace);

      setIsSuccess(true);
      form.reset();
      setSelectedPosition(null);

      notifications.show({
        title: "Éxito",
        message: "Lugar agregado correctamente",
        color: "green",
      });

      if (!categories.includes(values.category)) {
        setCategories((prev) => [...prev, values.category]);
      }
    } catch (error) {
      console.error("Error creando lugar:", error);
      notifications.show({
        title: "Error",
        message: "No se pudo agregar el lugar",
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Stack h="100%" spacing="md">
      <Title order={1}>Agregar Nuevo Lugar</Title>
      <Text c="dimmed">
        Selecciona una ubicación en el mapa y completa la información del lugar
      </Text>

      {loading && (
        <Center p="xl">
          <Loader size="lg" />
        </Center>
      )}

      {!currentUser && !loading && (
        <Alert
          icon={<IconInfoCircle size={16} />}
          title="Acceso restringido"
          color="orange"
        >
          Debes iniciar sesión para agregar nuevos lugares
        </Alert>
      )}

      {isSuccess && (
        <Alert
          icon={<IconInfoCircle size={16} />}
          title="¡Éxito!"
          color="green"
        >
          El lugar ha sido agregado correctamente
        </Alert>
      )}

      {!loading && currentUser && (
        <Group align="flex-start" spacing="md" style={{ flex: 1 }}>
          {/* Mapa */}
          <Box style={{ flex: 2, minHeight: "500px" }}>
            <Card shadow="sm" padding="md" radius="md" withBorder h="100%">
              <Card.Section>
                <Box style={{ height: "500px" }}>
                  <Map
                    height="100%"
                    center={center}
                    zoom={zoom}
                    onClick={handleMapClick}
                    onBoundsChanged={({ center, zoom }) => {
                      setCenter(center);
                      setZoom(zoom);
                    }}
                  >
                    {selectedPosition && (
                      <Marker
                        width={40}
                        anchor={selectedPosition}
                        color="red"
                      />
                    )}
                  </Map>
                </Box>
              </Card.Section>
            </Card>
          </Box>

          {/* Formulario */}
          <Box style={{ flex: 1, minWidth: "300px" }}>
            <Card shadow="sm" padding="md" radius="md" withBorder>
              <Title order={3} mb="md">
                Información del Lugar
              </Title>

              <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack>
                  <TextInput
                    label="Nombre del lugar"
                    placeholder="Ej: Restaurante El Buen Sabor"
                    withAsterisk
                    {...form.getInputProps("name")}
                  />

                  <Select
                    label="Categoría"
                    placeholder="Selecciona o escribe una categoría"
                    withAsterisk
                    searchable
                    creatable
                    getCreateLabel={(query) => `+ Crear "${query}"`}
                    onCreate={(query) => {
                      const item = { value: query, label: query };
                      setCategories((current) => [...current, query]);
                      return item;
                    }}
                    data={categories.map((cat) => ({ value: cat, label: cat }))}
                    {...form.getInputProps("category")}
                  />

                  <Textarea
                    label="Descripción"
                    placeholder="Describe el lugar, su especialidad, ambiente..."
                    withAsterisk
                    minRows={4}
                    {...form.getInputProps("description")}
                  />

                  {selectedPosition && (
                    <Card withBorder p="xs">
                      <Group spacing="xs">
                        <IconMapPin size={16} color="red" />
                        <div>
                          <Text size="sm" fw={500}>
                            Ubicación seleccionada
                          </Text>
                          <Text size="xs" c="dimmed">
                            Lat: {selectedPosition[0].toFixed(4)}
                          </Text>
                          <Text size="xs" c="dimmed">
                            Lng: {selectedPosition[1].toFixed(4)}
                          </Text>
                        </div>
                      </Group>
                    </Card>
                  )}

                  <Button
                    type="submit"
                    disabled={!selectedPosition || submitting}
                    loading={submitting}
                    leftSection={<IconPlus size={16} />}
                    fullWidth
                  >
                    {selectedPosition
                      ? submitting
                        ? "Agregando..."
                        : "Agregar Lugar"
                      : "Selecciona una ubicación en el mapa"}
                  </Button>
                </Stack>
              </form>
            </Card>
          </Box>
        </Group>
      )}
    </Stack>
  );
};

export default AgregarLugar;
