import { Box, Flex, Image, Text, Title } from "@mantine/core";
import pizza from "../public/img/pizza.png";

const Home = () => {
  return (
    <Flex h={600} justify="center" align="center" px="xl">
      <Flex direction="column" justify="center" align="center" w="50%" px="md">
        <Title order={2} fw={900} mb="xs" ta="center">
          QUADRA
        </Title>
        <Title order={3} fw={500} c="dimmed" mb="sm" ta="center">
          comida real, para gente real
        </Title>
        <Text c="dimmed" fz="md" ta="center">
          Explora los sabores reales de la calle, califica tus favoritos y
          comparte esos rincones que merecen ser descubiertos. <br />
          Porque en cada <em>Quadra</em> hay un puesto que cuenta una historia…
          y sabe increíble.
        </Text>
      </Flex>

      {/* Imagen a la derecha */}
      <Box w="50%" ta="center">
        <Image src={pizza} h={500} w="auto" fit="contain" />
      </Box>
    </Flex>
  );
};

export default Home;
