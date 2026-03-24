import { auth } from '@/auth';
import { Heading } from '@/components/heading';
import { Button } from '@/components/ui/button';
import { networking } from '@/constants/profile';
import {
  adminDeleteChannelComment,
  adminDeleteChannelMessage,
  adminToggleChannelMessageCommentsClosed,
  adminToggleChannelMessagePinned,
  getChannelThreads,
} from '@/features/channel/service';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'Channel Admin - Nazar',
  description: 'Channel moderation panel.',
};

export default async function ChannelAdminPage() {
  const session = await auth();
  const email = session?.user?.email;
  console.log('session', session);
  if (!email || email !== networking.email) notFound();

  const threads = await getChannelThreads();

  return (
    <section>
      <Heading hasMotion={false}>Channel admin</Heading>

      <div className="mt-8 space-y-6">
        {threads.map((t) => (
          <div
            key={t.id}
            className="rounded-2xl border border-white/5 bg-neutral-900/10 px-4 py-4 text-sm dark:bg-neutral-200/5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  #{t.id} • {t.createdBy}
                </div>
                <div className="mt-2 wrap-break-word">{t.body}</div>
              </div>

              <div className="flex flex-wrap gap-2">
                <form action={adminToggleChannelMessagePinned}>
                  <input type="hidden" name="id" value={t.id} />
                  <Button type="submit" variant="outline" size="sm">
                    {t.isPinned ? 'unpin' : 'pin'}
                  </Button>
                </form>

                <form action={adminToggleChannelMessageCommentsClosed}>
                  <input type="hidden" name="id" value={t.id} />
                  <Button type="submit" variant="outline" size="sm">
                    {t.commentsClosed ? 'open comments' : 'close comments'}
                  </Button>
                </form>

                <form action={adminDeleteChannelMessage}>
                  <input type="hidden" name="id" value={t.id} />
                  <Button type="submit" variant="destructive" size="sm">
                    delete post
                  </Button>
                </form>
              </div>
            </div>

            {t.comments.length > 0 && (
              <div className="mt-4 space-y-2 border-t border-white/5 pt-4">
                {t.comments.map((c) => (
                  <div
                    key={c.id}
                    className="flex flex-wrap items-start justify-between gap-3 rounded-xl bg-neutral-200/10 px-3 py-2 text-xs dark:bg-neutral-900/10"
                  >
                    <div className="min-w-0 wrap-break-word">
                      <div className="text-neutral-500 dark:text-neutral-400">
                        #{c.id} • {c.createdBy}
                      </div>
                      <div className="mt-1">{c.body}</div>
                    </div>
                    <form action={adminDeleteChannelComment}>
                      <input type="hidden" name="id" value={c.id} />
                      <Button type="submit" variant="destructive" size="sm">
                        delete
                      </Button>
                    </form>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
