import { auth } from '@/auth';
import { Heading } from '@/components/heading';
import { getChannelThreads } from '@/features/channel/service';
import {
  ChannelEntries,
  ChannelForm,
  ChannelFormShell,
  ChannelSignInButton,
  ChannelSignOutButton,
} from '@/features/channel/ui';

export const metadata = {
  title: 'Channel - Nazar',
  description: 'A channel feed where visitors can leave a message or comment.',
};

export const dynamic = 'force-dynamic';

export default async function ChannelPage() {
  const session = await auth();
  const viewerEmail = session?.user?.email ?? null;
  const isLoggedIn = Boolean(viewerEmail);

  const entries = await getChannelThreads(viewerEmail);

  return (
    <section>
      <Heading>
        {isLoggedIn && (
          <>
            <span>Hi {session?.user?.name}</span> <br />
          </>
        )}
        Channel feed — leave a message
      </Heading>

      <ChannelFormShell>
        {isLoggedIn ? (
          <>
            <ChannelForm />
            <ChannelSignOutButton />
          </>
        ) : (
          <ChannelSignInButton />
        )}
      </ChannelFormShell>

      <ChannelEntries entries={entries} canComment={isLoggedIn} viewerEmail={viewerEmail} />
    </section>
  );
}
