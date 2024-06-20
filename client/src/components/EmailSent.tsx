import { AbsoluteCenter, Container, Heading, Text } from '@chakra-ui/react'

const EmailSent = () => (
  <Container mx={0} px={0} h={100}>
    <AbsoluteCenter>
      <Heading>Email Sent</Heading>
      <Text fontSize='xl'>
        Please check your inbox for your password reset link
      </Text>
    </AbsoluteCenter >
  </Container>
)

export default EmailSent;
