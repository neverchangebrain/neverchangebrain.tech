import { Cards } from '@/components/cards';
import { Heading } from '@/components/heading';
import { Text } from '@/components/text';
import { work } from '@/lib/constants';
import Link from 'next/link';

export default function Home() {
  return (
    <section>
      <Heading>Yoo, I&apos;m Nazar 👋</Heading>

      <section className="prose prose-neutral mt-8 max-w-full dark:prose-invert">
        <Text>
          I&apos;m a developer with a passion for building beautiful and functional applications.{' '}
          {work ? (
            <>
              I currently{' '}
              <Link href={'/work'}>
                <span className="text-neutral-400">/</span>work,
              </Link>{' '}
              as a backend developer at <a href={work.companyUrl}>{work.companyName}</a> -{' '}
              {work.description}.
            </>
          ) : (
            <>
              I have commercial experience — see{' '}
              <Link href={'/work'}>
                <span className="text-neutral-400">/</span>work
              </Link>{' '}
              and I&apos;m open to collaboration and new opportunities.
            </>
          )}
        </Text>
      </section>

      <Cards />
    </section>
  );
}

export const revalidate = 3600;
