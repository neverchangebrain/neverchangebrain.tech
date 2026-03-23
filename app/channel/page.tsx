import { auth } from '@/app/auth';
import { getChannelMessages } from '@/app/db/queries';
import { Heading } from '@/components/heading';
import { SignIn, SignOut } from './components/buttons';
import { Entries } from './components/entries';
import Form, { FormShell } from './components/form';

export const metadata = {
  title: 'Channel - Nazar',
  description: 'A channel-style feed where visitors can leave a message.',
};

export default async function ChannelPage() {
  const session = await auth();
  const isLoggedIn = session?.user?.email;

  const entries = await getChannelMessages();

  return (
    <section>
      <Heading>
        {isLoggedIn && (
          <>
            <span>Hi {session.user?.name}</span> <br />
          </>
        )}
        Channel feed — leave a message
      </Heading>

      <FormShell>
        {isLoggedIn ? (
          <>
            <Form />
            <SignOut />
          </>
        ) : (
          <SignIn />
        )}
      </FormShell>

      <Entries entries={entries} />
    </section>
  );
}
