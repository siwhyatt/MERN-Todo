import { RadioGroup, Radio, Stack } from "@chakra-ui/react";

interface TimeSelectProps {
  value: string;
  onChange: (value: string) => void;
}

const TimeSelect = ({ value, onChange }: TimeSelectProps) => {
  return (
    <RadioGroup
      value={value}
      onChange={onChange}
      colorScheme="teal"
    >
      <Stack spacing={5} direction={'row'}>
        <Radio value="15">15m</Radio>
        <Radio value="30">30m</Radio>
        <Radio value="60">1h</Radio>
        <Radio value="120">2h</Radio>
      </Stack>
    </RadioGroup>
  )
}

export default TimeSelect;
