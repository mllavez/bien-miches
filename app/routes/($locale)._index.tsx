import {Section, Container, Flex} from '@radix-ui/themes';

import {LaunchForm} from '~/components/LuanchForm';
import {Countdown} from '~/components/Countdown';

export default function Homepage() {
  return (
    <Section>
      <Container>
        <Flex>
          <h1>FREE DRINK!</h1>
          <h2>SAT, 9/16/23 @ 5pm</h2>
          <h3>907 Cedar St, Santa Cruz</h3>
        </Flex>
        <Flex>
          <Countdown targetDate={new Date('September 16, 2023 17:00:00')} />
        </Flex>
        <LaunchForm />
      </Container>
    </Section>
  );
}
