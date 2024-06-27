// Footer.tsx
import React from 'react';
import { Button, Container, Flex, Box, useColorModeValue } from "@chakra-ui/react";
import { MdAdd, MdOutlinePriorityHigh, MdOutlineAccessTimeFilled } from "react-icons/md";
import { FaHourglass, FaSortAmountDown, FaSortAmountUp } from "react-icons/fa";
import { SortType } from '../utils/sortFunctions';
import { useLocation, useNavigate } from 'react-router-dom';

interface FooterProps {
  setSortByCreatedAt: () => void;
  setSortByTime: () => void;
  setSortByPriority: () => void;
  sortType: SortType | null;
  sortAscending: boolean;
  onAddClick: () => void;
}

const Footer: React.FC<FooterProps> = ({
  setSortByCreatedAt,
  setSortByTime,
  setSortByPriority,
  sortType,
  sortAscending,
  onAddClick
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === '/';

  const handleAddClick = () => {
    if (!isHomePage) {
      navigate('/');
    }
    onAddClick();
  };

  const getSortIcon = (type: SortType) => {
    if (sortType === type) {
      return sortAscending ? <FaSortAmountUp /> : <FaSortAmountDown />;
    }
    return null;
  };
  const bgColor = useColorModeValue("gray.100", "gray.800");


  return (
    <Box
      as="footer"
      position="sticky"
      bottom={0}
      zIndex="sticky"
      bg={bgColor}
    >
      <Container maxW={"900px"}>
        <Flex bg={useColorModeValue("gray.300", "gray.700")} p={4} my={4} gap={3} borderRadius={5} alignItems={"center"} justifyContent={"space-between"} >
          <Button onClick={setSortByCreatedAt} isDisabled={!isHomePage} opacity={isHomePage ? 1 : 0.5} >
            <MdOutlineAccessTimeFilled />
            {getSortIcon(SortType.CreatedAt)}
          </Button>
          <Button onClick={setSortByTime} isDisabled={!isHomePage} opacity={isHomePage ? 1 : 0.5} >
            <FaHourglass />
            {getSortIcon(SortType.Time)}
          </Button>
          <Button onClick={setSortByPriority} isDisabled={!isHomePage} opacity={isHomePage ? 1 : 0.5} >
            <MdOutlinePriorityHigh />
            {getSortIcon(SortType.Priority)}
          </Button>
          <Button onClick={handleAddClick}>
            <MdAdd />
          </Button>
        </Flex>
      </Container>
    </Box>
  );
};

export default Footer;
