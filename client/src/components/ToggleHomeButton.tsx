import { useLocation, Link as RouterLink } from 'react-router-dom';
import { Button, Icon } from '@chakra-ui/react';
import { RiHome2Fill } from 'react-icons/ri';
import { FaFolder } from 'react-icons/fa';

const ToggleHomeButton = () => {
  const location = useLocation();

  const isHome = location.pathname === '/';
  const icon = isHome ? FaFolder : RiHome2Fill;
  const to = isHome ? '/projects' : '/';

  return (
    <Button display={{ base: "flex", md: "none" }} as={RouterLink} to={to} mr={4}>
      <Icon as={icon} />
    </Button>
  );
};

export default ToggleHomeButton;
