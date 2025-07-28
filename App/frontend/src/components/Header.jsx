import { Autocomplete, Group, Container } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");

  const searchData = [
    "Tacos",
    "Sushi",
    "Pizza",
    "Pasta",
    "Mariscos",
    "Pescado",
    "Carne",
    "Mole",
    "Cochinita",
    "Paella",
    "Risotto",
    "Ramen",
    "Hamburguesa",
    "Pozole",
    "Enchiladas",
    "Ceviche",
    "Dim Sum",
    "Croissant",
    "Gelato",
    "Churros",
    "Esquites",
    "Tasting Menu",
    "Brunch",
    "Mezcal",
    "Cócteles",
    "Pato Pekín",
    "Tuna Tostada",

    "Pujol",
    "Quintonil",
    "Rosetta",
    "Sud 777",
    "Contramar",
    "Máximo Bistrot",
    "Casa Virginia",
    "Lok",
    "Lardo",
    "Meroma",

    "Alta Cocina",
    "Contemporáneo",
    "Italiana",
    "Mexicana",
    "Francesa",
    "Mediterránea",
    "Asiática",
    "Casual",
    "Internacional",
  ];

  const handleSearch = (value) => {
    if (value) {
      navigate("/restaurantes", {
        state: { searchTerm: value },
      });
      setSearchValue("");
    }
  };

  return (
    <div>
      <Group grow justify="space-between">
        <h1 style={{ fontWeight: 900 }}>QUADRA</h1>
        <Container>
          <Autocomplete
            clearable
            placeholder="Buscar comida, restaurante o categoría..."
            data={searchData}
            value={searchValue}
            onChange={setSearchValue}
            onOptionSubmit={handleSearch}
            onKeyDown={(event) => {
              if (event.key === "Enter" && searchValue) {
                handleSearch(searchValue);
              }
            }}
          />
        </Container>
        <Group justify="flex-end">
          <div>CP: 86100</div>
          <div>12:00 hr</div>
        </Group>
      </Group>
    </div>
  );
};

export default Header;
