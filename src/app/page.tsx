import { Heading } from '@/components/heading';
import { Text } from '@/components/text';
import { getCurrentExperience } from '@/features/experience/service';
import { Cards } from '@/widgets/cards';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const currentExperience = await getCurrentExperience();

  return (
    <section>
      <Heading>Yoo, I&apos;m Nazar 👋</Heading>

      <section className="prose prose-neutral dark:prose-invert mt-8 max-w-full">
        <Text>
          I&apos;m a developer with a passion for building beautiful and functional applications.{' '}
          {currentExperience ? (
            <>
              I currently{' '}
              <Link href={'/work'}>
                <span className="text-neutral-400">/</span>work,
              </Link>{' '}
              as {currentExperience.position ? currentExperience.position : 'a developer'} at{' '}
              {currentExperience.companyUrl ? (
                <a href={currentExperience.companyUrl}>{currentExperience.companyName}</a>
              ) : (
                <span>{currentExperience.companyName}</span>
              )}
              {currentExperience.description ? <> - {currentExperience.description}.</> : '.'}
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
