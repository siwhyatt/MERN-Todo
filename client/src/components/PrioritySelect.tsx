import { RadioGroup, Radio, Stack } from "@chakra-ui/react";

interface PrioritySelectProps {
  value: string;
  onChange: (value: string) => void;
}

const PrioritySelect = ({ value, onChange }: PrioritySelectProps) => {
  return (
    <RadioGroup
      value={value}
      onChange={onChange}
    >
      <Stack spacing={5} direction={'row'}>
        <Radio size='lg' value="low" colorScheme='blue'>Low</Radio>
        <Radio size='lg' value="medium" colorScheme='green'>Med</Radio>
        <Radio size='lg' value="high" colorScheme='red'>High</Radio>
      </Stack>
    </RadioGroup>
  )
}

export default PrioritySelect;

