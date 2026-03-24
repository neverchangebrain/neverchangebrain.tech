import { auth } from '@/auth';
import { Heading } from '@/components/heading';
import { networking } from '@/constants/profile';
import {
  adminClearChannelReactions,
  adminDeleteChannelComment,
  adminDeleteChannelMessage,
  adminToggleChannelMessageCommentsClosed,
  adminToggleChannelMessagePinned,
  getChannelThreads,
} from '@/features/channel/service';
import { ChannelAdminPanel } from '@/features/channel/ui';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'Channel Admin - Nazar',
  description: 'Channel moderation panel.',
};

export const dynamic = 'force-dynamic';

export default async function ChannelAdminPage() {
  const session = await auth();
  const email = session?.user?.email;
  if (!email || email !== networking.email) notFound();

  const threads = await getChannelThreads(email);

  return (
    <section>
      <Heading hasMotion={false}>Channel admin</Heading>

      <ChannelAdminPanel
        initialThreads={threads}
        actions={{
          adminClearChannelReactions,
          adminDeleteChannelComment,
          adminDeleteChannelMessage,
          adminToggleChannelMessageCommentsClosed,
          adminToggleChannelMessagePinned,
        }}
      />
    </section>
  );
}
