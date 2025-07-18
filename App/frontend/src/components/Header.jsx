import { Autocomplete, Group, Container } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";

const Header = () => {
  return (
    <div>
      <Group grow justify="space-between">
        <h1 style={{ fontWeight: 900 }}>QUADRA</h1>
        <Container>
          <Autocomplete
            clearable
            placeholder="Buscar"
            data={["Tacos", "Empanadas", "Cereal", "Hot Dog"]}
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
