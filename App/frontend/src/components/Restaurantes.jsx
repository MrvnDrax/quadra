import { useState, useRef, useEffect } from "react";
import {
  Stack,
  Title,
  Card,
  Text,
  Button,
  Modal,
  TextInput,
  Textarea,
  Group,
  Badge,
  Box,
  Alert,
  Loader,
  Center,
  Rating,
  Divider,
  Select,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { Map, Marker, Overlay } from "pigeon-maps";
import {
  IconMapPin,
  IconPlus,
  IconInfoCircle,
  IconStar,
  IconEdit,
  IconTrash,
} from "@tabler/icons-react";
import { useLocation } from "react-router-dom";
import { placesAPI, authAPI } from "../services/api";

const Restaurantes = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const mapRef = useRef(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();

  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);

  const [center, setCenter] = useState([19.4326, -99.1332]);
  const [zoom, setZoom] = useState(13);
  const [newMarkerPosition, setNewMarkerPosition] = useState(null);

  useEffect(() => {
    loadRestaurants();
    loadCurrentUser();
  }, []);

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await placesAPI.getPlaces();
      setRestaurants(data);

      const uniqueCategories = [...new Set(data.map((r) => r.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Error cargando restaurantes:", error);
      setError("Error cargando restaurantes");
      notifications.show({
        title: "Error",
        message: "No se pudieron cargar los restaurantes",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentUser = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (token) {
        const user = await authAPI.getCurrentUser();
        setCurrentUser(user);
      }
    } catch (error) {
      console.error("Error cargando usuario:", error);
    }
  };

  useEffect(() => {
    const filterRestaurants = (term) => {
      if (!term) {
        return restaurants;
      }

      const searchLower = term.toLowerCase();

      return restaurants.filter((restaurant) => {
        const nameMatch = restaurant.name.toLowerCase().includes(searchLower);

        const categoryMatch = restaurant.category
          .toLowerCase()
          .includes(searchLower);

        const specialtyMatch =
          restaurant.specialties && Array.isArray(restaurant.specialties)
            ? restaurant.specialties.some(
                (specialty) =>
                  specialty.toLowerCase().includes(searchLower) ||
                  searchLower.includes(specialty.toLowerCase())
              )
            : false;

        const descriptionMatch = restaurant.description
          .toLowerCase()
          .includes(searchLower);

        return nameMatch || categoryMatch || specialtyMatch || descriptionMatch;
      });
    };

    if (location.state?.searchTerm) {
      const term = location.state.searchTerm;
      setSearchTerm(term);
      const filtered = filterRestaurants(term);
      setFilteredRestaurants(filtered);

      const exactRestaurant = restaurants.find(
        (r) => r.name.toLowerCase() === term.toLowerCase()
      );

      if (exactRestaurant) {
        setCenter([exactRestaurant.latitude, exactRestaurant.longitude]);
        setZoom(16);
        setSelectedRestaurant(exactRestaurant);

        setTimeout(() => {
          if (mapRef.current) {
            mapRef.current.scrollIntoView({
              behavior: "smooth",
              block: "start",
              inline: "nearest",
            });
          }
        }, 100);
      }

      window.history.replaceState({}, document.title);
    } else {
      setFilteredRestaurants(restaurants);
      setSearchTerm("");
    }
  }, [location.state, restaurants]);

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
    if (!currentUser) {
      notifications.show({
        title: "Acceso restringido",
        message: "Debes iniciar sesión para agregar restaurantes",
        color: "orange",
      });
      return;
    }

    setNewMarkerPosition(latLng);
    setSelectedRestaurant(null);
    open();
  };

  const handleSubmit = async (values) => {
    if (!newMarkerPosition) return;

    if (!currentUser) {
      notifications.show({
        title: "Error",
        message: "Debes iniciar sesión para agregar un restaurante",
        color: "red",
      });
      return;
    }

    try {
      const newPlace = {
        name: values.name,
        description: values.description,
        category: values.category,
        latitude: newMarkerPosition[0],
        longitude: newMarkerPosition[1],
      };

      const createdPlace = await placesAPI.createPlace(newPlace);

      setRestaurants((prev) => [...prev, createdPlace]);

      if (!categories.includes(values.category)) {
        setCategories((prev) => [...prev, values.category]);
      }

      form.reset();
      setNewMarkerPosition(null);
      close();

      notifications.show({
        title: "Éxito",
        message: "Restaurante agregado correctamente",
        color: "green",
      });
    } catch (error) {
      console.error("Error creando restaurante:", error);
      notifications.show({
        title: "Error",
        message: "No se pudo agregar el restaurante",
        color: "red",
      });
    }
  };

  const handleViewOnMap = (restaurant) => {
    setCenter([restaurant.latitude, restaurant.longitude]);
    setZoom(16);
    setSelectedRestaurant(restaurant);

    if (mapRef.current) {
      mapRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
    }
  };

  const handleMarkerClick = (restaurant) => {
    setSelectedRestaurant(
      selectedRestaurant?.id === restaurant.id ? null : restaurant
    );
    setCenter([restaurant.latitude, restaurant.longitude]);
    setZoom(16);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setFilteredRestaurants(restaurants);
    setSelectedRestaurant(null);
    setCenter([19.4326, -99.1332]);
    setZoom(13);
  };

  const getCategoryColor = (category) => {
    const colors = {
      "Alta Cocina": "red",
      Contemporáneo: "blue",
      Italiana: "green",
      Mexicana: "orange",
      Mariscos: "cyan",
      Francesa: "purple",
      Mediterránea: "teal",
      Asiática: "pink",
      Casual: "gray",
      Internacional: "indigo",
    };
    return colors[category] || "blue";
  };

  return (
    <Box style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Group justify="space-between" align="center" mb="md">
        <Title order={1}>Restaurantes en CDMX</Title>
        <Badge size="lg" variant="light" color="blue">
          {filteredRestaurants.length} restaurantes
        </Badge>
      </Group>

      {/* Mostrar loading */}
      {loading && (
        <Center p="xl">
          <Loader size="lg" />
        </Center>
      )}

      {/* Mostrar error */}
      {error && (
        <Alert
          icon={<IconInfoCircle size={16} />}
          title="Error"
          color="red"
          mb="md"
        >
          {error}
        </Alert>
      )}

      {/* Mostrar término de búsqueda activo */}
      {searchTerm && (
        <Alert
          icon={<IconInfoCircle size={16} />}
          title="Búsqueda activa"
          color="blue"
          mb="md"
          withCloseButton
          onClose={clearSearch}
        >
          Mostrando resultados para: "{searchTerm}"
        </Alert>
      )}

      {!loading && !error && (
        <>
          <Text size="sm" c="dimmed" mb="md">
            {currentUser
              ? "Explora restaurantes en la ciudad o haz clic en el mapa para agregar uno nuevo"
              : "Explora restaurantes en la ciudad. Inicia sesión para agregar nuevos lugares."}
          </Text>

          {/* Mapa */}
          <Card
            ref={mapRef}
            shadow="sm"
            padding="md"
            radius="md"
            withBorder
            mb="md"
            style={{
              scrollMarginTop: "20px",
            }}
          >
            <Card.Section>
              <Box style={{ height: "400px" }}>
                <Map
                  height={400}
                  center={center}
                  zoom={zoom}
                  onClick={handleMapClick}
                  onBoundsChanged={({ center, zoom }) => {
                    setCenter(center);
                    setZoom(zoom);
                  }}
                >
                  {filteredRestaurants.map((restaurant) => (
                    <Marker
                      key={restaurant.id}
                      width={selectedRestaurant?.id === restaurant.id ? 50 : 40}
                      anchor={[restaurant.latitude, restaurant.longitude]}
                      color={getCategoryColor(restaurant.category)}
                      onClick={() => handleMarkerClick(restaurant)}
                    />
                  ))}

                  {selectedRestaurant && (
                    <Overlay
                      anchor={[
                        selectedRestaurant.latitude,
                        selectedRestaurant.longitude,
                      ]}
                      offset={[120, 78]}
                    >
                      <Card
                        shadow="lg"
                        padding="sm"
                        radius="md"
                        withBorder
                        style={{
                          backgroundColor: "white",
                          minWidth: "200px",
                          maxWidth: "250px",
                          zIndex: 1000,
                        }}
                      >
                        <Group spacing="xs" align="center" mb="xs">
                          <IconMapPin
                            size={16}
                            color={getCategoryColor(
                              selectedRestaurant.category
                            )}
                          />
                          <Text fw={600} size="sm">
                            {selectedRestaurant.name}
                          </Text>
                          <Badge
                            color={getCategoryColor(
                              selectedRestaurant.category
                            )}
                            size="xs"
                          >
                            {selectedRestaurant.category}
                          </Badge>
                        </Group>
                        <Text size="xs" c="dimmed" lineClamp={2}>
                          {selectedRestaurant.description}
                        </Text>
                      </Card>
                    </Overlay>
                  )}

                  {newMarkerPosition && (
                    <Marker
                      width={40}
                      anchor={newMarkerPosition}
                      color="yellow"
                    />
                  )}
                </Map>
              </Box>
            </Card.Section>
          </Card>

          {/* Lista de restaurantes */}
          <Box style={{ flexGrow: 1, overflowY: "auto" }}>
            <Title order={3} mb="md">
              Directorio de Restaurantes
            </Title>
            <Stack spacing="xs">
              {filteredRestaurants.map((restaurant) => (
                <Card
                  key={restaurant.id}
                  shadow="sm"
                  padding="md"
                  radius="md"
                  withBorder
                  style={{
                    backgroundColor:
                      selectedRestaurant?.id === restaurant.id
                        ? "#f8f9fa"
                        : "white",
                    border:
                      selectedRestaurant?.id === restaurant.id
                        ? "2px solid #228be6"
                        : "1px solid #e9ecef",
                  }}
                >
                  <Group justify="space-between" align="flex-start">
                    <Box style={{ flex: 1 }}>
                      <Group align="center" spacing="xs" mb="xs">
                        <IconMapPin size={16} />
                        <Text fw={500} size="lg">
                          {restaurant.name}
                        </Text>
                        <Badge
                          color={getCategoryColor(restaurant.category)}
                          size="sm"
                        >
                          {restaurant.category}
                        </Badge>
                      </Group>
                      <Text size="sm" c="dimmed" mb="xs">
                        {restaurant.description}
                      </Text>
                      {restaurant.specialties &&
                        Array.isArray(restaurant.specialties) &&
                        restaurant.specialties.length > 0 && (
                          <Group spacing="xs" mb="xs">
                            <Text size="xs" fw={500} c="dimmed">
                              Especialidades:
                            </Text>
                            {restaurant.specialties
                              .slice(0, 4)
                              .map((specialty, index) => (
                                <Badge
                                  key={index}
                                  size="xs"
                                  variant="dot"
                                  color="gray"
                                >
                                  {specialty}
                                </Badge>
                              ))}
                          </Group>
                        )}
                    </Box>
                    <Group spacing="xs">
                      <Button
                        size="sm"
                        variant={
                          selectedRestaurant?.id === restaurant.id
                            ? "filled"
                            : "light"
                        }
                        onClick={() => handleViewOnMap(restaurant)}
                      >
                        Ver en mapa
                      </Button>
                    </Group>
                  </Group>
                </Card>
              ))}
            </Stack>
          </Box>

          {/* Modal para agregar restaurante */}
          <Modal
            opened={opened}
            onClose={() => {
              close();
              setNewMarkerPosition(null);
              form.reset();
            }}
            title="Agregar Nuevo Restaurante"
            centered
          >
            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack>
                <TextInput
                  label="Nombre del restaurante"
                  placeholder="Ej: La Casa de Toño"
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
                  placeholder="Describe el restaurante, su especialidad, ambiente, etc."
                  withAsterisk
                  minRows={3}
                  {...form.getInputProps("description")}
                />

                {newMarkerPosition && (
                  <Text size="sm" c="dimmed">
                    Ubicación: {newMarkerPosition[0].toFixed(4)},{" "}
                    {newMarkerPosition[1].toFixed(4)}
                  </Text>
                )}

                <Group justify="flex-end" mt="md">
                  <Button
                    variant="light"
                    onClick={() => {
                      close();
                      setNewMarkerPosition(null);
                      form.reset();
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" leftSection={<IconPlus size={16} />}>
                    Agregar Restaurante
                  </Button>
                </Group>
              </Stack>
            </form>
          </Modal>
        </>
      )}
    </Box>
  );
};

export default Restaurantes;
