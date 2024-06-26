import { Box, Flex, Spinner, Stack, Text, useToast, useColorModeValue } from "@chakra-ui/react";
import { MdDelete } from "react-icons/md";
import { Project } from "./ProjectList.tsx";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BASE_URL } from "../App";
import UpdateProject from "./UpdateProject.tsx";
import { useSwipeable } from 'react-swipeable';
import { useMediaQuery } from '@chakra-ui/react';
import { useState } from 'react';

interface ProjectItemProps {
  project: Project;
  token: string;
}

const ProjectItem = ({ project, token }: ProjectItemProps) => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [isMobile] = useMediaQuery("(max-width: 48em)");
  const [swipeOffset, setSwipeOffset] = useState(0);
  const DELETION_THRESHOLD = window.innerWidth / 2;
  const bgColor = useColorModeValue("white", "gray.800");

  const { mutate: deleteProject, isPending: isDeleting } = useMutation({
    mutationKey: ["deleteProject"],
    mutationFn: async () => {
      try {
        const res = await fetch(BASE_URL + `/projects/${project._id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        return data;
      } catch (error) {
        console.log(error);
      }
    },
    onSuccess: () => {
      toast({
        title: "Project deleted.",
        description: "The project item has been deleted successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const handlers = useSwipeable({
    onSwiping: (eventData) => {
      if (isMobile) {
        setSwipeOffset(eventData.deltaX);
      }
    },
    onSwipedLeft: (eventData) => {
      if (isMobile) {
        if (Math.abs(eventData.deltaX) >= DELETION_THRESHOLD) {
          deleteProject();
        } else {
          setSwipeOffset(0);
        }
      }
    },
    onSwipedRight: (eventData) => {
      if (isMobile) {
        if (Math.abs(eventData.deltaX) >= DELETION_THRESHOLD) {
          deleteProject();
        } else {
          setSwipeOffset(0);
        }
      }
    },
    onTouchEndOrOnMouseUp: () => {
      setSwipeOffset(0);
    },
    trackMouse: true,
    trackTouch: true,
  });
  return (
    <Box position="relative">
      {/* Background color box */}
      <Box
        position="absolute"
        top={0}
        bottom={0}
        left={0}
        right={0}
        bg="red.500"
        style={{
          opacity: Math.min(Math.abs(swipeOffset) / DELETION_THRESHOLD, 1),
          transition: 'opacity 0.2s ease-out',
        }}
        zIndex={-1}
      />
      {isMobile && (
        <Text
          position="absolute"
          right={swipeOffset < 0 ? 4 : 'auto'}
          left={swipeOffset > 0 ? 4 : 'auto'}
          top="50%"
          transform="translateY(-50%)"
          color="white"
          fontWeight="bold"
          opacity={Math.abs(swipeOffset) >= DELETION_THRESHOLD ? 1 : 0}
          transition="opacity 0.2s ease-out"
        >
          Release to Delete
        </Text>
      )}
      <Flex
        gap={2}
        alignItems={"center"}
        {...handlers}
        bg={bgColor}
        borderRadius={"lg"}
        style={{
          transform: `translateX(${Math.max(Math.min(swipeOffset, DELETION_THRESHOLD), -DELETION_THRESHOLD)}px)`,
          transition: 'transform 0.2s ease-out',
        }}
      >
        <Flex
          flex={1}
          alignItems={"start"}
          border={"1px"}
          borderColor={"gray.600"}
          p={2}
          borderRadius={"lg"}
          justifyContent={"space-between"}
        >
          <Box>
            <Text>
              {project.name}
            </Text>
            <Text color='grey'>
              {project.description}
            </Text>
          </Box>
          <Stack align={'center'} gap={2}>
            <UpdateProject key={project._id} project={project} token={token} />
            {!isMobile &&
              <>
                <Box color={"red.500"} cursor={"pointer"} onClick={() => deleteProject()}>
                  {!isDeleting && <MdDelete size={25} />}
                  {isDeleting && <Spinner size={"sm"} />}
                </Box>
              </>
            }
          </Stack>
        </Flex>
      </Flex>
    </Box>
  );
};
export default ProjectItem;

